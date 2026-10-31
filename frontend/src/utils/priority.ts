import type { Priority } from '@/types'

export const PRIORITY_LABELS: Record<Priority, string> = { 1: 'Low', 2: 'Medium', 3: 'High' }

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 3, label: PRIORITY_LABELS[3] },
  { value: 2, label: PRIORITY_LABELS[2] },
  { value: 1, label: PRIORITY_LABELS[1] },
]
