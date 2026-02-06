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
    <nav class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <button
              class="text-2xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
              onclick="window.navigateTo('/bands')"
            >
              <span class="text-3xl">🎸</span>
              <span>GigHub</span>
            </button>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-right">
              <div class="font-semibold">${user.name}</div>
              ${user.instrument ? `<div class="text-xs text-purple-100">${user.instrument}</div>` : ''}
            </div>
            <button
              onclick="window.handleLogout()"
              class="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
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
;(window as any).navigateTo = (path: string) => {
  router.navigate(path)
}

;(window as any).handleLogout = async () => {
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
