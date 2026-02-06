// Vote API

import { apiClient } from './client'

export interface VoteResponse {
  id: number
  songId: number
  userId: number
  createdAt: string
}

export interface MyVotesResponse {
  pollId: number
  votes: VoteInfo[]
}

export interface VoteInfo {
  songId: number
  voteId: number
  createdAt: string
}

export interface CreateVoteRequest {
  songId: number
}

export async function vote(data: CreateVoteRequest): Promise<VoteResponse> {
  return apiClient.post<VoteResponse>('/api/votes', data)
}

export async function cancelVote(voteId: number): Promise<void> {
  return apiClient.delete<void>(`/api/votes/${voteId}`)
}

export async function getMyVotes(pollId: number): Promise<MyVotesResponse> {
  return apiClient.get<MyVotesResponse>(`/api/polls/${pollId}/votes/me`)
}
