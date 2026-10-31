<script setup lang="ts">
import { computed, ref } from 'vue'

import AppIcon from '@/components/common/AppIcon.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import FormField from '@/components/common/FormField.vue'
import { useBoardStore } from '@/stores/board'
import { useConfirmStore } from '@/stores/confirm'
import type { Card, CardDraft, Priority } from '@/types'
import { defaultDueDateInput, fromDateTimeInput, toDateTimeInput } from '@/utils/date'
import { PRIORITY_OPTIONS } from '@/utils/priority'
import {
  LIMITS,
  validateCardDescription,
  validateCardTitle,
  validateDueDate,
} from '@/utils/validation'

const props = defineProps<{ listId: string; card?: Card | null }>()
const emit = defineEmits<{ close: [] }>()

const store = useBoardStore()
const confirm = useConfirmStore()

const title = ref(props.card?.title ?? '')
const description = ref(props.card?.description ?? '')
const priority = ref<Priority>(props.card?.priority ?? 2)
const dueDate = ref(props.card ? toDateTimeInput(props.card.dueDate) : defaultDueDateInput())
const isCompleted = ref(props.card?.isCompleted ?? false)

const titleError = ref<string | null>(null)
const descriptionError = ref<string | null>(null)
const dueDateError = ref<string | null>(null)
const saving = ref(false)

const descriptionCount = computed(
  () => `${description.value.trim().length}/${LIMITS.cardDescription.max} characters`,
)

function validate(): boolean {
  titleError.value = validateCardTitle(title.value)
  descriptionError.value = validateCardDescription(description.value)
  dueDateError.value = validateDueDate(dueDate.value)
  return !titleError.value && !descriptionError.value && !dueDateError.value
}

async function submit() {
  if (!validate()) return
  const draft: CardDraft = {
    title: title.value.trim(),
    description: description.value.trim(),
    priority: priority.value,
    dueDate: fromDateTimeInput(dueDate.value),
  }
  saving.value = true
  const saved = props.card
    ? await store.updateCard(props.card, { ...draft, isCompleted: isCompleted.value })
    : await store.createCard(props.listId, draft)
  saving.value = false
  if (saved) emit('close')
}

async function remove() {
  if (!props.card) return
  const confirmed = await confirm.ask({
    title: 'Delete this card?',
    message: `"${props.card.title}" will be permanently deleted.`,
    confirmLabel: 'Delete card',
  })
  if (confirmed && (await store.deleteCard(props.card))) emit('close')
}
</script>

<template>
  <BaseModal :title="card ? 'Card details' : 'Add a card'" @close="emit('close')">
    <form id="card-form" novalidate @submit.prevent="submit">
      <FormField
        v-slot="{ id, invalid }"
        label="Title"
        :error="titleError"
        :hint="`${LIMITS.cardTitle.min} to ${LIMITS.cardTitle.max} characters.`"
      >
        <input :id="id" v-model="title" :class="['input', { 'input--invalid': invalid }]" />
      </FormField>

      <FormField
        v-slot="{ id, invalid }"
        label="Description"
        :error="descriptionError"
        :hint="descriptionCount"
      >
        <textarea
          :id="id"
          v-model="description"
          :class="['input', { 'input--invalid': invalid }]"
          rows="2"
        />
      </FormField>

      <div class="card-form__row">
        <FormField v-slot="{ id }" label="Priority">
          <select :id="id" v-model.number="priority" class="input">
            <option v-for="option in PRIORITY_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </FormField>

        <FormField v-slot="{ id, invalid }" label="Due date" :error="dueDateError">
          <input
            :id="id"
            v-model="dueDate"
            :class="['input', { 'input--invalid': invalid }]"
            type="datetime-local"
          />
        </FormField>
      </div>

      <label v-if="card" class="card-form__check">
        <input v-model="isCompleted" type="checkbox" />
        Mark as completed
      </label>
    </form>

    <template #footer>
      <button v-if="card" class="btn btn--ghost card-form__delete" type="button" @click="remove">
        <AppIcon name="trash" :size="16" />
        Delete
      </button>
      <button class="btn" type="button" @click="emit('close')">Cancel</button>
      <button class="btn btn--primary" type="submit" form="card-form" :disabled="saving">
        {{ saving ? 'Saving…' : card ? 'Save changes' : 'Add card' }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.card-form__row {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 12px;
}

@media (max-width: 420px) {
  .card-form__row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

.card-form__check {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  font-weight: 600;
}

.card-form__delete {
  margin-right: auto;
  color: var(--color-danger);
}
</style>
