<script setup lang="ts">
import type { Priority } from '@/types'
import { PRIORITY_LABELS } from '@/utils/priority'

defineProps<{ priority: Priority }>()
</script>

<template>
  <span :class="['priority-badge', `priority-badge--${priority}`]">
    {{ PRIORITY_LABELS[priority] }}
  </span>
</template>

<style scoped>
.priority-badge {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.priority-badge--1 {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.priority-badge--2 {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}

.priority-badge--3 {
  background: var(--color-danger);
  color: #fff;
}
</style>
