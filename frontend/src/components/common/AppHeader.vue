<script setup lang="ts">
import { useRouter } from 'vue-router'

import AppIcon from './AppIcon.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="app-header">
    <RouterLink class="app-header__brand" :to="{ name: 'boards' }">
      <AppIcon name="board" :size="20" />
      <span>UTasks</span>
    </RouterLink>
    <div class="app-header__user">
      <span class="app-header__name" :title="auth.user?.username">{{ auth.user?.username }}</span>
      <button class="app-header__logout" type="button" @click="logout">
        <AppIcon name="logout" :size="16" />
        Log out
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: var(--header-height);
  padding: 0 16px;
  background: var(--color-primary);
  color: #fff;
}

.app-header__brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: inherit;
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
}

.app-header__user {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.app-header__name {
  max-width: 30vw;
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-header__logout {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 4px 10px;
  border: 0;
  border-radius: var(--radius-sm);
  background: rgb(255 255 255 / 18%);
  color: inherit;
  font-weight: 600;
  cursor: pointer;
}

.app-header__logout:hover {
  background: rgb(255 255 255 / 30%);
}
</style>
