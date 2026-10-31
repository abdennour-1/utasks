<script setup lang="ts">
import { nextTick, ref } from 'vue'

import AppIcon from '@/components/common/AppIcon.vue'
import { useBoardStore } from '@/stores/board'
import { validateListName } from '@/utils/validation'

const store = useBoardStore()

const isOpen = ref(false)
const name = ref('')
const error = ref<string | null>(null)
const saving = ref(false)
const input = ref<HTMLInputElement | null>(null)

async function open() {
  isOpen.value = true
  await nextTick()
  input.value?.focus()
}

function close() {
  isOpen.value = false
  name.value = ''
  error.value = null
}

async function submit() {
  error.value = validateListName(name.value)
  if (error.value) return
  saving.value = true
  const created = await store.createList(name.value.trim())
  saving.value = false
  if (created) {
    // Stays open so several lists can be added in a row, like Trello.
    name.value = ''
    await nextTick()
    input.value?.focus()
  }
}
</script>

<template>
  <div class="add-list">
    <button v-if="!isOpen" class="add-list__open" type="button" @click="open">
      <AppIcon name="plus" :size="16" />
      Add a list
    </button>
    <form v-else class="add-list__form" novalidate @submit.prevent="submit">
      <label class="visually-hidden" for="new-list-name">List name</label>
      <input
        id="new-list-name"
        ref="input"
        v-model="name"
        :class="['input', { 'input--invalid': error }]"
        placeholder="List name"
        @keydown.esc="close"
      />
      <p v-if="error" class="add-list__error" role="alert">{{ error }}</p>
      <div class="add-list__actions">
        <button class="btn btn--primary" type="submit" :disabled="saving">
          {{ saving ? 'Adding…' : 'Add list' }}
        </button>
        <button class="btn btn--ghost" type="button" @click="close">Cancel</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.add-list {
  flex: none;
  width: var(--column-width);
  scroll-snap-align: start;
}

.add-list__open {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: 44px;
  padding: 8px 12px;
  border: 0;
  border-radius: var(--radius-lg);
  background: rgb(255 255 255 / 24%);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.add-list__open:hover {
  background: rgb(255 255 255 / 36%);
}

.add-list__form {
  padding: 8px;
  border-radius: var(--radius-lg);
  background: var(--color-surface-muted);
}

.add-list__error {
  margin-top: 4px;
  color: var(--color-danger);
  font-size: 13px;
}

.add-list__actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}
</style>
