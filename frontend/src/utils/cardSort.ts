import type { Card } from '@/types'

export type SortMode = 'manual' | 'priority' | 'dueDate' | 'priorityDueDate'
export type SortDirection = 'asc' | 'desc'

export interface ListSort {
  mode: SortMode
  direction: SortDirection
}

export const MANUAL_SORT: ListSort = { mode: 'manual', direction: 'asc' }

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'priority', label: 'Priority' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'priorityDueDate', label: 'Priority then due date' },
]

/** The most useful order when a mode gets selected: most urgent first. */
export function defaultDirection(mode: SortMode): SortDirection {
  return mode === 'dueDate' ? 'asc' : 'desc'
}

export function directionLabel({ mode, direction }: ListSort): string {
  if (mode === 'dueDate') return direction === 'asc' ? 'Earliest first' : 'Latest first'
  return direction === 'asc' ? 'Low to high' : 'High to low'
}

function dueTime(card: Card): number {
  return new Date(card.dueDate).getTime()
}

/**
 * Returns a sorted copy; ties keep their manual order. In "priority then due date", the
 * direction applies to the priority and ties always show the earliest due date first.
 */
export function sortCards(cards: Card[], { mode, direction }: ListSort): Card[] {
  if (mode === 'manual') return cards
  const sign = direction === 'asc' ? 1 : -1
  return [...cards].sort((a, b) => {
    if (mode === 'dueDate') return sign * (dueTime(a) - dueTime(b))
    const byPriority = sign * (a.priority - b.priority)
    if (mode === 'priority' || byPriority !== 0) return byPriority
    return dueTime(a) - dueTime(b)
  })
}
