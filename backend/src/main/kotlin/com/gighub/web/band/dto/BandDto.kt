package com.gighub.web.band.dto

import com.gighub.domain.band.Band
import com.gighub.domain.band.BandMember
import com.gighub.domain.band.BandRole
import com.gighub.web.auth.dto.UserInfo
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

// Request DTOs
data class CreateBandRequest(
    @field:NotBlank(message = "밴드 이름은 필수입니다")
    @field:Size(max = 100, message = "밴드 이름은 최대 100자까지 입력 가능합니다")
    val name: String,

    val description: String? = null
)

data class UpdateBandRequest(
    @field:NotBlank(message = "밴드 이름은 필수입니다")
    @field:Size(max = 100, message = "밴드 이름은 최대 100자까지 입력 가능합니다")
    val name: String,

    val description: String? = null
)

data class UpdateMemberRoleRequest(
    @field:NotBlank(message = "역할은 필수입니다")
    val role: String // "LEADER" or "MEMBER"
) {
    fun toBandRole(): BandRole {
        return BandRole.valueOf(role)
    }
}

data class CreateInviteCodeRequest(
    @field:Positive(message = "유효 기간은 양수여야 합니다")
    val expiresInDays: Int = 30,

    val role: String? = "MEMBER" // "LEADER" or "MEMBER"
) {
    fun toBandRole(): BandRole {
        return BandRole.valueOf(role ?: "MEMBER")
    }
}

data class JoinBandRequest(
    @field:NotBlank(message = "초대 코드는 필수입니다")
    val inviteCode: String
)

// Response DTOs
data class BandResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val role: BandRole,
    val memberCount: Int,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(band: Band, role: BandRole, memberCount: Int) = BandResponse(
            id = band.id,
            name = band.name,
            description = band.description,
            role = role,
            memberCount = memberCount,
            createdAt = band.createdAt
        )
    }
}

data class BandDetailResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val members: List<BandMemberInfo>,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(band: Band, members: List<BandMemberInfo>) = BandDetailResponse(
            id = band.id,
            name = band.name,
            description = band.description,
            members = members,
            createdAt = band.createdAt
        )
    }
}

data class BandMemberInfo(
    val user: UserInfo,
    val role: BandRole,
    val joinedAt: LocalDateTime
) {
    companion object {
        fun from(bandMember: BandMember) = BandMemberInfo(
            user = UserInfo.from(bandMember.user),
            role = bandMember.role,
            joinedAt = bandMember.joinedAt
        )
    }
}

data class InviteCodeResponse(
    val code: String,
    val role: BandRole,
    val usedByUser: UserInfo?,
    val createdAt: LocalDateTime,
    val expiresAt: LocalDateTime
)
