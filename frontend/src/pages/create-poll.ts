// Create poll page

import { createPoll } from '../api/polls'
import { renderNavbar } from '../components/navbar'
import { router } from '../utils/router'

export function renderCreatePollPage(params: Record<string, string>): void {
  const bandId = parseInt(params.bandId)
  const app = document.querySelector<HTMLDivElement>('#app')!

  // 기본값: 오늘부터 7일 후
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  app.innerHTML = `
    ${renderNavbar()}
    <div class="min-h-screen flex items-center justify-center p-6" style="background: #fafafa;">
      <div class="w-full max-w-2xl">
        <!-- 뒤로가기 -->
        <button
          onclick="window.navigateTo('/bands/${bandId}')"
          style="color: #171717; font-weight: 500; margin-bottom: 1.5rem; text-decoration: underline; text-underline-offset: 2px; background: none; border: none; cursor: pointer; font-size: 0.9375rem;"
        >
          ← 밴드로 돌아가기
        </button>

        <!-- 투표 생성 폼 -->
        <div class="card fade-in">
          <h1 class="text-4xl font-semibold" style="color: #171717; letter-spacing: -0.02em; margin-bottom: 1.5rem;">새 투표 만들기</h1>

          <form id="create-poll-form">
            <div class="form-group">
              <label class="label">투표 제목</label>
              <input
                type="text"
                id="title"
                required
                maxlength="200"
                class="input"
                placeholder="예: 다음 연습곡 투표"
              />
            </div>

            <div class="form-group">
              <label class="label">설명 <span style="color: #a3a3a3; font-weight: 400;">(선택)</span></label>
              <textarea
                id="description"
                rows="4"
                class="input"
                placeholder="투표에 대한 추가 설명을 입력하세요"
              ></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="label">시작 시간</label>
                <input
                  type="datetime-local"
                  id="start-date"
                  required
                  value="${formatDateTimeLocal(today)}"
                  class="input"
                />
              </div>

              <div class="form-group">
                <label class="label">종료 시간</label>
                <input
                  type="datetime-local"
                  id="end-date"
                  required
                  value="${formatDateTimeLocal(nextWeek)}"
                  class="input"
                />
              </div>
            </div>

            <div id="error-message" class="alert alert-error hidden"></div>

            <div style="display: flex; gap: 1rem; margin-top: 0.75rem;">
              <button
                type="button"
                onclick="window.navigateTo('/bands/${bandId}')"
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
                투표 만들기
              </button>
            </div>
          </form>

          <!-- 안내 사항 -->
          <div class="alert alert-info" style="margin-top: 1.25rem;">
            💡 투표를 생성한 후 곡을 제안할 수 있습니다. 모든 밴드 멤버가 곡을 제안하고 투표할 수 있습니다.
          </div>
        </div>
      </div>
    </div>
  `

  const form = document.querySelector<HTMLFormElement>('#create-poll-form')!
  const errorMessage = document.querySelector('#error-message')!

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const title = (document.querySelector('#title') as HTMLInputElement).value
    const description = (
      document.querySelector('#description') as HTMLTextAreaElement
    ).value
    const startDate = (document.querySelector('#start-date') as HTMLInputElement)
      .value
    const endDate = (document.querySelector('#end-date') as HTMLInputElement)
      .value

    try {
      errorMessage.classList.add('hidden')

      // ISO 형식으로 변환
      const startDateTime = new Date(startDate).toISOString()
      const endDateTime = new Date(endDate).toISOString()

      await createPoll(bandId, {
        title,
        description: description || undefined,
        startDate: startDateTime,
        endDate: endDateTime
      })

      router.navigate(`/bands/${bandId}`)
    } catch (error) {
      errorMessage.textContent =
        error instanceof Error ? error.message : '투표 생성에 실패했습니다.'
      errorMessage.classList.remove('hidden')
    }
  })
}
