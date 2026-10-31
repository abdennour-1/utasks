import { ref } from 'vue'
import { defineStore } from 'pinia'

import { errorMessage } from '@/api/client'
import * as boardsApi from '@/api/boards'
import { useAuthStore } from '@/stores/auth'
import { useToastsStore } from '@/stores/toasts'
import type { Board, BoardPayload } from '@/types'
import { clearBoardLayout } from '@/utils/boardLayout'

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error' | 'not-found'

export const useBoardsStore = defineStore('boards', () => {
  const auth = useAuthStore()
  const toasts = useToastsStore()

  const boards = ref<Board[]>([])
  const status = ref<LoadStatus>('idle')
  const loadError = ref<string | null>(null)
  let loadedFor: string | null = null

  async function load() {
    const userId = auth.user?.id
    if (!userId) return
    // Keeps the current grid visible while refreshing the same user's boards.
    if (loadedFor !== userId) {
      boards.value = []
      status.value = 'loading'
    }
    loadError.value = null
    try {
      const fetched = await boardsApi.fetchUserBoards(userId)
      boards.value = fetched
      loadedFor = userId
      status.value = 'ready'
    } catch (error) {
      // A failed refresh should not hide boards that are already on screen.
      if (loadedFor === userId) {
        toasts.error(`Could not refresh your boards. ${errorMessage(error)}`)
        return
      }
      loadError.value = errorMessage(error)
      status.value = 'error'
    }
  }

  async function create(payload: BoardPayload): Promise<boolean> {
    const userId = auth.user?.id
    if (!userId) return false
    try {
      boards.value.unshift(await boardsApi.createBoard(userId, payload))
      toasts.success('Board created.')
      return true
    } catch (error) {
      toasts.error(`Could not create the board. ${errorMessage(error)}`)
      return false
    }
  }

  async function update(id: string, payload: BoardPayload): Promise<boolean> {
    try {
      const updated = await boardsApi.updateBoard(id, payload)
      boards.value = boards.value.map((board) => (board.id === id ? updated : board))
      toasts.success('Board updated.')
      return true
    } catch (error) {
      toasts.error(`Could not update the board. ${errorMessage(error)}`)
      return false
    }
  }

  async function remove(id: string): Promise<boolean> {
    try {
      await boardsApi.deleteBoard(id)
      boards.value = boards.value.filter((board) => board.id !== id)
      clearBoardLayout(id)
      toasts.success('Board deleted.')
      return true
    } catch (error) {
      toasts.error(`Could not delete the board. ${errorMessage(error)}`)
      return false
    }
  }

  return { boards, status, loadError, load, create, update, remove }
})
