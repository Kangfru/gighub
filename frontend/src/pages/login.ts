// Login page

import { login } from '../api/auth'
import { saveTokens, saveUser } from '../utils/auth'
import { router } from '../utils/router'
import { showToast } from '../utils/toast'

export function renderLoginPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!

  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center p-6" style="background: #fafafa;">
      <div class="w-full max-w-md">
        <!-- Logo & Title -->
        <div class="text-center mb-12 fade-in">
          <div class="text-5xl mb-4">🎸</div>
          <h1 class="text-4xl font-semibold mb-3" style="color: #171717; letter-spacing: -0.02em;">GigHub</h1>
          <p class="text-base" style="color: #737373;">밴드 연습곡 투표 시스템</p>
        </div>

        <!-- Login Card -->
        <div class="card fade-in" style="animation-delay: 0.1s;">
          <form id="login-form">
            <!-- Email Input -->
            <div class="form-group">
              <label class="label">이메일</label>
              <input
                type="email"
                id="email"
                required
                class="input"
                placeholder="example@email.com"
                autocomplete="email"
              />
            </div>

            <!-- Password Input -->
            <div class="form-group">
              <label class="label">비밀번호</label>
              <input
                type="password"
                id="password"
                required
                class="input"
                placeholder="최소 8자"
                autocomplete="current-password"
              />
            </div>

            <!-- Error Message -->
            <div id="error-message" class="alert alert-error hidden"></div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn btn-primary btn-lg w-full"
              style="margin-top: 2rem;"
            >
              로그인
            </button>
          </form>

          <!-- Register Link -->
          <div class="text-center pt-8" style="border-top: 1px solid #e5e5e5; margin-top: 1.25rem;">
            <span style="color: #737373; font-size: 0.9375rem;">계정이 없으신가요?</span>
            <button
              onclick="window.navigateTo('/register')"
              style="color: #171717; font-weight: 500; margin-left: 0.5rem; text-decoration: underline; text-underline-offset: 2px; background: none; border: none; cursor: pointer; font-size: 0.9375rem;"
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  const form = document.querySelector<HTMLFormElement>('#login-form')!
  const errorMessage = document.querySelector<HTMLDivElement>('#error-message')!

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = (document.querySelector('#email') as HTMLInputElement).value
    const password = (document.querySelector('#password') as HTMLInputElement).value

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
