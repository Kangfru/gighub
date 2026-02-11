// Band detail page with polls

import {
  getBandDetail,
  updateBand,
  deleteBand,
  createInviteCode,
  getInviteCodes,
  deleteInviteCode,
  type InviteCodeResponse
} from '../api/bands'
import { getPollsByBand } from '../api/polls'
import { renderNavbar } from '../components/navbar'
import { renderPollCard } from '../components/poll-card'
import { renderMemberList } from '../components/member-list'
import { showToast } from '../utils/toast'
import { formatDate } from '../utils/date'

export async function renderBandDetailPage(
  params: Record<string, string>
): Promise<void> {
  const bandId = parseInt(params.bandId)
  const app = document.querySelector<HTMLDivElement>('#app')!

  // 로딩 UI
  app.innerHTML = `
    ${renderNavbar()}
    <div style="min-height: 100vh; background: #fafafa; padding: 2rem 0;">
      <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem;">
        <div style="text-align: center; color: #737373; padding: 3rem;">로딩 중...</div>
      </div>
    </div>
  `

  try {
    const [band, polls] = await Promise.all([
      getBandDetail(bandId),
      getPollsByBand(bandId)
    ])

    app.innerHTML = `
      ${renderNavbar()}
      <div style="min-height: 100vh; background: #fafafa; padding: 2rem 0;">
        <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem;">
          <!-- 뒤로가기 -->
          <button
            onclick="window.navigateTo('/bands')"
            style="color: #171717; font-weight: 500; margin-bottom: 1rem; text-decoration: underline; text-underline-offset: 2px; background: none; border: none; cursor: pointer; font-size: 0.9375rem;"
          >
            ← 밴드 목록
          </button>

          <!-- 밴드 정보 -->
          <div class="card fade-in" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div style="flex: 1;">
                <h1 style="font-size: 2rem; font-weight: 600; color: #171717; margin-bottom: 0.5rem;">${band.name}</h1>
                ${
                  band.description
                    ? `<p style="color: #737373; margin-bottom: 0.75rem;">${band.description}</p>`
                    : ''
                }
                <span class="badge ${
                  band.myRole === 'LEADER' ? 'badge-leader' : 'badge-neutral'
                }">
                  ${band.myRole === 'LEADER' ? '리더' : '멤버'}
                </span>
              </div>
              ${
                band.myRole === 'LEADER'
                  ? `
                <button
                  onclick="window.showBandSettingsModal()"
                  class="btn btn-secondary"
                  style="display: inline-flex; align-items: center; gap: 0.5rem;"
                >
                  <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path>
                  </svg>
                  설정
                </button>
              `
                  : ''
              }
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 7fr 3fr; gap: 1.5rem; align-items: start;">
            <!-- 투표 목록 -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="font-size: 1.5rem; font-weight: 600; color: #171717;">투표 목록</h2>
                <button
                  onclick="window.navigateTo('/bands/${bandId}/polls/create')"
                  class="btn btn-primary"
                >
                  + 투표 만들기
                </button>
              </div>

              ${
                polls.length === 0
                  ? `
                <div class="card" style="text-align: center; padding: 3rem;">
                  <p style="color: #737373;">아직 투표가 없습니다.</p>
                  <p style="color: #a3a3a3; font-size: 0.875rem; margin-top: 0.5rem;">첫 투표를 만들어보세요!</p>
                </div>
              `
                  : `
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                  ${polls.map((poll) => renderPollCard(poll)).join('')}
                </div>
              `
              }
            </div>

            <!-- 멤버 목록 -->
            <div style="padding-top: 3.5rem;">
              ${renderMemberList(band.members)}
            </div>
          </div>
        </div>
      </div>

      ${band.myRole === 'LEADER' ? renderBandSettingsModal() : ''}
    `

    if (band.myRole === 'LEADER') {
      setupBandSettingsModal(bandId, band)
    }
  } catch (error) {
    app.innerHTML = `
      ${renderNavbar()}
      <div style="min-height: 100vh; background: #fafafa; padding: 2rem 0;">
        <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem;">
          <div style="text-align: center; padding: 3rem;">
            <p style="color: #dc2626; font-weight: 600; margin-bottom: 0.5rem;">오류가 발생했습니다</p>
            <p style="color: #737373; font-size: 0.875rem;">
              ${error instanceof Error ? error.message : '알 수 없는 오류'}
            </p>
          </div>
        </div>
      </div>
    `
  }
}

function renderBandSettingsModal(): string {
  return `
    <!-- 밴드 설정 모달 -->
    <div id="band-settings-modal" class="fixed inset-0 modal-backdrop hidden items-center justify-center z-50" style="padding: 1.5rem;">
      <div class="modal-content w-full" style="max-width: 42rem; max-height: 90vh; overflow-y: auto;">
        <div style="position: sticky; top: 0; background: white; border-bottom: 1px solid #e5e5e5; padding: 1.5rem; border-radius: 1.5rem 1.5rem 0 0; z-index: 10;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 class="text-2xl font-semibold" style="color: #171717;">밴드 설정</h2>
            <button
              onclick="window.hideBandSettingsModal()"
              style="color: #737373; background: none; border: none; cursor: pointer; padding: 0.25rem;"
            >
              <svg style="width: 1.5rem; height: 1.5rem;" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>

        <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 2rem;">
          <!-- 밴드 정보 수정 -->
          <div>
            <h3 style="font-size: 1.125rem; font-weight: 600; color: #171717; margin-bottom: 1rem;">밴드 정보</h3>
            <form id="update-band-form">
              <div class="form-group">
                <label class="label">밴드 이름</label>
                <input
                  type="text"
                  id="update-band-name"
                  required
                  maxlength="100"
                  class="input"
                  placeholder="밴드 이름"
                />
              </div>
              <div class="form-group">
                <label class="label">설명 <span style="color: #a3a3a3; font-weight: 400;">(선택)</span></label>
                <textarea
                  id="update-band-description"
                  rows="3"
                  class="input"
                  placeholder="밴드 설명"
                ></textarea>
              </div>
              <div id="update-error" class="alert alert-error hidden"></div>
              <button type="submit" class="btn btn-primary btn-lg w-full" style="margin-top: 0.75rem;">
                변경사항 저장
              </button>
            </form>
          </div>

          <!-- 초대 코드 관리 -->
          <div style="border-top: 1px solid #e5e5e5; padding-top: 2rem;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: #171717; margin-bottom: 1rem;">초대 코드</h3>

            <form id="create-invite-form" style="margin-bottom: 1.5rem;">
              <div style="display: flex; gap: 0.75rem;">
                <div style="flex: 1;">
                  <select id="invite-expires-days" class="input">
                    <option value="7">7일</option>
                    <option value="30" selected>30일</option>
                    <option value="90">90일</option>
                  </select>
                </div>
                <div style="flex: 1;">
                  <select id="invite-role" class="input">
                    <option value="MEMBER" selected>멤버</option>
                    <option value="LEADER">리더</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-primary" style="white-space: nowrap; padding: 0 1.5rem;">
                  코드 생성
                </button>
              </div>
            </form>

            <div id="invite-codes-list" style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="text-align: center; color: #737373; padding: 1rem;">로딩 중...</div>
            </div>
          </div>

          <!-- 밴드 삭제 -->
          <div style="border-top: 1px solid #e5e5e5; padding-top: 2rem;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: #dc2626; margin-bottom: 1rem;">위험 구역</h3>
            <div class="alert alert-error" style="padding: 1.25rem;">
              <p style="color: #171717; margin-bottom: 1rem;">
                밴드를 삭제하면 모든 투표와 데이터가 영구적으로 삭제됩니다.
              </p>
              <button
                onclick="window.confirmDeleteBand()"
                class="btn btn-danger btn-lg w-full"
              >
                밴드 삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function setupBandSettingsModal(bandId: number, band: any): void {
  const modal = document.querySelector('#band-settings-modal')!
  const updateForm = document.querySelector<HTMLFormElement>('#update-band-form')!
  const createInviteForm = document.querySelector<HTMLFormElement>('#create-invite-form')!
  const updateError = document.querySelector('#update-error')!

  // 모달 표시/숨김
  ; (window as any).showBandSettingsModal = async () => {
    modal.classList.remove('hidden')
    modal.classList.add('flex')

    // 현재 밴드 정보로 폼 채우기
    ; (document.querySelector('#update-band-name') as HTMLInputElement).value = band.name
    ; (document.querySelector('#update-band-description') as HTMLTextAreaElement).value = band.description || ''

    // 초대 코드 목록 로드
    await loadInviteCodes(bandId)
  }

  ; (window as any).hideBandSettingsModal = () => {
    modal.classList.add('hidden')
    modal.classList.remove('flex')
    updateError.classList.add('hidden')
  }

  // 밴드 정보 수정
  updateForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const name = (document.querySelector('#update-band-name') as HTMLInputElement).value
    const description = (document.querySelector('#update-band-description') as HTMLTextAreaElement).value

    try {
      updateError.classList.add('hidden')
      await updateBand(bandId, { name, description: description || undefined })
      showToast('밴드 정보가 수정되었습니다', 'success')
      setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      const message = error instanceof Error ? error.message : '수정에 실패했습니다'
      updateError.textContent = message
      updateError.classList.remove('hidden')
      showToast(message, 'error')
    }
  })

  // 초대 코드 생성
  createInviteForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const expiresInDays = parseInt((document.querySelector('#invite-expires-days') as HTMLSelectElement).value)
    const role = (document.querySelector('#invite-role') as HTMLSelectElement).value as 'LEADER' | 'MEMBER'

    try {
      await createInviteCode(bandId, { expiresInDays, role })
      showToast('초대 코드가 생성되었습니다', 'success')
      await loadInviteCodes(bandId)
    } catch (error) {
      const message = error instanceof Error ? error.message : '생성에 실패했습니다'
      showToast(message, 'error')
    }
  })

  // 밴드 삭제 확인
  ; (window as any).confirmDeleteBand = async () => {
    if (!confirm(`정말로 "${band.name}" 밴드를 삭제하시겠습니까?\n\n모든 투표와 데이터가 영구적으로 삭제됩니다.`)) {
      return
    }

    try {
      await deleteBand(bandId)
      showToast('밴드가 삭제되었습니다', 'success')
      setTimeout(() => window.navigateTo('/bands'), 500)
    } catch (error) {
      const message = error instanceof Error ? error.message : '삭제에 실패했습니다'
      showToast(message, 'error')
    }
  }
}

async function loadInviteCodes(bandId: number): Promise<void> {
  const container = document.querySelector('#invite-codes-list')!

  try {
    const codes = await getInviteCodes(bandId)

    if (codes.length === 0) {
      container.innerHTML = `
        <div class="text-center text-neutral-500 py-4">
          초대 코드가 없습니다
        </div>
      `
      return
    }

    container.innerHTML = codes.map(code => renderInviteCodeCard(code)).join('')
  } catch (error) {
    container.innerHTML = `
      <div class="text-center text-red-600 py-4">
        초대 코드를 불러오지 못했습니다
      </div>
    `
  }
}

function renderInviteCodeCard(code: InviteCodeResponse): string {
  const isExpired = new Date(code.expiresAt) < new Date()

  return `
    <div style="background: #fafafa; border: 1px solid #e5e5e5; border-radius: 0.75rem; padding: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.75rem;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <code style="font-family: monospace; font-size: 0.875rem; background: white; padding: 0.375rem 0.75rem; border-radius: 0.5rem; color: #2563eb; border: 1px solid #d4d4d4; font-weight: 600;">
              ${code.code}
            </code>
            <button
              onclick="navigator.clipboard.writeText('${code.code}'); window.showToast?.('복사되었습니다', 'success')"
              style="color: #737373; background: none; border: none; cursor: pointer; padding: 0.25rem;"
              title="복사"
            >
              <svg style="width: 1rem; height: 1rem;" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
              </svg>
            </button>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #525252;">
            <span class="${code.role === 'LEADER' ? 'badge-leader' : 'badge-neutral'}" style="padding: 0.125rem 0.5rem;">
              ${code.role === 'LEADER' ? '리더' : '멤버'}
            </span>
            ${
              isExpired
                ? `<span style="color: #dc2626; font-weight: 500;">만료됨</span>`
                : `<span>만료: ${formatDate(code.expiresAt)}</span>`
            }
          </div>
        </div>
        <button
          onclick="window.deleteInviteCodeConfirm?.('${code.code}')"
          style="color: #dc2626; background: none; border: none; cursor: pointer; padding: 0.25rem;"
          title="삭제"
        >
          <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
  `
}

// 초대 코드 삭제
;(window as any).deleteInviteCodeConfirm = async (code: string) => {
  if (!confirm('이 초대 코드를 삭제하시겠습니까?')) {
    return
  }

  try {
    const bandId = parseInt(window.location.pathname.split('/')[2])
    await deleteInviteCode(bandId, code)
    showToast('초대 코드가 삭제되었습니다', 'success')
    await loadInviteCodes(bandId)
  } catch (error) {
    const message = error instanceof Error ? error.message : '삭제에 실패했습니다'
    showToast(message, 'error')
  }
}
