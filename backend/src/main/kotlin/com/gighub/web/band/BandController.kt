package com.gighub.web.band

import com.gighub.security.CurrentUser
import com.gighub.web.band.dto.*
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/bands")
class BandController(
    private val bandService: BandService
) {

    @PostMapping
    fun createBand(
        @CurrentUser userId: Long,
        @Valid @RequestBody request: CreateBandRequest
    ): ResponseEntity<BandResponse> {
        val response = bandService.createBand(userId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping("/me")
    fun getMyBands(@CurrentUser userId: Long): ResponseEntity<List<BandResponse>> {
        val response = bandService.getMyBands(userId)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{bandId}")
    fun getBandDetail(
        @CurrentUser userId: Long,
        @PathVariable bandId: Long
    ): ResponseEntity<BandDetailResponse> {
        val response = bandService.getBandDetail(userId, bandId)
        return ResponseEntity.ok(response)
    }

    @PutMapping("/{bandId}")
    fun updateBand(
        @CurrentUser userId: Long,
        @PathVariable bandId: Long,
        @Valid @RequestBody request: UpdateBandRequest
    ): ResponseEntity<BandResponse> {
        val response = bandService.updateBand(userId, bandId, request)
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/{bandId}")
    fun deleteBand(
        @CurrentUser userId: Long,
        @PathVariable bandId: Long
    ): ResponseEntity<Void> {
        bandService.deleteBand(userId, bandId)
        return ResponseEntity.noContent().build()
    }

    @PatchMapping("/{bandId}/members/{targetUserId}/role")
    fun updateMemberRole(
        @CurrentUser userId: Long,
        @PathVariable bandId: Long,
        @PathVariable targetUserId: Long,
        @Valid @RequestBody request: UpdateMemberRoleRequest
    ): ResponseEntity<BandMemberInfo> {
        val response = bandService.updateMemberRole(userId, bandId, targetUserId, request)
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/{bandId}/members/{targetUserId}")
    fun removeMember(
        @CurrentUser userId: Long,
        @PathVariable bandId: Long,
        @PathVariable targetUserId: Long
    ): ResponseEntity<Void> {
        bandService.removeMember(userId, bandId, targetUserId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{bandId}/members")
    fun getMembers(
        @CurrentUser userId: Long,
        @PathVariable bandId: Long
    ): ResponseEntity<List<BandMemberInfo>> {
        val response = bandService.getMembers(userId, bandId)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/{bandId}/invite-codes")
    fun createInviteCode(
        @CurrentUser userId: Long,
        @PathVariable bandId: Long,
        @Valid @RequestBody request: CreateInviteCodeRequest
    ): ResponseEntity<InviteCodeResponse> {
        val response = bandService.createInviteCode(userId, bandId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping("/{bandId}/invite-codes")
    fun getInviteCodes(
        @CurrentUser userId: Long,
        @PathVariable bandId: Long
    ): ResponseEntity<List<InviteCodeResponse>> {
        val response = bandService.getInviteCodes(userId, bandId)
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/{bandId}/invite-codes/{code}")
    fun deleteInviteCode(
        @CurrentUser userId: Long,
        @PathVariable bandId: Long,
        @PathVariable code: String
    ): ResponseEntity<Void> {
        bandService.deleteInviteCode(userId, bandId, code)
        return ResponseEntity.noContent().build()
    }
}
