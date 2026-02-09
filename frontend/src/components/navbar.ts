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
    <nav class="bg-white/80 border-b border-neutral-200 text-neutral-900 sticky top-0 z-40 backdrop-blur-lg">
      <div class="container mx-auto px-8 lg:px-12 w-full">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <button
              class="text-2xl font-bold hover:opacity-70 transition-opacity flex items-center gap-2"
              onclick="window.navigateTo('/bands')"
            >
              <span class="text-2xl">🎸</span>
              <span class="text-neutral-900 font-bold tracking-tight">GigHub</span>
            </button>
          </div>

          <div class="flex items-center gap-6">
            <div class="text-right hidden sm:block">
              <div class="font-semibold text-neutral-900">${user.name}</div>
              ${user.instrument ? `<div class="text-xs text-neutral-500">${user.instrument}</div>` : ''}
            </div>
            <button
              onclick="window.handleLogout()"
              class="px-5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 hover:border-neutral-400 rounded-full font-medium transition-all text-sm"
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
