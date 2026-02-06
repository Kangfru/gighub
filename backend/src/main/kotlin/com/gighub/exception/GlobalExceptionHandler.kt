package com.gighub.exception

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.LocalDateTime

data class ErrorResponse(
    val code: String,
    val message: String,
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val details: Map<String, String>? = null
)

@RestControllerAdvice
class GlobalExceptionHandler {

    private val logger = LoggerFactory.getLogger(javaClass)

    @ExceptionHandler(GigHubException::class)
    fun handleGigHubException(ex: GigHubException): ResponseEntity<ErrorResponse> {
        logger.warn("GigHubException: ${ex.errorCode.code} - ${ex.message}")

        val response = ErrorResponse(
            code = ex.errorCode.code,
            message = ex.message ?: ex.errorCode.message
        )

        return ResponseEntity
            .status(ex.errorCode.status)
            .body(response)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val errors = ex.bindingResult.allErrors
            .associate { error ->
                val field = (error as? FieldError)?.field ?: "unknown"
                val message = error.defaultMessage ?: "유효하지 않은 값입니다"
                field to message
            }

        logger.warn("Validation error: $errors")

        val response = ErrorResponse(
            code = ErrorCode.VALIDATION_ERROR.code,
            message = ErrorCode.VALIDATION_ERROR.message,
            details = errors
        )

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(response)
    }

    @ExceptionHandler(Exception::class)
    fun handleUnexpectedException(ex: Exception): ResponseEntity<ErrorResponse> {
        logger.error("Unexpected exception", ex)

        val response = ErrorResponse(
            code = ErrorCode.INTERNAL_SERVER_ERROR.code,
            message = ErrorCode.INTERNAL_SERVER_ERROR.message
        )

        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(response)
    }
}
