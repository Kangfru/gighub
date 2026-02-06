package com.gighub.web.poll

import com.gighub.security.CurrentUser
import com.gighub.web.poll.dto.*
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
class PollController(
    private val pollService: PollService
) {

    @PostMapping("/bands/{bandId}/polls")
    fun createPoll(
        @CurrentUser userId: Long,
        @PathVariable bandId: Long,
        @Valid @RequestBody request: CreatePollRequest
    ): ResponseEntity<PollResponse> {
        val response = pollService.createPoll(userId, bandId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping("/bands/{bandId}/polls")
    fun getPollsByBand(
        @CurrentUser userId: Long,
        @PathVariable bandId: Long,
        @RequestParam(required = false) status: PollStatus?
    ): ResponseEntity<List<PollResponse>> {
        val response = pollService.getPollsByBand(userId, bandId, status)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/polls/{pollId}")
    fun getPollDetail(
        @CurrentUser userId: Long,
        @PathVariable pollId: Long
    ): ResponseEntity<PollDetailResponse> {
        val response = pollService.getPollDetail(userId, pollId)
        return ResponseEntity.ok(response)
    }

    @PutMapping("/polls/{pollId}")
    fun updatePoll(
        @CurrentUser userId: Long,
        @PathVariable pollId: Long,
        @Valid @RequestBody request: UpdatePollRequest
    ): ResponseEntity<PollResponse> {
        val response = pollService.updatePoll(userId, pollId, request)
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/polls/{pollId}")
    fun deletePoll(
        @CurrentUser userId: Long,
        @PathVariable pollId: Long
    ): ResponseEntity<Void> {
        pollService.deletePoll(userId, pollId)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/polls/{pollId}/songs")
    fun addSong(
        @CurrentUser userId: Long,
        @PathVariable pollId: Long,
        @Valid @RequestBody request: CreateSongRequest
    ): ResponseEntity<SongResponse> {
        val response = pollService.addSong(userId, pollId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @PutMapping("/songs/{songId}")
    fun updateSong(
        @CurrentUser userId: Long,
        @PathVariable songId: Long,
        @Valid @RequestBody request: UpdateSongRequest
    ): ResponseEntity<SongResponse> {
        val response = pollService.updateSong(userId, songId, request)
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/songs/{songId}")
    fun deleteSong(
        @CurrentUser userId: Long,
        @PathVariable songId: Long
    ): ResponseEntity<Void> {
        pollService.deleteSong(userId, songId)
        return ResponseEntity.noContent().build()
    }
}
