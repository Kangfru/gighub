package com.gighub.domain.poll

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface PollRepository : JpaRepository<Poll, Long> {
    fun findByBandId(bandId: Long): List<Poll>

    @Query("SELECT p FROM Poll p WHERE p.band.id = :bandId ORDER BY p.startDate DESC")
    fun findByBandIdOrderByStartDateDesc(bandId: Long): List<Poll>
}
