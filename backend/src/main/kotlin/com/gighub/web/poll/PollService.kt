package com.gighub.web.poll

import com.gighub.domain.band.BandRepository
import com.gighub.domain.poll.*
import com.gighub.domain.user.UserRepository
import com.gighub.exception.ErrorCode
import com.gighub.exception.GigHubException
import com.gighub.security.PermissionService
import com.gighub.utils.DateTimeUtils
import com.gighub.web.poll.dto.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class PollService(
    private val pollRepository: PollRepository,
    private val songRepository: SongRepository,
    private val voteRepository: VoteRepository,
    private val bandRepository: BandRepository,
    private val userRepository: UserRepository,
    private val permissionService: PermissionService
) {

    @Transactional
    fun createPoll(userId: Long, bandId: Long, request: CreatePollRequest): PollResponse {
        permissionService.requireBandMember(userId, bandId)

        if (request.startDate.isAfter(request.endDate)) {
            throw GigHubException.BusinessException(errorCode = ErrorCode.INVALID_DATE_RANGE)
        }

        val band = bandRepository.findById(bandId).orElseThrow {
            GigHubException.ResourceNotFoundException(errorCode = ErrorCode.BAND_NOT_FOUND)
        }

        val user = userRepository.findById(userId).orElseThrow {
            GigHubException.ResourceNotFoundException(errorCode = ErrorCode.USER_NOT_FOUND)
        }

        val poll = Poll(
            band = band,
            title = request.title,
            description = request.description,
            createdBy = user,
            startDate = request.startDate,
            endDate = request.endDate
        )

        val savedPoll = pollRepository.save(poll)
        return PollResponse.from(savedPoll, 0)
    }

    fun getPollsByBand(userId: Long, bandId: Long, status: PollStatus?): List<PollResponse> {
        permissionService.requireBandMember(userId, bandId)

        val polls = pollRepository.findByBandIdOrderByStartDateDesc(bandId)
        val now = DateTimeUtils.now()

        return polls
            .map { poll ->
                val songCount = songRepository.findByPollId(poll.id).size
                PollResponse.from(poll, songCount)
            }
            .filter { response ->
                when (status) {
                    null -> true
                    PollStatus.ACTIVE -> response.status == PollStatus.ACTIVE
                    PollStatus.UPCOMING -> response.status == PollStatus.UPCOMING
                    PollStatus.ENDED -> response.status == PollStatus.ENDED
                }
            }
    }

    fun getPollDetail(userId: Long, pollId: Long): PollDetailResponse {
        val poll = pollRepository.findById(pollId).orElseThrow {
            GigHubException.ResourceNotFoundException(errorCode = ErrorCode.POLL_NOT_FOUND)
        }

        permissionService.requireBandMember(userId, poll.band.id)

        val songs = songRepository.findByPollIdWithSuggestedBy(pollId)
        val voteCounts = voteRepository.countVotesBySongForPoll(pollId)
            .associate { it.songId to it.voteCount.toInt() }

        val songResponses = songs.map { song ->
            SongResponse.from(song, voteCounts[song.id] ?: 0)
        }

        val myVotes = voteRepository.findByUserIdAndPollId(userId, pollId)
            .map { it.song.id }

        val now = DateTimeUtils.now()
        val status = when {
            now.isBefore(poll.startDate) -> PollStatus.UPCOMING
            now.isAfter(poll.endDate) -> PollStatus.ENDED
            else -> PollStatus.ACTIVE
        }

        return PollDetailResponse(
            id = poll.id,
            bandId = poll.band.id,
            title = poll.title,
            description = poll.description,
            createdBy = com.gighub.web.auth.dto.UserInfo.from(poll.createdBy),
            startDate = poll.startDate,
            endDate = poll.endDate,
            status = status,
            songs = songResponses,
            myVotes = myVotes,
            createdAt = poll.createdAt
        )
    }

    @Transactional
    fun updatePoll(userId: Long, pollId: Long, request: UpdatePollRequest): PollResponse {
        val poll = pollRepository.findById(pollId).orElseThrow {
            GigHubException.ResourceNotFoundException(errorCode = ErrorCode.POLL_NOT_FOUND)
        }

        permissionService.requirePollCreatorOrLeader(userId, poll)

        if (request.startDate.isAfter(request.endDate)) {
            throw GigHubException.BusinessException(errorCode = ErrorCode.INVALID_DATE_RANGE)
        }

        poll.title = request.title
        poll.description = request.description
        poll.startDate = request.startDate
        poll.endDate = request.endDate

        val songCount = songRepository.findByPollId(pollId).size
        return PollResponse.from(poll, songCount)
    }

    @Transactional
    fun deletePoll(userId: Long, pollId: Long) {
        val poll = pollRepository.findById(pollId).orElseThrow {
            GigHubException.ResourceNotFoundException(errorCode = ErrorCode.POLL_NOT_FOUND)
        }

        permissionService.requirePollCreatorOrLeader(userId, poll)

        // 투표 삭제
        val songs = songRepository.findByPollId(pollId)
        songs.forEach { song ->
            val votes = voteRepository.findByUserIdAndSongId(userId, song.id)
            votes?.let { voteRepository.delete(it) }
        }

        // 곡 삭제
        songRepository.deleteAll(songs)

        // 투표 삭제
        pollRepository.delete(poll)
    }

    @Transactional
    fun addSong(userId: Long, pollId: Long, request: CreateSongRequest): SongResponse {
        val poll = pollRepository.findById(pollId).orElseThrow {
            GigHubException.ResourceNotFoundException(errorCode = ErrorCode.POLL_NOT_FOUND)
        }

        permissionService.requireBandMember(userId, poll.band.id)

        val user = userRepository.findById(userId).orElseThrow {
            GigHubException.ResourceNotFoundException(errorCode = ErrorCode.USER_NOT_FOUND)
        }

        val song = Song(
            poll = poll,
            suggestedBy = user,
            artist = request.artist,
            title = request.title,
            youtubeUrl = request.youtubeUrl,
            description = request.description
        )

        val savedSong = songRepository.save(song)
        return SongResponse.from(savedSong, 0)
    }

    @Transactional
    fun updateSong(userId: Long, songId: Long, request: UpdateSongRequest): SongResponse {
        val song = songRepository.findById(songId).orElseThrow {
            GigHubException.ResourceNotFoundException(errorCode = ErrorCode.SONG_NOT_FOUND)
        }

        permissionService.requireSongSuggestorOrLeader(userId, song)

        song.artist = request.artist
        song.title = request.title
        song.youtubeUrl = request.youtubeUrl
        song.description = request.description

        val voteCount = voteRepository.countBySongId(songId)
        return SongResponse.from(song, voteCount)
    }

    @Transactional
    fun deleteSong(userId: Long, songId: Long) {
        val song = songRepository.findById(songId).orElseThrow {
            GigHubException.ResourceNotFoundException(errorCode = ErrorCode.SONG_NOT_FOUND)
        }

        permissionService.requireSongSuggestorOrLeader(userId, song)

        // 투표 삭제
        val votes = voteRepository.findByUserIdAndSongId(userId, songId)
        votes?.let { voteRepository.delete(it) }

        // 곡 삭제
        songRepository.delete(song)
    }
}
