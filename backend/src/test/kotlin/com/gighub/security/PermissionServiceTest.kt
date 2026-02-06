package com.gighub.security

import com.gighub.domain.band.*
import com.gighub.domain.poll.Poll
import com.gighub.domain.poll.Song
import com.gighub.domain.user.User
import com.gighub.exception.ErrorCode
import com.gighub.exception.GigHubException
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.LocalDateTime
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class PermissionServiceTest {

    private val bandMemberRepository = mockk<BandMemberRepository>()
    private val permissionService = PermissionService(bandMemberRepository)

    @AfterEach
    fun tearDown() {
        clearAllMocks()
    }

    @Test
    fun `requireBandLeader - LEADER 권한 성공`() {
        // given
        val userId = 1L
        val bandId = 1L
        val band = Band(id = bandId, name = "테스트 밴드")
        val user = User(id = userId, email = "test@test.com", password = "pw", name = "테스트")
        val bandMember = BandMember(
            id = 1L,
            band = band,
            user = user,
            role = BandRole.LEADER
        )

        every { bandMemberRepository.findByBandIdAndUserId(bandId, userId) } returns bandMember

        // when & then (예외 없이 통과)
        permissionService.requireBandLeader(userId, bandId)
    }

    @Test
    fun `requireBandLeader - MEMBER는 실패`() {
        // given
        val userId = 1L
        val bandId = 1L
        val band = Band(id = bandId, name = "테스트 밴드")
        val user = User(id = userId, email = "test@test.com", password = "pw", name = "테스트")
        val bandMember = BandMember(
            id = 1L,
            band = band,
            user = user,
            role = BandRole.MEMBER
        )

        every { bandMemberRepository.findByBandIdAndUserId(bandId, userId) } returns bandMember

        // when & then
        val exception = assertThrows<GigHubException.UnauthorizedException> {
            permissionService.requireBandLeader(userId, bandId)
        }

        assertEquals(ErrorCode.LEADER_REQUIRED, exception.errorCode)
    }

    @Test
    fun `requireBandLeader - 멤버가 아니면 실패`() {
        // given
        val userId = 1L
        val bandId = 1L

        every { bandMemberRepository.findByBandIdAndUserId(bandId, userId) } returns null

        // when & then
        val exception = assertThrows<GigHubException.UnauthorizedException> {
            permissionService.requireBandLeader(userId, bandId)
        }

        assertEquals(ErrorCode.MEMBER_REQUIRED, exception.errorCode)
    }

    @Test
    fun `requireBandMember - 멤버이면 성공`() {
        // given
        val userId = 1L
        val bandId = 1L

        every { bandMemberRepository.existsByBandIdAndUserId(bandId, userId) } returns true

        // when & then (예외 없이 통과)
        permissionService.requireBandMember(userId, bandId)
    }

    @Test
    fun `requireBandMember - 멤버가 아니면 실패`() {
        // given
        val userId = 1L
        val bandId = 1L

        every { bandMemberRepository.existsByBandIdAndUserId(bandId, userId) } returns false

        // when & then
        val exception = assertThrows<GigHubException.UnauthorizedException> {
            permissionService.requireBandMember(userId, bandId)
        }

        assertEquals(ErrorCode.MEMBER_REQUIRED, exception.errorCode)
    }

    @Test
    fun `requirePollCreatorOrLeader - 생성자면 성공`() {
        // given
        val userId = 1L
        val band = Band(id = 1L, name = "테스트 밴드")
        val creator = User(id = userId, email = "test@test.com", password = "pw", name = "생성자")
        val poll = Poll(
            id = 1L,
            band = band,
            title = "테스트 투표",
            createdBy = creator,
            startDate = LocalDateTime.now(),
            endDate = LocalDateTime.now().plusDays(7)
        )

        // when & then (예외 없이 통과)
        permissionService.requirePollCreatorOrLeader(userId, poll)
    }

    @Test
    fun `requirePollCreatorOrLeader - LEADER면 성공`() {
        // given
        val userId = 1L
        val creatorId = 2L
        val band = Band(id = 1L, name = "테스트 밴드")
        val creator = User(id = creatorId, email = "creator@test.com", password = "pw", name = "생성자")
        val user = User(id = userId, email = "leader@test.com", password = "pw", name = "리더")
        val poll = Poll(
            id = 1L,
            band = band,
            title = "테스트 투표",
            createdBy = creator,
            startDate = LocalDateTime.now(),
            endDate = LocalDateTime.now().plusDays(7)
        )

        val bandMember = BandMember(
            id = 1L,
            band = band,
            user = user,
            role = BandRole.LEADER
        )

        every { bandMemberRepository.findByBandIdAndUserId(band.id, userId) } returns bandMember

        // when & then (예외 없이 통과)
        permissionService.requirePollCreatorOrLeader(userId, poll)
    }

    @Test
    fun `requirePollCreatorOrLeader - 생성자도 아니고 LEADER도 아니면 실패`() {
        // given
        val userId = 1L
        val creatorId = 2L
        val band = Band(id = 1L, name = "테스트 밴드")
        val creator = User(id = creatorId, email = "creator@test.com", password = "pw", name = "생성자")
        val user = User(id = userId, email = "member@test.com", password = "pw", name = "멤버")
        val poll = Poll(
            id = 1L,
            band = band,
            title = "테스트 투표",
            createdBy = creator,
            startDate = LocalDateTime.now(),
            endDate = LocalDateTime.now().plusDays(7)
        )

        val bandMember = BandMember(
            id = 1L,
            band = band,
            user = user,
            role = BandRole.MEMBER
        )

        every { bandMemberRepository.findByBandIdAndUserId(band.id, userId) } returns bandMember

        // when & then
        val exception = assertThrows<GigHubException.UnauthorizedException> {
            permissionService.requirePollCreatorOrLeader(userId, poll)
        }

        assertEquals(ErrorCode.UNAUTHORIZED, exception.errorCode)
    }

    @Test
    fun `isBandMember - true 반환`() {
        // given
        val userId = 1L
        val bandId = 1L

        every { bandMemberRepository.existsByBandIdAndUserId(bandId, userId) } returns true

        // when
        val result = permissionService.isBandMember(userId, bandId)

        // then
        assertTrue(result)
    }

    @Test
    fun `isBandMember - false 반환`() {
        // given
        val userId = 1L
        val bandId = 1L

        every { bandMemberRepository.existsByBandIdAndUserId(bandId, userId) } returns false

        // when
        val result = permissionService.isBandMember(userId, bandId)

        // then
        assertFalse(result)
    }

    @Test
    fun `isBandLeader - LEADER면 true 반환`() {
        // given
        val userId = 1L
        val bandId = 1L
        val band = Band(id = bandId, name = "테스트 밴드")
        val user = User(id = userId, email = "test@test.com", password = "pw", name = "테스트")
        val bandMember = BandMember(
            id = 1L,
            band = band,
            user = user,
            role = BandRole.LEADER
        )

        every { bandMemberRepository.findByBandIdAndUserId(bandId, userId) } returns bandMember

        // when
        val result = permissionService.isBandLeader(userId, bandId)

        // then
        assertTrue(result)
    }

    @Test
    fun `isBandLeader - MEMBER면 false 반환`() {
        // given
        val userId = 1L
        val bandId = 1L
        val band = Band(id = bandId, name = "테스트 밴드")
        val user = User(id = userId, email = "test@test.com", password = "pw", name = "테스트")
        val bandMember = BandMember(
            id = 1L,
            band = band,
            user = user,
            role = BandRole.MEMBER
        )

        every { bandMemberRepository.findByBandIdAndUserId(bandId, userId) } returns bandMember

        // when
        val result = permissionService.isBandLeader(userId, bandId)

        // then
        assertFalse(result)
    }
}
