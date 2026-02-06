package com.gighub.domain.poll

import com.gighub.domain.common.BaseTimeEntity
import com.gighub.domain.user.User
import jakarta.persistence.*

@Entity
@Table(
    name = "votes",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["user_id", "song_id"])
    ]
)
class Vote(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id", nullable = false)
    val song: Song
) : BaseTimeEntity()
