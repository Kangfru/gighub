package com.gighub.domain.band

import com.gighub.domain.common.BaseTimeEntity
import com.gighub.domain.user.User
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "invite_codes")
class InviteCode(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false, length = 36)
    val code: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "band_id", nullable = false)
    val band: Band,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    val inviteRole: BandRole = BandRole.MEMBER,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "used_by_user_id")
    var usedByUser: User? = null,

    @Column(nullable = false)
    val expiresAt: LocalDateTime
) : BaseTimeEntity()
