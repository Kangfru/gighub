// Main entry point

import './style.css'
import { router } from './utils/router'
import { isAuthenticated } from './utils/auth'
import { renderLoginPage } from './pages/login'
import { renderRegisterPage } from './pages/register'
import { renderBandsPage } from './pages/bands'
import { renderBandDetailPage } from './pages/band-detail'
import { renderPollDetailPage } from './pages/poll-detail'
import { renderCreatePollPage } from './pages/create-poll'

// 인증 필요한 페이지 가드
function requireAuth(handler: (params?: Record<string, string>) => void) {
  return (params?: Record<string, string>) => {
    if (!isAuthenticated()) {
      router.navigate('/login')
      return
    }
    handler(params)
  }
}

// 라우트 설정
router.add('/login', () => {
  if (isAuthenticated()) {
    router.navigate('/bands')
    return
  }
  renderLoginPage()
})

router.add('/register', () => {
  if (isAuthenticated()) {
    router.navigate('/bands')
    return
  }
  renderRegisterPage()
})

router.add('/bands', requireAuth(() => renderBandsPage()))
router.add('/bands/:bandId', requireAuth((params) => renderBandDetailPage(params!)))
router.add('/bands/:bandId/polls/create', requireAuth((params) => renderCreatePollPage(params!)))
router.add('/polls/:pollId', requireAuth((params) => renderPollDetailPage(params!)))

// 404
router.setNotFound(() => {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p class="text-gray-600 mb-6">페이지를 찾을 수 없습니다.</p>
        <button
          onclick="window.navigateTo('${isAuthenticated() ? '/bands' : '/login'}')"
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition"
        >
          ${isAuthenticated() ? '밴드 목록으로' : '로그인 페이지로'}
        </button>
      </div>
    </div>
  `
})

// 라우터 초기화
router.init()

// 전역 navigateTo 함수 노출
;(window as any).navigateTo = (path: string) => router.navigate(path)

// 초기 페이지 - 루트 경로 처리
if (window.location.pathname === '/') {
  router.navigate(isAuthenticated() ? '/bands' : '/login')
}
