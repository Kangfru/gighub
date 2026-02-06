package com.gighub.domain.user

import com.gighub.domain.common.BaseTimeEntity
import jakarta.persistence.*

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false, length = 100)
    val email: String,

    @Column(nullable = false)
    val password: String, // BCrypt hashed

    @Column(nullable = false, length = 50)
    val name: String,

    @Column(columnDefinition = "TEXT")
    val instrument: String? = null
) : BaseTimeEntity()
