// Band member list component

import type { BandMemberInfo } from '../api/bands'

export function renderMemberList(members: BandMemberInfo[]): string {
  return `
    <div class="card">
      <h3 style="font-size: 1.25rem; font-weight: 600; color: #171717; margin-bottom: 1rem;">멤버 목록</h3>
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${members
          .map(
            (member, index) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #e5e5e5; ${index === members.length - 1 ? 'border-bottom: none;' : ''}">
            <div>
              <span style="font-weight: 600; color: #171717;">${member.user.name}</span>
              ${
                member.user.instrument
                  ? `<span style="color: #737373; font-size: 0.875rem; margin-left: 0.5rem;">(${member.user.instrument})</span>`
                  : ''
              }
              ${
                member.role === 'LEADER'
                  ? '<span class="badge badge-leader" style="font-size: 0.75rem; margin-left: 0.5rem;">리더</span>'
                  : ''
              }
            </div>
            <span style="font-size: 0.875rem; color: #737373;">
              ${new Date(member.joinedAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })} 가입
            </span>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `
}
