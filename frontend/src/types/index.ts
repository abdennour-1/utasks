export interface User {
  id: string
  username: string
}

export interface Board {
  id: string
  name: string
  userId: string
  description?: string
}

export interface BoardList {
  id: string
  name: string
  boardId: string
}

/** 1 = Low, 2 = Medium, 3 = High */
export type Priority = 1 | 2 | 3

export interface Card {
  id: string
  title: string
  description: string
  listId: string
  dueDate: string
  priority: Priority
  isCompleted: boolean
}

export interface BoardPayload {
  name: string
  description?: string
}

/** The API requires all of these fields on every card creation. */
export interface CardDraft {
  title: string
  description: string
  dueDate: string
  priority: Priority
}

/** The API requires all of these fields on every card update. */
export type CardUpdate = Omit<Card, 'id'>

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string
}
