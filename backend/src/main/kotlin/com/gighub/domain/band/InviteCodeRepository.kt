package com.gighub.domain.band

import org.springframework.data.jpa.repository.JpaRepository

interface InviteCodeRepository : JpaRepository<InviteCode, Long> {
    fun findByCode(code: String): InviteCode?
    fun findByBandId(bandId: Long): List<InviteCode>
}
