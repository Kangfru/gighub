package com.gighub.domain.user

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface UserRepository : JpaRepository<User, Long> {
    fun findByEmail(email: String): User?
    fun existsByEmail(email: String): Boolean

    @Modifying
    @Query("UPDATE User u SET u.password = :password WHERE u.id = :id")
    fun updatePassword(id: Long, password: String)
}
