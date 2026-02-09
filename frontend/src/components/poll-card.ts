// Poll card component

import type { PollResponse } from '../api/polls'
import { formatDate } from '../utils/date'

export function renderPollCard(poll: PollResponse): string {
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

  const statusColor = statusColors[poll.status]
  const statusLabel = statusLabels[poll.status]

  return `
    <div
      class="card-base card-hover group"
      onclick="window.navigateTo('/polls/${poll.id}')"
    >
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-xl font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">${poll.title}</h3>
        <span class="badge ${statusColor}">
          ${statusLabel}
        </span>
      </div>

      ${poll.description
      ? `<p class="text-neutral-600 text-sm mb-4 line-clamp-2">${poll.description}</p>`
      : ''
    }

      <div class="text-sm text-neutral-500 space-y-2 pt-4 border-t border-neutral-200">
        <div class="flex justify-between">
          <span>기간</span>
          <span class="text-neutral-700 font-medium">${formatDate(poll.startDate)} ~ ${formatDate(poll.endDate)}</span>
        </div>
        <div class="flex justify-between">
          <span>곡 후보</span>
          <span class="text-neutral-700 font-medium">${poll.songCount}개</span>
        </div>
        <div class="flex justify-between">
          <span>생성자</span>
          <span class="text-neutral-700 font-medium">${poll.createdBy.name}</span>
        </div>
      </div>
    </div>
  `
}
