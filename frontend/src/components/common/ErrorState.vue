<script setup lang="ts">
import EmptyState from './EmptyState.vue'

defineProps<{ title: string; message: string }>()
const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <EmptyState :title="title" :message="message">
    <button class="btn btn--primary" type="button" @click="emit('retry')">Try again</button>
  </EmptyState>
</template>
