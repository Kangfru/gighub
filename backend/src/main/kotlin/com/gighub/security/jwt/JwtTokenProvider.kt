package com.gighub.security.jwt

import com.gighub.exception.ErrorCode
import com.gighub.exception.GigHubException
import io.jsonwebtoken.Claims
import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtTokenProvider(
    private val jwtProperties: JwtProperties
) {

    private val logger = LoggerFactory.getLogger(javaClass)
    private val secretKey: SecretKey = run {
        val keyBytes = try {
            // Try to decode as Base64 first
            Base64.getDecoder().decode(jwtProperties.secret)
        } catch (e: IllegalArgumentException) {
            // If not valid Base64, use as plain text (must be at least 32 bytes)
            jwtProperties.secret.toByteArray(Charsets.UTF_8)
        }
        Keys.hmacShaKeyFor(keyBytes)
    }

    fun generateAccessToken(userId: Long, email: String): String {
        val now = Date()
        val expiryDate = Date(now.time + jwtProperties.accessExpiry)

        return Jwts.builder()
            .subject(userId.toString())
            .claim("email", email)
            .claim("type", "access")
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(secretKey)
            .compact()
    }

    fun generateRefreshToken(userId: Long): String {
        val now = Date()
        val expiryDate = Date(now.time + jwtProperties.refreshExpiry)

        return Jwts.builder()
            .subject(userId.toString())
            .claim("type", "refresh")
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(secretKey)
            .compact()
    }

    fun validateToken(token: String): Boolean {
        try {
            Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
            return true
        } catch (ex: JwtException) {
            logger.warn("Invalid JWT token: ${ex.message}")
            return false
        } catch (ex: IllegalArgumentException) {
            logger.warn("JWT token is empty or null")
            return false
        }
    }

    fun getUserIdFromToken(token: String): Long {
        try {
            val claims = getClaims(token)
            return claims.subject.toLong()
        } catch (ex: Exception) {
            throw GigHubException.AuthenticationException(
                errorCode = ErrorCode.INVALID_TOKEN,
                message = "토큰에서 사용자 ID를 추출할 수 없습니다",
                cause = ex
            )
        }
    }

    fun getTokenType(token: String): String? {
        return try {
            val claims = getClaims(token)
            claims["type"] as? String
        } catch (ex: Exception) {
            null
        }
    }

    private fun getClaims(token: String): Claims {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .payload
    }
}
