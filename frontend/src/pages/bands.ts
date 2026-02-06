// Band list page (user's bands)

import { getMyBands, createBand } from '../api/bands'
import { renderNavbar } from '../components/navbar'
import { renderBandCard } from '../components/band-card'
import { renderSkeletonGrid } from '../components/loading'
import { showToast } from '../utils/toast'

export async function renderBandsPage(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app')!

  // 로딩 UI
  app.innerHTML = `
    ${renderNavbar()}
    <div class="min-h-screen py-8 bg-[#0a0a0a]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        ${renderSkeletonGrid()}
      </div>
    </div>
  `

  try {
    const bands = await getMyBands()

    app.innerHTML = `
      ${renderNavbar()}
      <div class="min-h-screen py-8 bg-[#0a0a0a]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center mb-10 fade-in">
            <div>
              <h1 class="text-4xl font-bold text-white mb-2">내 밴드</h1>
              <p class="text-gray-400">함께 음악을 만들어가는 공간</p>
            </div>
            <button
              onclick="window.showCreateBandModal()"
              class="btn-gradient text-white font-semibold px-8 py-4 rounded-lg shadow-lg flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
              </svg>
              밴드 만들기
            </button>
          </div>

          ${
            bands.length === 0
              ? `
            <div class="text-center mt-20 fade-in">
              <div class="text-8xl mb-6">🎸</div>
              <p class="text-2xl font-bold text-white mb-3">아직 밴드가 없습니다</p>
              <p class="text-gray-400 mb-8">밴드를 만들거나 초대 코드로 가입해보세요!</p>
              <button
                onclick="window.showCreateBandModal()"
                class="btn-gradient text-white font-semibold px-10 py-4 rounded-lg shadow-lg inline-flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                </svg>
                첫 밴드 만들기
              </button>
            </div>
          `
              : `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${bands.map((band) => renderBandCard(band)).join('')}
            </div>
          `
          }
        </div>
      </div>

      <!-- 밴드 생성 모달 -->
      <div id="create-band-modal" class="fixed inset-0 modal-backdrop hidden items-center justify-center z-50 px-4">
        <div class="bg-[#111111] border border-gray-800 rounded-2xl p-10 w-full max-w-md scale-in shadow-2xl">
          <h2 class="text-3xl font-bold text-white mb-8">새 밴드 만들기</h2>
          <form id="create-band-form" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">
                밴드 이름
              </label>
              <input
                type="text"
                id="band-name"
                required
                maxlength="100"
                class="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none transition-all text-white"
                placeholder="예: 록밴드, 재즈 앙상블"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">
                설명 (선택)
              </label>
              <textarea
                id="band-description"
                rows="3"
                class="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none transition-all resize-none text-white"
                placeholder="밴드에 대해 간단히 소개해주세요"
              ></textarea>
            </div>

            <div id="modal-error" class="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg hidden"></div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                onclick="window.hideCreateBandModal()"
                class="flex-1 btn-secondary font-semibold py-4 px-6 rounded-lg transition"
              >
                취소
              </button>
              <button
                type="submit"
                class="flex-1 btn-gradient text-white font-semibold py-4 px-6 rounded-lg shadow-lg"
              >
                만들기
              </button>
            </div>
          </form>
        </div>
      </div>
    `

    setupCreateBandModal()
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    app.innerHTML = `
      ${renderNavbar()}
      <div class="min-h-screen py-8 bg-[#0a0a0a]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mt-20 fade-in">
            <div class="text-8xl mb-6">⚠️</div>
            <p class="text-2xl font-bold text-red-400 mb-3">오류가 발생했습니다</p>
            <p class="text-gray-400 mb-8">${message}</p>
            <button
              onclick="window.location.reload()"
              class="btn-gradient text-white font-semibold px-10 py-4 rounded-lg shadow-lg"
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

  ;(window as any).showCreateBandModal = () => {
    modal.classList.remove('hidden')
    modal.classList.add('flex')
  }

  ;(window as any).hideCreateBandModal = () => {
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
