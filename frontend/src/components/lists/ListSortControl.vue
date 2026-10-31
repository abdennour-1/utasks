<script setup lang="ts">
import { computed, useId } from 'vue'

import AppIcon from '@/components/common/AppIcon.vue'
import {
  defaultDirection,
  directionLabel,
  SORT_OPTIONS,
  type ListSort,
  type SortMode,
} from '@/utils/cardSort'

const props = defineProps<{ sort: ListSort }>()
const emit = defineEmits<{ change: [sort: ListSort] }>()

const selectId = useId()
const isManual = computed(() => props.sort.mode === 'manual')

function changeMode(event: Event) {
  const mode = (event.target as HTMLSelectElement).value as SortMode
  emit('change', { mode, direction: defaultDirection(mode) })
}

function toggleDirection() {
  const direction = props.sort.direction === 'asc' ? 'desc' : 'asc'
  emit('change', { ...props.sort, direction })
}
</script>

<template>
  <div class="list-sort">
    <label class="list-sort__label" :for="selectId">Sort</label>
    <select :id="selectId" class="list-sort__select" :value="sort.mode" @change="changeMode">
      <option v-for="option in SORT_OPTIONS" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <button
      v-if="!isManual"
      class="list-sort__direction"
      type="button"
      :title="`Direction: ${directionLabel(sort)}. Click to reverse.`"
      @click="toggleDirection"
    >
      <AppIcon :name="sort.direction === 'asc' ? 'arrowUp' : 'arrowDown'" :size="14" />
      {{ directionLabel(sort) }}
    </button>
  </div>
</template>

<style scoped>
.list-sort {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 6px;
  padding: 0 10px 4px;
  font-size: 12px;
}

.list-sort__label {
  color: var(--color-text-muted);
  font-weight: 600;
}

.list-sort__select {
  flex: 1;
  min-width: 0;
  min-height: 28px;
  padding: 2px 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 12px;
}

.list-sort__direction {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-height: 28px;
  padding: 2px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.list-sort__direction:hover {
  background: var(--color-primary-soft);
}

/* iOS zooms into focused fields whose text is smaller than 16px. */
@media (pointer: coarse) {
  .list-sort__select {
    font-size: 16px;
  }
}
</style>
