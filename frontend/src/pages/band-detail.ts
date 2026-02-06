// Band detail page with polls

import { getBandDetail } from '../api/bands'
import { getPollsByBand } from '../api/polls'
import { renderNavbar } from '../components/navbar'
import { renderPollCard } from '../components/poll-card'
import { renderMemberList } from '../components/member-list'

export async function renderBandDetailPage(
  params: Record<string, string>
): Promise<void> {
  const bandId = parseInt(params.bandId)
  const app = document.querySelector<HTMLDivElement>('#app')!

  // 로딩 UI
  app.innerHTML = `
    ${renderNavbar()}
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">로딩 중...</div>
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
      <div class="min-h-screen bg-gray-100 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- 뒤로가기 -->
          <button
            onclick="window.navigateTo('/bands')"
            class="text-blue-500 hover:underline mb-4"
          >
            ← 밴드 목록
          </button>

          <!-- 밴드 정보 -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">${band.name}</h1>
                ${
                  band.description
                    ? `<p class="text-gray-600 mt-2">${band.description}</p>`
                    : ''
                }
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- 투표 목록 -->
            <div class="lg:col-span-2">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-900">투표 목록</h2>
                <button
                  onclick="window.navigateTo('/bands/${bandId}/polls/create')"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
                >
                  + 투표 만들기
                </button>
              </div>

              ${
                polls.length === 0
                  ? `
                <div class="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
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
    `
  } catch (error) {
    app.innerHTML = `
      ${renderNavbar()}
      <div class="min-h-screen bg-gray-100 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center text-red-500">
            오류가 발생했습니다: ${
              error instanceof Error ? error.message : '알 수 없는 오류'
            }
          </div>
        </div>
      </div>
    `
  }
}
