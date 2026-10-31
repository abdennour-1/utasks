<script setup lang="ts">
import AppIcon from './AppIcon.vue'

defineProps<{ title: string }>()
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <div class="auth-card__brand">
        <AppIcon name="board" :size="24" />
        <span>UTasks</span>
      </div>
      <h1 class="auth-card__title">{{ title }}</h1>
      <slot />
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 24px 16px;
  background: var(--color-primary-soft);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 28px 24px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.auth-card__brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--color-primary);
  font-size: 22px;
  font-weight: 700;
}

.auth-card__title {
  margin-bottom: 20px;
  font-size: 18px;
  text-align: center;
}
</style>
