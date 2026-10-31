<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const isOffline = ref(!navigator.onLine)

function update() {
  isOffline.value = !navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', update)
  window.addEventListener('offline', update)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', update)
  window.removeEventListener('offline', update)
})
</script>

<template>
  <p v-if="isOffline" class="offline-banner" role="alert">
    You are offline. Changes cannot be saved until your connection is back.
  </p>
</template>

<style scoped>
.offline-banner {
  flex: none;
  padding: 6px 16px;
  background: var(--color-danger);
  color: #fff;
  font-size: 14px;
  text-align: center;
}
</style>
