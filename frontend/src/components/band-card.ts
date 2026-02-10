// Band card component

import type { BandResponse } from '../api/bands'

export function renderBandCard(band: BandResponse): string {
  const roleClasses = band.role === 'LEADER' ? 'badge-leader' : 'badge-neutral'
  const roleText = band.role === 'LEADER' ? '👑 리더' : '멤버'

  return `
    <div
      class="card card-interactive"
      onclick="window.navigateTo('/bands/${band.id}')"
      style="cursor: pointer;"
    >
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
        <h3 style="font-size: 1.5rem; font-weight: 600; color: #171717; letter-spacing: -0.02em;">
          ${band.name}
        </h3>
        <span class="badge ${roleClasses}">
          ${roleText}
        </span>
      </div>

      ${band.description
      ? `<p style="color: #525252; font-size: 0.875rem; margin-bottom: 1.5rem; line-height: 1.6; min-height: 2.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${band.description}</p>`
      : '<p style="color: #a3a3a3; font-size: 0.875rem; margin-bottom: 1.5rem; font-style: italic; min-height: 2.5rem; display: flex; align-items: center;">설명이 없습니다</p>'
    }

      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; padding-top: 1rem; border-top: 1px solid #e5e5e5;">
        <span style="display: flex; align-items: center; gap: 0.5rem; color: #525252; font-weight: 500;">
          <svg style="width: 1rem; height: 1rem;" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
          </svg>
          ${band.memberCount}명
        </span>
        <span style="color: #a3a3a3; font-size: 0.75rem;">
          ${new Date(band.createdAt).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Seoul'
    })}
        </span>
      </div>
    </div>
  `
}
