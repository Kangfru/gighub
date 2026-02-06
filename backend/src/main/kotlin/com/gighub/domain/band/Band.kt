package com.gighub.domain.band

import com.gighub.domain.common.BaseTimeEntity
import jakarta.persistence.*

@Entity
@Table(name = "bands")
class Band(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 100)
    var name: String,

    @Column(columnDefinition = "TEXT")
    var description: String? = null
) : BaseTimeEntity()
