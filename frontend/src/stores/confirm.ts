import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface ConfirmRequest {
  title: string
  message: string
  confirmLabel: string
}

/** Backs the single app-wide ConfirmDialog with a promise-based API. */
export const useConfirmStore = defineStore('confirm', () => {
  const request = ref<ConfirmRequest | null>(null)
  let resolver: ((confirmed: boolean) => void) | null = null

  function ask(next: ConfirmRequest): Promise<boolean> {
    resolver?.(false)
    request.value = next
    return new Promise((resolve) => {
      resolver = resolve
    })
  }

  function answer(confirmed: boolean) {
    resolver?.(confirmed)
    resolver = null
    request.value = null
  }

  return { request, ask, answer }
})
