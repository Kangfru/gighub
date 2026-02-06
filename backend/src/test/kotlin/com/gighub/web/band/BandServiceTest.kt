package com.gighub.web.band

import com.gighub.domain.band.*
import com.gighub.domain.user.User
import com.gighub.domain.user.UserRepository
import com.gighub.exception.ErrorCode
import com.gighub.exception.GigHubException
import com.gighub.security.PermissionService
import com.gighub.web.band.dto.CreateBandRequest
import com.gighub.web.band.dto.CreateInviteCodeRequest
import io.mockk.*
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.LocalDateTime
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class BandServiceTest {

    private val bandRepository = mockk<BandRepository>()
    private val bandMemberRepository = mockk<BandMemberRepository>()
    private val inviteCodeRepository = mockk<InviteCodeRepository>()
    private val userRepository = mockk<UserRepository>()
    private val permissionService = mockk<PermissionService>()

    private val bandService = BandService(
        bandRepository,
        bandMemberRepository,
        inviteCodeRepository,
        userRepository,
        permissionService
    )

    @AfterEach
    fun tearDown() {
        clearAllMocks()
    }

    @Test
    fun `밴드 생성 - 성공 (생성자는 자동 LEADER)`() {
        // given
        val userId = 1L
        val request = CreateBandRequest(
            name = "테스트 밴드",
            description = "설명"
        )

        val user = User(
            id = userId,
            email = "test@test.com",
            password = "pw",
            name = "테스트"
        )

        val savedBand = Band(
            id = 1L,
            name = request.name,
            description = request.description
        )

        val savedMember = mockk<BandMember>(relaxed = true)

        every { userRepository.findById(userId) } returns java.util.Optional.of(user)
        every { bandRepository.save(any()) } returns savedBand
        every { bandMemberRepository.save(any()) } returns savedMember

        // when
        val response = bandService.createBand(userId, request)

        // then
        assertNotNull(response)
        assertEquals(savedBand.id, response.id)
        assertEquals(request.name, response.name)
        assertEquals(BandRole.LEADER, response.role)
        assertEquals(1, response.memberCount)

        verify(exactly = 1) { bandRepository.save(any()) }
        verify(exactly = 1) {
            bandMemberRepository.save(match {
                it.role == BandRole.LEADER && it.user.id == userId
            })
        }
    }

    @Test
    fun `초대 코드 생성 - LEADER만 가능`() {
        // given
        val userId = 1L
        val bandId = 1L
        val request = CreateInviteCodeRequest(
            expiresInDays = 7,
            role = "MEMBER"
        )

        val band = Band(id = bandId, name = "테스트 밴드")

        val savedInviteCode = mockk<InviteCode>(relaxed = true) {
            every { code } returns "TEST-CODE"
            every { inviteRole } returns BandRole.MEMBER
            every { createdAt } returns LocalDateTime.now()
            every { expiresAt } returns LocalDateTime.now().plusDays(7)
            every { usedByUser } returns null
        }

        every { permissionService.requireBandLeader(userId, bandId) } just Runs
        every { bandRepository.findById(bandId) } returns java.util.Optional.of(band)
        every { inviteCodeRepository.save(any()) } returns savedInviteCode

        // when
        val response = bandService.createInviteCode(userId, bandId, request)

        // then
        assertNotNull(response)
        assertNotNull(response.code)
        assertEquals(BandRole.MEMBER, response.role)

        verify(exactly = 1) { permissionService.requireBandLeader(userId, bandId) }
        verify(exactly = 1) { inviteCodeRepository.save(any()) }
    }

    @Test
    fun `초대 코드 생성 - MEMBER는 실패`() {
        // given
        val userId = 1L
        val bandId = 1L
        val request = CreateInviteCodeRequest(expiresInDays = 7)

        every { permissionService.requireBandLeader(userId, bandId) } throws
            GigHubException.UnauthorizedException(ErrorCode.LEADER_REQUIRED)

        // when & then
        val exception = assertThrows<GigHubException.UnauthorizedException> {
            bandService.createInviteCode(userId, bandId, request)
        }

        assertEquals(ErrorCode.LEADER_REQUIRED, exception.errorCode)
    }

    @Test
    fun `멤버 역할 변경 - LEADER가 MEMBER로 변경 (다른 LEADER 존재)`() {
        // given
        val userId = 1L // 요청자 (LEADER)
        val targetUserId = 2L // 대상 (LEADER -> MEMBER로 변경)
        val bandId = 1L

        val band = Band(id = bandId, name = "테스트 밴드")
        val targetUser = User(id = targetUserId, email = "target@test.com", password = "pw", name = "대상")

        val targetMember = BandMember(
            id = 1L,
            band = band,
            user = targetUser,
            role = BandRole.LEADER
        )

        every { permissionService.requireBandLeader(userId, bandId) } just Runs
        every { bandMemberRepository.findByBandIdAndUserId(bandId, targetUserId) } returns targetMember
        every { bandMemberRepository.countByBandIdAndRole(bandId, BandRole.LEADER) } returns 2 // 2명의 LEADER

        // when
        val response = bandService.updateMemberRole(
            userId,
            bandId,
            targetUserId,
            com.gighub.web.band.dto.UpdateMemberRoleRequest(role = "MEMBER")
        )

        // then
        assertEquals(BandRole.MEMBER, response.role)
        assertEquals(BandRole.MEMBER, targetMember.role) // 실제로 변경됨
    }

    @Test
    fun `멤버 역할 변경 - 마지막 LEADER는 변경 불가`() {
        // given
        val userId = 1L
        val targetUserId = 2L
        val bandId = 1L

        val band = Band(id = bandId, name = "테스트 밴드")
        val targetUser = User(id = targetUserId, email = "target@test.com", password = "pw", name = "대상")

        val targetMember = BandMember(
            id = 1L,
            band = band,
            user = targetUser,
            role = BandRole.LEADER
        )

        every { permissionService.requireBandLeader(userId, bandId) } just Runs
        every { bandMemberRepository.findByBandIdAndUserId(bandId, targetUserId) } returns targetMember
        every { bandMemberRepository.countByBandIdAndRole(bandId, BandRole.LEADER) } returns 1 // 1명만 LEADER

        // when & then
        val exception = assertThrows<GigHubException.BusinessException> {
            bandService.updateMemberRole(
                userId,
                bandId,
                targetUserId,
                com.gighub.web.band.dto.UpdateMemberRoleRequest(role = "MEMBER")
            )
        }

        assertEquals(ErrorCode.CANNOT_REMOVE_LAST_LEADER, exception.errorCode)
    }

    @Test
    fun `멤버 제거 - LEADER가 다른 멤버 추방`() {
        // given
        val userId = 1L // 요청자 (LEADER)
        val targetUserId = 2L // 대상 (MEMBER)
        val bandId = 1L

        val band = Band(id = bandId, name = "테스트 밴드")
        val targetUser = User(id = targetUserId, email = "target@test.com", password = "pw", name = "대상")

        val targetMember = BandMember(
            id = 1L,
            band = band,
            user = targetUser,
            role = BandRole.MEMBER
        )

        every { permissionService.requireBandLeader(userId, bandId) } just Runs
        every { bandMemberRepository.findByBandIdAndUserId(bandId, targetUserId) } returns targetMember
        every { bandMemberRepository.delete(targetMember) } just Runs

        // when
        bandService.removeMember(userId, bandId, targetUserId)

        // then
        verify(exactly = 1) { bandMemberRepository.delete(targetMember) }
    }

    @Test
    fun `멤버 제거 - 본인 탈퇴 (권한 체크 안 함)`() {
        // given
        val userId = 1L
        val bandId = 1L

        val band = Band(id = bandId, name = "테스트 밴드")
        val user = User(id = userId, email = "test@test.com", password = "pw", name = "테스트")

        val member = BandMember(
            id = 1L,
            band = band,
            user = user,
            role = BandRole.MEMBER
        )

        every { bandMemberRepository.findByBandIdAndUserId(bandId, userId) } returns member
        every { bandMemberRepository.delete(member) } just Runs

        // when
        bandService.removeMember(userId, bandId, userId)

        // then
        verify(exactly = 0) { permissionService.requireBandLeader(any(), any()) } // 권한 체크 안 함
        verify(exactly = 1) { bandMemberRepository.delete(member) }
    }
}
