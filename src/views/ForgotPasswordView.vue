<template>
  <div class="min-h-screen bg-gradient flex items-center justify-center login-container">
    <!-- Formas decorativas -->
    <div class="floating-shapes">
      <div class="shape shape1"></div>
      <div class="shape shape2"></div>
    </div>

    <div class="forgot-wrapper">
      <div class="card card-elevated forgot-card">
        <!-- Header -->
        <div class="card-header text-center">
          <div class="icon">
            <i class="fas fa-key"></i>
          </div>
          <h1 class="forgot-title">Recuperar Contraseña</h1>
          <p v-if="!emailSent" class="forgot-subtitle">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
          </p>
          <p v-else class="success-message">
            <i class="fas fa-check-circle"></i>
            Enlace enviado correctamente
          </p>
        </div>

        <!-- Formulario o mensaje de éxito -->
        <div class="card-body">
          <div v-if="!emailSent">
            <form @submit.prevent="handleSubmit">
              <div class="input-group">
                <label class="input-label" for="email">
                  Correo Electrónico <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <i class="fas fa-envelope input-icon"></i>
                  <input
                    id="email"
                    v-model="email"
                    type="email"
                    class="input input-with-icon"
                    :class="{ error: emailError }"
                    placeholder="ejemplo@correo.com"
                    @blur="validateEmail"
                  />
                </div>
                <div v-if="emailError" class="input-error">
                  {{ emailError }}
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-lg w-full"
                :disabled="auth.state.loading || !isEmailValid"
              >
                <div v-if="auth.state.loading" class="spinner"></div>
                <span v-if="!auth.state.loading">Enviar Enlace de Recuperación</span>
                <span v-else>Enviando...</span>
              </button>

              <div v-if="auth.state.error" class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i>
                {{ auth.state.error }}
              </div>
            </form>
          </div>

          <div v-else class="success-content text-center">
            <div class="success-icon">
              <i class="fas fa-envelope-open"></i>
            </div>
            <h3 class="success-title">¡Revisa tu correo!</h3>
            <p class="success-text">
              Hemos enviado un enlace de recuperación a <strong>{{ email }}</strong>
            </p>
            <p class="help-text">
              Si no recibes el correo en unos minutos, revisa tu carpeta de spam o 
              <button 
                @click="resendEmail" 
                class="link-button"
                :disabled="auth.state.loading || countdown > 0"
              >
                intenta enviarlo nuevamente
              </button>
            </p>

            <div v-if="countdown > 0" class="countdown">
              <p>Podrás solicitar un nuevo enlace en {{ countdown }} segundos</p>
            </div>
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
import { ref, computed, onUnmounted } from 'vue'
import { auth } from '@/stores/auth'

const email = ref('')
const emailError = ref('')
const emailSent = ref(false)
const countdown = ref(0)
let countdownInterval = null

// Validación de email
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email.value.trim()) {
    emailError.value = 'El correo electrónico es requerido'
  } else if (!emailRegex.test(email.value)) {
    emailError.value = 'Ingresa un correo electrónico válido'
  } else {
    emailError.value = ''
  }
}

const isEmailValid = computed(() => {
  return email.value.trim() && !emailError.value
})

// Manejo del envío
const handleSubmit = async () => {
  auth.clearError()
  validateEmail()
  
  if (!isEmailValid.value) return

  const result = await auth.forgotPassword(email.value)
  
  if (result.success) {
    emailSent.value = true
    startCountdown()
  }
}

// Reenviar email
const resendEmail = async () => {
  if (countdown.value > 0) return
  
  const result = await auth.forgotPassword(email.value)
  
  if (result.success) {
    startCountdown()
  }
}

// Countdown para reenvío
const startCountdown = () => {
  countdown.value = 60
  
  countdownInterval = setInterval(() => {
    countdown.value--
    
    if (countdown.value <= 0) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
  }, 1000)
}

// Limpiar interval
onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
.forgot-wrapper {
  width: 100%;
  max-width: 450px;
  z-index: 10;
  position: relative;
}

.forgot-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-radius: 50%;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: white;
}

.forgot-title {
  margin: 0 0 1rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}

.forgot-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.975rem;
  line-height: 1.5;
}

.success-message {
  color: #059669 !important;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.success-content {
  padding: 2rem 0;
}

.success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  color: white;
}

.success-title {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.success-text {
  margin: 0 0 1rem 0;
  color: #6b7280;
  line-height: 1.6;
}

.help-text {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
}

.link-button {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
  padding: 0;
  font-family: inherit;
}

.link-button:hover:not(:disabled) {
  color: #2563eb;
}

.link-button:disabled {
  color: #9ca3af;
  cursor: not-allowed;
  text-decoration: none;
}

.countdown {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
}

.countdown p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
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
  .forgot-title {
    font-size: 1.5rem;
  }
  
  .success-content {
    padding: 1rem 0;
  }
}
</style>
