<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { errorMessage } from '@/api/client'
import AuthCard from '@/components/common/AuthCard.vue'
import FormField from '@/components/common/FormField.vue'
import { UnknownUsernameError, useAuthStore } from '@/stores/auth'
import { validateLoginUsername, validateUserId } from '@/utils/validation'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const username = ref('')
const userId = ref('')
const needsUserId = ref(false)
const usernameError = ref<string | null>(null)
const userIdError = ref<string | null>(null)
const formError = ref<string | null>(null)
const submitting = ref(false)

function onUsernameInput() {
  needsUserId.value = false
  userId.value = ''
  userIdError.value = null
  formError.value = null
}

function validate(): boolean {
  usernameError.value = validateLoginUsername(username.value)
  userIdError.value = needsUserId.value ? validateUserId(userId.value) : null
  return !usernameError.value && !userIdError.value
}

async function enterApp() {
  const redirect = route.query.redirect
  await router.replace(
    typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/boards',
  )
}

async function submit() {
  formError.value = null
  if (!validate()) return
  submitting.value = true
  try {
    const name = username.value.trim()
    if (needsUserId.value) await auth.loginWithId(name, userId.value.trim())
    else await auth.login(name)
    await enterApp()
  } catch (error) {
    if (error instanceof UnknownUsernameError) needsUserId.value = true
    else formError.value = errorMessage(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthCard title="Log in to your account">
    <form novalidate @submit.prevent="submit">
      <FormField v-slot="{ id, invalid }" label="Username" :error="usernameError">
        <input
          :id="id"
          v-model="username"
          :class="['input', { 'input--invalid': invalid }]"
          autocomplete="username"
          autocapitalize="none"
          spellcheck="false"
          @input="onUsernameInput"
        />
      </FormField>

      <template v-if="needsUserId">
        <p class="login__notice" role="status">
          This username is not known on this browser, and the API cannot look up an account by
          username. Enter the user ID shown when the account was created.
        </p>
        <FormField v-slot="{ id, invalid }" label="User ID" :error="userIdError">
          <input
            :id="id"
            v-model="userId"
            :class="['input', { 'input--invalid': invalid }]"
            autocomplete="off"
            autocapitalize="none"
            spellcheck="false"
          />
        </FormField>
      </template>

      <p v-if="formError" class="login__error" role="alert">{{ formError }}</p>

      <button class="btn btn--primary btn--block" type="submit" :disabled="submitting">
        {{ submitting ? 'Logging in…' : 'Log in' }}
      </button>
    </form>
    <p class="login__alt">
      No account yet?
      <RouterLink :to="{ name: 'register' }">Create one</RouterLink>
    </p>
  </AuthCard>
</template>

<style scoped>
.login__notice {
  margin-bottom: 14px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--color-warning-soft);
  color: var(--color-warning);
  font-size: 14px;
}

.login__error {
  margin-bottom: 14px;
  color: var(--color-danger);
}

.login__alt {
  margin-top: 16px;
  text-align: center;
}
</style>
