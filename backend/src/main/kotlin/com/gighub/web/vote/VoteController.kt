package com.gighub.web.vote

import com.gighub.security.CurrentUser
import com.gighub.web.vote.dto.CreateVoteRequest
import com.gighub.web.vote.dto.MyVotesResponse
import com.gighub.web.vote.dto.VoteResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
class VoteController(
    private val voteService: VoteService
) {

    @PostMapping("/votes")
    fun vote(
        @CurrentUser userId: Long,
        @Valid @RequestBody request: CreateVoteRequest
    ): ResponseEntity<VoteResponse> {
        val response = voteService.vote(userId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @DeleteMapping("/votes/{voteId}")
    fun cancelVote(
        @CurrentUser userId: Long,
        @PathVariable voteId: Long
    ): ResponseEntity<Void> {
        voteService.cancelVote(userId, voteId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/polls/{pollId}/votes/me")
    fun getMyVotes(
        @CurrentUser userId: Long,
        @PathVariable pollId: Long
    ): ResponseEntity<MyVotesResponse> {
        val response = voteService.getMyVotes(userId, pollId)
        return ResponseEntity.ok(response)
    }
}
