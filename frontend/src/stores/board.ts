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
import { MANUAL_SORT, sortCards, type ListSort } from '@/utils/cardSort'

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
  const sortByList = ref<Record<string, ListSort>>({})
  const savingCardIds = ref(new Set<string>())
  const isDragging = ref(false)
  let latestLoad = 0

  function persistLayout() {
    if (!board.value) return
    const cards: Record<string, string[]> = {}
    const sorts: Record<string, ListSort> = {}
    for (const list of lists.value) {
      cards[list.id] = (cardsByList.value[list.id] ?? []).map((card) => card.id)
      sorts[list.id] = listSort(list.id)
    }
    saveBoardLayout(board.value.id, { lists: lists.value.map((list) => list.id), cards, sorts })
  }

  function listSort(listId: string): ListSort {
    return sortByList.value[listId] ?? MANUAL_SORT
  }

  function setListSort(listId: string, sort: ListSort) {
    sortByList.value[listId] = sort
    persistLayout()
  }

  function displayedCards(listId: string): Card[] {
    return sortCards(cardsByList.value[listId] ?? [], listSort(listId))
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
      sortByList.value = layout.sorts
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

  /** Optimistic: the card moves at once and only this card goes back if the API refuses. */
  async function moveCard(cardId: string, targetListId: string, targetIndex: number) {
    const sourceListId = Object.keys(cardsByList.value).find((listId) =>
      cardsByList.value[listId]?.some((card) => card.id === cardId),
    )
    const sourceColumn = sourceListId ? cardsByList.value[sourceListId] : undefined
    const sourceIndex = sourceColumn?.findIndex((card) => card.id === cardId) ?? -1
    const card = sourceColumn?.[sourceIndex]
    if (!sourceListId || !card || sourceListId === targetListId) return

    const place = (listId: string, index: number, placed: Card) => {
      const column = [...(cardsByList.value[listId] ?? [])]
      column.splice(index, 0, placed)
      cardsByList.value[listId] = column
    }
    const take = (listId: string) => {
      cardsByList.value[listId] = (cardsByList.value[listId] ?? []).filter(
        (item) => item.id !== cardId,
      )
    }

    // In a sorted list the drop position means nothing: the card takes its sorted place.
    const isTargetManual = listSort(targetListId).mode === 'manual'
    const targetLength = cardsByList.value[targetListId]?.length ?? 0

    take(sourceListId)
    place(targetListId, isTargetManual ? targetIndex : targetLength, {
      ...card,
      listId: targetListId,
    })
    persistLayout()
    savingCardIds.value.add(cardId)
    try {
      const { id, ...fields } = card
      await cardsApi.updateCard(id, { ...fields, listId: targetListId })
    } catch (error) {
      take(targetListId)
      place(sourceListId, sourceIndex, card)
      persistLayout()
      toasts.error(`Could not move "${card.title}". ${errorMessage(error)}`)
    } finally {
      savingCardIds.value.delete(cardId)
    }
  }

  /** The API has no position field: this order only lives in the local layout. */
  function reorderCard(listId: string, oldIndex: number, newIndex: number) {
    const column = [...(cardsByList.value[listId] ?? [])]
    const [card] = column.splice(oldIndex, 1)
    if (!card) return
    column.splice(newIndex, 0, card)
    cardsByList.value[listId] = column
    persistLayout()
  }

  /** The API has no position field: this order only lives in the local layout. */
  function reorderLists(next: BoardList[]) {
    lists.value = next
    persistLayout()
  }

  return {
    board,
    lists,
    cardsByList,
    savingCardIds,
    isDragging,
    status,
    loadError,
    load,
    listSort,
    setListSort,
    displayedCards,
    moveCard,
    reorderCard,
    reorderLists,
    renameBoard,
    createList,
    renameList,
    deleteList,
    createCard,
    updateCard,
    deleteCard,
  }
})
