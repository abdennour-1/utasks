<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue'
import type { Board } from '@/types'

defineProps<{ board: Board }>()
const emit = defineEmits<{ edit: []; delete: [] }>()
</script>

<template>
  <article class="board-card">
    <RouterLink class="board-card__link" :to="{ name: 'board', params: { id: board.id } }">
      <h2 class="board-card__name">{{ board.name }}</h2>
      <p v-if="board.description" class="board-card__description">{{ board.description }}</p>
    </RouterLink>
    <div class="board-card__actions">
      <button
        class="icon-btn"
        type="button"
        :aria-label="`Edit board ${board.name}`"
        @click="emit('edit')"
      >
        <AppIcon name="edit" />
      </button>
      <button
        class="icon-btn"
        type="button"
        :aria-label="`Delete board ${board.name}`"
        @click="emit('delete')"
      >
        <AppIcon name="trash" />
      </button>
    </div>
  </article>
</template>

<style scoped>
.board-card {
  display: flex;
  flex-direction: column;
  min-height: 132px;
  overflow: hidden;
  border-top: 4px solid var(--color-primary);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.board-card:hover {
  box-shadow: var(--shadow-lg);
}

.board-card__link {
  flex: 1;
  padding: 14px 16px 4px;
  color: inherit;
  text-decoration: none;
}

.board-card__name {
  font-size: 17px;
  overflow-wrap: anywhere;
}

.board-card__description {
  display: -webkit-box;
  margin-top: 4px;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 14px;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.board-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 2px;
  padding: 0 6px 6px;
}
</style>
