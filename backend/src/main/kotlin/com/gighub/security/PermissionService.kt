package com.gighub.security

import com.gighub.domain.band.BandMemberRepository
import com.gighub.domain.band.BandRole
import com.gighub.domain.poll.Poll
import com.gighub.domain.poll.Song
import com.gighub.exception.ErrorCode
import com.gighub.exception.GigHubException
import org.springframework.stereotype.Service

@Service
class PermissionService(
    private val bandMemberRepository: BandMemberRepository
) {

    /**
     * LEADER 권한 확인
     */
    fun requireBandLeader(userId: Long, bandId: Long) {
        val bandMember = bandMemberRepository.findByBandIdAndUserId(bandId, userId)
            ?: throw GigHubException.UnauthorizedException(
                errorCode = ErrorCode.MEMBER_REQUIRED,
                message = "해당 밴드의 멤버가 아닙니다"
            )

        if (bandMember.role != BandRole.LEADER) {
            throw GigHubException.UnauthorizedException(
                errorCode = ErrorCode.LEADER_REQUIRED
            )
        }
    }

    /**
     * 밴드 멤버 권한 확인 (LEADER 또는 MEMBER)
     */
    fun requireBandMember(userId: Long, bandId: Long) {
        if (!bandMemberRepository.existsByBandIdAndUserId(bandId, userId)) {
            throw GigHubException.UnauthorizedException(
                errorCode = ErrorCode.MEMBER_REQUIRED
            )
        }
    }

    /**
     * 투표 생성자 또는 LEADER 권한 확인
     */
    fun requirePollCreatorOrLeader(userId: Long, poll: Poll) {
        if (poll.createdBy.id == userId) {
            return
        }

        val bandMember = bandMemberRepository.findByBandIdAndUserId(poll.band.id, userId)
        if (bandMember?.role != BandRole.LEADER) {
            throw GigHubException.UnauthorizedException(
                errorCode = ErrorCode.UNAUTHORIZED,
                message = "투표 생성자 또는 밴드 리더만 수정할 수 있습니다"
            )
        }
    }

    /**
     * 곡 제안자 또는 LEADER 권한 확인
     */
    fun requireSongSuggestorOrLeader(userId: Long, song: Song) {
        if (song.suggestedBy.id == userId) {
            return
        }

        val bandMember = bandMemberRepository.findByBandIdAndUserId(song.poll.band.id, userId)
        if (bandMember?.role != BandRole.LEADER) {
            throw GigHubException.UnauthorizedException(
                errorCode = ErrorCode.UNAUTHORIZED,
                message = "곡 제안자 또는 밴드 리더만 수정할 수 있습니다"
            )
        }
    }

    /**
     * 밴드 멤버인지 확인 (Boolean 반환)
     */
    fun isBandMember(userId: Long, bandId: Long): Boolean {
        return bandMemberRepository.existsByBandIdAndUserId(bandId, userId)
    }

    /**
     * 밴드 리더인지 확인 (Boolean 반환)
     */
    fun isBandLeader(userId: Long, bandId: Long): Boolean {
        val bandMember = bandMemberRepository.findByBandIdAndUserId(bandId, userId)
        return bandMember?.role == BandRole.LEADER
    }
}
