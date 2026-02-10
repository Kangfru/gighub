package com.gighub.web.poll.dto

import com.gighub.domain.poll.Poll
import com.gighub.domain.poll.Song
import com.gighub.utils.DateTimeUtils
import com.gighub.web.auth.dto.UserInfo
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

// Request DTOs
data class CreatePollRequest(
    @field:NotBlank(message = "투표 제목은 필수입니다")
    @field:Size(max = 200, message = "제목은 최대 200자까지 입력 가능합니다")
    val title: String,

    val description: String? = null,

    @field:NotNull(message = "시작일은 필수입니다")
    val startDate: LocalDateTime,

    @field:NotNull(message = "종료일은 필수입니다")
    @field:Future(message = "종료일은 미래여야 합니다")
    val endDate: LocalDateTime
)

data class UpdatePollRequest(
    @field:NotBlank(message = "투표 제목은 필수입니다")
    @field:Size(max = 200, message = "제목은 최대 200자까지 입력 가능합니다")
    val title: String,

    val description: String? = null,

    @field:NotNull(message = "시작일은 필수입니다")
    val startDate: LocalDateTime,

    @field:NotNull(message = "종료일은 필수입니다")
    val endDate: LocalDateTime
)

data class CreateSongRequest(
    @field:NotBlank(message = "아티스트는 필수입니다")
    @field:Size(max = 100, message = "아티스트는 최대 100자까지 입력 가능합니다")
    val artist: String,

    @field:NotBlank(message = "곡 제목은 필수입니다")
    @field:Size(max = 200, message = "곡 제목은 최대 200자까지 입력 가능합니다")
    val title: String,

    @field:Size(max = 500, message = "YouTube URL은 최대 500자까지 입력 가능합니다")
    val youtubeUrl: String? = null,

    val description: String? = null
)

data class UpdateSongRequest(
    @field:NotBlank(message = "아티스트는 필수입니다")
    @field:Size(max = 100, message = "아티스트는 최대 100자까지 입력 가능합니다")
    val artist: String,

    @field:NotBlank(message = "곡 제목은 필수입니다")
    @field:Size(max = 200, message = "곡 제목은 최대 200자까지 입력 가능합니다")
    val title: String,

    @field:Size(max = 500, message = "YouTube URL은 최대 500자까지 입력 가능합니다")
    val youtubeUrl: String? = null,

    val description: String? = null
)

// Response DTOs
data class PollResponse(
    val id: Long,
    val bandId: Long,
    val title: String,
    val description: String?,
    val createdBy: UserInfo,
    val startDate: LocalDateTime,
    val endDate: LocalDateTime,
    val status: PollStatus,
    val songCount: Int,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(poll: Poll, songCount: Int): PollResponse {
            val now = DateTimeUtils.now()
            val status = when {
                now.isBefore(poll.startDate) -> PollStatus.UPCOMING
                now.isAfter(poll.endDate) -> PollStatus.ENDED
                else -> PollStatus.ACTIVE
            }

            return PollResponse(
                id = poll.id,
                bandId = poll.band.id,
                title = poll.title,
                description = poll.description,
                createdBy = UserInfo.from(poll.createdBy),
                startDate = poll.startDate,
                endDate = poll.endDate,
                status = status,
                songCount = songCount,
                createdAt = poll.createdAt
            )
        }
    }
}

enum class PollStatus {
    UPCOMING,  // 시작 전
    ACTIVE,    // 진행 중
    ENDED      // 종료됨
}

data class PollDetailResponse(
    val id: Long,
    val bandId: Long,
    val title: String,
    val description: String?,
    val createdBy: UserInfo,
    val startDate: LocalDateTime,
    val endDate: LocalDateTime,
    val status: PollStatus,
    val songs: List<SongResponse>,
    val myVotes: List<Long>, // 내가 투표한 곡 ID 목록
    val createdAt: LocalDateTime
)

data class SongResponse(
    val id: Long,
    val pollId: Long,
    val artist: String,
    val title: String,
    val youtubeUrl: String?,
    val description: String?,
    val suggestedBy: UserInfo,
    val voteCount: Int,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(song: Song, voteCount: Int): SongResponse {
            return SongResponse(
                id = song.id,
                pollId = song.poll.id,
                artist = song.artist,
                title = song.title,
                youtubeUrl = song.youtubeUrl,
                description = song.description,
                suggestedBy = UserInfo.from(song.suggestedBy),
                voteCount = voteCount,
                createdAt = song.createdAt
            )
        }
    }
}
