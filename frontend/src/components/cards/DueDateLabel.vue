<script setup lang="ts">
import { computed } from 'vue'

import AppIcon from '@/components/common/AppIcon.vue'
import type { Card } from '@/types'
import { formatDueDate, isOverdue } from '@/utils/date'

const props = defineProps<{ card: Card }>()

const overdue = computed(() => isOverdue(props.card))
</script>

<template>
  <span :class="['due-date', { 'due-date--overdue': overdue }]">
    <AppIcon name="clock" :size="14" />
    <time :datetime="card.dueDate">{{ formatDueDate(card.dueDate) }}</time>
    <strong v-if="overdue">· Overdue</strong>
  </span>
</template>

<style scoped>
.due-date {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.due-date--overdue {
  color: var(--color-danger);
  font-weight: 600;
}
</style>
