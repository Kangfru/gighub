package com.gighub.exception

import org.springframework.http.HttpStatus

enum class ErrorCode(
    val code: String,
    val status: HttpStatus,
    val message: String
) {
    // 인증 관련 (AUTH)
    INVALID_CREDENTIALS("AUTH001", HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다"),
    INVALID_TOKEN("AUTH002", HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다"),
    EXPIRED_TOKEN("AUTH003", HttpStatus.UNAUTHORIZED, "만료된 토큰입니다"),
    DUPLICATE_EMAIL("AUTH004", HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다"),

    // 인가 관련 (AUTHZ)
    UNAUTHORIZED("AUTHZ001", HttpStatus.FORBIDDEN, "권한이 없습니다"),
    LEADER_REQUIRED("AUTHZ002", HttpStatus.FORBIDDEN, "밴드 리더만 수행할 수 있는 작업입니다"),
    MEMBER_REQUIRED("AUTHZ003", HttpStatus.FORBIDDEN, "밴드 멤버만 접근할 수 있습니다"),

    // 리소스 관련 (RES)
    RESOURCE_NOT_FOUND("RES001", HttpStatus.NOT_FOUND, "요청한 리소스를 찾을 수 없습니다"),
    USER_NOT_FOUND("RES002", HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다"),
    BAND_NOT_FOUND("RES003", HttpStatus.NOT_FOUND, "밴드를 찾을 수 없습니다"),
    POLL_NOT_FOUND("RES004", HttpStatus.NOT_FOUND, "투표를 찾을 수 없습니다"),
    SONG_NOT_FOUND("RES005", HttpStatus.NOT_FOUND, "곡을 찾을 수 없습니다"),
    VOTE_NOT_FOUND("RES006", HttpStatus.NOT_FOUND, "투표 내역을 찾을 수 없습니다"),
    INVITE_CODE_NOT_FOUND("RES007", HttpStatus.NOT_FOUND, "초대 코드를 찾을 수 없습니다"),

    // 비즈니스 로직 관련 (BIZ)
    DUPLICATE_VOTE("BIZ001", HttpStatus.CONFLICT, "이미 투표한 곡입니다"),
    INVITE_CODE_EXPIRED("BIZ002", HttpStatus.BAD_REQUEST, "만료된 초대 코드입니다"),
    INVITE_CODE_ALREADY_USED("BIZ003", HttpStatus.BAD_REQUEST, "이미 사용된 초대 코드입니다"),
    POLL_NOT_ACTIVE("BIZ004", HttpStatus.BAD_REQUEST, "투표가 진행 중이 아닙니다"),
    INVALID_DATE_RANGE("BIZ005", HttpStatus.BAD_REQUEST, "시작일은 종료일보다 이전이어야 합니다"),
    CANNOT_REMOVE_LAST_LEADER("BIZ006", HttpStatus.BAD_REQUEST, "마지막 리더는 제거할 수 없습니다"),
    ALREADY_BAND_MEMBER("BIZ007", HttpStatus.CONFLICT, "이미 해당 밴드의 멤버입니다"),

    // 서버 에러 (SYS)
    INTERNAL_SERVER_ERROR("SYS001", HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다"),
    VALIDATION_ERROR("SYS002", HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다")
}
