// Reset password page

import { resetPassword } from '../api/auth'
import { router } from '../utils/router'
import { showToast } from '../utils/toast'

export function renderResetPasswordPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!

  // URL 쿼리 파라미터에서 token 추출
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  if (!token) {
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center p-6" style="background: #fafafa;">
        <div class="w-full max-w-md">
          <div class="card text-center">
            <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
            <h2 style="font-size: 1.125rem; font-weight: 600; color: #171717; margin-bottom: 0.75rem;">유효하지 않은 링크</h2>
            <p style="color: #525252; font-size: 0.9375rem; margin-bottom: 1.5rem;">
              비밀번호 재설정 링크가 올바르지 않습니다.
            </p>
            <button
              onclick="window.navigateTo('/forgot-password')"
              class="btn btn-primary"
            >
              비밀번호 찾기로 이동
            </button>
          </div>
        </div>
      </div>
    `
    return
  }

  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center p-6" style="background: #fafafa;">
      <div class="w-full max-w-md">
        <!-- Logo & Title -->
        <div class="text-center fade-in" style="margin-bottom: 3rem;">
          <div class="text-5xl" style="margin-bottom: 1rem;">🎸</div>
          <h1 class="text-4xl font-semibold" style="color: #171717; letter-spacing: -0.02em; margin-bottom: 0.75rem;">GigHub</h1>
          <p class="text-base" style="color: #737373;">새 비밀번호 설정</p>
        </div>

        <!-- Card -->
        <div class="card fade-in" style="animation-delay: 0.1s;">
          <form id="reset-form">
            <div class="form-group">
              <label class="label">새 비밀번호</label>
              <input
                type="password"
                id="new-password"
                required
                class="input"
                placeholder="최소 8자"
                autocomplete="new-password"
              />
            </div>

            <div class="form-group">
              <label class="label">비밀번호 확인</label>
              <input
                type="password"
                id="confirm-password"
                required
                class="input"
                placeholder="비밀번호를 다시 입력해주세요"
                autocomplete="new-password"
              />
            </div>

            <div id="error-message" class="alert alert-error hidden"></div>

            <button
              type="submit"
              id="submit-btn"
              class="btn btn-primary btn-lg w-full"
              style="margin-top: 0.75rem;"
            >
              비밀번호 변경
            </button>
          </form>

          <!-- 로그인 링크 -->
          <div class="text-center pt-8" style="border-top: 1px solid #e5e5e5; margin-top: 1.25rem;">
            <button
              onclick="window.navigateTo('/login')"
              style="color: #171717; font-weight: 500; text-decoration: underline; text-underline-offset: 2px; background: none; border: none; cursor: pointer; font-size: 0.9375rem;"
            >
              로그인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  const form = document.querySelector<HTMLFormElement>('#reset-form')!
  const errorMessage = document.querySelector<HTMLDivElement>('#error-message')!
  const submitBtn = document.querySelector<HTMLButtonElement>('#submit-btn')!

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const newPassword = (document.querySelector('#new-password') as HTMLInputElement).value
    const confirmPassword = (document.querySelector('#confirm-password') as HTMLInputElement).value

    if (newPassword !== confirmPassword) {
      errorMessage.textContent = '비밀번호가 일치하지 않습니다.'
      errorMessage.classList.remove('hidden')
      return
    }

    if (newPassword.length < 8) {
      errorMessage.textContent = '비밀번호는 최소 8자 이상이어야 합니다.'
      errorMessage.classList.remove('hidden')
      return
    }

    try {
      errorMessage.classList.add('hidden')
      submitBtn.disabled = true
      submitBtn.textContent = '변경 중...'

      await resetPassword(token, newPassword)

      showToast('비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.', 'success')
      setTimeout(() => router.navigate('/login'), 1500)
    } catch (error) {
      const message = error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.'
      errorMessage.textContent = message
      errorMessage.classList.remove('hidden')
      submitBtn.disabled = false
      submitBtn.textContent = '비밀번호 변경'
    }
  })
}
