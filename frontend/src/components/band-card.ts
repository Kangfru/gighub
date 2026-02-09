// Band card component

import type { BandResponse } from '../api/bands'

export function renderBandCard(band: BandResponse): string {
  const roleClasses = band.role === 'LEADER'
    ? 'badge-leader'
    : 'badge-gradient'
  const roleText = band.role === 'LEADER' ? '👑 리더' : '🎵 멤버'

  return `
    <div
      class="card-base card-hover relative overflow-hidden group"
      onclick="window.navigateTo('/bands/${band.id}')"
    >
      <div class="relative z-10">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-2xl font-bold text-neutral-900 group-hover:text-blue-600 transition-colors tracking-tight">${band.name}</h3>
          <span class="${roleClasses} badge">
            ${roleText}
          </span>
        </div>

        ${band.description
      ? `<p class="text-neutral-600 text-sm mb-6 line-clamp-2 min-h-[40px] leading-relaxed">${band.description}</p>`
      : '<p class="text-neutral-400 text-sm mb-6 italic min-h-[40px] flex items-center">설명이 없습니다</p>'
    }

        <div class="flex justify-between items-center text-sm pt-4 border-t border-neutral-200">
          <span class="flex items-center gap-2 text-neutral-500 font-medium">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
            </svg>
            ${band.memberCount}명
          </span>
          <span class="text-neutral-400 text-xs">
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
