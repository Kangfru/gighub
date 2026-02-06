package com.gighub.web.vote

import com.gighub.domain.band.Band
import com.gighub.domain.poll.*
import com.gighub.domain.user.User
import com.gighub.domain.user.UserRepository
import com.gighub.exception.ErrorCode
import com.gighub.exception.GigHubException
import com.gighub.security.PermissionService
import com.gighub.web.vote.dto.CreateVoteRequest
import io.mockk.*
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.LocalDateTime
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class VoteServiceTest {

    private val voteRepository = mockk<VoteRepository>()
    private val songRepository = mockk<SongRepository>()
    private val userRepository = mockk<UserRepository>()
    private val permissionService = mockk<PermissionService>()

    private val voteService = VoteService(
        voteRepository,
        songRepository,
        userRepository,
        permissionService
    )

    @AfterEach
    fun tearDown() {
        clearAllMocks()
    }

    @Test
    fun `투표 - 성공`() {
        // given
        val userId = 1L
        val songId = 1L
        val band = Band(id = 1L, name = "테스트 밴드")
        val creator = User(id = 2L, email = "creator@test.com", password = "pw", name = "생성자")
        val voter = User(id = userId, email = "voter@test.com", password = "pw", name = "투표자")

        val poll = Poll(
            id = 1L,
            band = band,
            title = "테스트 투표",
            createdBy = creator,
            startDate = LocalDateTime.now().minusDays(1),
            endDate = LocalDateTime.now().plusDays(1)
        )

        val song = Song(
            id = songId,
            poll = poll,
            suggestedBy = creator,
            artist = "아티스트",
            title = "제목"
        )

        val savedVote = Vote(
            id = 1L,
            user = voter,
            song = song
        )

        val request = CreateVoteRequest(songId = songId)

        every { songRepository.findById(songId) } returns java.util.Optional.of(song)
        every { permissionService.requireBandMember(userId, band.id) } just Runs
        every { voteRepository.existsByUserIdAndSongId(userId, songId) } returns false
        every { userRepository.findById(userId) } returns java.util.Optional.of(voter)
        every { voteRepository.save(any()) } returns savedVote

        // when
        val response = voteService.vote(userId, request)

        // then
        assertNotNull(response)
        assertEquals(savedVote.id, response.id)
        assertEquals(songId, response.songId)
        assertEquals(userId, response.userId)

        verify(exactly = 1) { permissionService.requireBandMember(userId, band.id) }
        verify(exactly = 1) { voteRepository.existsByUserIdAndSongId(userId, songId) }
        verify(exactly = 1) { voteRepository.save(any()) }
    }

    @Test
    fun `투표 - 곡 없음 실패`() {
        // given
        val userId = 1L
        val songId = 999L
        val request = CreateVoteRequest(songId = songId)

        every { songRepository.findById(songId) } returns java.util.Optional.empty()

        // when & then
        val exception = assertThrows<GigHubException.ResourceNotFoundException> {
            voteService.vote(userId, request)
        }

        assertEquals(ErrorCode.SONG_NOT_FOUND, exception.errorCode)
    }

    @Test
    fun `투표 - 투표 기간 아님 실패`() {
        // given
        val userId = 1L
        val songId = 1L
        val band = Band(id = 1L, name = "테스트 밴드")
        val creator = User(id = 2L, email = "creator@test.com", password = "pw", name = "생성자")

        val poll = Poll(
            id = 1L,
            band = band,
            title = "테스트 투표",
            createdBy = creator,
            startDate = LocalDateTime.now().plusDays(1), // 아직 시작 안 함
            endDate = LocalDateTime.now().plusDays(7)
        )

        val song = Song(
            id = songId,
            poll = poll,
            suggestedBy = creator,
            artist = "아티스트",
            title = "제목"
        )

        val request = CreateVoteRequest(songId = songId)

        every { songRepository.findById(songId) } returns java.util.Optional.of(song)
        every { permissionService.requireBandMember(userId, band.id) } just Runs

        // when & then
        val exception = assertThrows<GigHubException.BusinessException> {
            voteService.vote(userId, request)
        }

        assertEquals(ErrorCode.POLL_NOT_ACTIVE, exception.errorCode)
    }

    @Test
    fun `투표 - 중복 투표 실패`() {
        // given
        val userId = 1L
        val songId = 1L
        val band = Band(id = 1L, name = "테스트 밴드")
        val creator = User(id = 2L, email = "creator@test.com", password = "pw", name = "생성자")

        val poll = Poll(
            id = 1L,
            band = band,
            title = "테스트 투표",
            createdBy = creator,
            startDate = LocalDateTime.now().minusDays(1),
            endDate = LocalDateTime.now().plusDays(1)
        )

        val song = Song(
            id = songId,
            poll = poll,
            suggestedBy = creator,
            artist = "아티스트",
            title = "제목"
        )

        val request = CreateVoteRequest(songId = songId)

        every { songRepository.findById(songId) } returns java.util.Optional.of(song)
        every { permissionService.requireBandMember(userId, band.id) } just Runs
        every { voteRepository.existsByUserIdAndSongId(userId, songId) } returns true

        // when & then
        val exception = assertThrows<GigHubException.BusinessException> {
            voteService.vote(userId, request)
        }

        assertEquals(ErrorCode.DUPLICATE_VOTE, exception.errorCode)
    }

    @Test
    fun `투표 취소 - 성공`() {
        // given
        val userId = 1L
        val voteId = 1L
        val voter = User(id = userId, email = "voter@test.com", password = "pw", name = "투표자")
        val song = mockk<Song>(relaxed = true)

        val vote = Vote(
            id = voteId,
            user = voter,
            song = song
        )

        every { voteRepository.findById(voteId) } returns java.util.Optional.of(vote)
        every { voteRepository.delete(vote) } just Runs

        // when
        voteService.cancelVote(userId, voteId)

        // then
        verify(exactly = 1) { voteRepository.delete(vote) }
    }

    @Test
    fun `투표 취소 - 본인 투표 아님 실패`() {
        // given
        val userId = 1L
        val voteId = 1L
        val otherUser = User(id = 2L, email = "other@test.com", password = "pw", name = "다른 사용자")
        val song = mockk<Song>(relaxed = true)

        val vote = Vote(
            id = voteId,
            user = otherUser,
            song = song
        )

        every { voteRepository.findById(voteId) } returns java.util.Optional.of(vote)

        // when & then
        val exception = assertThrows<GigHubException.UnauthorizedException> {
            voteService.cancelVote(userId, voteId)
        }

        assertEquals(ErrorCode.UNAUTHORIZED, exception.errorCode)
    }
}
