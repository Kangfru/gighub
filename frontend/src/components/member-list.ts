// Band member list component

import type { BandMemberInfo } from '../api/bands'

export function renderMemberList(members: BandMemberInfo[]): string {
  return `
    <div class="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
      <h3 class="text-xl font-bold text-neutral-900 mb-4">멤버 목록</h3>
      <div class="space-y-3">
        ${members
          .map(
            (member) => `
          <div class="flex justify-between items-center py-3 border-b border-neutral-200 last:border-b-0">
            <div>
              <span class="font-semibold text-neutral-900">${member.user.name}</span>
              ${
                member.user.instrument
                  ? `<span class="text-neutral-500 text-sm ml-2">(${member.user.instrument})</span>`
                  : ''
              }
              ${
                member.role === 'LEADER'
                  ? '<span class="badge-leader text-xs px-2 py-0.5 rounded ml-2">리더</span>'
                  : ''
              }
            </div>
            <span class="text-sm text-neutral-500">
              ${new Date(member.joinedAt).toLocaleDateString('ko-KR')} 가입
            </span>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `
}
