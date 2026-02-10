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
    <div style="min-height: 100vh; padding: 3rem 0; background: #fafafa; display: flex; justify-content: center;">
      <div style="max-width: 80rem; width: 100%; padding: 0 1.5rem;">
        ${renderSkeletonGrid()}
      </div>
    </div>
  `

  try {
    const bands = await getMyBands()

    app.innerHTML = `
      ${renderNavbar()}
      <div style="min-height: 100vh; padding: 3rem 0; background: #fafafa;">
        <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem;">
          <div class="fade-in" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem;">
            <div>
              <h1 style="font-size: 2.25rem; font-weight: 600; color: #171717; margin-bottom: 0.5rem; letter-spacing: -0.02em;">내 밴드</h1>
              <p style="color: #737373;">함께 음악을 만들어가는 공간</p>
            </div>
            <div style="display: flex; gap: 0.75rem;">
              <button
                onclick="window.showJoinBandModal()"
                class="btn btn-secondary"
                style="display: inline-flex; align-items: center; gap: 0.5rem;"
              >
                <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 6a3 3 0 11-6 0 3 3 0 016 0zM14 17a6 6 0 00-12 0h12zM13 8a1 1 0 100 2h4a1 1 0 100-2h-4z"></path>
                </svg>
                밴드 참여
              </button>
              <button
                onclick="window.showCreateBandModal()"
                class="btn btn-primary"
                style="display: inline-flex; align-items: center; gap: 0.5rem;"
              >
                <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                </svg>
                밴드 만들기
              </button>
            </div>
          </div>

          ${bands.length === 0
        ? `
            <div class="fade-in" style="text-align: center; margin-top: 6rem;">
              <div style="font-size: 4.5rem; margin-bottom: 1.5rem;">🎸</div>
              <p style="font-size: 1.5rem; font-weight: 600; color: #171717; margin-bottom: 0.75rem;">아직 밴드가 없습니다</p>
              <p style="color: #737373; margin-bottom: 2.5rem;">밴드를 만들거나 초대 코드로 가입해보세요!</p>
              <div style="display: flex; gap: 1rem; justify-content: center;">
                <button
                  onclick="window.showJoinBandModal()"
                  class="btn btn-secondary btn-lg"
                  style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 1rem; padding: 1rem 2rem;"
                >
                  <svg style="width: 1.5rem; height: 1.5rem;" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 6a3 3 0 11-6 0 3 3 0 016 0zM14 17a6 6 0 00-12 0h12zM13 8a1 1 0 100 2h4a1 1 0 100-2h-4z"></path>
                  </svg>
                  초대 코드로 참여
                </button>
                <button
                  onclick="window.showCreateBandModal()"
                  class="btn btn-primary btn-lg"
                  style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 1rem; padding: 1rem 2rem;"
                >
                  <svg style="width: 1.5rem; height: 1.5rem;" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                  </svg>
                  첫 밴드 만들기
                </button>
              </div>
            </div>
          `
        : `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr)); gap: 2rem;">
              ${bands.map((band) => renderBandCard(band)).join('')}
            </div>
          `
      }
        </div>
      </div>

      <!-- 밴드 생성 모달 -->
      <div id="create-band-modal" class="fixed inset-0 modal-backdrop hidden items-center justify-center z-50" style="padding: 1.5rem;">
        <div class="card w-full" style="max-width: 28rem; animation: modalSlideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
          <h2 class="text-2xl font-semibold" style="color: #171717; margin-bottom: 1.25rem;">새 밴드 만들기</h2>
          <form id="create-band-form">
            <div class="form-group">
              <label class="label">밴드 이름</label>
              <input
                type="text"
                id="band-name"
                required
                maxlength="100"
                class="input"
                placeholder="예: 록밴드, 재즈 앙상블"
              />
            </div>

            <div class="form-group">
              <label class="label">설명 <span style="color: #a3a3a3; font-weight: 400;">(선택)</span></label>
              <textarea
                id="band-description"
                rows="3"
                class="input"
                placeholder="밴드에 대해 간단히 소개해주세요"
              ></textarea>
            </div>

            <div id="modal-error" class="alert alert-error hidden"></div>

            <div style="display: flex; gap: 1rem; margin-top: 0.75rem;">
              <button
                type="button"
                onclick="window.hideCreateBandModal()"
                class="btn btn-secondary btn-lg"
                style="flex: 1;"
              >
                취소
              </button>
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                style="flex: 1;"
              >
                만들기
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 밴드 참여 모달 -->
      <div id="join-band-modal" class="fixed inset-0 modal-backdrop hidden items-center justify-center z-50" style="padding: 1.5rem;">
        <div class="card w-full" style="max-width: 28rem; animation: modalSlideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
          <h2 class="text-2xl font-semibold" style="color: #171717; margin-bottom: 1.25rem;">밴드 참여하기</h2>
          <form id="join-band-form">
            <div class="form-group">
              <label class="label">초대 코드</label>
              <input
                type="text"
                id="invite-code"
                required
                class="input"
                style="font-family: monospace;"
                placeholder="초대 코드를 입력하세요"
              />
              <div class="alert alert-info" style="margin-top: 0.75rem;">
                💡 밴드 리더로부터 받은 초대 코드를 입력해주세요
              </div>
            </div>

            <div id="join-modal-error" class="alert alert-error hidden"></div>

            <div style="display: flex; gap: 1rem; margin-top: 0.75rem;">
              <button
                type="button"
                onclick="window.hideJoinBandModal()"
                class="btn btn-secondary btn-lg"
                style="flex: 1;"
              >
                취소
              </button>
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                style="flex: 1;"
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
      <div style="min-height: 100vh; padding: 3rem 0; background: #fafafa;">
        <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem;">
          <div class="fade-in" style="text-align: center; margin-top: 6rem;">
            <div style="font-size: 4.5rem; margin-bottom: 1.5rem;">⚠️</div>
            <p style="font-size: 1.5rem; font-weight: 600; color: #dc2626; margin-bottom: 0.75rem;">오류가 발생했습니다</p>
            <p style="color: #737373; margin-bottom: 2rem;">${message}</p>
            <button
              onclick="window.location.reload()"
              class="btn btn-primary"
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
