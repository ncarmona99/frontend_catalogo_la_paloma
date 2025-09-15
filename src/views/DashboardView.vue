<template>
  <div class="dashboard">
    <AdminNavbar />

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



        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/stores/auth'
import AdminNavbar from '@/components/AdminNavbar.vue'

const router = useRouter()

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

/* Responsive */
@media (max-width: 768px) {
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
}
</style>
