package com.gighub.domain.band

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface BandMemberRepository : JpaRepository<BandMember, Long> {
    fun findByUserId(userId: Long): List<BandMember>
    fun findByBandIdAndUserId(bandId: Long, userId: Long): BandMember?
    fun existsByBandIdAndUserId(bandId: Long, userId: Long): Boolean

    @Query("SELECT bm FROM BandMember bm JOIN FETCH bm.band WHERE bm.user.id = :userId")
    fun findByUserIdWithBand(userId: Long): List<BandMember>

    @Query("SELECT bm FROM BandMember bm JOIN FETCH bm.user WHERE bm.band.id = :bandId")
    fun findByBandIdWithUser(bandId: Long): List<BandMember>

    fun countByBandIdAndRole(bandId: Long, role: BandRole): Int
}
