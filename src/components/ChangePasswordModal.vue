<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-key"></i>
          Cambiar Contraseña
        </h3>
        <button @click="closeModal" class="close-button">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label" for="currentPassword">
              Contraseña Actual <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <i class="fas fa-lock input-icon"></i>
              <input
                id="currentPassword"
                v-model="form.currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: errors.currentPassword }"
                placeholder="Ingresa tu contraseña actual"
                @blur="validateCurrentPassword"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showCurrentPassword = !showCurrentPassword"
              >
                <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div v-if="errors.currentPassword" class="error-message">
              {{ errors.currentPassword }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="newPassword">
              Nueva Contraseña <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <i class="fas fa-lock input-icon"></i>
              <input
                id="newPassword"
                v-model="form.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: errors.newPassword }"
                placeholder="Mínimo 6 caracteres"
                @blur="validateNewPassword"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showNewPassword = !showNewPassword"
              >
                <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div v-if="errors.newPassword" class="error-message">
              {{ errors.newPassword }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="confirmPassword">
              Confirmar Nueva Contraseña <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <i class="fas fa-lock input-icon"></i>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
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
            <div v-if="errors.confirmPassword" class="error-message">
              {{ errors.confirmPassword }}
            </div>
          </div>

          <div v-if="auth.state.error" class="alert alert-error">
            <i class="fas fa-exclamation-circle"></i>
            {{ auth.state.error }}
          </div>

          <div v-if="successMessage" class="alert alert-success">
            <i class="fas fa-check-circle"></i>
            {{ successMessage }}
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn btn-secondary" :disabled="auth.state.loading">
          Cancelar
        </button>
        <button @click="handleSubmit" class="btn btn-primary" :disabled="auth.state.loading || !isFormValid">
          <div v-if="auth.state.loading" class="spinner"></div>
          <span v-if="!auth.state.loading">Cambiar Contraseña</span>
          <span v-else>Procesando...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { auth } from '@/stores/auth'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const successMessage = ref('')

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Validaciones
const validateCurrentPassword = () => {
  if (!form.value.currentPassword.trim()) {
    errors.value.currentPassword = 'La contraseña actual es requerida'
  } else {
    errors.value.currentPassword = ''
  }
}

const validateNewPassword = () => {
  if (!form.value.newPassword.trim()) {
    errors.value.newPassword = 'La nueva contraseña es requerida'
  } else if (form.value.newPassword.length < 6) {
    errors.value.newPassword = 'La contraseña debe tener al menos 6 caracteres'
  } else if (form.value.newPassword === form.value.currentPassword) {
    errors.value.newPassword = 'La nueva contraseña debe ser diferente a la actual'
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
  return form.value.currentPassword.trim() && 
         form.value.newPassword.trim() &&
         form.value.confirmPassword.trim() &&
         !errors.value.currentPassword && 
         !errors.value.newPassword && 
         !errors.value.confirmPassword &&
         form.value.newPassword === form.value.confirmPassword &&
         form.value.newPassword !== form.value.currentPassword
})

// Manejo del envío
const handleSubmit = async () => {
  auth.clearError()
  successMessage.value = ''
  
  validateCurrentPassword()
  validateNewPassword()
  validateConfirmPassword()
  
  if (!isFormValid.value) return

  const result = await auth.changePassword(form.value.currentPassword, form.value.newPassword)
  
  if (result.success) {
    successMessage.value = result.message
    
    // Limpiar formulario
    form.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    // Cerrar modal después de 2 segundos
    setTimeout(() => {
      closeModal()
    }, 2000)
  }
}

const closeModal = () => {
  // Limpiar formulario y errores
  form.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  errors.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  successMessage.value = ''
  auth.clearError()
  
  emit('close')
}

// Limpiar formulario cuando se cierra el modal
watch(() => props.isVisible, (newValue) => {
  if (!newValue) {
    closeModal()
  }
})
</script>

<style scoped>
.modal-overlay {
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

.modal-container {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
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

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
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

.form-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: #ef4444;
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

.error-message {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #ef4444;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
  transform: translateY(-1px);
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .modal-container {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
