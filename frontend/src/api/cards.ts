import { apiClient } from './client'
import type { ApiEnvelope, Card, CardDraft, CardUpdate } from '@/types'

export async function fetchListCards(listId: string): Promise<Card[]> {
  const { data } = await apiClient.get<ApiEnvelope<Card[]>>(`/api/cards/list/${listId}`)
  return data.data
}

export async function createCard(listId: string, draft: CardDraft): Promise<Card> {
  const { data } = await apiClient.post<ApiEnvelope<Card>>('/api/cards', { ...draft, listId })
  return data.data
}

/** The API requires every field on update, even for a simple move. */
export async function updateCard(id: string, card: CardUpdate): Promise<Card> {
  const { data } = await apiClient.put<ApiEnvelope<Card>>(`/api/cards/${id}`, card)
  return data.data
}

export async function deleteCard(id: string): Promise<void> {
  await apiClient.delete(`/api/cards/${id}`)
}
