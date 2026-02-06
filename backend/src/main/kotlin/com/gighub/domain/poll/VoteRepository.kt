package com.gighub.domain.poll

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface VoteRepository : JpaRepository<Vote, Long> {
    fun countBySongId(songId: Long): Int
    fun existsByUserIdAndSongId(userId: Long, songId: Long): Boolean
    fun findByUserIdAndSongId(userId: Long, songId: Long): Vote?

    @Query("SELECT v FROM Vote v JOIN FETCH v.song s WHERE v.user.id = :userId AND s.poll.id = :pollId")
    fun findByUserIdAndPollId(userId: Long, pollId: Long): List<Vote>

    @Query("SELECT s.id as songId, COUNT(v) as voteCount FROM Song s LEFT JOIN Vote v ON v.song.id = s.id WHERE s.poll.id = :pollId GROUP BY s.id")
    fun countVotesBySongForPoll(pollId: Long): List<VoteCount>

    interface VoteCount {
        val songId: Long
        val voteCount: Long
    }
}
