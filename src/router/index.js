import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/stores/auth'
import CatalogoView from '@/views/CatalogoView.vue'
import LoginView from '@/views/LoginView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Catalogo',
      component: CatalogoView
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: ForgotPasswordView,
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    }
  ]
})

// Guard de navegación simple
router.beforeEach((to, from, next) => {
  // Rutas que requieren autenticación
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login')
    return
  }
  
  // Rutas para invitados (login, registro, etc.)
  if (to.meta.requiresGuest && auth.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router
