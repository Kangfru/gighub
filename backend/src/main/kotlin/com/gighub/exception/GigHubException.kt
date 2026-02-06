package com.gighub.exception

sealed class GigHubException(
    val errorCode: ErrorCode,
    message: String? = null,
    cause: Throwable? = null
) : RuntimeException(message ?: errorCode.message, cause) {

    // 인증 예외
    class AuthenticationException(
        errorCode: ErrorCode = ErrorCode.INVALID_CREDENTIALS,
        message: String? = null,
        cause: Throwable? = null
    ) : GigHubException(errorCode, message, cause)

    // 인가 예외
    class UnauthorizedException(
        errorCode: ErrorCode = ErrorCode.UNAUTHORIZED,
        message: String? = null
    ) : GigHubException(errorCode, message)

    // 리소스 없음
    class ResourceNotFoundException(
        errorCode: ErrorCode = ErrorCode.RESOURCE_NOT_FOUND,
        message: String? = null
    ) : GigHubException(errorCode, message)

    // 비즈니스 로직 예외
    class BusinessException(
        errorCode: ErrorCode,
        message: String? = null
    ) : GigHubException(errorCode, message)
}
