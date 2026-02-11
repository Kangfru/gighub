// Song card with vote button

import type { SongResponse } from '../api/polls'
import { vote, cancelVote } from '../api/votes'

export function renderSongCard(
  song: SongResponse,
  isVoted: boolean,
  voteId?: number,
  currentUserId?: number,
  rank?: number,
  isEnded: boolean = false
): string {
  const voteButtonText = isVoted ? '투표 취소' : '투표하기'
  const voteAction = isVoted
    ? `window.handleCancelVote(${voteId})`
    : `window.handleVote(${song.id})`

  // 수정 권한 확인 (제안자 본인)
  const canEdit = currentUserId && song.suggestedBy.id === currentUserId

  // 순위 배지 생성
  const getRankBadge = (rank: number) => {
    const medals = ['🥇', '🥈', '🥉']
    if (rank <= 3) {
      return `<div style="font-size: 2rem; line-height: 1;">${medals[rank - 1]}</div>`
    }
    return `<div style="font-size: 1.25rem; font-weight: 700; color: #737373;">${rank}위</div>`
  }

  return `
    <div class="card" style="transition: background-color 0.2s; ${rank ? 'position: relative;' : ''}">
      ${rank ? `
        <div style="position: absolute; top: 1rem; left: 1rem; display: flex; align-items: center; justify-content: center; width: 3rem; height: 3rem; background: white; border-radius: 9999px; border: 2px solid #e5e5e5; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${getRankBadge(rank)}
        </div>
      ` : ''}
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem; ${rank ? 'margin-left: 3.5rem;' : ''}">
        <div style="flex: 1;">
          <h4 style="font-size: 1.25rem; font-weight: 600; color: #171717; margin-bottom: 0.25rem;">${song.artist}</h4>
          <p style="color: #525252; font-weight: 500;">${song.title}</p>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; background: #f5f5f5; padding: 0.5rem 1rem; border-radius: 9999px; border: 1px solid #e5e5e5;">
          <span style="font-size: 1.5rem; font-weight: 700; color: #2563eb;">${song.voteCount}</span>
          <span style="font-size: 0.875rem; color: #525252;">표</span>
        </div>
      </div>

      ${song.youtubeUrl
      ? `
        <a
          href="${song.youtubeUrl}"
          target="_blank"
          style="display: inline-flex; align-items: center; gap: 0.5rem; color: #dc2626; padding: 0.5rem 0.75rem; border-radius: 9999px; border: 1px solid #fecaca; background: #fef2f2; font-size: 0.875rem; margin-bottom: 0.75rem; text-decoration: none; transition: all 0.2s;"
          onmouseover="this.style.background='#fee2e2'"
          onmouseout="this.style.background='#fef2f2'"
        >
          <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
          YouTube에서 듣기
        </a>
      `
      : ''
    }

      ${song.description
      ? `<p style="color: #525252; font-size: 0.875rem; margin-bottom: 1rem; background: #fafafa; padding: 1rem; border-radius: 0.75rem; border: 1px solid #e5e5e5;">${song.description}</p>`
      : ''
    }

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e5e5;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="width: 1.75rem; height: 1.75rem; border-radius: 9999px; background: #171717; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: white; font-weight: 600;">
                ${song.suggestedBy.name.substring(0, 1)}
            </span>
            <span style="font-size: 0.875rem; color: #525252;">제안: ${song.suggestedBy.name}</span>
            ${canEdit && !isEnded ? `
              <button
                onclick="window.showEditSongModal(${song.id})"
                style="color: #737373; background: none; border: none; cursor: pointer; padding: 0.25rem; display: inline-flex; align-items: center;"
                title="곡 수정"
              >
                <svg style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
            ` : ''}
        </div>
        ${!isEnded ? `
          <button
            onclick="${voteAction}"
            class="btn ${isVoted ? '' : 'btn-primary'}"
            style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; ${isVoted ? 'background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;' : ''}"
            ${isVoted ? 'onmouseover="this.style.background=\'#fee2e2\'" onmouseout="this.style.background=\'#fef2f2\'"' : ''}
          >
            ${isVoted ? `
              <svg style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ` : `
              <svg style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            `}
            ${voteButtonText}
          </button>
        ` : ''}
      </div>
    </div>
  `
}

// 전역 함수로 등록
; (window as any).handleVote = async (songId: number) => {
  try {
    await vote({ songId })
    // 페이지 새로고침
    window.location.reload()
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message)
    }
  }
}

  ; (window as any).handleCancelVote = async (voteId: number) => {
    try {
      await cancelVote(voteId)
      // 페이지 새로고침
      window.location.reload()
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    }
  }
