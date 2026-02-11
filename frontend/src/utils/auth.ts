// Token 관리 유틸리티

const ACCESS_TOKEN_KEY = 'gighub_access_token'
const REFRESH_TOKEN_KEY = 'gighub_refresh_token'
const TOKEN_EXPIRY_KEY = 'gighub_token_expiry'
const USER_KEY = 'gighub_user'

export interface User {
  id: number
  email: string
  name: string
  instrument?: string
}

export function saveTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
  const expiryTime = Date.now() + expiresIn * 1000 // 초를 밀리초로 변환
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function saveUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser(): User | null {
  const userJson = localStorage.getItem(USER_KEY)
  return userJson ? JSON.parse(userJson) : null
}

export function getTokenExpiry(): number | null {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  return expiry ? parseInt(expiry, 10) : null
}

export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry()
  if (!expiry) return true
  return Date.now() >= expiry
}

export function clearAuth(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  const token = getAccessToken()
  if (!token) return false
  if (isTokenExpired()) {
    // 토큰이 만료되었으면 자동으로 정리
    clearAuth()
    return false
  }
  return true
}
