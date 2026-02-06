package com.gighub.web.vote.dto

import com.gighub.domain.poll.Vote
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.time.LocalDateTime

// Request DTOs
data class CreateVoteRequest(
    @field:NotNull(message = "곡 ID는 필수입니다")
    @field:Positive(message = "곡 ID는 양수여야 합니다")
    val songId: Long
)

// Response DTOs
data class VoteResponse(
    val id: Long,
    val songId: Long,
    val userId: Long,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(vote: Vote): VoteResponse {
            return VoteResponse(
                id = vote.id,
                songId = vote.song.id,
                userId = vote.user.id,
                createdAt = vote.createdAt
            )
        }
    }
}

data class MyVotesResponse(
    val pollId: Long,
    val votes: List<VoteInfo>
)

data class VoteInfo(
    val songId: Long,
    val voteId: Long,
    val createdAt: LocalDateTime
)
