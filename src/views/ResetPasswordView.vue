<template>
  <div class="min-h-screen bg-gradient flex items-center justify-center login-container">
    <!-- Formas decorativas -->
    <div class="floating-shapes">
      <div class="shape shape1"></div>
      <div class="shape shape2"></div>
    </div>

    <div class="reset-wrapper">
      <div class="card card-elevated reset-card">
        <!-- Header -->
        <div class="card-header text-center">
          <div class="icon">
            <i class="fas fa-key"></i>
          </div>
          <h1 class="reset-title">Nueva Contraseña</h1>
          <p v-if="userInfo" class="reset-subtitle">
            Restablece la contraseña para <strong>{{ userInfo.username }}</strong>
          </p>
          <p v-else-if="loading" class="reset-subtitle">
            Verificando enlace...
          </p>
          <p v-else class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            Enlace inválido o expirado
          </p>
        </div>

        <!-- Formulario -->
        <div class="card-body">
          <div v-if="userInfo && !success">
            <form @submit.prevent="handleSubmit">
              <div class="input-group">
                <label class="input-label" for="newPassword">
                  Nueva Contraseña <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <i class="fas fa-lock input-icon"></i>
                  <input
                    id="newPassword"
                    v-model="form.newPassword"
                    :type="showPassword ? 'text' : 'password'"
                    class="input input-with-icon"
                    :class="{ error: errors.newPassword }"
                    placeholder="Mínimo 6 caracteres"
                    @blur="validateNewPassword"
                  />
                  <button
                    type="button"
                    class="password-toggle"
                    @click="showPassword = !showPassword"
                  >
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <div v-if="errors.newPassword" class="input-error">
                  {{ errors.newPassword }}
                </div>
              </div>

              <div class="input-group">
                <label class="input-label" for="confirmPassword">
                  Confirmar Contraseña <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <i class="fas fa-lock input-icon"></i>
                  <input
                    id="confirmPassword"
                    v-model="form.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="input input-with-icon"
                    :class="{ error: errors.confirmPassword }"
                    placeholder="Repite la nueva contraseña"
                    @blur="validateConfirmPassword"
                  />
                  <button
                    type="button"
                    class="password-toggle"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <div v-if="errors.confirmPassword" class="input-error">
                  {{ errors.confirmPassword }}
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-lg w-full"
                :disabled="auth.state.loading || !isFormValid"
              >
                <div v-if="auth.state.loading" class="spinner"></div>
                <span v-if="!auth.state.loading">Restablecer Contraseña</span>
                <span v-else>Procesando...</span>
              </button>

              <div v-if="auth.state.error" class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i>
                {{ auth.state.error }}
              </div>
            </form>
          </div>

          <div v-else-if="success" class="success-content text-center">
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h3 class="success-title">¡Contraseña Actualizada!</h3>
            <p class="success-text">
              Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
            </p>
            <router-link to="/login" class="btn btn-primary">
              <i class="fas fa-sign-in-alt"></i>
              Ir al Login
            </router-link>
          </div>

          <div v-else-if="!loading && !userInfo" class="error-content text-center">
            <div class="error-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="error-title">Enlace Inválido</h3>
            <p class="error-text">
              Este enlace de recuperación es inválido o ha expirado. Solicita un nuevo enlace de recuperación.
            </p>
            <router-link to="/forgot-password" class="btn btn-secondary">
              <i class="fas fa-redo"></i>
              Solicitar Nuevo Enlace
            </router-link>
          </div>
        </div>

        <!-- Footer -->
        <div class="card-footer text-center">
          <router-link to="/login" class="back-link">
            <i class="fas fa-arrow-left"></i>
            Volver al login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from '@/stores/auth'

const route = useRoute()
const router = useRouter()

const userInfo = ref(null)
const loading = ref(true)
const success = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = ref({
  newPassword: '',
  confirmPassword: ''
})

const errors = ref({
  newPassword: '',
  confirmPassword: ''
})

// Validaciones
const validateNewPassword = () => {
  if (!form.value.newPassword.trim()) {
    errors.value.newPassword = 'La nueva contraseña es requerida'
  } else if (form.value.newPassword.length < 6) {
    errors.value.newPassword = 'La contraseña debe tener al menos 6 caracteres'
  } else {
    errors.value.newPassword = ''
  }
}

const validateConfirmPassword = () => {
  if (!form.value.confirmPassword.trim()) {
    errors.value.confirmPassword = 'Confirma tu nueva contraseña'
  } else if (form.value.confirmPassword !== form.value.newPassword) {
    errors.value.confirmPassword = 'Las contraseñas no coinciden'
  } else {
    errors.value.confirmPassword = ''
  }
}

const isFormValid = computed(() => {
  return form.value.newPassword.trim() && 
         form.value.confirmPassword.trim() &&
         !errors.value.newPassword && 
         !errors.value.confirmPassword &&
         form.value.newPassword === form.value.confirmPassword
})

// Verificar token al cargar
const verifyToken = async () => {
  const token = route.query.token
  
  if (!token) {
    loading.value = false
    return
  }

  try {
    const result = await auth.verifyResetToken(token)
    
    if (result.success) {
      userInfo.value = result.data
    }
  } catch (error) {
    console.error('Error verificando token:', error)
  } finally {
    loading.value = false
  }
}

// Manejo del envío
const handleSubmit = async () => {
  auth.clearError()
  validateNewPassword()
  validateConfirmPassword()
  
  if (!isFormValid.value) return

  const token = route.query.token
  
  if (!token) {
    auth.state.error = 'Token de recuperación no encontrado'
    return
  }

  const result = await auth.resetPassword(token, form.value.newPassword)
  
  if (result.success) {
    success.value = true
  }
}

onMounted(() => {
  verifyToken()
})
</script>

<style scoped>
.reset-wrapper {
  width: 100%;
  max-width: 450px;
  z-index: 10;
  position: relative;
}

.reset-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 50%;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: white;
}

.reset-title {
  margin: 0 0 1rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}

.reset-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.975rem;
  line-height: 1.5;
}

.error-message {
  color: #ef4444 !important;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.success-content, .error-content {
  padding: 2rem 0;
}

.success-icon, .error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  color: white;
}

.success-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.error-icon {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.success-title, .error-title {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.success-text, .error-text {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
  line-height: 1.6;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  font-size: 0.875rem;
}

.password-toggle:hover {
  color: #374151;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #3b82f6;
}

/* Reutilizar estilos de login para formas */
.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 8s ease-in-out infinite;
}

.shape1 {
  width: 250px;
  height: 250px;
  top: 15%;
  right: 15%;
  animation-delay: 0s;
}

.shape2 {
  width: 180px;
  height: 180px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .reset-title {
    font-size: 1.5rem;
  }
  
  .success-content, .error-content {
    padding: 1rem 0;
  }
}
</style>
