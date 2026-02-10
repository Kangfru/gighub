// Navigation bar component

import { getUser, clearAuth, isAuthenticated } from '../utils/auth'
import { router } from '../utils/router'
import { logout } from '../api/auth'
import { showToast } from '../utils/toast'

export function renderNavbar(): string {
  if (!isAuthenticated()) {
    return ''
  }

  const user = getUser()
  if (!user) {
    return ''
  }

  return `
    <nav class="navbar" style="position: sticky; top: 0; z-index: 40;">
      <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; height: 4rem;">
          <button
            onclick="window.navigateTo('/bands')"
            style="display: flex; align-items: center; gap: 0.5rem; background: none; border: none; cursor: pointer; padding: 0.5rem; transition: opacity 0.2s;"
            onmouseover="this.style.opacity='0.7'"
            onmouseout="this.style.opacity='1'"
          >
            <span style="font-size: 1.5rem;">🎸</span>
            <span style="font-size: 1.5rem; font-weight: 700; color: #171717; letter-spacing: -0.02em;">GigHub</span>
          </button>

          <div style="display: flex; align-items: center; gap: 1.5rem;">
            <div style="text-align: right; display: none;" class="sm-block">
              <div style="font-weight: 600; color: #171717; font-size: 0.9375rem;">${user.name}</div>
              ${user.instrument ? `<div style="font-size: 0.75rem; color: #737373; margin-top: 0.125rem;">${user.instrument}</div>` : ''}
            </div>
            <button
              onclick="window.handleLogout()"
              class="btn btn-secondary"
              style="white-space: nowrap;"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </nav>
  `
}

// 전역 함수로 등록
; (window as any).navigateTo = (path: string) => {
  router.navigate(path)
}

  ; (window as any).handleLogout = async () => {
    try {
      await logout()
      showToast('로그아웃 되었습니다', 'info')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuth()
      setTimeout(() => router.navigate('/login'), 500)
    }
  }
