<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import CardFormModal from '@/components/cards/CardFormModal.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import InlineEdit from '@/components/common/InlineEdit.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import AddListForm from '@/components/lists/AddListForm.vue'
import ListColumn from '@/components/lists/ListColumn.vue'
import { useBoardStore } from '@/stores/board'
import type { Card } from '@/types'
import { validateBoardName } from '@/utils/validation'

const props = defineProps<{ id: string }>()

const store = useBoardStore()

const newCardListId = ref<string | null>(null)
const openedCardId = ref<string | null>(null)

// Looked up by id so that the modal always reflects the card's current state.
const openedCard = computed<Card | null>(() => {
  for (const cards of Object.values(store.cardsByList)) {
    const found = cards.find((card) => card.id === openedCardId.value)
    if (found) return found
  }
  return null
})

function closeCardModal() {
  newCardListId.value = null
  openedCardId.value = null
}

watch(() => props.id, store.load, { immediate: true })
</script>

<template>
  <main class="board-page">
    <div v-if="store.status === 'loading'" class="board-page__canvas" aria-busy="true">
      <SkeletonBlock v-for="n in 3" :key="n" class="board-page__skeleton" />
    </div>

    <EmptyState
      v-else-if="store.status === 'not-found'"
      class="board-page__message"
      title="Board not found"
      message="This board does not exist or does not belong to you."
    >
      <RouterLink class="btn btn--primary board-page__back-btn" :to="{ name: 'boards' }">
        Back to my boards
      </RouterLink>
    </EmptyState>

    <ErrorState
      v-else-if="store.status === 'error'"
      class="board-page__message"
      title="Could not load this board"
      :message="store.loadError ?? ''"
      @retry="store.load(id)"
    />

    <template v-else-if="store.board">
      <header class="board-page__header">
        <RouterLink
          class="board-page__back"
          :to="{ name: 'boards' }"
          aria-label="Back to my boards"
        >
          <AppIcon name="arrowUp" class="board-page__back-icon" />
        </RouterLink>
        <h1 class="board-page__title">
          <InlineEdit
            :value="store.board.name"
            label="Rename board"
            :validate="validateBoardName"
            @save="store.renameBoard"
          />
        </h1>
      </header>

      <p v-if="store.lists.length === 0" class="board-page__hint">
        No lists yet. Add your first list to get started.
      </p>

      <div class="board-page__canvas">
        <div class="board-page__lists">
          <ListColumn
            v-for="list in store.lists"
            :key="list.id"
            :list="list"
            @add-card="newCardListId = list.id"
            @open-card="openedCardId = $event.id"
          />
        </div>
        <AddListForm />
      </div>
    </template>

    <CardFormModal
      v-if="openedCard"
      :key="openedCard.id"
      :list-id="openedCard.listId"
      :card="openedCard"
      @close="closeCardModal"
    />
    <CardFormModal v-else-if="newCardListId" :list-id="newCardListId" @close="closeCardModal" />
  </main>
</template>

<style scoped>
.board-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-board);
  color: #fff;
}

.board-page__header {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
}

.board-page__back {
  display: inline-flex;
  flex: none;
  padding: 6px;
  border-radius: var(--radius-sm);
  color: inherit;
}

.board-page__back:hover {
  background: rgb(255 255 255 / 20%);
}

.board-page__back-icon {
  transform: rotate(-90deg);
}

.board-page__back-btn {
  text-decoration: none;
}

.board-page__title {
  flex: 1;
  min-width: 0;
  font-size: 20px;
}

.board-page__hint {
  flex: none;
  padding: 0 16px 10px;
}

.board-page__message {
  margin-top: 24px;
}

.board-page__canvas {
  display: flex;
  flex: 1;
  align-items: flex-start;
  gap: 12px;
  min-height: 0;
  padding: 4px 16px 16px;
  overflow-x: auto;
  scroll-padding-left: 16px;
}

.board-page__lists {
  display: flex;
  flex: none;
  align-items: flex-start;
  gap: 12px;
  height: 100%;
}

.board-page__skeleton {
  flex: none;
  width: var(--column-width);
  height: 280px;
  opacity: 0.5;
}

@media (max-width: 600px) {
  .board-page {
    --column-width: 84vw;
  }

  .board-page__canvas {
    scroll-snap-type: x mandatory;
  }
}
</style>
