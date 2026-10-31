<script setup lang="ts">
import { computed, ref } from 'vue'

import BaseModal from '@/components/common/BaseModal.vue'
import FormField from '@/components/common/FormField.vue'
import { useBoardsStore } from '@/stores/boards'
import type { Board, BoardPayload } from '@/types'
import { LIMITS, validateBoardDescription, validateBoardName } from '@/utils/validation'

const props = defineProps<{ board?: Board | null }>()
const emit = defineEmits<{ close: [] }>()

const boards = useBoardsStore()

const name = ref(props.board?.name ?? '')
const description = ref(props.board?.description ?? '')
const nameError = ref<string | null>(null)
const descriptionError = ref<string | null>(null)
const saving = ref(false)

const isEditing = computed(() => Boolean(props.board))

function buildPayload(): BoardPayload {
  const trimmed = description.value.trim()
  // A board without a description omits the field, unless clearing an existing one.
  return trimmed || props.board?.description
    ? { name: name.value.trim(), description: trimmed }
    : { name: name.value.trim() }
}

async function submit() {
  nameError.value = validateBoardName(name.value)
  descriptionError.value = validateBoardDescription(description.value)
  if (nameError.value || descriptionError.value) return

  saving.value = true
  const saved = props.board
    ? await boards.update(props.board.id, buildPayload())
    : await boards.create(buildPayload())
  saving.value = false
  if (saved) emit('close')
}
</script>

<template>
  <BaseModal :title="isEditing ? 'Edit board' : 'Create a board'" @close="emit('close')">
    <form id="board-form" novalidate @submit.prevent="submit">
      <FormField
        v-slot="{ id, invalid }"
        label="Name"
        :error="nameError"
        :hint="`${LIMITS.boardName.min} to ${LIMITS.boardName.max} characters.`"
      >
        <input :id="id" v-model="name" :class="['input', { 'input--invalid': invalid }]" />
      </FormField>
      <FormField
        v-slot="{ id, invalid }"
        label="Description (optional)"
        :error="descriptionError"
        :hint="`Up to ${LIMITS.boardDescription.max} characters.`"
      >
        <textarea
          :id="id"
          v-model="description"
          :class="['input', { 'input--invalid': invalid }]"
          rows="3"
        />
      </FormField>
    </form>
    <template #footer>
      <button class="btn" type="button" @click="emit('close')">Cancel</button>
      <button class="btn btn--primary" type="submit" form="board-form" :disabled="saving">
        {{ saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create board' }}
      </button>
    </template>
  </BaseModal>
</template>
