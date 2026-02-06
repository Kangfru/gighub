package com.gighub.domain.poll

import com.gighub.domain.common.BaseTimeEntity
import com.gighub.domain.user.User
import jakarta.persistence.*

@Entity
@Table(name = "songs")
class Song(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    val poll: Poll,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggested_by_user_id", nullable = false)
    val suggestedBy: User,

    @Column(nullable = false, length = 100)
    var artist: String,

    @Column(nullable = false, length = 200)
    var title: String,

    @Column(length = 500)
    var youtubeUrl: String? = null,

    @Column(columnDefinition = "TEXT")
    var description: String? = null
) : BaseTimeEntity()
