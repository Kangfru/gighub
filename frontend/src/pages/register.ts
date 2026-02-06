// Register page

import { register } from '../api/auth'
import { saveTokens, saveUser } from '../utils/auth'
import { router } from '../utils/router'
import { showToast } from '../utils/toast'

export function renderRegisterPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!

  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center px-4 py-8 bg-[#0a0a0a]">
      <div class="bg-[#111111] border border-gray-800 p-10 rounded-2xl w-full max-w-md scale-in">
        <div class="text-center mb-8">
          <div class="text-6xl mb-4">🎸</div>
          <h1 class="text-4xl font-bold gradient-text mb-2">GigHub</h1>
          <p class="text-gray-400">밴드 연습곡 투표 시스템</p>
        </div>

        <form id="register-form" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">
              이메일
            </label>
            <input
              type="email"
              id="email"
              required
              class="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none transition-all text-white"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              required
              minlength="8"
              class="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none transition-all text-white"
              placeholder="최소 8자"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">
              이름
            </label>
            <input
              type="text"
              id="name"
              required
              maxlength="50"
              class="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none transition-all text-white"
              placeholder="홍길동"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">
              악기/역할 (선택)
            </label>
            <input
              type="text"
              id="instrument"
              class="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none transition-all text-white"
              placeholder="예: 기타, 보컬, 드럼 등"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">
              초대 코드 (선택)
            </label>
            <input
              type="text"
              id="invite-code"
              class="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none transition-all text-white"
              placeholder="밴드 초대 코드 (없으면 건너뛰기)"
            />
            <p class="text-xs text-gray-400 mt-2 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg">
              💡 초대 코드가 없어도 가입 가능합니다. 가입 후 밴드를 만들거나 초대를 받으세요.
            </p>
          </div>

          <div id="error-message" class="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg hidden"></div>

          <button
            type="submit"
            class="w-full btn-gradient text-white font-semibold py-4 px-8 rounded-lg shadow-lg"
          >
            가입하기
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-400">
          이미 계정이 있으신가요?
          <button
            onclick="window.navigateTo('/login')"
            class="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition ml-1"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  `

  const form = document.querySelector<HTMLFormElement>('#register-form')!
  const errorMessage = document.querySelector<HTMLDivElement>('#error-message')!

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = (document.querySelector('#email') as HTMLInputElement).value
    const password = (document.querySelector('#password') as HTMLInputElement)
      .value
    const name = (document.querySelector('#name') as HTMLInputElement).value
    const instrument = (
      document.querySelector('#instrument') as HTMLInputElement
    ).value
    const inviteCode = (
      document.querySelector('#invite-code') as HTMLInputElement
    ).value

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
