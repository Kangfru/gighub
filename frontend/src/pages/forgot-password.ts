// Forgot password page

import { forgotPassword } from '../api/auth'
import { router } from '../utils/router'

export function renderForgotPasswordPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!

  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center p-6" style="background: #fafafa;">
      <div class="w-full max-w-md">
        <!-- Logo & Title -->
        <div class="text-center fade-in" style="margin-bottom: 3rem;">
          <div class="text-5xl" style="margin-bottom: 1rem;">🎸</div>
          <h1 class="text-4xl font-semibold" style="color: #171717; letter-spacing: -0.02em; margin-bottom: 0.75rem;">GigHub</h1>
          <p class="text-base" style="color: #737373;">비밀번호 찾기</p>
        </div>

        <!-- Card -->
        <div class="card fade-in" style="animation-delay: 0.1s;">
          <!-- 초기 폼 -->
          <div id="form-section">
            <p style="color: #525252; font-size: 0.9375rem; line-height: 1.6; margin-bottom: 1.5rem;">
              가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
            </p>

            <form id="forgot-form">
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

              <div id="error-message" class="alert alert-error hidden"></div>

              <button
                type="submit"
                id="submit-btn"
                class="btn btn-primary btn-lg w-full"
                style="margin-top: 0.75rem;"
              >
                재설정 링크 보내기
              </button>
            </form>
          </div>

          <!-- 성공 메시지 -->
          <div id="success-section" class="hidden text-center" style="padding: 1rem 0;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📧</div>
            <h2 style="font-size: 1.125rem; font-weight: 600; color: #171717; margin-bottom: 0.75rem;">이메일을 확인해주세요</h2>
            <p style="color: #525252; font-size: 0.9375rem; line-height: 1.6;">
              비밀번호 재설정 링크를 발송했습니다.<br>
              이메일이 도착하지 않으면 스팸 폴더를 확인해주세요.<br>
              <span style="color: #737373; font-size: 0.875rem;">링크는 30분간 유효합니다.</span>
            </p>
          </div>

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

  const form = document.querySelector<HTMLFormElement>('#forgot-form')!
  const errorMessage = document.querySelector<HTMLDivElement>('#error-message')!
  const submitBtn = document.querySelector<HTMLButtonElement>('#submit-btn')!
  const formSection = document.querySelector<HTMLDivElement>('#form-section')!
  const successSection = document.querySelector<HTMLDivElement>('#success-section')!

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = (document.querySelector('#email') as HTMLInputElement).value

    try {
      errorMessage.classList.add('hidden')
      submitBtn.disabled = true
      submitBtn.textContent = '발송 중...'

      await forgotPassword(email)

      // 이메일 존재 여부와 관계없이 항상 성공 표시
      formSection.classList.add('hidden')
      successSection.classList.remove('hidden')
    } catch (error) {
      const message = error instanceof Error ? error.message : '요청에 실패했습니다.'
      errorMessage.textContent = message
      errorMessage.classList.remove('hidden')
      submitBtn.disabled = false
      submitBtn.textContent = '재설정 링크 보내기'
    }
  })
}
