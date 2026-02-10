// Register page

import { register } from '../api/auth'
import { saveTokens, saveUser } from '../utils/auth'
import { router } from '../utils/router'
import { showToast } from '../utils/toast'

export function renderRegisterPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!

  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center p-6" style="background: #fafafa;">
      <div class="w-full max-w-md">
        <!-- Logo & Title -->
        <div class="text-center fade-in" style="margin-bottom: 3rem;">
          <div class="text-5xl" style="margin-bottom: 1rem;">🎸</div>
          <h1 class="text-4xl font-semibold" style="color: #171717; letter-spacing: -0.02em; margin-bottom: 0.75rem;">GigHub</h1>
          <p class="text-base" style="color: #737373;">밴드 연습곡 투표 시스템</p>
        </div>

        <!-- Register Card -->
        <div class="card fade-in" style="animation-delay: 0.1s;">
          <h2 class="text-2xl font-semibold" style="color: #171717; margin-bottom: 1.25rem;">회원가입</h2>

          <form id="register-form">
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
                minlength="8"
                class="input"
                placeholder="최소 8자"
                autocomplete="new-password"
              />
            </div>

            <!-- Name Input -->
            <div class="form-group">
              <label class="label">이름</label>
              <input
                type="text"
                id="name"
                required
                maxlength="50"
                class="input"
                placeholder="홍길동"
                autocomplete="name"
              />
            </div>

            <!-- Instrument Input -->
            <div class="form-group">
              <label class="label">악기/역할 <span style="color: #a3a3a3; font-weight: 400;">(선택)</span></label>
              <input
                type="text"
                id="instrument"
                class="input"
                placeholder="예: 기타, 보컬, 드럼"
              />
            </div>

            <!-- Invite Code Input -->
            <div class="form-group">
              <label class="label">초대 코드 <span style="color: #a3a3a3; font-weight: 400;">(선택)</span></label>
              <input
                type="text"
                id="invite-code"
                class="input"
                placeholder="밴드 초대 코드"
                style="font-family: monospace; margin-bottom: 0.75rem;"
              />
              <div class="alert alert-info">
                💡 초대 코드가 없어도 가입 가능합니다. 가입 후 밴드를 만들거나 초대를 받으세요.
              </div>
            </div>

            <!-- Error Message -->
            <div id="error-message" class="alert alert-error hidden"></div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn btn-primary btn-lg w-full"
              style="margin-top: 0.75rem;"
            >
              가입하기
            </button>
          </form>

          <!-- Login Link -->
          <div class="text-center pt-8" style="border-top: 1px solid #e5e5e5; margin-top: 1.25rem;">
            <span style="color: #737373; font-size: 0.9375rem;">이미 계정이 있으신가요?</span>
            <button
              onclick="window.navigateTo('/login')"
              style="color: #171717; font-weight: 500; margin-left: 0.5rem; text-decoration: underline; text-underline-offset: 2px; background: none; border: none; cursor: pointer; font-size: 0.9375rem;"
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  const form = document.querySelector<HTMLFormElement>('#register-form')!
  const errorMessage = document.querySelector<HTMLDivElement>('#error-message')!

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = (document.querySelector('#email') as HTMLInputElement).value
    const password = (document.querySelector('#password') as HTMLInputElement).value
    const name = (document.querySelector('#name') as HTMLInputElement).value
    const instrument = (document.querySelector('#instrument') as HTMLInputElement).value
    const inviteCode = (document.querySelector('#invite-code') as HTMLInputElement).value

    try {
      errorMessage.classList.add('hidden')

      const response = await register({
        email,
        password,
        name,
        instrument: instrument || undefined,
        inviteCode
      })

      // 토큰과 사용자 정보 저장
      saveTokens(response.accessToken, response.refreshToken)
      saveUser(response.user)

      showToast('회원가입 성공! 환영합니다 🎉', 'success')

      // 밴드 목록 페이지로 이동
      setTimeout(() => router.navigate('/bands'), 500)
    } catch (error) {
      const message = error instanceof Error ? error.message : '회원가입에 실패했습니다.'
      errorMessage.textContent = message
      errorMessage.classList.remove('hidden')
      showToast(message, 'error')
    }
  })
}
