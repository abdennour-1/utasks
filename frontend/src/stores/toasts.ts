import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

const DURATION_MS: Record<ToastType, number> = { success: 3000, info: 4000, error: 6000 }

export const useToastsStore = defineStore('toasts', () => {
  const toasts = ref<Toast[]>([])
  let nextId = 1

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function show(type: ToastType, message: string) {
    // Avoids stacking identical errors when several parallel calls fail together.
    if (toasts.value.some((toast) => toast.message === message)) return
    const id = nextId++
    toasts.value.push({ id, type, message })
    setTimeout(() => dismiss(id), DURATION_MS[type])
  }

  return {
    toasts,
    dismiss,
    success: (message: string) => show('success', message),
    error: (message: string) => show('error', message),
    info: (message: string) => show('info', message),
  }
})
