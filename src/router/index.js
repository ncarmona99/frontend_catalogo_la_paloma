import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/stores/auth'
import CatalogoView from '@/views/CatalogoView.vue'
import LoginView from '@/views/LoginView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AdminCategoriasView from '@/views/admin/AdminCategoriasView.vue'
import AdminProductosView from '@/views/admin/AdminProductosView.vue'
import AdminProductoFormView from '@/views/admin/AdminProductoFormView.vue'
import AdminImagenesView from '@/views/admin/AdminImagenesView.vue'
import AdminUsuariosView from '@/views/admin/AdminUsuariosView.vue'
import AdminMarcasView from '@/views/admin/AdminMarcasView.vue'
import AdminMarcaFormView from '@/views/admin/AdminMarcaFormView.vue'
import AdminTemporadasView from '@/views/admin/AdminTemporadasView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Catalogo',
      component: CatalogoView
    },
    {
      path: '/admin/temporadas',
      name: 'AdminTemporadas',
      component: AdminTemporadasView,
      meta: { requiresAuth: true, requiresAdmin: true }
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
    },
    // Rutas administrativas
    {
      path: '/admin/categorias',
      name: 'AdminCategorias',
      component: AdminCategoriasView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/productos',
      name: 'AdminProductos',
      component: AdminProductosView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/productos/nuevo',
      name: 'AdminProductoNuevo',
      component: AdminProductoFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/productos/editar/:id',
      name: 'AdminProductoEditar',
      component: AdminProductoFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/imagenes',
      name: 'AdminImagenes',
      component: AdminImagenesView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/usuarios',
      name: 'AdminUsuarios',
      component: AdminUsuariosView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/marcas',
      name: 'AdminMarcas',
      component: AdminMarcasView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/marcas/nueva',
      name: 'AdminMarcaNueva',
      component: AdminMarcaFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/marcas/editar/:id',
      name: 'AdminMarcaEditar',
      component: AdminMarcaFormView,
      meta: { requiresAuth: true }
    }
  ]
})

// Guard de navegación mejorado
router.beforeEach((to, from, next) => {
  // Rutas que requieren autenticación
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login')
    return
  }
  
  // Rutas que requieren rol de administrador
  if (to.meta.requiresAdmin && auth.currentUser?.rol?.toLowerCase() !== 'administrador') {
    next('/dashboard')
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
