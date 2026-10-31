<script setup lang="ts">
import EmptyState from '@/components/common/EmptyState.vue'
</script>

<template>
  <main class="not-found">
    <EmptyState title="Page not found" message="The page you are looking for does not exist.">
      <RouterLink class="btn btn--primary not-found__link" to="/">Back to my boards</RouterLink>
    </EmptyState>
  </main>
</template>

<style scoped>
.not-found__link {
  text-decoration: none;
}
</style>
