import { apiClient } from './client'
import type { ApiEnvelope, BoardList } from '@/types'

export async function fetchBoardLists(boardId: string): Promise<BoardList[]> {
  const { data } = await apiClient.get<ApiEnvelope<BoardList[]>>(`/api/lists/board/${boardId}`)
  return data.data
}

export async function createList(boardId: string, name: string): Promise<BoardList> {
  const { data } = await apiClient.post<ApiEnvelope<BoardList>>('/api/lists', { name, boardId })
  return data.data
}

/** The API requires `boardId` even when only renaming. */
export async function updateList(id: string, boardId: string, name: string): Promise<BoardList> {
  const { data } = await apiClient.put<ApiEnvelope<BoardList>>(`/api/lists/${id}`, {
    name,
    boardId,
  })
  return data.data
}

export async function deleteList(id: string): Promise<void> {
  await apiClient.delete(`/api/lists/${id}`)
}
