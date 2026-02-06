// Band API

import { apiClient } from './client'
import type { User } from '../utils/auth'

export interface BandResponse {
  id: number
  name: string
  description?: string
  role: 'LEADER' | 'MEMBER'
  memberCount: number
  createdAt: string
}

export interface BandDetailResponse {
  id: number
  name: string
  description?: string
  members: BandMemberInfo[]
  createdAt: string
}

export interface BandMemberInfo {
  user: User
  role: 'LEADER' | 'MEMBER'
  joinedAt: string
}

export interface InviteCodeResponse {
  code: string
  role: 'LEADER' | 'MEMBER'
  usedByUser?: User
  createdAt: string
  expiresAt: string
}

export interface CreateBandRequest {
  name: string
  description?: string
}

export interface UpdateBandRequest {
  name: string
  description?: string
}

export interface CreateInviteCodeRequest {
  expiresInDays: number
  role?: 'LEADER' | 'MEMBER'
}

export interface UpdateMemberRoleRequest {
  role: 'LEADER' | 'MEMBER'
}

export interface JoinBandRequest {
  inviteCode: string
}

export async function createBand(data: CreateBandRequest): Promise<BandResponse> {
  return apiClient.post<BandResponse>('/api/bands', data)
}

export async function getMyBands(): Promise<BandResponse[]> {
  return apiClient.get<BandResponse[]>('/api/bands/me')
}

export async function getBandDetail(bandId: number): Promise<BandDetailResponse> {
  return apiClient.get<BandDetailResponse>(`/api/bands/${bandId}`)
}

export async function updateBand(
  bandId: number,
  data: UpdateBandRequest
): Promise<BandResponse> {
  return apiClient.put<BandResponse>(`/api/bands/${bandId}`, data)
}

export async function deleteBand(bandId: number): Promise<void> {
  return apiClient.delete<void>(`/api/bands/${bandId}`)
}

export async function updateMemberRole(
  bandId: number,
  userId: number,
  data: UpdateMemberRoleRequest
): Promise<BandMemberInfo> {
  return apiClient.patch<BandMemberInfo>(
    `/api/bands/${bandId}/members/${userId}/role`,
    data
  )
}

export async function removeMember(bandId: number, userId: number): Promise<void> {
  return apiClient.delete<void>(`/api/bands/${bandId}/members/${userId}`)
}

export async function getMembers(bandId: number): Promise<BandMemberInfo[]> {
  return apiClient.get<BandMemberInfo[]>(`/api/bands/${bandId}/members`)
}

export async function createInviteCode(
  bandId: number,
  data: CreateInviteCodeRequest
): Promise<InviteCodeResponse> {
  return apiClient.post<InviteCodeResponse>(
    `/api/bands/${bandId}/invite-codes`,
    data
  )
}

export async function getInviteCodes(
  bandId: number
): Promise<InviteCodeResponse[]> {
  return apiClient.get<InviteCodeResponse[]>(`/api/bands/${bandId}/invite-codes`)
}

export async function deleteInviteCode(
  bandId: number,
  code: string
): Promise<void> {
  return apiClient.delete<void>(`/api/bands/${bandId}/invite-codes/${code}`)
}

export async function joinBand(data: JoinBandRequest): Promise<BandResponse> {
  return apiClient.post<BandResponse>('/api/bands/join', data)
}
