import axios, { AxiosError } from 'axios'

import { useRequestsStore } from '@/stores/requests'

const DEFAULT_BASE_URL = 'https://utasks-026af75f15a3.herokuapp.com'
// The free Heroku dyno can take a while to wake up.
const TIMEOUT_MS = 30_000

export type ApiErrorKind =
  'offline' | 'timeout' | 'network' | 'validation' | 'not-found' | 'conflict' | 'server' | 'unknown'

/** Every failed API call rejects with this error, whatever went wrong. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

interface ErrorBody {
  errors?: { message?: string; field?: string }[]
}

/** The API often pads its errors with a generic "Invalid value" entry. */
function firstUsefulMessage(body: ErrorBody | undefined): string | undefined {
  const messages = (body?.errors ?? []).map((error) => error.message).filter(Boolean)
  return messages.find((message) => message !== 'Invalid value')
}

function toApiError(error: AxiosError<ErrorBody>): ApiError {
  if (!error.response) {
    if (!navigator.onLine) {
      return new ApiError('offline', 'You are offline. Check your connection and try again.')
    }
    if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
      return new ApiError('timeout', 'The server took too long to respond. Please try again.')
    }
    return new ApiError('network', 'Unable to reach the server. Please try again.')
  }

  const { status, data } = error.response
  if (status >= 500) {
    return new ApiError('server', 'The server ran into a problem. Please try again.', status)
  }
  if (status === 404) {
    return new ApiError('not-found', firstUsefulMessage(data) ?? 'Not found.', status)
  }
  if (status === 409) {
    return new ApiError('conflict', firstUsefulMessage(data) ?? 'Already exists.', status)
  }
  if (status === 400) {
    return new ApiError(
      'validation',
      firstUsefulMessage(data) ?? 'Some of the values are invalid.',
      status,
    )
  }
  return new ApiError('unknown', firstUsefulMessage(data) ?? 'Something went wrong.', status)
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL,
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  useRequestsStore().start()
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    useRequestsStore().finish()
    return response
  },
  (error: AxiosError<ErrorBody>) => {
    useRequestsStore().finish()
    return Promise.reject(toApiError(error))
  },
)

/** The message to show to the user for anything caught around an API call. */
export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
}
