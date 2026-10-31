<script setup lang="ts">
import { ref } from 'vue'

import { ApiError, errorMessage } from '@/api/client'
import AppIcon from '@/components/common/AppIcon.vue'
import AuthCard from '@/components/common/AuthCard.vue'
import FormField from '@/components/common/FormField.vue'
import { useAuthStore } from '@/stores/auth'
import { useToastsStore } from '@/stores/toasts'
import type { User } from '@/types'
import { validateNewUsername } from '@/utils/validation'

const auth = useAuthStore()
const toasts = useToastsStore()

const username = ref('')
const usernameError = ref<string | null>(null)
const formError = ref<string | null>(null)
const submitting = ref(false)
const created = ref<User | null>(null)

async function submit() {
  formError.value = null
  usernameError.value = validateNewUsername(username.value)
  if (usernameError.value) return
  submitting.value = true
  try {
    created.value = await auth.register(username.value.trim())
  } catch (error) {
    if (error instanceof ApiError && error.kind === 'conflict') {
      usernameError.value = 'This username is already taken.'
    } else {
      formError.value = errorMessage(error)
    }
  } finally {
    submitting.value = false
  }
}

async function copyUserId() {
  try {
    await navigator.clipboard.writeText(created.value?.id ?? '')
    toasts.success('User ID copied.')
  } catch {
    toasts.info('Could not copy automatically. Select the ID and copy it manually.')
  }
}
</script>

<template>
  <AuthCard v-if="created" title="Your account is ready">
    <p class="register__text">
      Welcome, <strong>{{ created.username }}</strong
      >! Keep your user ID: you will need it to log in from another browser or device.
    </p>
    <div class="register__id">
      <code class="register__id-value">{{ created.id }}</code>
      <button class="icon-btn" type="button" aria-label="Copy user ID" @click="copyUserId">
        <AppIcon name="copy" />
      </button>
    </div>
    <RouterLink class="btn btn--primary btn--block register__continue" :to="{ name: 'boards' }">
      Go to my boards
    </RouterLink>
  </AuthCard>

  <AuthCard v-else title="Create your account">
    <form novalidate @submit.prevent="submit">
      <FormField
        v-slot="{ id, invalid }"
        label="Username"
        :error="usernameError"
        hint="3 to 30 characters: letters, numbers, dots, dashes and underscores."
      >
        <input
          :id="id"
          v-model="username"
          :class="['input', { 'input--invalid': invalid }]"
          autocomplete="username"
          autocapitalize="none"
          spellcheck="false"
        />
      </FormField>

      <p v-if="formError" class="register__error" role="alert">{{ formError }}</p>

      <button class="btn btn--primary btn--block" type="submit" :disabled="submitting">
        {{ submitting ? 'Creating account…' : 'Create account' }}
      </button>
    </form>
    <p class="register__alt">
      Already have an account?
      <RouterLink :to="{ name: 'login' }">Log in</RouterLink>
    </p>
  </AuthCard>
</template>

<style scoped>
.register__text {
  margin-bottom: 14px;
  overflow-wrap: anywhere;
}

.register__id {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
  padding: 6px 6px 6px 12px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-muted);
}

.register__id-value {
  font-size: 14px;
  overflow-wrap: anywhere;
  user-select: all;
}

.register__continue {
  text-decoration: none;
}

.register__error {
  margin-bottom: 14px;
  color: var(--color-danger);
}

.register__alt {
  margin-top: 16px;
  text-align: center;
}
</style>
