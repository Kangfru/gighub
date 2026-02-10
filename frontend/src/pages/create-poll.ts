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
    <div class="min-h-screen bg-neutral-50 py-8">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 뒤로가기 -->
        <button
          onclick="window.navigateTo('/bands/${bandId}')"
          class="text-blue-600 hover:text-blue-700 mb-4 font-medium"
        >
          ← 밴드로 돌아가기
        </button>

        <!-- 투표 생성 폼 -->
        <div class="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
          <h1 class="text-3xl font-bold text-neutral-900" style="margin-bottom: 1.25rem;">새 투표 만들기</h1>

          <form id="create-poll-form" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">
                투표 제목
              </label>
              <input
                type="text"
                id="title"
                required
                maxlength="200"
                class="input-base"
                placeholder="예: 다음 연습곡 투표"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">
                설명 (선택)
              </label>
              <textarea
                id="description"
                rows="4"
                class="input-base resize-none"
                placeholder="투표에 대한 추가 설명을 입력하세요"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-2">
                  시작 시간
                </label>
                <input
                  type="datetime-local"
                  id="start-date"
                  required
                  value="${formatDateTimeLocal(today)}"
                  class="input-base"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-2">
                  종료 시간
                </label>
                <input
                  type="datetime-local"
                  id="end-date"
                  required
                  value="${formatDateTimeLocal(nextWeek)}"
                  class="input-base"
                />
              </div>
            </div>

            <div id="error-message" class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl hidden"></div>

            <div class="flex gap-4 pt-2">
              <button
                type="button"
                onclick="window.navigateTo('/bands/${bandId}')"
                class="flex-1 btn-secondary py-3"
              >
                취소
              </button>
              <button
                type="submit"
                class="flex-1 btn-primary py-3"
              >
                투표 만들기
              </button>
            </div>
          </form>
        </div>

        <!-- 안내 사항 -->
        <div class="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <h3 class="font-semibold text-blue-700 mb-2">💡 투표 생성 안내</h3>
          <ul class="text-sm text-blue-600 space-y-1">
            <li>• 투표를 생성한 후 곡을 제안할 수 있습니다.</li>
            <li>• 모든 밴드 멤버가 곡을 제안하고 투표할 수 있습니다.</li>
            <li>• 투표 기간 중에는 여러 곡에 투표할 수 있습니다.</li>
          </ul>
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
