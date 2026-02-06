package com.gighub.web.band

import com.gighub.domain.band.*
import com.gighub.domain.user.UserRepository
import com.gighub.exception.ErrorCode
import com.gighub.exception.GigHubException
import com.gighub.security.PermissionService
import com.gighub.web.band.dto.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
@Transactional(readOnly = true)
class BandService(
    private val bandRepository: BandRepository,
    private val bandMemberRepository: BandMemberRepository,
    private val inviteCodeRepository: InviteCodeRepository,
    private val userRepository: UserRepository,
    private val permissionService: PermissionService
) {

    @Transactional
    fun createBand(userId: Long, request: CreateBandRequest): BandResponse {
        val user = userRepository.findById(userId).orElseThrow {
            GigHubException.ResourceNotFoundException(errorCode = ErrorCode.USER_NOT_FOUND)
        }

        // 1. 밴드 생성
        val band = Band(
            name = request.name,
            description = request.description
        )
        val savedBand = bandRepository.save(band)

        // 2. 생성자를 LEADER로 등록
        val bandMember = BandMember(
            band = savedBand,
            user = user,
            role = BandRole.LEADER
        )
        bandMemberRepository.save(bandMember)

        return BandResponse.from(savedBand, BandRole.LEADER, 1)
    }

    fun getMyBands(userId: Long): List<BandResponse> {
        val bandMembers = bandMemberRepository.findByUserIdWithBand(userId)

        return bandMembers.map { bm ->
            val memberCount = bandMemberRepository.countByBandIdAndRole(bm.band.id, BandRole.LEADER) +
                    bandMemberRepository.countByBandIdAndRole(bm.band.id, BandRole.MEMBER)

            BandResponse.from(bm.band, bm.role, memberCount)
        }
    }

    fun getBandDetail(userId: Long, bandId: Long): BandDetailResponse {
        permissionService.requireBandMember(userId, bandId)

        val band = bandRepository.findById(bandId).orElseThrow {
            GigHubException.ResourceNotFoundException(errorCode = ErrorCode.BAND_NOT_FOUND)
        }

        val bandMembers = bandMemberRepository.findByBandIdWithUser(bandId)
        val memberInfos = bandMembers.map { BandMemberInfo.from(it) }

        return BandDetailResponse.from(band, memberInfos)
    }

    @Transactional
    fun updateBand(userId: Long, bandId: Long, request: UpdateBandRequest): BandResponse {
        permissionService.requireBandLeader(userId, bandId)

        val band = bandRepository.findById(bandId).orElseThrow {
            GigHubException.ResourceNotFoundException(errorCode = ErrorCode.BAND_NOT_FOUND)
        }

        band.name = request.name
        band.description = request.description

        val memberCount = bandMemberRepository.countByBandIdAndRole(bandId, BandRole.LEADER) +
                bandMemberRepository.countByBandIdAndRole(bandId, BandRole.MEMBER)

        return BandResponse.from(band, BandRole.LEADER, memberCount)
    }

    @Transactional
    fun deleteBand(userId: Long, bandId: Long) {
        permissionService.requireBandLeader(userId, bandId)

        // 밴드 멤버 삭제
        val bandMembers = bandMemberRepository.findByUserId(userId).filter { it.band.id == bandId }
        bandMemberRepository.deleteAll(bandMembers)

        // 초대 코드 삭제
        val inviteCodes = inviteCodeRepository.findByBandId(bandId)
        inviteCodeRepository.deleteAll(inviteCodes)

        // 밴드 삭제
        bandRepository.deleteById(bandId)
    }

    @Transactional
    fun updateMemberRole(userId: Long, bandId: Long, targetUserId: Long, request: UpdateMemberRoleRequest): BandMemberInfo {
        permissionService.requireBandLeader(userId, bandId)

        val bandMember = bandMemberRepository.findByBandIdAndUserId(bandId, targetUserId)
            ?: throw GigHubException.ResourceNotFoundException(
                errorCode = ErrorCode.RESOURCE_NOT_FOUND,
                message = "해당 밴드에 멤버가 존재하지 않습니다"
            )

        // LEADER를 MEMBER로 변경할 때, 마지막 LEADER가 아닌지 확인
        val newRole = request.toBandRole()
        if (bandMember.role == BandRole.LEADER && newRole == BandRole.MEMBER) {
            val leaderCount = bandMemberRepository.countByBandIdAndRole(bandId, BandRole.LEADER)
            if (leaderCount <= 1) {
                throw GigHubException.BusinessException(
                    errorCode = ErrorCode.CANNOT_REMOVE_LAST_LEADER
                )
            }
        }

        bandMember.role = newRole

        return BandMemberInfo.from(bandMember)
    }

    @Transactional
    fun removeMember(userId: Long, bandId: Long, targetUserId: Long) {
        // 자기 자신을 탈퇴시키거나, LEADER가 다른 멤버를 추방
        if (userId != targetUserId) {
            permissionService.requireBandLeader(userId, bandId)
        }

        val bandMember = bandMemberRepository.findByBandIdAndUserId(bandId, targetUserId)
            ?: throw GigHubException.ResourceNotFoundException(
                errorCode = ErrorCode.RESOURCE_NOT_FOUND,
                message = "해당 밴드에 멤버가 존재하지 않습니다"
            )

        // LEADER가 탈퇴하려 할 때, 마지막 LEADER가 아닌지 확인
        if (bandMember.role == BandRole.LEADER) {
            val leaderCount = bandMemberRepository.countByBandIdAndRole(bandId, BandRole.LEADER)
            if (leaderCount <= 1) {
                throw GigHubException.BusinessException(
                    errorCode = ErrorCode.CANNOT_REMOVE_LAST_LEADER,
                    message = "마지막 리더는 밴드를 탈퇴할 수 없습니다. 다른 멤버를 리더로 지정하거나 밴드를 삭제해주세요."
                )
            }
        }

        bandMemberRepository.delete(bandMember)
    }

    fun getMembers(userId: Long, bandId: Long): List<BandMemberInfo> {
        permissionService.requireBandMember(userId, bandId)

        val bandMembers = bandMemberRepository.findByBandIdWithUser(bandId)
        return bandMembers.map { BandMemberInfo.from(it) }
    }

    @Transactional
    fun createInviteCode(userId: Long, bandId: Long, request: CreateInviteCodeRequest): InviteCodeResponse {
        permissionService.requireBandLeader(userId, bandId)

        val band = bandRepository.findById(bandId).orElseThrow {
            GigHubException.ResourceNotFoundException(errorCode = ErrorCode.BAND_NOT_FOUND)
        }

        val inviteCode = InviteCode(
            code = UUID.randomUUID().toString(),
            band = band,
            inviteRole = request.toBandRole(),
            expiresAt = LocalDateTime.now().plusDays(request.expiresInDays.toLong())
        )

        val savedCode = inviteCodeRepository.save(inviteCode)

        return InviteCodeResponse(
            code = savedCode.code,
            role = savedCode.inviteRole,
            usedByUser = null,
            createdAt = savedCode.createdAt,
            expiresAt = savedCode.expiresAt
        )
    }

    fun getInviteCodes(userId: Long, bandId: Long): List<InviteCodeResponse> {
        permissionService.requireBandLeader(userId, bandId)

        val inviteCodes = inviteCodeRepository.findByBandId(bandId)

        return inviteCodes.map { ic ->
            InviteCodeResponse(
                code = ic.code,
                role = ic.inviteRole,
                usedByUser = ic.usedByUser?.let { com.gighub.web.auth.dto.UserInfo.from(it) },
                createdAt = ic.createdAt,
                expiresAt = ic.expiresAt
            )
        }
    }

    @Transactional
    fun deleteInviteCode(userId: Long, bandId: Long, code: String) {
        permissionService.requireBandLeader(userId, bandId)

        val inviteCode = inviteCodeRepository.findByCode(code)
            ?: throw GigHubException.ResourceNotFoundException(errorCode = ErrorCode.INVITE_CODE_NOT_FOUND)

        if (inviteCode.band.id != bandId) {
            throw GigHubException.UnauthorizedException(
                errorCode = ErrorCode.UNAUTHORIZED,
                message = "해당 밴드의 초대 코드가 아닙니다"
            )
        }

        inviteCodeRepository.delete(inviteCode)
    }
}
