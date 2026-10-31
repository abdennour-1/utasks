<script setup lang="ts">
import { computed } from 'vue'

import DueDateLabel from './DueDateLabel.vue'
import PriorityBadge from './PriorityBadge.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import type { Card } from '@/types'
import { isOverdue } from '@/utils/date'

const props = defineProps<{ card: Card; saving?: boolean }>()
const emit = defineEmits<{ open: [] }>()

const overdue = computed(() => isOverdue(props.card))
</script>

<template>
  <article
    class="card-item"
    :class="{
      'card-item--overdue': overdue,
      'card-item--completed': card.isCompleted,
      'card-item--saving': saving,
    }"
    role="button"
    tabindex="0"
    @click="emit('open')"
    @keydown.enter="emit('open')"
  >
    <div class="card-item__top">
      <PriorityBadge :priority="card.priority" />
      <span v-if="card.isCompleted" class="card-item__done">
        <AppIcon name="check" :size="14" />
        Done
      </span>
    </div>
    <h3 class="card-item__title">{{ card.title }}</h3>
    <p class="card-item__description">{{ card.description }}</p>
    <DueDateLabel :card="card" />
  </article>
</template>

<style scoped>
.card-item {
  padding: 8px 10px;
  border-left: 4px solid transparent;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  /* A long press starts a drag: it must not select text or open the callout menu. */
  -webkit-touch-callout: none;
  user-select: none;
}

.card-item:hover {
  box-shadow: 0 0 0 2px var(--color-primary);
}

.card-item--overdue {
  border-left-color: var(--color-danger);
  background: var(--color-danger-soft);
}

.card-item--saving {
  opacity: 0.65;
}

/* The placeholder showing where the dragged card will land. */
.card-item--ghost {
  background: var(--color-primary-soft);
  box-shadow: inset 0 0 0 2px var(--color-primary);
  opacity: 0.6;
}

.card-item--completed .card-item__title {
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.card-item__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.card-item__done {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: var(--color-success);
  font-size: 12px;
  font-weight: 700;
}

.card-item__title {
  font-size: 14px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.card-item__description {
  margin-bottom: 4px;
  color: var(--color-text-muted);
  font-size: 13px;
  overflow-wrap: anywhere;
}
</style>
