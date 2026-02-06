package com.gighub.domain.poll

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface SongRepository : JpaRepository<Song, Long> {
    fun findByPollId(pollId: Long): List<Song>

    @Query("SELECT s FROM Song s JOIN FETCH s.suggestedBy WHERE s.poll.id = :pollId")
    fun findByPollIdWithSuggestedBy(pollId: Long): List<Song>
}
