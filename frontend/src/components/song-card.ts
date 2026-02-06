// Song card with vote button

import type { SongResponse } from '../api/polls'
import { vote, cancelVote } from '../api/votes'

export function renderSongCard(
  song: SongResponse,
  isVoted: boolean,
  voteId?: number
): string {
  const voteButtonClass = isVoted
    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20'
    : 'btn-primary'
  const voteButtonText = isVoted ? '투표 취소' : '투표하기'
  const voteAction = isVoted
    ? `window.handleCancelVote(${voteId})`
    : `window.handleVote(${song.id})`

  return `
    <div class="card-base hover:bg-zinc-800/50 transition-colors">
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1">
          <h4 class="text-xl font-bold text-white mb-1">${song.artist}</h4>
          <p class="text-zinc-400 font-medium">${song.title}</p>
        </div>
        <div class="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-lg">
          <span class="text-2xl font-bold text-blue-400">${song.voteCount}</span>
          <span class="text-sm text-zinc-500">표</span>
        </div>
      </div>

      ${song.youtubeUrl
      ? `
        <a
          href="${song.youtubeUrl}"
          target="_blank"
          class="inline-flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors text-sm mb-3"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
          YouTube에서 듣기
        </a>
      `
      : ''
    }

      ${song.description
      ? `<p class="text-zinc-400 text-sm mb-4 bg-zinc-800/50 p-3 rounded-lg">${song.description}</p>`
      : ''
    }

      <div class="flex justify-between items-center mt-4 pt-4 border-t border-zinc-800">
        <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                ${song.suggestedBy.name.substring(0, 1)}
            </span>
            <span class="text-sm text-zinc-500">제안: ${song.suggestedBy.name}</span>
        </div>
        <button
          onclick="${voteAction}"
          class="${voteButtonClass} flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium"
        >
          ${isVoted ? `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          ` : `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          `}
          ${voteButtonText}
        </button>
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
