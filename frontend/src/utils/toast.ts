// Toast notification utility

type ToastType = 'success' | 'error' | 'info'

export function showToast(message: string, type: ToastType = 'info', duration: number = 3000): void {
  // 기존 토스트 제거
  const existing = document.querySelector('.toast')
  if (existing) {
    existing.remove()
  }

  // 새 토스트 생성
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message

  document.body.appendChild(toast)

  // 자동 제거
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(100%)'
    setTimeout(() => toast.remove(), 300)
  }, duration)
}
