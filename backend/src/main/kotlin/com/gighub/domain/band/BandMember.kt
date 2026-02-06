package com.gighub.domain.band

import com.gighub.domain.common.BaseTimeEntity
import com.gighub.domain.user.User
import jakarta.persistence.*

@Entity
@Table(
    name = "band_members",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["band_id", "user_id"])
    ]
)
class BandMember(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "band_id", nullable = false)
    val band: Band,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var role: BandRole = BandRole.MEMBER,

    @Column(nullable = false, updatable = false)
    val joinedAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
) : BaseTimeEntity()
