import { apiClient } from './client'
import type { ApiEnvelope, Board, BoardPayload } from '@/types'

export async function fetchUserBoards(userId: string): Promise<Board[]> {
  const { data } = await apiClient.get<ApiEnvelope<Board[]>>(`/api/boards/user/${userId}`)
  return data.data
}

export async function fetchBoard(id: string): Promise<Board> {
  const { data } = await apiClient.get<ApiEnvelope<Board>>(`/api/boards/${id}`)
  return data.data
}

export async function createBoard(userId: string, payload: BoardPayload): Promise<Board> {
  const { data } = await apiClient.post<ApiEnvelope<Board>>('/api/boards', { ...payload, userId })
  return data.data
}

export async function updateBoard(id: string, payload: BoardPayload): Promise<Board> {
  const { data } = await apiClient.put<ApiEnvelope<Board>>(`/api/boards/${id}`, payload)
  return data.data
}

export async function deleteBoard(id: string): Promise<void> {
  await apiClient.delete(`/api/boards/${id}`)
}
