package com.gighub.web.auth.dto

import com.gighub.domain.band.BandRole
import com.gighub.domain.user.User
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

// Request DTOs
data class RegisterRequest(
    @field:NotBlank(message = "이메일은 필수입니다")
    @field:Email(message = "올바른 이메일 형식이 아닙니다")
    val email: String,

    @field:NotBlank(message = "비밀번호는 필수입니다")
    @field:Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다")
    val password: String,

    @field:NotBlank(message = "이름은 필수입니다")
    @field:Size(max = 50, message = "이름은 최대 50자까지 입력 가능합니다")
    val name: String,

    val instrument: String? = null,

    val inviteCode: String? = null
)

data class LoginRequest(
    @field:NotBlank(message = "이메일은 필수입니다")
    @field:Email(message = "올바른 이메일 형식이 아닙니다")
    val email: String,

    @field:NotBlank(message = "비밀번호는 필수입니다")
    val password: String
)

data class RefreshTokenRequest(
    @field:NotBlank(message = "Refresh 토큰은 필수입니다")
    val refreshToken: String
)

// Response DTOs
data class TokenResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: UserInfo,
    val band: BandInfo? = null // 회원가입 시에만 제공
)

data class LoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: UserInfo,
    val bands: List<UserBandInfo>
)

data class UserInfo(
    val id: Long,
    val email: String,
    val name: String,
    val instrument: String?
) {
    companion object {
        fun from(user: User) = UserInfo(
            id = user.id,
            email = user.email,
            name = user.name,
            instrument = user.instrument
        )
    }
}

data class BandInfo(
    val id: Long,
    val name: String,
    val role: BandRole
)

data class UserBandInfo(
    val band: BandInfo,
    val role: BandRole
)

data class RefreshTokenResponse(
    val accessToken: String
)
