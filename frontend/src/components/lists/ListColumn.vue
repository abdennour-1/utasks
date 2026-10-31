<script setup lang="ts">
import { computed } from 'vue'

import ListHeader from './ListHeader.vue'
import CardItem from '@/components/cards/CardItem.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useBoardStore } from '@/stores/board'
import type { BoardList, Card } from '@/types'

const props = defineProps<{ list: BoardList }>()
const emit = defineEmits<{ 'add-card': []; 'open-card': [card: Card] }>()

const store = useBoardStore()

const cards = computed(() => store.cardsByList[props.list.id] ?? [])
</script>

<template>
  <section class="list-column">
    <ListHeader :list="list" :card-count="cards.length" />

    <div class="list-column__cards">
      <p v-if="cards.length === 0" class="list-column__empty">No cards yet</p>
      <CardItem v-for="card in cards" :key="card.id" :card="card" @open="emit('open-card', card)" />
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
  scroll-snap-align: start;
}

.list-column__cards {
  position: relative;
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
