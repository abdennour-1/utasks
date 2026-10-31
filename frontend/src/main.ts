import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/main.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { useToastsStore } from './stores/toasts'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const UNEXPECTED_ERROR = 'Something went wrong. Please try again.'
app.config.errorHandler = () => useToastsStore().error(UNEXPECTED_ERROR)
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault()
  useToastsStore().error(UNEXPECTED_ERROR)
})

app.mount('#app')

useAuthStore()
  .verifySession()
  .then((stillValid) => {
    if (stillValid) return
    useToastsStore().info('Your account no longer exists. Please log in again.')
    router.push({ name: 'login' })
  })
