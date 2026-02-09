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
    <div class="min-h-screen bg-neutral-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center text-neutral-500">로딩 중...</div>
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
      <div class="min-h-screen bg-neutral-50 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- 뒤로가기 -->
          <button
            onclick="window.navigateTo('/bands')"
            class="text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            ← 밴드 목록
          </button>

          <!-- 밴드 정보 -->
          <div class="bg-white border border-neutral-200 rounded-2xl p-8 mb-8 shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h1 class="text-3xl font-bold text-neutral-900">${band.name}</h1>
                ${
                  band.description
                    ? `<p class="text-neutral-600 mt-2">${band.description}</p>`
                    : ''
                }
                <span class="inline-block mt-3 px-3 py-1 text-xs font-medium rounded-full ${
                  band.myRole === 'LEADER'
                    ? 'badge-leader'
                    : 'badge-neutral'
                }">
                  ${band.myRole === 'LEADER' ? '리더' : '멤버'}
                </span>
              </div>
              ${
                band.myRole === 'LEADER'
                  ? `
                <button
                  onclick="window.showBandSettingsModal()"
                  class="btn-secondary flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path>
                  </svg>
                  설정
                </button>
              `
                  : ''
              }
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- 투표 목록 -->
            <div class="lg:col-span-2">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-neutral-900">투표 목록</h2>
                <button
                  onclick="window.navigateTo('/bands/${bandId}/polls/create')"
                  class="btn-primary px-6 py-2.5 rounded-full text-sm"
                >
                  + 투표 만들기
                </button>
              </div>

              ${
                polls.length === 0
                  ? `
                <div class="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-neutral-500 shadow-sm">
                  <p>아직 투표가 없습니다.</p>
                  <p class="text-sm mt-2">첫 투표를 만들어보세요!</p>
                </div>
              `
                  : `
                <div class="space-y-4">
                  ${polls.map((poll) => renderPollCard(poll)).join('')}
                </div>
              `
              }
            </div>

            <!-- 멤버 목록 -->
            <div class="lg:col-span-1">
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
      <div class="min-h-screen bg-neutral-50 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center text-red-600">
            오류가 발생했습니다: ${
              error instanceof Error ? error.message : '알 수 없는 오류'
            }
          </div>
        </div>
      </div>
    `
  }
}

function renderBandSettingsModal(): string {
  return `
    <!-- 밴드 설정 모달 -->
    <div id="band-settings-modal" class="fixed inset-0 modal-backdrop hidden items-center justify-center z-50 px-4">
      <div class="card-base w-full max-w-2xl scale-in shadow-2xl bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 pb-4">
          <div class="flex justify-between items-center">
            <h2 class="text-3xl font-bold text-white">밴드 설정</h2>
            <button
              onclick="window.hideBandSettingsModal()"
              class="text-zinc-400 hover:text-white transition"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-8">
          <!-- 밴드 정보 수정 -->
          <div>
            <h3 class="text-xl font-bold text-white mb-4">밴드 정보</h3>
            <form id="update-band-form" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-zinc-300 mb-2">
                  밴드 이름
                </label>
                <input
                  type="text"
                  id="update-band-name"
                  required
                  maxlength="100"
                  class="input-base"
                  placeholder="밴드 이름"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-zinc-300 mb-2">
                  설명 (선택)
                </label>
                <textarea
                  id="update-band-description"
                  rows="3"
                  class="input-base resize-none"
                  placeholder="밴드 설명"
                ></textarea>
              </div>
              <div id="update-error" class="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg hidden"></div>
              <button type="submit" class="btn-primary w-full">
                변경사항 저장
              </button>
            </form>
          </div>

          <!-- 초대 코드 관리 -->
          <div class="border-t border-zinc-800 pt-8">
            <h3 class="text-xl font-bold text-white mb-4">초대 코드</h3>

            <form id="create-invite-form" class="mb-6">
              <div class="flex gap-3">
                <div class="flex-1">
                  <select id="invite-expires-days" class="input-base">
                    <option value="7">7일</option>
                    <option value="30" selected>30일</option>
                    <option value="90">90일</option>
                  </select>
                </div>
                <div class="flex-1">
                  <select id="invite-role" class="input-base">
                    <option value="MEMBER" selected>멤버</option>
                    <option value="LEADER">리더</option>
                  </select>
                </div>
                <button type="submit" class="btn-primary whitespace-nowrap">
                  코드 생성
                </button>
              </div>
            </form>

            <div id="invite-codes-list" class="space-y-3">
              <div class="text-center text-zinc-400 py-4">로딩 중...</div>
            </div>
          </div>

          <!-- 밴드 삭제 -->
          <div class="border-t border-zinc-800 pt-8">
            <h3 class="text-xl font-bold text-red-400 mb-4">위험 구역</h3>
            <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p class="text-zinc-300 mb-4">
                밴드를 삭제하면 모든 투표와 데이터가 영구적으로 삭제됩니다.
              </p>
              <button
                onclick="window.confirmDeleteBand()"
                class="btn-danger w-full"
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
        <div class="text-center text-zinc-400 py-4">
          초대 코드가 없습니다
        </div>
      `
      return
    }

    container.innerHTML = codes.map(code => renderInviteCodeCard(code)).join('')
  } catch (error) {
    container.innerHTML = `
      <div class="text-center text-red-400 py-4">
        초대 코드를 불러오지 못했습니다
      </div>
    `
  }
}

function renderInviteCodeCard(code: InviteCodeResponse): string {
  const isExpired = new Date(code.expiresAt) < new Date()
  const isUsed = code.usedByUser !== undefined && code.usedByUser !== null

  return `
    <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
      <div class="flex justify-between items-start mb-2">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <code class="text-sm font-mono bg-zinc-900 px-3 py-1 rounded text-blue-400 border border-zinc-700">
              ${code.code}
            </code>
            <button
              onclick="navigator.clipboard.writeText('${code.code}'); window.showToast?.('복사되었습니다', 'success')"
              class="text-zinc-400 hover:text-white transition"
              title="복사"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
              </svg>
            </button>
          </div>
          <div class="flex items-center gap-2 text-xs text-zinc-400">
            <span class="px-2 py-1 rounded ${
              code.role === 'LEADER'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-zinc-700 text-zinc-300'
            }">
              ${code.role === 'LEADER' ? '리더' : '멤버'}
            </span>
            ${
              isUsed
                ? `<span class="text-green-400">✓ 사용됨 (${code.usedByUser?.name})</span>`
                : isExpired
                ? `<span class="text-red-400">만료됨</span>`
                : `<span>만료: ${formatDate(code.expiresAt)}</span>`
            }
          </div>
        </div>
        ${
          !isUsed
            ? `
          <button
            onclick="window.deleteInviteCodeConfirm?.('${code.code}')"
            class="text-red-400 hover:text-red-300 transition"
            title="삭제"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
          </button>
        `
            : ''
        }
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
