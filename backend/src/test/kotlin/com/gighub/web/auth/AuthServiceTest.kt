package com.gighub.web.auth

import com.gighub.config.EmailService
import com.gighub.domain.band.*
import com.gighub.domain.user.PasswordResetTokenRepository
import com.gighub.domain.user.User
import com.gighub.domain.user.UserRepository
import com.gighub.exception.ErrorCode
import com.gighub.exception.GigHubException
import com.gighub.security.jwt.JwtProperties
import com.gighub.security.jwt.JwtTokenProvider
import com.gighub.web.auth.dto.LoginRequest
import com.gighub.web.auth.dto.RegisterRequest
import io.mockk.*
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.LocalDateTime
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class AuthServiceTest {

    private val userRepository = mockk<UserRepository>()
    private val inviteCodeRepository = mockk<InviteCodeRepository>()
    private val bandMemberRepository = mockk<BandMemberRepository>()
    private val passwordResetTokenRepository = mockk<PasswordResetTokenRepository>()
    private val passwordEncoder = mockk<PasswordEncoder>()
    private val jwtTokenProvider = mockk<JwtTokenProvider>()
    private val emailService = mockk<EmailService>()
    private val jwtProperties = JwtProperties(
        secret = "test-secret-key-for-testing-purposes-only-must-be-long-enough",
        accessExpiry = 3600000L, // 1 hour
        refreshExpiry = 604800000L // 7 days
    )

    private val authService = AuthService(
        userRepository,
        inviteCodeRepository,
        bandMemberRepository,
        passwordResetTokenRepository,
        passwordEncoder,
        jwtTokenProvider,
        jwtProperties,
        emailService,
        frontendUrl = "http://localhost:3000"
    )

    @AfterEach
    fun tearDown() {
        clearAllMocks()
    }

    @Test
    fun `회원가입 - 초대 코드 없이 성공`() {
        // given
        val request = RegisterRequest(
            email = "test@example.com",
            password = "password123",
            name = "테스트",
            instrument = "기타",
            inviteCode = null
        )

        val savedUser = User(
            id = 1L,
            email = request.email,
            password = "encodedPassword",
            name = request.name,
            instrument = request.instrument
        )

        every { userRepository.existsByEmail(request.email) } returns false
        every { passwordEncoder.encode(request.password) } returns "encodedPassword"
        every { userRepository.save(any()) } returns savedUser
        every { jwtTokenProvider.generateAccessToken(1L, request.email) } returns "accessToken"
        every { jwtTokenProvider.generateRefreshToken(1L) } returns "refreshToken"

        // when
        val response = authService.register(request)

        // then
        assertNotNull(response)
        assertEquals("accessToken", response.accessToken)
        assertEquals("refreshToken", response.refreshToken)
        assertEquals(3600L, response.expiresIn) // 1 hour in seconds
        assertEquals(request.email, response.user.email)
        assertEquals(request.name, response.user.name)
        assertNull(response.band)

        verify(exactly = 1) { userRepository.existsByEmail(request.email) }
        verify(exactly = 1) { passwordEncoder.encode(request.password) }
        verify(exactly = 1) { userRepository.save(any()) }
        verify(exactly = 0) { inviteCodeRepository.findByCode(any()) }
    }

    @Test
    fun `회원가입 - 초대 코드로 밴드 가입 성공`() {
        // given
        val request = RegisterRequest(
            email = "test@example.com",
            password = "password123",
            name = "테스트",
            instrument = "기타",
            inviteCode = "INVITE123"
        )

        val band = Band(id = 1L, name = "테스트 밴드")
        val inviteCode = InviteCode(
            id = 1L,
            code = "INVITE123",
            band = band,
            inviteRole = BandRole.MEMBER,
            expiresAt = LocalDateTime.now().plusDays(30)
        )

        val savedUser = User(
            id = 1L,
            email = request.email,
            password = "encodedPassword",
            name = request.name,
            instrument = request.instrument
        )

        every { userRepository.existsByEmail(request.email) } returns false
        every { passwordEncoder.encode(request.password) } returns "encodedPassword"
        every { userRepository.save(any()) } returns savedUser
        every { inviteCodeRepository.findByCode("INVITE123") } returns inviteCode
        every { bandMemberRepository.save(any()) } returns mockk()
        every { inviteCodeRepository.save(any()) } returns inviteCode
        every { jwtTokenProvider.generateAccessToken(1L, request.email) } returns "accessToken"
        every { jwtTokenProvider.generateRefreshToken(1L) } returns "refreshToken"

        // when
        val response = authService.register(request)

        // then
        assertNotNull(response)
        assertNotNull(response.band)
        assertEquals(band.id, response.band?.id)
        assertEquals(band.name, response.band?.name)
        assertEquals(BandRole.MEMBER, response.band?.role)

        verify(exactly = 1) { inviteCodeRepository.findByCode("INVITE123") }
        verify(exactly = 1) { bandMemberRepository.save(any()) }
    }

    @Test
    fun `회원가입 - 이메일 중복 실패`() {
        // given
        val request = RegisterRequest(
            email = "existing@example.com",
            password = "password123",
            name = "테스트",
            inviteCode = null
        )

        every { userRepository.existsByEmail(request.email) } returns true

        // when & then
        val exception = assertThrows<GigHubException.BusinessException> {
            authService.register(request)
        }

        assertEquals(ErrorCode.DUPLICATE_EMAIL, exception.errorCode)
    }

    @Test
    fun `회원가입 - 초대 코드 없음 실패`() {
        // given
        val request = RegisterRequest(
            email = "test@example.com",
            password = "password123",
            name = "테스트",
            inviteCode = "INVALID_CODE"
        )

        every { userRepository.existsByEmail(request.email) } returns false
        every { passwordEncoder.encode(request.password) } returns "encodedPassword"
        every { userRepository.save(any()) } returns mockk(relaxed = true)
        every { inviteCodeRepository.findByCode("INVALID_CODE") } returns null

        // when & then
        val exception = assertThrows<GigHubException.ResourceNotFoundException> {
            authService.register(request)
        }

        assertEquals(ErrorCode.INVITE_CODE_NOT_FOUND, exception.errorCode)
    }

    @Test
    fun `로그인 - 성공`() {
        // given
        val request = LoginRequest(
            email = "test@example.com",
            password = "password123"
        )

        val user = User(
            id = 1L,
            email = request.email,
            password = "encodedPassword",
            name = "테스트"
        )

        every { userRepository.findByEmail(request.email) } returns user
        every { passwordEncoder.matches(request.password, user.password) } returns true
        every { bandMemberRepository.findByUserIdWithBand(1L) } returns emptyList()
        every { jwtTokenProvider.generateAccessToken(1L, request.email) } returns "accessToken"
        every { jwtTokenProvider.generateRefreshToken(1L) } returns "refreshToken"

        // when
        val response = authService.login(request)

        // then
        assertNotNull(response)
        assertEquals("accessToken", response.accessToken)
        assertEquals("refreshToken", response.refreshToken)
        assertEquals(3600L, response.expiresIn) // 1 hour in seconds
        assertEquals(user.email, response.user.email)
        assertEquals(0, response.bands.size)
    }

    @Test
    fun `로그인 - 이메일 없음 실패`() {
        // given
        val request = LoginRequest(
            email = "nonexistent@example.com",
            password = "password123"
        )

        every { userRepository.findByEmail(request.email) } returns null

        // when & then
        val exception = assertThrows<GigHubException.AuthenticationException> {
            authService.login(request)
        }

        assertEquals(ErrorCode.INVALID_CREDENTIALS, exception.errorCode)
    }

    @Test
    fun `로그인 - 비밀번호 불일치 실패`() {
        // given
        val request = LoginRequest(
            email = "test@example.com",
            password = "wrongpassword"
        )

        val user = User(
            id = 1L,
            email = request.email,
            password = "encodedPassword",
            name = "테스트"
        )

        every { userRepository.findByEmail(request.email) } returns user
        every { passwordEncoder.matches(request.password, user.password) } returns false

        // when & then
        val exception = assertThrows<GigHubException.AuthenticationException> {
            authService.login(request)
        }

        assertEquals(ErrorCode.INVALID_CREDENTIALS, exception.errorCode)
    }
}
