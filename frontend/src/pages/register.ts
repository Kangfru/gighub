// Register page

import { register } from '../api/auth'
import { saveTokens, saveUser } from '../utils/auth'
import { router } from '../utils/router'
import { showToast } from '../utils/toast'

export function renderRegisterPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!

  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center p-8 bg-zinc-950 w-full">
      <div class="card-base w-full max-w-md scale-in bg-zinc-900 border-zinc-800 p-8 sm:p-12 shadow-2xl">
        <div class="text-center mb-10">
          <div class="text-6xl mb-6 animate-pulse">🎸</div>
          <h1 class="text-4xl font-bold text-white mb-2 tracking-tight">GigHub</h1>
          <p class="text-zinc-400">밴드 연습곡 투표 시스템</p>
        </div>

        <form id="register-form" class="space-y-8">
          <div class="space-y-3">
            <label class="block text-sm font-bold text-zinc-300 ml-1">
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

          <div class="space-y-3">
            <label class="block text-sm font-bold text-zinc-300 ml-1">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              required
              minlength="8"
              class="input-base"
              placeholder="최소 8자"
            />
          </div>

          <div class="space-y-3">
            <label class="block text-sm font-bold text-zinc-300 ml-1">
              이름
            </label>
            <input
              type="text"
              id="name"
              required
              maxlength="50"
              class="input-base"
              placeholder="홍길동"
            />
          </div>

          <div class="space-y-3">
            <label class="block text-sm font-bold text-zinc-300 ml-1">
              악기/역할 (선택)
            </label>
            <input
              type="text"
              id="instrument"
              class="input-base"
              placeholder="예: 기타, 보컬, 드럼 등"
            />
          </div>

          <div class="space-y-3">
            <label class="block text-sm font-bold text-zinc-300 ml-1">
              초대 코드 (선택)
            </label>
            <input
              type="text"
              id="invite-code"
              class="input-base"
              placeholder="밴드 초대 코드"
            />
            <p class="text-xs text-blue-400 mt-2 bg-blue-500/5 border border-blue-500/10 px-3 py-2 rounded-lg leading-relaxed">
              💡 초대 코드가 없어도 가입 가능합니다. 가입 후 밴드를 만들거나 초대를 받으세요.
            </p>
          </div>

          <div id="error-message" class="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg hidden"></div>

          <button
            type="submit"
            class="w-full btn-primary py-4 text-lg shadow-xl mt-8"
          >
            가입하기
          </button>
        </form>

        <div class="mt-8 text-center text-sm text-zinc-400">
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
