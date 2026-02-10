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
    <div style="min-height: 100vh; background: #fafafa; padding: 2rem 0;">
      <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem;">
        <div style="text-align: center; color: #737373; padding: 3rem;">로딩 중...</div>
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
      UPCOMING: 'badge-primary',
      ACTIVE: 'badge-success',
      ENDED: 'badge-neutral'
    }

    const statusLabels = {
      UPCOMING: '예정',
      ACTIVE: '진행중',
      ENDED: '종료'
    }

    app.innerHTML = `
      ${renderNavbar()}
      <div style="min-height: 100vh; background: #fafafa; padding: 2rem 0;">
        <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem;">
          <!-- 뒤로가기 -->
          <button
            onclick="window.navigateTo('/bands/${poll.bandId}')"
            style="color: #171717; font-weight: 500; margin-bottom: 1rem; text-decoration: underline; text-underline-offset: 2px; background: none; border: none; cursor: pointer; font-size: 0.9375rem;"
          >
            ← 밴드로 돌아가기
          </button>

          <!-- 투표 정보 -->
          <div class="card fade-in" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
              <div style="flex: 1;">
                <h1 style="font-size: 2rem; font-weight: 600; color: #171717; margin-bottom: 0.5rem;">${poll.title}</h1>
                ${
                  poll.description
                    ? `<p style="color: #737373;">${poll.description}</p>`
                    : ''
                }
              </div>
              <span class="badge ${statusColors[poll.status]}" style="padding: 0.375rem 1rem;">
                ${statusLabels[poll.status]}
              </span>
            </div>

            <div style="font-size: 0.875rem; color: #737373; display: flex; flex-direction: column; gap: 0.25rem; padding-top: 1rem; border-top: 1px solid #e5e5e5;">
              <div>기간: ${formatDateTime(poll.startDate)} ~ ${formatDateTime(poll.endDate)}</div>
              <div>생성자: ${poll.createdBy.name}</div>
            </div>
          </div>

          <!-- 곡 제안 버튼 & 제목 -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.5rem; font-weight: 600; color: #171717;">제안된 곡</h2>
            ${
              poll.status === 'ACTIVE'
                ? `
              <button
                onclick="window.showAddSongModal()"
                class="btn btn-primary"
              >
                + 곡 제안하기
              </button>
            `
                : ''
            }
          </div>

          <!-- 곡 목록 -->
          ${
            poll.songs.length === 0
              ? `
            <div class="card" style="text-align: center; padding: 3rem;">
              <p style="color: #737373;">아직 제안된 곡이 없습니다.</p>
              ${
                poll.status === 'ACTIVE'
                  ? '<p style="color: #a3a3a3; font-size: 0.875rem; margin-top: 0.5rem;">첫 곡을 제안해보세요!</p>'
                  : ''
              }
            </div>
          `
              : `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr)); gap: 1.5rem;">
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
      <div id="add-song-modal" class="fixed inset-0 modal-backdrop hidden items-center justify-center z-50" style="padding: 1.5rem;">
        <div class="card w-full" style="max-width: 28rem; animation: modalSlideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
          <h2 class="text-2xl font-semibold" style="color: #171717; margin-bottom: 1.25rem;">곡 제안하기</h2>
          <form id="add-song-form">
            <div class="form-group">
              <label class="label">아티스트</label>
              <input
                type="text"
                id="artist"
                required
                maxlength="100"
                class="input"
                placeholder="아티스트명"
              />
            </div>

            <div class="form-group">
              <label class="label">곡 제목</label>
              <input
                type="text"
                id="title"
                required
                maxlength="200"
                class="input"
                placeholder="곡 제목"
              />
            </div>

            <div class="form-group">
              <label class="label">YouTube URL <span style="color: #a3a3a3; font-weight: 400;">(선택)</span></label>
              <input
                type="url"
                id="youtube-url"
                maxlength="500"
                class="input"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div class="form-group">
              <label class="label">설명 <span style="color: #a3a3a3; font-weight: 400;">(선택)</span></label>
              <textarea
                id="song-description"
                rows="3"
                class="input"
                placeholder="곡에 대한 설명"
              ></textarea>
            </div>

            <div id="modal-error" class="alert alert-error hidden"></div>

            <div style="display: flex; gap: 1rem; margin-top: 0.75rem;">
              <button
                type="button"
                onclick="window.hideAddSongModal()"
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
