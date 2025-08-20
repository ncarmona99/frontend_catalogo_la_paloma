<template>
  <div class="dashboard">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="container flex justify-between items-center">
        <div class="nav-brand flex items-center gap-3">
          <i class="fas fa-dove nav-icon"></i>
          <span class="nav-title">La Paloma</span>
        </div>
        
        <div class="nav-user flex items-center gap-4">
          <div class="user-info text-right">
            <div class="user-name">{{ auth.currentUser?.username }}</div>
            <div class="user-role">{{ auth.currentUser?.rol }}</div>
          </div>
          <button
            class="btn btn-ghost btn-sm"
            @click="handleLogout"
          >
            <i class="fas fa-sign-out-alt"></i>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Welcome Section -->
        <div class="welcome-section text-center">
          <h1 class="welcome-title">¡Bienvenido, {{ auth.currentUser?.username }}! 👋</h1>
          <p class="welcome-subtitle">Has iniciado sesión exitosamente en el sistema La Paloma</p>
        </div>

        <!-- Dashboard Grid -->
        <div class="dashboard-grid">
          <!-- Información del Usuario -->
          <div class="card card-elevated">
            <div class="card-header">
              <h3 class="card-title">Información del Usuario</h3>
            </div>
            <div class="card-body">
              <div class="user-details">
                <div class="detail-item">
                  <span class="detail-label">ID:</span>
                  <span class="detail-value">{{ auth.currentUser?.id }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Usuario:</span>
                  <span class="detail-value">{{ auth.currentUser?.username }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">{{ auth.currentUser?.email }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Rol:</span>
                  <span class="detail-value">
                    <span class="badge" :class="getRoleClass(auth.currentUser?.rol)">
                      {{ auth.currentUser?.rol }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones Rápidas -->
          <div class="card card-elevated">
            <div class="card-header">
              <h3 class="card-title">Acciones Rápidas</h3>
            </div>
            <div class="card-body">
              <div class="action-buttons flex flex-col gap-3">
                <button class="btn btn-primary action-btn">
                  <i class="fas fa-users"></i>
                  Ver Usuarios
                </button>
                <button class="btn btn-secondary action-btn">
                  <i class="fas fa-cog"></i>
                  Configuración
                </button>
                <button class="btn btn-ghost action-btn">
                  <i class="fas fa-chart-bar"></i>
                  Reportes
                </button>
              </div>
            </div>
          </div>

          <!-- Estado del Sistema -->
          <div class="card card-elevated">
            <div class="card-header">
              <h3 class="card-title">Estado del Sistema</h3>
            </div>
            <div class="card-body">
              <div class="status-items flex flex-col gap-4">
                <div class="status-item flex items-center gap-4">
                  <div class="status-icon success">
                    <i class="fas fa-check-circle"></i>
                  </div>
                  <div class="status-info">
                    <div class="status-label">API</div>
                    <div class="status-value">Conectado</div>
                  </div>
                </div>
                
                <div class="status-item flex items-center gap-4">
                  <div class="status-icon success">
                    <i class="fas fa-database"></i>
                  </div>
                  <div class="status-info">
                    <div class="status-label">Base de Datos</div>
                    <div class="status-value">Operativa</div>
                  </div>
                </div>
                
                <div class="status-item flex items-center gap-4">
                  <div class="status-icon success">
                    <i class="fas fa-shield-alt"></i>
                  </div>
                  <div class="status-info">
                    <div class="status-label">Seguridad</div>
                    <div class="status-value">Activa</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/stores/auth'

const router = useRouter()

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

const getRoleClass = (role) => {
  switch (role?.toLowerCase()) {
    case 'administrador':
      return 'badge-admin'
    case 'usuario':
      return 'badge-user'
    default:
      return 'badge-default'
  }
}

// Verificar autenticación
onMounted(() => {
  if (!auth.isAuthenticated) {
    router.push('/login')
  }
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f8fafc;
}

.navbar {
  background: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  color: #3b82f6;
  font-size: 1.5rem;
}

.nav-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.user-name {
  font-weight: 600;
  color: #111827;
}

.user-role {
  font-size: 0.875rem;
  color: #6b7280;
}

.main-content {
  padding: 2rem 0;
}

.welcome-section {
  margin-bottom: 3rem;
}

.welcome-title {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
}

.welcome-subtitle {
  margin: 0;
  font-size: 1.125rem;
  color: #6b7280;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #6b7280;
}

.detail-value {
  font-weight: 600;
  color: #111827;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge-admin {
  background: #fef3c7;
  color: #d97706;
}

.badge-user {
  background: #dbeafe;
  color: #2563eb;
}

.badge-default {
  background: #f3f4f6;
  color: #6b7280;
}

.action-btn {
  justify-content: flex-start;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  font-size: 1.125rem;
}

.status-icon.success {
  background: #d1fae5;
  color: #059669;
}

.status-label {
  font-weight: 500;
  color: #111827;
}

.status-value {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar .container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-user {
    width: 100%;
    justify-content: space-between;
  }

  .main-content {
    padding: 1rem 0;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .user-info {
    text-align: left;
  }
}
</style>
