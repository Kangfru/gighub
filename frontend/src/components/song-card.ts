// Song card with vote button

import type { SongResponse } from '../api/polls'
import { vote, cancelVote } from '../api/votes'

export function renderSongCard(
  song: SongResponse,
  isVoted: boolean,
  voteId?: number
): string {
  const voteButtonClass = isVoted
    ? 'bg-red-500 hover:bg-red-600'
    : 'bg-blue-500 hover:bg-blue-600'
  const voteButtonText = isVoted ? '투표 취소' : '투표하기'
  const voteAction = isVoted
    ? `window.handleCancelVote(${voteId})`
    : `window.handleVote(${song.id})`

  return `
    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1">
          <h4 class="text-lg font-bold text-gray-900">${song.artist}</h4>
          <p class="text-gray-700">${song.title}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold text-blue-600">${song.voteCount}</span>
          <span class="text-sm text-gray-500">표</span>
        </div>
      </div>

      ${
        song.youtubeUrl
          ? `
        <a
          href="${song.youtubeUrl}"
          target="_blank"
          class="text-blue-500 hover:underline text-sm mb-2 block"
        >
          🎵 YouTube에서 듣기
        </a>
      `
          : ''
      }

      ${
        song.description
          ? `<p class="text-gray-600 text-sm mb-3">${song.description}</p>`
          : ''
      }

      <div class="flex justify-between items-center mt-4">
        <span class="text-sm text-gray-500">제안: ${song.suggestedBy.name}</span>
        <button
          onclick="${voteAction}"
          class="${voteButtonClass} text-white px-4 py-2 rounded transition"
        >
          ${voteButtonText}
        </button>
      </div>
    </div>
  `
}

// 전역 함수로 등록
;(window as any).handleVote = async (songId: number) => {
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

;(window as any).handleCancelVote = async (voteId: number) => {
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
