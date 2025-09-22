<template>
  <div class="min-h-screen bg-gradient flex items-center justify-center login-container">
    <!-- Formas decorativas de fondo -->
    <div class="floating-shapes">
      <div class="shape shape1"></div>
      <div class="shape shape2"></div>
      <div class="shape shape3"></div>
    </div>

    <div class="login-wrapper">
      <div class="card card-elevated login-card">
        <!-- Header -->
        <div class="card-header text-center">
            <img src="../assets/logo.png" alt="La Paloma" class="logo-image">
          <p class="login-subtitle">Inicia sesión en tu cuenta</p>
        </div>

        <!-- Formulario -->
        <div class="card-body">
          <form @submit.prevent="handleLogin">
            <div class="input-group">
              <label class="input-label" for="username">
                Usuario <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <i class="fas fa-user input-icon"></i>
                <input
                  id="username"
                  v-model="form.username"
                  type="text"
                  class="input input-with-icon"
                  :class="{ error: errors.username }"
                  placeholder="Ingresa tu usuario"
                  @blur="validateUsername"
                />
              </div>
              <div v-if="errors.username" class="input-error">
                {{ errors.username }}
              </div>
            </div>

            <div class="input-group">
              <label class="input-label" for="password">
                Contraseña <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <i class="fas fa-lock input-icon"></i>
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="input input-with-icon"
                  :class="{ error: errors.password }"
                  placeholder="Ingresa tu contraseña"
                  @blur="validatePassword"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div v-if="errors.password" class="input-error">
                {{ errors.password }}
              </div>
            </div>

            <div class="form-options">
              <label class="remember-me">
                <input v-model="form.rememberMe" type="checkbox" />
                <span>Recordarme</span>
              </label>
              <router-link to="/forgot-password" class="link">
                ¿Olvidaste tu contraseña?
              </router-link>
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-lg w-full"
              :disabled="auth.state.loading || !isFormValid"
            >
              <div v-if="auth.state.loading" class="spinner"></div>
              <span v-if="!auth.state.loading">Iniciar Sesión</span>
              <span v-else>Ingresando...</span>
            </button>

            <div v-if="auth.state.error" class="alert alert-error">
              <i class="fas fa-exclamation-circle"></i>
              {{ auth.state.error }}
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="card-footer text-center">
          <p>Acceso restringido para personal autorizado</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/stores/auth'

const router = useRouter()

// Datos del formulario
const form = ref({
  username: '',
  password: '',
  rememberMe: false
})

const errors = ref({
  username: '',
  password: ''
})

const showPassword = ref(false)

// Validaciones
const validateUsername = () => {
  if (!form.value.username.trim()) {
    errors.value.username = 'El usuario es requerido'
  } else if (form.value.username.length < 3) {
    errors.value.username = 'El usuario debe tener al menos 3 caracteres'
  } else {
    errors.value.username = ''
  }
}

const validatePassword = () => {
  if (!form.value.password) {
    errors.value.password = 'La contraseña es requerida'
  } else if (form.value.password.length < 4) {
    errors.value.password = 'La contraseña debe tener al menos 4 caracteres'
  } else {
    errors.value.password = ''
  }
}

const isFormValid = computed(() => {
  return form.value.username.trim() && 
         form.value.password && 
         !errors.value.username && 
         !errors.value.password
})

// Manejo del login
const handleLogin = async () => {
  auth.clearError()
  
  validateUsername()
  validatePassword()
  
  if (!isFormValid.value) return

  const result = await auth.login(form.value.username, form.value.password)
  
  if (result.success) {
    router.push('/dashboard')
  }
}

// Redirigir si ya está autenticado
onMounted(() => {
  if (auth.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.login-container {
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

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
  animation: float 6s ease-in-out infinite;
}

.shape1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.shape3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 60%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.login-wrapper {
  width: 100%;
  max-width: 400px;
  z-index: 10;
  position: relative;
}

.login-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: white;
}

.logo-image {
  width: 50%;
  height: 50%;
}

.login-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  z-index: 1;
}

.input-with-icon {
  padding-left: 2.75rem;
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

.required {
  color: #ef4444;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
}

.remember-me input[type="checkbox"] {
  margin: 0;
}

@media (max-width: 640px) {
  .login-title {
    font-size: 1.5rem;
  }
  
  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
