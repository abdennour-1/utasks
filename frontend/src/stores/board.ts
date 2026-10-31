import { ref } from 'vue'
import { defineStore } from 'pinia'

import { ApiError, errorMessage } from '@/api/client'
import * as boardsApi from '@/api/boards'
import * as cardsApi from '@/api/cards'
import * as listsApi from '@/api/lists'
import { useAuthStore } from '@/stores/auth'
import type { LoadStatus } from '@/stores/boards'
import { useToastsStore } from '@/stores/toasts'
import type { Board, BoardList, Card, CardDraft, CardUpdate } from '@/types'
import { applyOrder, loadBoardLayout, saveBoardLayout } from '@/utils/boardLayout'

function isMissing(error: unknown): boolean {
  return error instanceof ApiError && (error.kind === 'not-found' || error.kind === 'validation')
}

/** The board currently open: its lists and their cards. */
export const useBoardStore = defineStore('board', () => {
  const auth = useAuthStore()
  const toasts = useToastsStore()

  const board = ref<Board | null>(null)
  const lists = ref<BoardList[]>([])
  const cardsByList = ref<Record<string, Card[]>>({})
  const status = ref<LoadStatus>('idle')
  const loadError = ref<string | null>(null)
  let latestLoad = 0

  function persistLayout() {
    if (!board.value) return
    const cards: Record<string, string[]> = {}
    for (const list of lists.value) {
      cards[list.id] = (cardsByList.value[list.id] ?? []).map((card) => card.id)
    }
    saveBoardLayout(board.value.id, { lists: lists.value.map((list) => list.id), cards })
  }

  async function load(boardId: string) {
    const thisLoad = ++latestLoad
    status.value = 'loading'
    loadError.value = null
    board.value = null
    lists.value = []
    cardsByList.value = {}
    try {
      const fetchedBoard = await boardsApi.fetchBoard(boardId)
      // The API does not check ownership, so someone else's board reads as not found here.
      if (fetchedBoard.userId !== auth.user?.id) {
        if (thisLoad === latestLoad) status.value = 'not-found'
        return
      }
      const fetchedLists = await listsApi.fetchBoardLists(boardId)
      const fetchedCards = await Promise.all(
        fetchedLists.map((list) => cardsApi.fetchListCards(list.id)),
      )
      if (thisLoad !== latestLoad) return

      // The API returns the newest items first; new items belong at the end of a column.
      const layout = loadBoardLayout(boardId)
      const cards: Record<string, Card[]> = {}
      fetchedLists.forEach((list, index) => {
        const newestFirst = fetchedCards[index] ?? []
        cards[list.id] = applyOrder([...newestFirst].reverse(), layout.cards[list.id])
      })
      board.value = fetchedBoard
      lists.value = applyOrder([...fetchedLists].reverse(), layout.lists)
      cardsByList.value = cards
      status.value = 'ready'
    } catch (error) {
      if (thisLoad !== latestLoad) return
      if (isMissing(error)) {
        status.value = 'not-found'
      } else {
        loadError.value = errorMessage(error)
        status.value = 'error'
      }
    }
  }

  async function renameBoard(name: string) {
    const current = board.value
    if (!current) return
    board.value = { ...current, name }
    try {
      const payload =
        current.description === undefined ? { name } : { name, description: current.description }
      board.value = await boardsApi.updateBoard(current.id, payload)
    } catch (error) {
      board.value = current
      toasts.error(`Could not rename the board. ${errorMessage(error)}`)
    }
  }

  async function createList(name: string): Promise<boolean> {
    if (!board.value) return false
    try {
      const created = await listsApi.createList(board.value.id, name)
      lists.value.push(created)
      cardsByList.value[created.id] = []
      persistLayout()
      return true
    } catch (error) {
      toasts.error(`Could not create the list. ${errorMessage(error)}`)
      return false
    }
  }

  async function renameList(list: BoardList, name: string) {
    const setName = (next: string) => {
      lists.value = lists.value.map((item) =>
        item.id === list.id ? { ...item, name: next } : item,
      )
    }
    const previousName = list.name
    setName(name)
    try {
      await listsApi.updateList(list.id, list.boardId, name)
    } catch (error) {
      setName(previousName)
      toasts.error(`Could not rename the list. ${errorMessage(error)}`)
    }
  }

  async function deleteList(listId: string) {
    try {
      await listsApi.deleteList(listId)
      lists.value = lists.value.filter((list) => list.id !== listId)
      delete cardsByList.value[listId]
      persistLayout()
      toasts.success('List deleted.')
    } catch (error) {
      toasts.error(`Could not delete the list. ${errorMessage(error)}`)
    }
  }

  async function createCard(listId: string, draft: CardDraft): Promise<boolean> {
    try {
      const created = await cardsApi.createCard(listId, draft)
      cardsByList.value[listId]?.push(created)
      persistLayout()
      toasts.success('Card created.')
      return true
    } catch (error) {
      toasts.error(`Could not create the card. ${errorMessage(error)}`)
      return false
    }
  }

  async function updateCard(card: Card, changes: Partial<CardUpdate>): Promise<boolean> {
    const { id, ...fields } = card
    try {
      const updated = await cardsApi.updateCard(id, { ...fields, ...changes })
      const column = cardsByList.value[card.listId]
      const index = column?.findIndex((item) => item.id === id) ?? -1
      if (column && index >= 0) column[index] = updated
      toasts.success('Card updated.')
      return true
    } catch (error) {
      toasts.error(`Could not update the card. ${errorMessage(error)}`)
      return false
    }
  }

  async function deleteCard(card: Card): Promise<boolean> {
    try {
      await cardsApi.deleteCard(card.id)
      const column = cardsByList.value[card.listId]
      if (column) cardsByList.value[card.listId] = column.filter((item) => item.id !== card.id)
      persistLayout()
      toasts.success('Card deleted.')
      return true
    } catch (error) {
      toasts.error(`Could not delete the card. ${errorMessage(error)}`)
      return false
    }
  }

  return {
    board,
    lists,
    cardsByList,
    status,
    loadError,
    load,
    renameBoard,
    createList,
    renameList,
    deleteList,
    createCard,
    updateCard,
    deleteCard,
  }
})
