<template>
  <nav class="admin-navbar">
    <div class="container">
      <!-- Logo y título -->
      <div class="nav-brand">
        <router-link to="/dashboard" class="brand-link">
          <i class="fas fa-dove"></i>
          <span>La Paloma - Admin</span>
        </router-link>
      </div>

      <!-- Navegación principal -->
      <div class="nav-menu">
        <router-link 
          to="/dashboard" 
          class="nav-link"
          :class="{ active: $route.path === '/dashboard' }"
        >
          <i class="fas fa-tachometer-alt"></i>
          <span>Dashboard</span>
        </router-link>
        
        <router-link 
          to="/admin/productos" 
          class="nav-link"
          :class="{ active: $route.path.startsWith('/admin/productos') }"
        >
          <i class="fas fa-box"></i>
          <span>Productos</span>
        </router-link>
        
        <router-link 
          to="/admin/categorias" 
          class="nav-link"
          :class="{ active: $route.path === '/admin/categorias' }"
        >
          <i class="fas fa-tags"></i>
          <span>Categorías</span>
        </router-link>
        
        <router-link 
          to="/admin/marcas" 
          class="nav-link"
          :class="{ active: $route.path.startsWith('/admin/marcas') }"
        >
          <i class="fas fa-tag"></i>
          <span>Marcas</span>
        </router-link>
        
        <router-link 
          to="/admin/temporadas" 
          class="nav-link"
          :class="{ active: $route.path.startsWith('/admin/temporadas') }"
        >
          <i class="fas fa-calendar-alt"></i>
          <span>Temporadas</span>
        </router-link>
        
        
        <router-link 
          v-if="auth.currentUser?.rol?.toLowerCase() === 'administrador'"
          to="/admin/usuarios" 
          class="nav-link"
          :class="{ active: $route.path === '/admin/usuarios' }"
        >
          <i class="fas fa-users"></i>
          <span>Usuarios</span>
        </router-link>
      </div>

      <!-- Usuario y acciones -->
      <div class="nav-user">
        <div class="user-info">
          <div class="user-details">
            <div class="user-name">{{ auth.currentUser?.username }}</div>
            <div class="user-role">{{ auth.currentUser?.rol }}</div>
          </div>
        </div>
        
        <div class="user-actions">
          <button class="btn btn-ghost btn-sm" @click="handleLogout">
            <i class="fas fa-sign-out-alt"></i>
            Salir
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { auth } from '@/stores/auth'

const router = useRouter()

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-navbar {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #3b82f6;
  font-weight: 700;
  font-size: 1.125rem;
}

.brand-link i {
  font-size: 1.5rem;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #6b7280;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-link.active {
  background: #3b82f6;
  color: white;
}

.nav-link i {
  font-size: 1rem;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}


.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.user-role {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: capitalize;
}

.user-actions {
  display: flex;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
}

.btn-ghost:hover {
  background: #f3f4f6;
  color: #374151;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .nav-menu {
    display: none;
  }
  
  .user-details {
    display: none;
  }
  
  .brand-link span {
    display: none;
  }
}
</style>
