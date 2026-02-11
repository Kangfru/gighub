package com.gighub.web.vote

import com.gighub.domain.poll.SongRepository
import com.gighub.domain.poll.Vote
import com.gighub.domain.poll.VoteRepository
import com.gighub.domain.user.UserRepository
import com.gighub.exception.ErrorCode
import com.gighub.exception.GigHubException
import com.gighub.security.PermissionService
import com.gighub.utils.DateTimeUtils
import com.gighub.web.poll.dto.PollStatus
import com.gighub.web.vote.dto.CreateVoteRequest
import com.gighub.web.vote.dto.MyVotesResponse
import com.gighub.web.vote.dto.VoteInfo
import com.gighub.web.vote.dto.VoteResponse
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class VoteService(
    private val voteRepository: VoteRepository,
    private val songRepository: SongRepository,
    private val userRepository: UserRepository,
    private val permissionService: PermissionService
) {

    @Transactional
    fun vote(userId: Long, request: CreateVoteRequest): VoteResponse {
        val song = songRepository.findById(request.songId).orElseThrow {
            GigHubException.ResourceNotFoundException(errorCode = ErrorCode.SONG_NOT_FOUND)
        }

        val poll = song.poll

        // 밴드 멤버 확인
        permissionService.requireBandMember(userId, poll.band.id)

        // 투표 진행 중인지 확인
        val now = DateTimeUtils.now()
        if (now.isBefore(poll.startDate) || now.isAfter(poll.endDate)) {
            throw GigHubException.BusinessException(
                errorCode = ErrorCode.POLL_NOT_ACTIVE,
                message = "투표 기간이 아닙니다"
            )
        }

        // 이미 투표했는지 확인
        if (voteRepository.existsByUserIdAndSongId(userId, request.songId)) {
            throw GigHubException.BusinessException(errorCode = ErrorCode.DUPLICATE_VOTE)
        }

        val user = userRepository.findById(userId).orElseThrow {
            GigHubException.ResourceNotFoundException(errorCode = ErrorCode.USER_NOT_FOUND)
        }

        val vote = Vote(
            user = user,
            song = song
        )

        val savedVote = voteRepository.save(vote)
        return VoteResponse.from(savedVote)
    }

    @Transactional
    fun cancelVote(userId: Long, voteId: Long) {
        val vote = voteRepository.findById(voteId).orElseThrow {
            GigHubException.ResourceNotFoundException(errorCode = ErrorCode.VOTE_NOT_FOUND)
        }

        // 본인의 투표인지 확인
        if (vote.user.id != userId) {
            throw GigHubException.UnauthorizedException(
                errorCode = ErrorCode.UNAUTHORIZED,
                message = "본인의 투표만 취소할 수 있습니다"
            )
        }

        // 투표 진행 중인지 확인
        val poll = vote.song.poll
        val now = DateTimeUtils.now()
        if (now.isBefore(poll.startDate) || now.isAfter(poll.endDate)) {
            throw GigHubException.BusinessException(
                errorCode = ErrorCode.POLL_NOT_ACTIVE,
                message = "투표 기간이 아닙니다"
            )
        }

        voteRepository.delete(vote)
    }

    fun getMyVotes(userId: Long, pollId: Long): MyVotesResponse {
        val votes = voteRepository.findByUserIdAndPollId(userId, pollId)

        val voteInfos = votes.map { vote ->
            VoteInfo(
                songId = vote.song.id,
                voteId = vote.id,
                createdAt = vote.createdAt
            )
        }

        return MyVotesResponse(
            pollId = pollId,
            votes = voteInfos
        )
    }
}
