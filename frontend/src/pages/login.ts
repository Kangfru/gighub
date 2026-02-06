// Login page

import { login } from '../api/auth'
import { saveTokens, saveUser } from '../utils/auth'
import { router } from '../utils/router'
import { showToast } from '../utils/toast'

export function renderLoginPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!

  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div class="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md scale-in">
        <div class="text-center mb-8">
          <div class="text-6xl mb-4">🎸</div>
          <h1 class="text-4xl font-bold gradient-text mb-2">GigHub</h1>
          <p class="text-gray-600">밴드 연습곡 투표 시스템</p>
        </div>

        <form id="login-form" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              id="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none transition-all"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none transition-all"
              placeholder="최소 8자"
            />
          </div>

          <div id="error-message" class="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl hidden"></div>

          <button
            type="submit"
            class="w-full btn-gradient text-white font-semibold py-4 px-8 rounded-xl shadow-lg"
          >
            로그인
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-600">
          계정이 없으신가요?
          <button
            onclick="window.navigateTo('/register')"
            class="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition"
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
