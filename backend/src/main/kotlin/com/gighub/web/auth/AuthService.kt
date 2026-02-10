package com.gighub.web.auth

import com.gighub.domain.band.BandMemberRepository
import com.gighub.domain.band.InviteCodeRepository
import com.gighub.domain.user.User
import com.gighub.domain.user.UserRepository
import com.gighub.exception.ErrorCode
import com.gighub.exception.GigHubException
import com.gighub.security.jwt.JwtTokenProvider
import com.gighub.utils.DateTimeUtils
import com.gighub.web.auth.dto.*
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class AuthService(
    private val userRepository: UserRepository,
    private val inviteCodeRepository: InviteCodeRepository,
    private val bandMemberRepository: BandMemberRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {

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
            user = UserInfo.from(user),
            bands = bands
        )
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

        return RefreshTokenResponse(accessToken = accessToken)
    }
}
