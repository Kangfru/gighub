// Fetch wrapper with authentication

import { getAccessToken, getRefreshToken, saveTokens, clearAuth } from '../utils/auth'
import { router } from '../utils/router'

export interface ApiError {
  code: string
  message: string
  timestamp: string
  details?: Record<string, string>
}

class ApiClient {
  private baseURL = ''

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers = new Headers(options.headers || {})

    // Content-Type 기본값
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json')
    }

    // Access Token 추가
    const token = getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      // 401 Unauthorized - 토큰 만료
      if (response.status === 401) {
        const refreshToken = getRefreshToken()
        if (refreshToken) {
          // Refresh Token으로 재시도
          const refreshed = await this.refreshAccessToken()
          if (refreshed) {
            // 새 토큰으로 재요청
            const newToken = getAccessToken()
            headers.set('Authorization', `Bearer ${newToken}`)
            const retryResponse = await fetch(url, { ...options, headers })
            return this.handleResponse<T>(retryResponse)
          }
        }

        // Refresh 실패 시 로그인 페이지로
        clearAuth()
        router.navigate('/login')
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.')
      }

      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('네트워크 오류가 발생했습니다.')
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return undefined as T
    }

    const data = await response.json()

    if (!response.ok) {
      const error = data as ApiError
      // 사용자 친화적인 에러 메시지 매핑
      const userMessage = this.getUserFriendlyMessage(response.status, error.code)
      throw new Error(userMessage)
    }

    return data as T
  }

  private getUserFriendlyMessage(status: number, errorCode?: string): string {
    // HTTP 상태 코드별 기본 메시지
    switch (status) {
      case 400:
        return '잘못된 요청입니다. 입력 내용을 확인해주세요.'
      case 401:
        return '인증이 필요합니다. 다시 로그인해주세요.'
      case 403:
        return '권한이 없습니다.'
      case 404:
        return '요청한 정보를 찾을 수 없습니다.'
      case 409:
        return '이미 존재하거나 중복된 요청입니다.'
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      default:
        return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = getRefreshToken()
      if (!refreshToken) return false

      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })

      if (response.ok) {
        const data = await response.json()
        saveTokens(data.accessToken, refreshToken)
        return true
      }

      return false
    } catch {
      return false
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    })
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    })
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
