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
      class="card card-interactive"
      onclick="window.navigateTo('/polls/${poll.id}')"
      style="cursor: pointer;"
    >
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
        <h3 style="font-size: 1.25rem; font-weight: 600; color: #171717;">${poll.title}</h3>
        <span class="badge ${statusColor}">
          ${statusLabel}
        </span>
      </div>

      ${poll.description
      ? `<p style="color: #525252; font-size: 0.875rem; margin-bottom: 1rem; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${poll.description}</p>`
      : ''
    }

      <div style="font-size: 0.875rem; color: #737373; display: flex; flex-direction: column; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid #e5e5e5;">
        <div style="display: flex; justify-content: space-between;">
          <span>기간</span>
          <span style="color: #171717; font-weight: 500;">${formatDate(poll.startDate)} ~ ${formatDate(poll.endDate)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>곡 후보</span>
          <span style="color: #171717; font-weight: 500;">${poll.songCount}개</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>생성자</span>
          <span style="color: #171717; font-weight: 500;">${poll.createdBy.name}</span>
        </div>
      </div>
    </div>
  `
}
