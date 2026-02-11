package com.gighub.utils

import java.time.LocalDateTime
import java.time.ZoneId

/**
 * 한국 시간대(Asia/Seoul, UTC+9) 기반 날짜/시간 유틸리티
 */
object DateTimeUtils {
    val KOREA_ZONE: ZoneId = ZoneId.of("Asia/Seoul")

    /**
     * 현재 한국 시간 반환
     */
    fun now(): LocalDateTime = LocalDateTime.now(KOREA_ZONE)
}
