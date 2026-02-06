package com.gighub.web.auth

import com.gighub.security.CurrentUser
import com.gighub.web.auth.dto.*
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<TokenResponse> {
        val response = authService.register(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<LoginResponse> {
        val response = authService.login(request)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/refresh")
    fun refresh(@Valid @RequestBody request: RefreshTokenRequest): ResponseEntity<RefreshTokenResponse> {
        val response = authService.refresh(request)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/logout")
    fun logout(@CurrentUser userId: Long): ResponseEntity<Void> {
        // JWT는 stateless이므로 서버에서 할 일이 없음
        // 클라이언트가 토큰을 삭제하면 됨
        return ResponseEntity.noContent().build()
    }
}
