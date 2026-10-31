/**
 * Limits observed on the live API (see docs/API_NOTES.md). Exceeding some of them
 * returns a 500 rather than a 400, so the forms must catch them first.
 */
export const LIMITS = {
  username: { min: 3, max: 30 },
  boardName: { min: 3, max: 100 },
  boardDescription: { max: 500 },
  listName: { min: 3, max: 50 },
  cardTitle: { min: 3, max: 100 },
  cardDescription: { min: 1, max: 30 },
} as const

const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/
const USER_ID_PATTERN = /^[0-9a-fA-F]{24}$/

function validateLength(label: string, value: string, min: number, max: number): string | null {
  const length = value.trim().length
  if (length === 0) return `${label} is required.`
  if (length < min) return `${label} must be at least ${min} characters.`
  if (length > max) return `${label} must be at most ${max} characters.`
  return null
}

/** Login stays lenient on characters: accounts may predate the registration rules. */
export function validateLoginUsername(value: string): string | null {
  return value.trim() ? null : 'Username is required.'
}

export function validateNewUsername(value: string): string | null {
  const { min, max } = LIMITS.username
  const error = validateLength('Username', value, min, max)
  if (error) return error
  return USERNAME_PATTERN.test(value.trim())
    ? null
    : 'Username can only contain letters, numbers, dots, dashes and underscores.'
}

export function validateUserId(value: string): string | null {
  if (!value.trim()) return 'User ID is required.'
  return USER_ID_PATTERN.test(value.trim())
    ? null
    : 'A user ID is exactly 24 hexadecimal characters.'
}

export function validateBoardName(value: string): string | null {
  return validateLength('Board name', value, LIMITS.boardName.min, LIMITS.boardName.max)
}

export function validateBoardDescription(value: string): string | null {
  const { max } = LIMITS.boardDescription
  return value.trim().length > max ? `Description must be at most ${max} characters.` : null
}

export function validateListName(value: string): string | null {
  return validateLength('List name', value, LIMITS.listName.min, LIMITS.listName.max)
}

export function validateCardTitle(value: string): string | null {
  return validateLength('Title', value, LIMITS.cardTitle.min, LIMITS.cardTitle.max)
}

export function validateCardDescription(value: string): string | null {
  const { min, max } = LIMITS.cardDescription
  return validateLength('Description', value, min, max)
}

export function validateDueDate(value: string): string | null {
  if (!value) return 'Due date is required.'
  return Number.isNaN(new Date(value).getTime()) ? 'Enter a valid date.' : null
}
