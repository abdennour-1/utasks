<script setup lang="ts">
import { useId } from 'vue'

defineProps<{ label: string; error?: string | null; hint?: string }>()

const fieldId = useId()
</script>

<template>
  <div class="field">
    <label class="field__label" :for="fieldId">{{ label }}</label>
    <slot :id="fieldId" :invalid="Boolean(error)" />
    <p v-if="error" class="field__error" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field {
  margin-bottom: 14px;
}

.field__label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 600;
}

.field__error,
.field__hint {
  margin-top: 4px;
  font-size: 13px;
}

.field__error {
  color: var(--color-danger);
}

.field__hint {
  color: var(--color-text-muted);
}
</style>
