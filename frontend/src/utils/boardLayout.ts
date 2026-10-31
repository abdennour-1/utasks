import type { ListSort } from './cardSort'
import { readJson, removeKey, writeJson } from './storage'

/**
 * What the API cannot store (it has no position field): the order of the lists,
 * the manual order of the cards and each list's sort selection, per board.
 */
export interface BoardLayout {
  lists: string[]
  cards: Record<string, string[]>
  sorts: Record<string, ListSort>
}

function layoutKey(boardId: string): string {
  return `utasks.layout.${boardId}`
}

export function loadBoardLayout(boardId: string): BoardLayout {
  const stored = readJson<Partial<BoardLayout>>(layoutKey(boardId))
  return { lists: stored?.lists ?? [], cards: stored?.cards ?? {}, sorts: stored?.sorts ?? {} }
}

export function saveBoardLayout(boardId: string, layout: BoardLayout): void {
  writeJson(layoutKey(boardId), layout)
}

export function clearBoardLayout(boardId: string): void {
  removeKey(layoutKey(boardId))
}

/** Saved items first, in their saved order; items never ordered yet keep their relative order. */
export function applyOrder<T extends { id: string }>(items: T[], order: string[] = []): T[] {
  const rank = new Map(order.map((id, index) => [id, index]))
  const ranked = items.filter((item) => rank.has(item.id))
  ranked.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0))
  return [...ranked, ...items.filter((item) => !rank.has(item.id))]
}
