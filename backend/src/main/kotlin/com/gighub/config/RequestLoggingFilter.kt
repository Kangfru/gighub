package com.gighub.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
class RequestLoggingFilter : OncePerRequestFilter() {

    private val logger = LoggerFactory.getLogger(javaClass)

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        logger.info("========================================")
        logger.info("🔵 Incoming Request")
        logger.info("Method: ${request.method}")
        logger.info("URI: ${request.requestURI}")
        logger.info("Query: ${request.queryString ?: "none"}")
        logger.info("----------------------------------------")
        logger.info("📍 Origin Headers:")
        logger.info("  Origin: ${request.getHeader("Origin") ?: "null"}")
        logger.info("  Host: ${request.getHeader("Host") ?: "null"}")
        logger.info("  Referer: ${request.getHeader("Referer") ?: "null"}")
        logger.info("  X-Forwarded-For: ${request.getHeader("X-Forwarded-For") ?: "null"}")
        logger.info("  X-Forwarded-Proto: ${request.getHeader("X-Forwarded-Proto") ?: "null"}")
        logger.info("  X-Real-IP: ${request.getHeader("X-Real-IP") ?: "null"}")
        logger.info("----------------------------------------")
        logger.info("🔐 Auth Header:")
        logger.info("  Authorization: ${request.getHeader("Authorization")?.take(20) ?: "null"}...")
        logger.info("========================================")

        filterChain.doFilter(request, response)

        logger.info("========================================")
        logger.info("🟢 Response")
        logger.info("Status: ${response.status}")
        logger.info("CORS Headers:")
        logger.info("  Access-Control-Allow-Origin: ${response.getHeader("Access-Control-Allow-Origin") ?: "not set"}")
        logger.info("  Access-Control-Allow-Credentials: ${response.getHeader("Access-Control-Allow-Credentials") ?: "not set"}")
        logger.info("========================================")
    }
}
