<template>
  <div class="skeleton" aria-hidden="true" />
</template>

<style scoped>
.skeleton {
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, #dfe1e6 25%, #eef0f3 50%, #dfe1e6 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s linear infinite;
}

@keyframes skeleton-shimmer {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}
</style>
