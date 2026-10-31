import type { Card } from '@/types'

const DUE_DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Converts an ISO date to the local time format of `<input type="datetime-local">`. */
export function toDateTimeInput(iso: string): string {
  const date = new Date(iso)
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function fromDateTimeInput(value: string): string {
  return new Date(value).toISOString()
}

export function defaultDueDateInput(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(17, 0, 0, 0)
  return toDateTimeInput(date.toISOString())
}

export function formatDueDate(iso: string): string {
  return DUE_DATE_FORMAT.format(new Date(iso))
}

export function isOverdue(card: Pick<Card, 'dueDate' | 'isCompleted'>): boolean {
  return !card.isCompleted && new Date(card.dueDate).getTime() < Date.now()
}
