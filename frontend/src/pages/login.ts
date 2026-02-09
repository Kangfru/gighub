// Login page

import { login } from '../api/auth'
import { saveTokens, saveUser } from '../utils/auth'
import { router } from '../utils/router'
import { showToast } from '../utils/toast'

export function renderLoginPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!

  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center p-8 bg-neutral-50 w-full">
      <div class="card-base w-full max-w-md scale-in p-10 sm:p-14">
        <div class="text-center mb-12">
          <div class="text-5xl mb-4">🎸</div>
          <h1 class="text-4xl font-bold text-neutral-900 mb-3 tracking-tight">GigHub</h1>
          <p class="text-neutral-500 text-base">밴드 연습곡 투표 시스템</p>
        </div>

        <form id="login-form" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-neutral-700">
              이메일
            </label>
            <input
              type="email"
              id="email"
              required
              class="input-base"
              placeholder="example@email.com"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-neutral-700">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              required
              class="input-base"
              placeholder="최소 8자"
            />
          </div>

          <div id="error-message" class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl hidden"></div>

          <button
            type="submit"
            class="w-full btn-primary py-4 text-base mt-8"
          >
            로그인
          </button>
        </form>

        <div class="mt-8 text-center text-sm text-neutral-500">
          계정이 없으신가요?
          <button
            onclick="window.navigateTo('/register')"
            class="text-blue-600 hover:text-blue-700 font-medium hover:underline transition ml-1"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  `

  const form = document.querySelector<HTMLFormElement>('#login-form')!
  const errorMessage = document.querySelector<HTMLDivElement>('#error-message')!

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = (document.querySelector('#email') as HTMLInputElement).value
    const password = (document.querySelector('#password') as HTMLInputElement)
      .value

    try {
      errorMessage.classList.add('hidden')

      const response = await login({ email, password })

      // 토큰과 사용자 정보 저장
      saveTokens(response.accessToken, response.refreshToken)
      saveUser(response.user)

      showToast('로그인 성공!', 'success')

      // 밴드 목록 페이지로 이동
      setTimeout(() => router.navigate('/bands'), 500)
    } catch (error) {
      const message = error instanceof Error ? error.message : '로그인에 실패했습니다.'
      errorMessage.textContent = message
      errorMessage.classList.remove('hidden')
      showToast(message, 'error')
    }
  })
}
