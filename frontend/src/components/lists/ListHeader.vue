<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue'
import InlineEdit from '@/components/common/InlineEdit.vue'
import { useBoardStore } from '@/stores/board'
import { useConfirmStore } from '@/stores/confirm'
import type { BoardList } from '@/types'
import { validateListName } from '@/utils/validation'

const props = defineProps<{ list: BoardList; cardCount: number }>()

const store = useBoardStore()
const confirm = useConfirmStore()

async function confirmDelete() {
  const cards = props.cardCount === 1 ? '1 card' : `${props.cardCount} cards`
  const confirmed = await confirm.ask({
    title: 'Delete this list?',
    message: `"${props.list.name}" and its ${cards} will be permanently deleted.`,
    confirmLabel: 'Delete list',
  })
  if (confirmed) await store.deleteList(props.list.id)
}
</script>

<template>
  <header class="list-header">
    <span class="list-header__handle list-drag-handle" title="Drag to reorder this list">
      <AppIcon name="grip" :size="18" />
      <span class="visually-hidden">Drag to reorder this list</span>
    </span>
    <InlineEdit
      class="list-header__name"
      :value="list.name"
      label="Rename list"
      :validate="validateListName"
      @save="store.renameList(list, $event)"
    />
    <button
      class="icon-btn"
      type="button"
      :aria-label="`Delete list ${list.name}`"
      @click="confirmDelete"
    >
      <AppIcon name="trash" :size="16" />
    </button>
  </header>
</template>

<style scoped>
.list-header {
  display: flex;
  align-items: flex-start;
  gap: 2px;
  padding: 6px 4px 2px 2px;
}

.list-header__handle {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 36px;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: grab;
  /* The whole gesture belongs to the drag: the browser must not treat it as a scroll. */
  touch-action: none;
  -webkit-touch-callout: none;
  user-select: none;
}

.list-header__handle:hover {
  background: rgb(9 30 66 / 10%);
}

.list-header__name {
  font-size: 15px;
  font-weight: 700;
}
</style>
