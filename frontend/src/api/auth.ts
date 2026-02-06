// Auth API

import { apiClient } from './client'
import type { User } from '../utils/auth'

export interface RegisterRequest {
  email: string
  password: string
  name: string
  instrument?: string
  inviteCode?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  user: User
  band?: {
    id: number
    name: string
    role: string
  }
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
  bands: Array<{
    band: {
      id: number
      name: string
      role: string
    }
    role: string
  }>
}

export async function register(data: RegisterRequest): Promise<TokenResponse> {
  return apiClient.post<TokenResponse>('/api/auth/register', data)
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/api/auth/login', data)
}

export async function logout(): Promise<void> {
  return apiClient.post<void>('/api/auth/logout')
}
