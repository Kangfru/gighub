// Band card component

import type { BandResponse } from '../api/bands'

export function renderBandCard(band: BandResponse): string {
  const roleClasses = band.role === 'LEADER'
    ? 'badge-leader text-white'
    : 'badge-gradient text-white'
  const roleText = band.role === 'LEADER' ? '👑 리더' : '🎵 멤버'

  return `
    <div
      class="bg-[#111111] border border-gray-800 hover:border-gray-700 rounded-xl shadow-lg p-8 transition-all cursor-pointer fade-in overflow-hidden relative hover:-translate-y-1"
      onclick="window.navigateTo('/bands/${band.id}')"
    >
      <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16"></div>

      <div class="relative">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-2xl font-bold text-white">${band.name}</h3>
          <span class="${roleClasses} text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
            ${roleText}
          </span>
        </div>

        ${
          band.description
            ? `<p class="text-gray-400 text-sm mb-4 line-clamp-2">${band.description}</p>`
            : '<p class="text-gray-600 text-sm mb-4 italic">설명이 없습니다</p>'
        }

        <div class="flex justify-between items-center text-sm pt-4 border-t border-gray-800">
          <span class="flex items-center gap-1 text-blue-400 font-semibold">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
            </svg>
            ${band.memberCount}명
          </span>
          <span class="text-gray-500">
            ${new Date(band.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>
    </div>
  `
}
