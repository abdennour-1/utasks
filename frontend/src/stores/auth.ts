import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { ApiError } from '@/api/client'
import * as usersApi from '@/api/users'
import type { User } from '@/types'
import { readJson, removeKey, writeJson } from '@/utils/storage'

const SESSION_KEY = 'utasks.session'
const DIRECTORY_KEY = 'utasks.directory'

/** The username is not in this browser's directory: the API cannot resolve it to an id. */
export class UnknownUsernameError extends Error {
  constructor() {
    super('Unknown username on this browser.')
    this.name = 'UnknownUsernameError'
  }
}

function sameUsername(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase()
}

/**
 * The API has no login endpoint and no way to find a user by username, so accounts seen on
 * this browser are remembered in a local directory. See docs/API_NOTES.md.
 */
function readDirectory(): User[] {
  return readJson<User[]>(DIRECTORY_KEY) ?? []
}

function findInDirectory(username: string): User | undefined {
  const directory = readDirectory()
  return (
    directory.find((entry) => entry.username === username) ??
    directory.find((entry) => sameUsername(entry.username, username))
  )
}

function remember(user: User) {
  const others = readDirectory().filter((entry) => entry.id !== user.id)
  writeJson(DIRECTORY_KEY, [...others, user])
}

function forget(id: string) {
  writeJson(
    DIRECTORY_KEY,
    readDirectory().filter((entry) => entry.id !== id),
  )
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(readJson<User>(SESSION_KEY))
  const isAuthenticated = computed(() => user.value !== null)

  function startSession(next: User) {
    user.value = next
    writeJson(SESSION_KEY, next)
    remember(next)
  }

  function logout() {
    user.value = null
    removeKey(SESSION_KEY)
  }

  async function register(username: string): Promise<User> {
    const created = await usersApi.registerUser(username)
    startSession(created)
    return created
  }

  async function login(username: string): Promise<void> {
    const known = findInDirectory(username)
    if (!known) throw new UnknownUsernameError()
    try {
      startSession(await usersApi.fetchUser(known.id))
    } catch (error) {
      if (error instanceof ApiError && error.kind === 'not-found') forget(known.id)
      throw error
    }
  }

  /** Used when the account was created elsewhere and is not in the local directory. */
  async function loginWithId(username: string, id: string): Promise<void> {
    const found = await usersApi.fetchUser(id)
    if (!sameUsername(found.username, username)) {
      throw new ApiError('validation', 'This user ID does not belong to that username.')
    }
    startSession(found)
  }

  /** Ends a restored session if the account was deleted; other failures are not conclusive. */
  async function verifySession(): Promise<boolean> {
    if (!user.value) return true
    try {
      await usersApi.fetchUser(user.value.id)
      return true
    } catch (error) {
      if (error instanceof ApiError && error.kind === 'not-found') {
        forget(user.value.id)
        logout()
        return false
      }
      return true
    }
  }

  return { user, isAuthenticated, register, login, loginWithId, logout, verifySession }
})
