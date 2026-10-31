import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
// Not lazy-loaded: navigating must keep working, with a proper error state, if the connection drops.
import BoardDetailView from '@/views/BoardDetailView.vue'
import BoardsView from '@/views/BoardsView.vue'
import LoginView from '@/views/LoginView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import RegisterView from '@/views/RegisterView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: 'boards' } },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
    { path: '/boards', name: 'boards', component: BoardsView, meta: { requiresAuth: true } },
    {
      path: '/boards/:id',
      name: 'board',
      component: BoardDetailView,
      props: true,
      meta: { requiresAuth: true },
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'boards' }
  }
})

export default router
