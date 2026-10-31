<script setup lang="ts">
import BaseModal from './BaseModal.vue'
import { useConfirmStore } from '@/stores/confirm'

const confirm = useConfirmStore()
</script>

<template>
  <BaseModal v-if="confirm.request" :title="confirm.request.title" @close="confirm.answer(false)">
    <p class="confirm__message">{{ confirm.request.message }}</p>
    <template #footer>
      <button class="btn" type="button" @click="confirm.answer(false)">Cancel</button>
      <button class="btn btn--danger" type="button" @click="confirm.answer(true)">
        {{ confirm.request.confirmLabel }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.confirm__message {
  overflow-wrap: anywhere;
}
</style>
