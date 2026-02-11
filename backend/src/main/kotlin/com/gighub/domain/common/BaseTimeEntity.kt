package com.gighub.domain.common

import jakarta.persistence.Column
import jakarta.persistence.MappedSuperclass
import java.time.LocalDateTime
import java.time.ZoneId

@MappedSuperclass
abstract class BaseTimeEntity {

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(ZoneId.of("Asia/Seoul"))
}
