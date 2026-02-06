// Poll detail page with songs

import { getPollDetail, addSong } from '../api/polls'
import { getMyVotes } from '../api/votes'
import { renderNavbar } from '../components/navbar'
import { renderSongCard } from '../components/song-card'
import { formatDateTime } from '../utils/date'

export async function renderPollDetailPage(
  params: Record<string, string>
): Promise<void> {
  const pollId = parseInt(params.pollId)
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
    const poll = await getPollDetail(pollId)
    const myVotes = await getMyVotes(pollId)

    const myVoteMap = new Map(
      myVotes.votes.map((v) => [v.songId, v.voteId])
    )

    const statusColors = {
      UPCOMING: 'bg-blue-500',
      ACTIVE: 'bg-green-500',
      ENDED: 'bg-gray-500'
    }

    const statusLabels = {
      UPCOMING: '예정',
      ACTIVE: '진행중',
      ENDED: '종료'
    }

    app.innerHTML = `
      ${renderNavbar()}
      <div class="min-h-screen bg-gray-100 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- 뒤로가기 -->
          <button
            onclick="window.navigateTo('/bands/${poll.bandId}')"
            class="text-blue-500 hover:underline mb-4"
          >
            ← 밴드로 돌아가기
          </button>

          <!-- 투표 정보 -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">${poll.title}</h1>
                ${
                  poll.description
                    ? `<p class="text-gray-600 mt-2">${poll.description}</p>`
                    : ''
                }
              </div>
              <span class="${statusColors[poll.status]} text-white px-3 py-1 rounded">
                ${statusLabels[poll.status]}
              </span>
            </div>

            <div class="text-sm text-gray-500 space-y-1">
              <div>기간: ${formatDateTime(poll.startDate)} ~ ${formatDateTime(
      poll.endDate
    )}</div>
              <div>생성자: ${poll.createdBy.name}</div>
            </div>
          </div>

          <!-- 곡 제안 버튼 -->
          ${
            poll.status === 'ACTIVE'
              ? `
            <div class="mb-6">
              <button
                onclick="window.showAddSongModal()"
                class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition"
              >
                + 곡 제안하기
              </button>
            </div>
          `
              : ''
          }

          <!-- 곡 목록 -->
          <h2 class="text-2xl font-bold text-gray-900 mb-4">제안된 곡</h2>
          ${
            poll.songs.length === 0
              ? `
            <div class="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              <p>아직 제안된 곡이 없습니다.</p>
              ${
                poll.status === 'ACTIVE'
                  ? '<p class="text-sm mt-2">첫 곡을 제안해보세요!</p>'
                  : ''
              }
            </div>
          `
              : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              ${poll.songs
                .map((song) =>
                  renderSongCard(
                    song,
                    myVoteMap.has(song.id),
                    myVoteMap.get(song.id)
                  )
                )
                .join('')}
            </div>
          `
          }
        </div>
      </div>

      <!-- 곡 제안 모달 -->
      <div id="add-song-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center">
        <div class="bg-white rounded-lg p-8 w-full max-w-md">
          <h2 class="text-2xl font-bold mb-6">곡 제안하기</h2>
          <form id="add-song-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                아티스트
              </label>
              <input
                type="text"
                id="artist"
                required
                maxlength="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                곡 제목
              </label>
              <input
                type="text"
                id="title"
                required
                maxlength="200"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                YouTube URL (선택)
              </label>
              <input
                type="url"
                id="youtube-url"
                maxlength="500"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                설명 (선택)
              </label>
              <textarea
                id="song-description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div id="modal-error" class="text-red-500 text-sm hidden"></div>

            <div class="flex gap-2">
              <button
                type="button"
                onclick="window.hideAddSongModal()"
                class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md transition"
              >
                취소
              </button>
              <button
                type="submit"
                class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition"
              >
                제안하기
              </button>
            </div>
          </form>
        </div>
      </div>
    `

    setupAddSongModal(pollId)
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

function setupAddSongModal(pollId: number): void {
  const modal = document.querySelector('#add-song-modal')!
  const form = document.querySelector<HTMLFormElement>('#add-song-form')!
  const errorMessage = document.querySelector('#modal-error')!

  ;(window as any).showAddSongModal = () => {
    modal.classList.remove('hidden')
    modal.classList.add('flex')
  }

  ;(window as any).hideAddSongModal = () => {
    modal.classList.add('hidden')
    modal.classList.remove('flex')
    form.reset()
    errorMessage.classList.add('hidden')
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const artist = (document.querySelector('#artist') as HTMLInputElement).value
    const title = (document.querySelector('#title') as HTMLInputElement).value
    const youtubeUrl = (
      document.querySelector('#youtube-url') as HTMLInputElement
    ).value
    const description = (
      document.querySelector('#song-description') as HTMLTextAreaElement
    ).value

    try {
      errorMessage.classList.add('hidden')
      await addSong(pollId, {
        artist,
        title,
        youtubeUrl: youtubeUrl || undefined,
        description: description || undefined
      })
      window.location.reload()
    } catch (error) {
      errorMessage.textContent =
        error instanceof Error ? error.message : '곡 제안에 실패했습니다.'
      errorMessage.classList.remove('hidden')
    }
  })
}
