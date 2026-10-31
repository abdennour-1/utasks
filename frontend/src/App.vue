<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from '@/components/common/AppHeader.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import OfflineBanner from '@/components/common/OfflineBanner.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'
import { useAuthStore } from '@/stores/auth'
import { useRequestsStore } from '@/stores/requests'

const auth = useAuthStore()
const requests = useRequestsStore()
const route = useRoute()

const showHeader = computed(() => auth.isAuthenticated && !route.meta.guestOnly)
</script>

<template>
  <div class="app">
    <div v-if="requests.isBusy" class="app__progress" role="progressbar" aria-label="Loading" />
    <AppHeader v-if="showHeader" />
    <OfflineBanner />
    <div class="app__content">
      <RouterView />
    </div>
    <ConfirmDialog />
    <ToastContainer />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  height: 100dvh;
}

.app__content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.app__progress {
  position: fixed;
  z-index: 1100;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #ffc400, transparent);
  background-size: 50% 100%;
  background-repeat: no-repeat;
  animation: app-progress 1.1s linear infinite;
}

@keyframes app-progress {
  from {
    background-position: -50% 0;
  }

  to {
    background-position: 150% 0;
  }
}
</style>
