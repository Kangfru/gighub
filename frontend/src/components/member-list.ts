// Band member list component

import type { BandMemberInfo } from '../api/bands'

export function renderMemberList(members: BandMemberInfo[]): string {
  return `
    <div class="bg-[#111111] border border-gray-800 rounded-lg p-6">
      <h3 class="text-xl font-bold text-white mb-4">멤버 목록</h3>
      <div class="space-y-3">
        ${members
          .map(
            (member) => `
          <div class="flex justify-between items-center py-2 border-b border-gray-800 last:border-b-0">
            <div>
              <span class="font-medium text-white">${member.user.name}</span>
              ${
                member.user.instrument
                  ? `<span class="text-gray-500 text-sm ml-2">(${member.user.instrument})</span>`
                  : ''
              }
              ${
                member.role === 'LEADER'
                  ? '<span class="badge-leader text-white text-xs px-2 py-0.5 rounded ml-2">리더</span>'
                  : ''
              }
            </div>
            <span class="text-sm text-gray-500">
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
