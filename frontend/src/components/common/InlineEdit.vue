<script setup lang="ts">
import { nextTick, ref } from 'vue'

const props = defineProps<{
  value: string
  label: string
  validate: (value: string) => string | null
}>()
const emit = defineEmits<{ save: [value: string] }>()

const editing = ref(false)
const draft = ref('')
const error = ref<string | null>(null)
const input = ref<HTMLInputElement | null>(null)

async function start() {
  draft.value = props.value
  error.value = null
  editing.value = true
  await nextTick()
  input.value?.select()
}

function cancel() {
  editing.value = false
  error.value = null
}

function commit() {
  const next = draft.value.trim()
  error.value = props.validate(next)
  if (error.value) return
  editing.value = false
  if (next !== props.value) emit('save', next)
}

/** Clicking away saves valid text but must not trap the user on invalid text. */
function onBlur() {
  if (!editing.value) return
  if (props.validate(draft.value.trim())) cancel()
  else commit()
}
</script>

<template>
  <div class="inline-edit">
    <input
      v-if="editing"
      ref="input"
      v-model="draft"
      class="input inline-edit__input"
      :aria-label="label"
      :aria-invalid="Boolean(error)"
      @keydown.enter.prevent="commit"
      @keydown.esc.stop="cancel"
      @blur="onBlur"
    />
    <button v-else class="inline-edit__text" type="button" :title="label" @click="start">
      {{ value }}
    </button>
    <p v-if="error" class="inline-edit__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.inline-edit {
  position: relative;
  flex: 1;
  min-width: 0;
}

.inline-edit__text {
  display: block;
  width: 100%;
  padding: 4px 6px;
  border: 0;
  border-radius: var(--radius-sm);
  background: none;
  font-weight: inherit;
  text-align: left;
  cursor: text;
  overflow-wrap: anywhere;
}

.inline-edit__text:hover {
  background: rgb(127 127 127 / 20%);
}

.inline-edit__input {
  min-height: 32px;
  padding: 4px 6px;
  color: var(--color-text);
  font-weight: inherit;
}

.inline-edit__error {
  position: absolute;
  z-index: 5;
  top: 100%;
  left: 0;
  margin-top: 2px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  background: var(--color-danger);
  color: #fff;
  font-size: 12px;
  font-weight: 400;
  white-space: normal;
}
</style>
