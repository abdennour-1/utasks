<script lang="ts">
// Shared between instances: a confirmation can be stacked above the card details,
// and only the top modal reacts to the keyboard.
const openModals: symbol[] = []
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'

import AppIcon from './AppIcon.vue'

defineProps<{ title: string }>()
const emit = defineEmits<{ close: [] }>()

const FOCUSABLE = 'a[href], button:not(:disabled), input, select, textarea'

const modalId = Symbol('modal')
const titleId = useId()
const dialog = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

function trapTab(event: KeyboardEvent) {
  const focusable = dialog.value?.querySelectorAll<HTMLElement>(FOCUSABLE)
  const first = focusable?.[0]
  const last = focusable?.[focusable.length - 1]
  if (!first || !last) return
  // Focus can fall out of the modal, for instance when a focused button gets disabled.
  if (!dialog.value?.contains(document.activeElement)) {
    event.preventDefault()
    first.focus()
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (openModals.at(-1) !== modalId) return
  if (event.key === 'Escape') {
    emit('close')
  } else if (event.key === 'Tab') {
    trapTab(event)
  }
}

onMounted(() => {
  previouslyFocused = document.activeElement as HTMLElement | null
  openModals.push(modalId)
  document.addEventListener('keydown', onKeydown)
  document.body.style.overflow = 'hidden'
  // Focusing a field on touch devices would pop the keyboard over the form.
  const isTouch = window.matchMedia('(pointer: coarse)').matches
  const field = isTouch
    ? null
    : dialog.value?.querySelector<HTMLElement>('.modal__body input, .modal__body textarea')
  ;(field ?? dialog.value)?.focus()
})

onBeforeUnmount(() => {
  openModals.splice(openModals.indexOf(modalId), 1)
  document.removeEventListener('keydown', onKeydown)
  if (openModals.length === 0) document.body.style.overflow = ''
  previouslyFocused?.focus()
})
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" @mousedown.self="emit('close')">
      <div
        ref="dialog"
        class="modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
      >
        <header class="modal__header">
          <h2 :id="titleId" class="modal__title">{{ title }}</h2>
          <button class="icon-btn" type="button" aria-label="Close" @click="emit('close')">
            <AppIcon name="close" />
          </button>
        </header>
        <div class="modal__body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="modal__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgb(9 30 66 / 54%);
}

.modal {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
  max-height: 100%;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
}

.modal:focus {
  outline: none;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 8px 20px;
}

.modal__title {
  font-size: 18px;
  overflow-wrap: anywhere;
}

.modal__body {
  flex: 1;
  padding: 8px 20px 16px;
  overflow-y: auto;
}

.modal__footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px 16px;
  border-top: 1px solid var(--color-surface-muted);
}

@media (max-width: 520px) {
  .modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .modal {
    max-width: none;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
}
</style>
