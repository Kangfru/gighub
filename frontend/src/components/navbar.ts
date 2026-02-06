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
    <nav class="bg-zinc-900 border-b border-zinc-800 text-white sticky top-0 z-40 backdrop-blur-lg bg-zinc-900/80">
      <div class="container mx-auto px-8 lg:px-12 w-full">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <button
              class="text-2xl font-bold hover:opacity-80 transition-opacity flex items-center gap-2"
              onclick="window.navigateTo('/bands')"
            >
              <span class="text-3xl animate-pulse">🎸</span>
              <span class="text-white font-bold tracking-tight">GigHub</span>
            </button>
          </div>

          <div class="flex items-center gap-6">
            <div class="text-right hidden sm:block">
              <div class="font-semibold text-white">${user.name}</div>
              ${user.instrument ? `<div class="text-xs text-zinc-400">${user.instrument}</div>` : ''}
            </div>
            <button
              onclick="window.handleLogout()"
              class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 hover:border-zinc-600 rounded-xl font-medium transition-all text-sm"
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
