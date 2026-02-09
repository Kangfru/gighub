// Band list page (user's bands)

import { getMyBands, createBand, joinBand } from '../api/bands'
import { renderNavbar } from '../components/navbar'
import { renderBandCard } from '../components/band-card'
import { renderSkeletonGrid } from '../components/loading'
import { showToast } from '../utils/toast'

export async function renderBandsPage(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app')!

  // 로딩 UI
  app.innerHTML = `
    ${renderNavbar()}
    <div class="min-h-screen py-12 bg-neutral-50 w-full flex justify-center">
      <div class="container mx-auto px-8 lg:px-12 w-full">
        ${renderSkeletonGrid()}
      </div>
    </div>
  `

  try {
    const bands = await getMyBands()

    app.innerHTML = `
      ${renderNavbar()}
      <div class="min-h-screen py-12 bg-neutral-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center mb-12 fade-in">
            <div>
              <h1 class="text-4xl font-bold text-neutral-900 mb-2 tracking-tight">내 밴드</h1>
              <p class="text-neutral-600">함께 음악을 만들어가는 공간</p>
            </div>
            <div class="flex gap-3">
              <button
                onclick="window.showJoinBandModal()"
                class="btn-secondary flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 6a3 3 0 11-6 0 3 3 0 016 0zM14 17a6 6 0 00-12 0h12zM13 8a1 1 0 100 2h4a1 1 0 100-2h-4z"></path>
                </svg>
                밴드 참여
              </button>
              <button
                onclick="window.showCreateBandModal()"
                class="btn-primary flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                </svg>
                밴드 만들기
              </button>
            </div>
          </div>

          ${bands.length === 0
        ? `
            <div class="text-center mt-24 fade-in">
              <div class="text-7xl mb-6">🎸</div>
              <p class="text-2xl font-bold text-neutral-900 mb-3">아직 밴드가 없습니다</p>
              <p class="text-neutral-600 mb-10">밴드를 만들거나 초대 코드로 가입해보세요!</p>
              <div class="flex gap-4 justify-center">
                <button
                  onclick="window.showJoinBandModal()"
                  class="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4"
                >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 6a3 3 0 11-6 0 3 3 0 016 0zM14 17a6 6 0 00-12 0h12zM13 8a1 1 0 100 2h4a1 1 0 100-2h-4z"></path>
                  </svg>
                  초대 코드로 참여
                </button>
                <button
                  onclick="window.showCreateBandModal()"
                  class="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
                >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                  </svg>
                  첫 밴드 만들기
                </button>
              </div>
            </div>
          `
        : `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              ${bands.map((band) => renderBandCard(band)).join('')}
            </div>
          `
      }
        </div>
      </div>

      <!-- 밴드 생성 모달 -->
      <div id="create-band-modal" class="fixed inset-0 modal-backdrop hidden items-center justify-center z-50 px-4">
        <div class="card-base w-full max-w-md scale-in shadow-2xl p-8">
          <h2 class="text-3xl font-bold text-neutral-900 mb-8">새 밴드 만들기</h2>
          <form id="create-band-form" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">
                밴드 이름
              </label>
              <input
                type="text"
                id="band-name"
                required
                maxlength="100"
                class="input-base"
                placeholder="예: 록밴드, 재즈 앙상블"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">
                설명 (선택)
              </label>
              <textarea
                id="band-description"
                rows="3"
                class="input-base resize-none"
                placeholder="밴드에 대해 간단히 소개해주세요"
              ></textarea>
            </div>

            <div id="modal-error" class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl hidden"></div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                onclick="window.hideCreateBandModal()"
                class="flex-1 btn-secondary"
              >
                취소
              </button>
              <button
                type="submit"
                class="flex-1 btn-primary"
              >
                만들기
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 밴드 참여 모달 -->
      <div id="join-band-modal" class="fixed inset-0 modal-backdrop hidden items-center justify-center z-50 px-4">
        <div class="card-base w-full max-w-md scale-in shadow-2xl p-8">
          <h2 class="text-3xl font-bold text-neutral-900 mb-8">밴드 참여하기</h2>
          <form id="join-band-form" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">
                초대 코드
              </label>
              <input
                type="text"
                id="invite-code"
                required
                class="input-base font-mono"
                placeholder="초대 코드를 입력하세요"
              />
              <p class="mt-2 text-sm text-neutral-600">
                밴드 리더로부터 받은 초대 코드를 입력해주세요
              </p>
            </div>

            <div id="join-modal-error" class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl hidden"></div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                onclick="window.hideJoinBandModal()"
                class="flex-1 btn-secondary"
              >
                취소
              </button>
              <button
                type="submit"
                class="flex-1 btn-primary"
              >
                참여하기
              </button>
            </div>
          </form>
        </div>
      </div>
    `

    setupCreateBandModal()
    setupJoinBandModal()
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    app.innerHTML = `
      ${renderNavbar()}
      <div class="min-h-screen py-12 bg-neutral-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mt-24 fade-in">
            <div class="text-7xl mb-6">⚠️</div>
            <p class="text-2xl font-bold text-red-600 mb-3">오류가 발생했습니다</p>
            <p class="text-neutral-600 mb-8">${message}</p>
            <button
              onclick="window.location.reload()"
              class="btn-primary"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    `
    showToast(message, 'error')
  }
}

function setupCreateBandModal(): void {
  const modal = document.querySelector('#create-band-modal')!
  const form = document.querySelector<HTMLFormElement>('#create-band-form')!
  const errorMessage = document.querySelector('#modal-error')!

    ; (window as any).showCreateBandModal = () => {
      modal.classList.remove('hidden')
      modal.classList.add('flex')
    }

    ; (window as any).hideCreateBandModal = () => {
      modal.classList.add('hidden')
      modal.classList.remove('flex')
      form.reset()
      errorMessage.classList.add('hidden')
    }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const name = (document.querySelector('#band-name') as HTMLInputElement).value
    const description = (
      document.querySelector('#band-description') as HTMLTextAreaElement
    ).value

    try {
      errorMessage.classList.add('hidden')
      await createBand({ name, description: description || undefined })
      showToast('밴드가 생성되었습니다! 🎉', 'success')
      setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      const message = error instanceof Error ? error.message : '밴드 생성에 실패했습니다.'
      errorMessage.textContent = message
      errorMessage.classList.remove('hidden')
      showToast(message, 'error')
    }
  })
}

function setupJoinBandModal(): void {
  const modal = document.querySelector('#join-band-modal')!
  const form = document.querySelector<HTMLFormElement>('#join-band-form')!
  const errorMessage = document.querySelector('#join-modal-error')!

    ; (window as any).showJoinBandModal = () => {
      modal.classList.remove('hidden')
      modal.classList.add('flex')
    }

    ; (window as any).hideJoinBandModal = () => {
      modal.classList.add('hidden')
      modal.classList.remove('flex')
      form.reset()
      errorMessage.classList.add('hidden')
    }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const inviteCode = (document.querySelector('#invite-code') as HTMLInputElement).value.trim()

    try {
      errorMessage.classList.add('hidden')
      const band = await joinBand({ inviteCode })
      showToast(`${band.name} 밴드에 참여했습니다! 🎉`, 'success')
      setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      const message = error instanceof Error ? error.message : '밴드 참여에 실패했습니다.'
      errorMessage.textContent = message
      errorMessage.classList.remove('hidden')
      showToast(message, 'error')
    }
  })
}
