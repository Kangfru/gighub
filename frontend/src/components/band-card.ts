// Band card component

import type { BandResponse } from '../api/bands'

export function renderBandCard(band: BandResponse): string {
  const roleClasses = band.role === 'LEADER'
    ? 'badge-leader'
    : 'badge-gradient'
  const roleText = band.role === 'LEADER' ? '👑 리더' : '🎵 멤버'

  return `
    <div
      class="card-base card-hover relative overflow-hidden group p-6"
      onclick="window.navigateTo('/bands/${band.id}')"
    >
      <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

      <div class="relative z-10">
        <div class="flex justify-between items-start mb-6">
          <h3 class="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors tracking-tight">${band.name}</h3>
          <span class="${roleClasses} badge">
            ${roleText}
          </span>
        </div>

        ${band.description
      ? `<p class="text-zinc-400 text-sm mb-6 line-clamp-2 min-h-[40px] leading-relaxed">${band.description}</p>`
      : '<p class="text-zinc-600 text-sm mb-6 italic min-h-[40px] flex items-center">설명이 없습니다</p>'
    }

        <div class="flex justify-between items-center text-sm pt-4 border-t border-zinc-800/50">
          <span class="flex items-center gap-1.5 text-zinc-400 font-medium group-hover:text-blue-400 transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
            </svg>
            ${band.memberCount}명
          </span>
          <span class="text-zinc-500 font-mono text-xs">
            ${new Date(band.createdAt).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })}
          </span>
        </div>
      </div>
    </div>
  `
}
