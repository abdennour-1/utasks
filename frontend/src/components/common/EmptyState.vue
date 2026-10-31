<script setup lang="ts">
defineProps<{ title: string; message?: string }>()
</script>

<template>
  <div class="empty-state">
    <h2 class="empty-state__title">{{ title }}</h2>
    <p v-if="message" class="empty-state__message">{{ message }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 420px;
  margin: 0 auto;
  padding: 48px 16px;
  text-align: center;
}

.empty-state__title {
  font-size: 20px;
}

.empty-state__message {
  margin-bottom: 8px;
  opacity: 0.85;
}
</style>
