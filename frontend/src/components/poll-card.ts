// Poll card component

import type { PollResponse } from '../api/polls'
import { formatDate } from '../utils/date'

export function renderPollCard(poll: PollResponse): string {
  const statusColors = {
    UPCOMING: 'bg-blue-500',
    ACTIVE: 'bg-green-500',
    ENDED: 'bg-gray-600'
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
      class="bg-[#111111] border border-gray-800 hover:border-gray-700 rounded-lg p-6 transition-all cursor-pointer hover:-translate-y-1"
      onclick="window.navigateTo('/polls/${poll.id}')"
    >
      <div class="flex justify-between items-start mb-3">
        <h3 class="text-xl font-bold text-white">${poll.title}</h3>
        <span class="${statusColor} text-white text-xs px-2 py-1 rounded">
          ${statusLabel}
        </span>
      </div>

      ${
        poll.description
          ? `<p class="text-gray-400 text-sm mb-3 line-clamp-2">${poll.description}</p>`
          : ''
      }

      <div class="text-sm text-gray-500 space-y-1">
        <div>기간: ${formatDate(poll.startDate)} ~ ${formatDate(poll.endDate)}</div>
        <div>곡 ${poll.songCount}개 | 생성자: ${poll.createdBy.name}</div>
      </div>
    </div>
  `
}
