<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'

import ListHeader from './ListHeader.vue'
import ListSortControl from './ListSortControl.vue'
import CardItem from '@/components/cards/CardItem.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useBoardStore } from '@/stores/board'
import type { BoardList, Card } from '@/types'

interface CardDragChange {
  added?: { element: Card; newIndex: number }
  moved?: { oldIndex: number; newIndex: number }
}

const props = defineProps<{ list: BoardList }>()
const emit = defineEmits<{ 'add-card': []; 'open-card': [card: Card] }>()

const store = useBoardStore()

const cards = computed(() => store.displayedCards(props.list.id))
const sort = computed(() => store.listSort(props.list.id))
const isManual = computed(() => sort.value.mode === 'manual')

function onDragChange(change: CardDragChange) {
  if (change.added) {
    store.moveCard(change.added.element.id, props.list.id, change.added.newIndex)
  } else if (change.moved) {
    store.reorderCard(props.list.id, change.moved.oldIndex, change.moved.newIndex)
  }
}
</script>

<template>
  <section class="list-column">
    <ListHeader :list="list" :card-count="cards.length" />
    <ListSortControl :sort="sort" @change="store.setListSort(list.id, $event)" />

    <div class="list-column__body">
      <p v-if="cards.length === 0" class="list-column__empty">No cards yet</p>
      <!--
        On touch screens, a short hold starts the drag so that swiping still scrolls.
        A card being saved cannot be dragged, which rules out overlapping updates.
        While a sort is active, "sort" only disables reordering inside this list:
        cards can still leave it or be dropped into it.
      -->
      <draggable
        class="list-column__cards"
        :model-value="cards"
        item-key="id"
        group="cards"
        :sort="isManual"
        filter=".card-item--saving"
        ghost-class="card-item--ghost"
        :prevent-on-filter="false"
        :animation="150"
        :force-fallback="true"
        :fallback-tolerance="4"
        :fallback-on-body="true"
        :delay="180"
        :delay-on-touch-only="true"
        :touch-start-threshold="6"
        :empty-insert-threshold="24"
        :scroll-sensitivity="70"
        :scroll-speed="14"
        :bubble-scroll="true"
        @start="store.isDragging = true"
        @end="store.isDragging = false"
        @change="onDragChange"
      >
        <template #item="{ element }">
          <CardItem
            :card="element"
            :saving="store.savingCardIds.has(element.id)"
            @open="emit('open-card', element)"
          />
        </template>
      </draggable>
    </div>

    <button class="list-column__add" type="button" @click="emit('add-card')">
      <AppIcon name="plus" :size="16" />
      Add a card
    </button>
  </section>
</template>

<style scoped>
.list-column {
  display: flex;
  flex: none;
  flex-direction: column;
  width: var(--column-width);
  max-height: 100%;
  border-radius: var(--radius-lg);
  background: var(--color-surface-muted);
  color: var(--color-text);
  scroll-snap-align: start;
}

.list-column__body {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.list-column__cards {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  min-height: 56px;
  padding: 4px 8px;
  overflow-y: auto;
}

.list-column__empty {
  position: absolute;
  inset: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 13px;
  pointer-events: none;
}

.list-column__add {
  display: flex;
  flex: none;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  margin: 4px 8px 8px;
  padding: 4px 8px;
  border: 0;
  border-radius: var(--radius-md);
  background: none;
  color: var(--color-text-muted);
  font-weight: 600;
  cursor: pointer;
}

.list-column__add:hover {
  background: rgb(9 30 66 / 10%);
  color: var(--color-text);
}
</style>
