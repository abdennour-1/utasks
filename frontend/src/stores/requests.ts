import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

/** Counts in-flight API calls to drive the global progress bar. */
export const useRequestsStore = defineStore('requests', () => {
  const pending = ref(0)
  const isBusy = computed(() => pending.value > 0)

  function start() {
    pending.value += 1
  }

  function finish() {
    pending.value = Math.max(0, pending.value - 1)
  }

  return { isBusy, start, finish }
})
