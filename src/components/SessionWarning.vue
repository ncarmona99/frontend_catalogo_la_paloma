<template>
  <div v-if="showWarning" class="session-warning-overlay">
    <div class="session-warning-modal">
      <div class="warning-header">
        <i class="fas fa-clock warning-icon"></i>
        <h3>Sesión a punto de expirar</h3>
      </div>
      
      <div class="warning-body">
        <p>Tu sesión expirará en <strong>{{ timeLeft }}</strong> debido a inactividad.</p>
        <p>¿Deseas continuar trabajando?</p>
      </div>
      
      <div class="warning-actions">
        <button @click="extendSession" class="btn btn-primary">
          <i class="fas fa-play"></i>
          Continuar sesión
        </button>
        <button @click="logout" class="btn btn-secondary">
          <i class="fas fa-sign-out-alt"></i>
          Cerrar sesión
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { auth } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

const showWarning = ref(false)
const timeLeft = ref('')
const countdownInterval = ref(null)
const warningTimeout = ref(null)

// Tiempo de advertencia (5 minutos antes de expirar)
const WARNING_TIME = 5 * 60 * 1000 // 5 minutos

// Función para iniciar el monitoreo de sesión
const startSessionMonitoring = () => {
  // Limpiar timeouts existentes
  if (warningTimeout.value) {
    clearTimeout(warningTimeout.value)
  }
  
  // Calcular tiempo hasta la advertencia
  const sessionTimeout = 30 * 60 * 1000 // 30 minutos
  const warningTime = sessionTimeout - WARNING_TIME // 25 minutos
  
  warningTimeout.value = setTimeout(() => {
    showWarning.value = true
    startCountdown()
  }, warningTime)
}

// Función para iniciar la cuenta regresiva
const startCountdown = () => {
  let timeRemaining = WARNING_TIME / 1000 // Convertir a segundos
  
  countdownInterval.value = setInterval(() => {
    timeRemaining--
    
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    
    timeLeft.value = `${minutes}:${seconds.toString().padStart(2, '0')}`
    
    if (timeRemaining <= 0) {
      clearInterval(countdownInterval.value)
      logout()
    }
  }, 1000)
}

// Función para extender la sesión
const extendSession = () => {
  showWarning.value = false
  clearInterval(countdownInterval.value)
  clearTimeout(warningTimeout.value)
  
  // Actualizar actividad y reiniciar monitoreo
  auth.checkSession()
  startSessionMonitoring()
}

// Función para cerrar sesión
const logout = () => {
  showWarning.value = false
  clearInterval(countdownInterval.value)
  clearTimeout(warningTimeout.value)
  
  auth.logout()
  router.push('/login')
}

// Formato de tiempo para mostrar
const formatTime = (milliseconds) => {
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.floor((milliseconds % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

onMounted(() => {
  // Solo iniciar monitoreo si el usuario está autenticado
  if (auth.isAuthenticated) {
    startSessionMonitoring()
  }
})

onUnmounted(() => {
  if (warningTimeout.value) {
    clearTimeout(warningTimeout.value)
  }
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }
})
</script>

<style scoped>
.session-warning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.session-warning-modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.warning-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.warning-icon {
  font-size: 3rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.warning-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.warning-body {
  text-align: center;
  margin-bottom: 2rem;
  color: #6b7280;
  line-height: 1.6;
}

.warning-body p {
  margin: 0.5rem 0;
}

.warning-body strong {
  color: #ef4444;
  font-size: 1.1rem;
}

.warning-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .warning-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
