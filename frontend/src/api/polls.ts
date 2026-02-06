// Poll API

import { apiClient } from './client'
import type { User } from '../utils/auth'

export type PollStatus = 'UPCOMING' | 'ACTIVE' | 'ENDED'

export interface PollResponse {
  id: number
  bandId: number
  title: string
  description?: string
  createdBy: User
  startDate: string
  endDate: string
  status: PollStatus
  songCount: number
  createdAt: string
}

export interface PollDetailResponse {
  id: number
  bandId: number
  title: string
  description?: string
  createdBy: User
  startDate: string
  endDate: string
  status: PollStatus
  songs: SongResponse[]
  myVotes: number[] // 내가 투표한 곡 ID 목록
  createdAt: string
}

export interface SongResponse {
  id: number
  pollId: number
  artist: string
  title: string
  youtubeUrl?: string
  description?: string
  suggestedBy: User
  voteCount: number
  createdAt: string
}

export interface CreatePollRequest {
  title: string
  description?: string
  startDate: string
  endDate: string
}

export interface UpdatePollRequest {
  title: string
  description?: string
  startDate: string
  endDate: string
}

export interface CreateSongRequest {
  artist: string
  title: string
  youtubeUrl?: string
  description?: string
}

export interface UpdateSongRequest {
  artist: string
  title: string
  youtubeUrl?: string
  description?: string
}

export async function createPoll(
  bandId: number,
  data: CreatePollRequest
): Promise<PollResponse> {
  return apiClient.post<PollResponse>(`/api/bands/${bandId}/polls`, data)
}

export async function getPollsByBand(
  bandId: number,
  status?: PollStatus
): Promise<PollResponse[]> {
  const url = status
    ? `/api/bands/${bandId}/polls?status=${status}`
    : `/api/bands/${bandId}/polls`
  return apiClient.get<PollResponse[]>(url)
}

export async function getPollDetail(pollId: number): Promise<PollDetailResponse> {
  return apiClient.get<PollDetailResponse>(`/api/polls/${pollId}`)
}

export async function updatePoll(
  pollId: number,
  data: UpdatePollRequest
): Promise<PollResponse> {
  return apiClient.put<PollResponse>(`/api/polls/${pollId}`, data)
}

export async function deletePoll(pollId: number): Promise<void> {
  return apiClient.delete<void>(`/api/polls/${pollId}`)
}

export async function addSong(
  pollId: number,
  data: CreateSongRequest
): Promise<SongResponse> {
  return apiClient.post<SongResponse>(`/api/polls/${pollId}/songs`, data)
}

export async function updateSong(
  songId: number,
  data: UpdateSongRequest
): Promise<SongResponse> {
  return apiClient.put<SongResponse>(`/api/songs/${songId}`, data)
}

export async function deleteSong(songId: number): Promise<void> {
  return apiClient.delete<void>(`/api/songs/${songId}`)
}
