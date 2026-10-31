<script setup lang="ts">
import { onMounted, ref } from 'vue'

import BoardCard from '@/components/boards/BoardCard.vue'
import BoardFormModal from '@/components/boards/BoardFormModal.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import { useBoardsStore } from '@/stores/boards'
import { useConfirmStore } from '@/stores/confirm'
import type { Board } from '@/types'

const boards = useBoardsStore()
const confirm = useConfirmStore()

const isFormOpen = ref(false)
const editedBoard = ref<Board | null>(null)

function openCreate() {
  editedBoard.value = null
  isFormOpen.value = true
}

function openEdit(board: Board) {
  editedBoard.value = board
  isFormOpen.value = true
}

async function confirmDelete(board: Board) {
  const confirmed = await confirm.ask({
    title: 'Delete this board?',
    message: `"${board.name}" and all of its lists and cards will be permanently deleted.`,
    confirmLabel: 'Delete board',
  })
  if (confirmed) await boards.remove(board.id)
}

onMounted(boards.load)
</script>

<template>
  <main class="boards-page">
    <header class="boards-page__header">
      <h1 class="boards-page__title">My boards</h1>
      <button
        v-if="boards.boards.length > 0"
        class="btn btn--primary"
        type="button"
        @click="openCreate"
      >
        <AppIcon name="plus" :size="16" />
        New board
      </button>
    </header>

    <div v-if="boards.status === 'loading'" class="boards-grid" aria-busy="true">
      <SkeletonBlock v-for="n in 6" :key="n" class="boards-grid__skeleton" />
    </div>

    <ErrorState
      v-else-if="boards.status === 'error'"
      title="Could not load your boards"
      :message="boards.loadError ?? ''"
      @retry="boards.load"
    />

    <EmptyState
      v-else-if="boards.status === 'ready' && boards.boards.length === 0"
      title="No boards yet"
      message="Create your first board to start organizing your tasks."
    >
      <button class="btn btn--primary" type="button" @click="openCreate">
        <AppIcon name="plus" :size="16" />
        Create a board
      </button>
    </EmptyState>

    <div v-else class="boards-grid">
      <BoardCard
        v-for="board in boards.boards"
        :key="board.id"
        :board="board"
        @edit="openEdit(board)"
        @delete="confirmDelete(board)"
      />
    </div>

    <BoardFormModal v-if="isFormOpen" :board="editedBoard" @close="isFormOpen = false" />
  </main>
</template>

<style scoped>
.boards-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px 32px;
}

.boards-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 38px;
  margin-bottom: 16px;
}

.boards-page__title {
  font-size: 24px;
}

.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.boards-grid__skeleton {
  height: 132px;
}
</style>
