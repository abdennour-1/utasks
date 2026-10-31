<script setup lang="ts">
import AppIcon, { type IconName } from './AppIcon.vue'
import { useToastsStore, type ToastType } from '@/stores/toasts'

const toasts = useToastsStore()

const ICONS: Record<ToastType, IconName> = { success: 'check', error: 'alert', info: 'info' }
</script>

<template>
  <Teleport to="body">
    <div class="toasts" role="status" aria-live="polite">
      <div
        v-for="toast in toasts.toasts"
        :key="toast.id"
        :class="['toast', `toast--${toast.type}`]"
      >
        <AppIcon :name="ICONS[toast.type]" />
        <span class="toast__message">{{ toast.message }}</span>
        <button
          class="toast__close"
          type="button"
          aria-label="Dismiss"
          @click="toasts.dismiss(toast.id)"
        >
          <AppIcon name="close" :size="16" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.toasts {
  position: fixed;
  z-index: 1000;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(380px, calc(100vw - 32px));
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 10px 10px 12px;
  border-left: 4px solid var(--color-primary);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
}

.toast--success {
  border-left-color: var(--color-success);
  color: var(--color-success);
}

.toast--error {
  border-left-color: var(--color-danger);
  color: var(--color-danger);
}

.toast__message {
  flex: 1;
  color: var(--color-text);
  overflow-wrap: anywhere;
}

.toast__close {
  display: flex;
  padding: 2px;
  border: 0;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
}
</style>
