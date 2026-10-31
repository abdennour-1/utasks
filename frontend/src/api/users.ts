import { apiClient } from './client'
import type { ApiEnvelope, User } from '@/types'

export async function registerUser(username: string): Promise<User> {
  const { data } = await apiClient.post<ApiEnvelope<User>>('/api/users/register', { username })
  return data.data
}

export async function fetchUser(id: string): Promise<User> {
  const { data } = await apiClient.get<ApiEnvelope<User>>(`/api/users/${id}`)
  return data.data
}
