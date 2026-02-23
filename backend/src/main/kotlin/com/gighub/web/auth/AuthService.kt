package com.gighub.web.auth

import com.gighub.config.EmailService
import com.gighub.domain.band.BandMemberRepository
import com.gighub.domain.band.InviteCodeRepository
import com.gighub.domain.user.PasswordResetToken
import com.gighub.domain.user.PasswordResetTokenRepository
import com.gighub.domain.user.User
import com.gighub.domain.user.UserRepository
import com.gighub.exception.ErrorCode
import com.gighub.exception.GigHubException
import com.gighub.security.jwt.JwtProperties
import com.gighub.security.jwt.JwtTokenProvider
import com.gighub.utils.DateTimeUtils
import com.gighub.web.auth.dto.*
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

@Service
@Transactional(readOnly = true)
class AuthService(
    private val userRepository: UserRepository,
    private val inviteCodeRepository: InviteCodeRepository,
    private val bandMemberRepository: BandMemberRepository,
    private val passwordResetTokenRepository: PasswordResetTokenRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val jwtProperties: JwtProperties,
    private val emailService: EmailService,
    @param:Value("\${app.frontend-url}") private val frontendUrl: String
) {

    private val log = LoggerFactory.getLogger(AuthService::class.java)

    @Transactional
    fun register(request: RegisterRequest): TokenResponse {
        // 1. 이메일 중복 체크
        if (userRepository.existsByEmail(request.email)) {
            throw GigHubException.BusinessException(
                errorCode = ErrorCode.DUPLICATE_EMAIL
            )
        }

        // 2. 사용자 생성
        val encodedPassword = passwordEncoder.encode(request.password) ?: throw IllegalStateException("Failed to encode password")
        val user = User(
            email = request.email,
            password = encodedPassword,
            name = request.name,
            instrument = request.instrument
        )
        val savedUser = userRepository.save(user)

        // 3. 초대 코드가 있으면 밴드 가입 처리
        var bandInfo: BandInfo? = null
        if (!request.inviteCode.isNullOrBlank()) {
            val inviteCode = inviteCodeRepository.findByCode(request.inviteCode)
                ?: throw GigHubException.ResourceNotFoundException(
                    errorCode = ErrorCode.INVITE_CODE_NOT_FOUND
                )

            if (inviteCode.expiresAt.isBefore(DateTimeUtils.now())) {
                throw GigHubException.BusinessException(
                    errorCode = ErrorCode.INVITE_CODE_EXPIRED
                )
            }

            // 밴드 멤버 등록
            val bandMember = com.gighub.domain.band.BandMember(
                band = inviteCode.band,
                user = savedUser,
                role = inviteCode.inviteRole
            )
            bandMemberRepository.save(bandMember)

            bandInfo = BandInfo(
                id = inviteCode.band.id,
                name = inviteCode.band.name,
                role = inviteCode.inviteRole
            )
        }

        // 4. 토큰 생성
        val accessToken = jwtTokenProvider.generateAccessToken(savedUser.id, savedUser.email)
        val refreshToken = jwtTokenProvider.generateRefreshToken(savedUser.id)

        return TokenResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            expiresIn = jwtProperties.accessExpiry / 1000, // 밀리초를 초로 변환
            user = UserInfo.from(savedUser),
            band = bandInfo
        )
    }

    fun login(request: LoginRequest): LoginResponse {
        // 1. 사용자 확인
        val user = userRepository.findByEmail(request.email)
            ?: throw GigHubException.AuthenticationException(
                errorCode = ErrorCode.INVALID_CREDENTIALS
            )

        // 2. 비밀번호 확인
        if (!passwordEncoder.matches(request.password, user.password)) {
            throw GigHubException.AuthenticationException(
                errorCode = ErrorCode.INVALID_CREDENTIALS
            )
        }

        // 3. 사용자의 밴드 목록 조회
        val bandMembers = bandMemberRepository.findByUserIdWithBand(user.id)
        val bands = bandMembers.map { bm ->
            UserBandInfo(
                band = BandInfo(
                    id = bm.band.id,
                    name = bm.band.name,
                    role = bm.role
                ),
                role = bm.role
            )
        }

        // 4. 토큰 생성
        val accessToken = jwtTokenProvider.generateAccessToken(user.id, user.email)
        val refreshToken = jwtTokenProvider.generateRefreshToken(user.id)

        return LoginResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            expiresIn = jwtProperties.accessExpiry / 1000, // 밀리초를 초로 변환
            user = UserInfo.from(user),
            bands = bands
        )
    }

    @Transactional
    fun requestPasswordReset(request: ForgotPasswordRequest) {
        val user = userRepository.findByEmail(request.email)
            ?: throw GigHubException.ResourceNotFoundException(errorCode = ErrorCode.USER_NOT_FOUND)

        // 기존 미사용 토큰 삭제
        passwordResetTokenRepository.deleteByEmailAndUsedFalse(user.email)

        // 새 토큰 생성 (30분 유효)
        val token = UUID.randomUUID().toString()
        val expiresAt = DateTimeUtils.now().plusMinutes(30)
        passwordResetTokenRepository.save(
            PasswordResetToken(token = token, email = user.email, expiresAt = expiresAt)
        )

        // 이메일 발송
        val resetUrl = "$frontendUrl/reset-password?token=$token"
        emailService.sendPasswordResetEmail(user.email, token, resetUrl)
    }

    @Transactional
    fun resetPassword(request: ResetPasswordRequest) {
        val resetToken = passwordResetTokenRepository.findByToken(request.token)
            ?: throw GigHubException.ResourceNotFoundException(errorCode = ErrorCode.RESET_TOKEN_INVALID)

        if (resetToken.used) {
            throw GigHubException.ResourceNotFoundException(errorCode = ErrorCode.RESET_TOKEN_INVALID)
        }

        if (resetToken.expiresAt.isBefore(DateTimeUtils.now())) {
            throw GigHubException.BusinessException(errorCode = ErrorCode.RESET_TOKEN_EXPIRED)
        }

        val user = userRepository.findByEmail(resetToken.email)
            ?: throw GigHubException.ResourceNotFoundException(errorCode = ErrorCode.USER_NOT_FOUND)

        // 비밀번호 변경
        val encodedPassword = passwordEncoder.encode(request.newPassword) ?: throw IllegalStateException("Failed to encode password")
        userRepository.updatePassword(user.id, encodedPassword)

        // 토큰 사용 처리
        resetToken.used = true
    }

    fun refresh(request: RefreshTokenRequest): RefreshTokenResponse {
        // 1. Refresh 토큰 검증
        if (!jwtTokenProvider.validateToken(request.refreshToken)) {
            throw GigHubException.AuthenticationException(
                errorCode = ErrorCode.INVALID_TOKEN
            )
        }

        val tokenType = jwtTokenProvider.getTokenType(request.refreshToken)
        if (tokenType != "refresh") {
            throw GigHubException.AuthenticationException(
                errorCode = ErrorCode.INVALID_TOKEN,
                message = "Refresh 토큰이 아닙니다"
            )
        }

        // 2. 사용자 ID 추출
        val userId = jwtTokenProvider.getUserIdFromToken(request.refreshToken)

        // 3. 사용자 확인
        val user = userRepository.findById(userId).orElseThrow {
            GigHubException.ResourceNotFoundException(
                errorCode = ErrorCode.USER_NOT_FOUND
            )
        }

        // 4. 새로운 Access 토큰 생성
        val accessToken = jwtTokenProvider.generateAccessToken(user.id, user.email)

        return RefreshTokenResponse(
            accessToken = accessToken,
            expiresIn = jwtProperties.accessExpiry / 1000 // 밀리초를 초로 변환
        )
    }
}
