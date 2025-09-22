import { reactive } from 'vue'
import { apiCall } from '@/config/api'

// Estado global con gestión segura de sesiones
const state = reactive({
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  lastActivity: null,
  sessionTimeout: null
})

// Configuración de seguridad
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutos de inactividad
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000 // 5 minutos antes de expirar

// Inicializar desde sessionStorage (más seguro que localStorage)
const initializeFromStorage = () => {
  const accessToken = sessionStorage.getItem('accessToken')
  const refreshToken = sessionStorage.getItem('refreshToken')
  const user = sessionStorage.getItem('user')
  const lastActivity = sessionStorage.getItem('lastActivity')
  
  if (accessToken && refreshToken && user) {
    state.accessToken = accessToken
    state.refreshToken = refreshToken
    state.user = JSON.parse(user)
    state.lastActivity = lastActivity ? new Date(lastActivity) : new Date()
    
    // Verificar si la sesión ha expirado por inactividad
    if (isSessionExpired()) {
      clearSession()
    } else {
      // Renovar token si es necesario
      checkAndRefreshToken()
      // Iniciar monitoreo de actividad
      startActivityMonitoring()
    }
  }
}

// Verificar si la sesión ha expirado por inactividad
const isSessionExpired = () => {
  if (!state.lastActivity) return true
  
  const now = new Date()
  const timeSinceActivity = now.getTime() - state.lastActivity.getTime()
  return timeSinceActivity > SESSION_TIMEOUT
}

// Actualizar última actividad
const updateActivity = () => {
  state.lastActivity = new Date()
  sessionStorage.setItem('lastActivity', state.lastActivity.toISOString())
}

// Monitorear actividad del usuario
const startActivityMonitoring = () => {
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
  
  const resetTimeout = () => {
    updateActivity()
    clearTimeout(state.sessionTimeout)
    
    state.sessionTimeout = setTimeout(() => {
      if (isSessionExpired()) {
        clearSession()
        // Redirigir al login si estamos en una página protegida
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }, SESSION_TIMEOUT)
  }
  
  // Agregar listeners de eventos
  events.forEach(event => {
    document.addEventListener(event, resetTimeout, true)
  })
  
  // Inicializar timeout
  resetTimeout()
}

// Limpiar listeners de eventos
const stopActivityMonitoring = () => {
  if (state.sessionTimeout) {
    clearTimeout(state.sessionTimeout)
    state.sessionTimeout = null
  }
}

// Inicializar desde storage
initializeFromStorage()

// API simple - ahora usando la configuración centralizada

// Verificar y renovar token si es necesario
const checkAndRefreshToken = async () => {
  if (!state.accessToken || !state.refreshToken) return false
  
  try {
    // Decodificar token para verificar expiración
    const tokenPayload = JSON.parse(atob(state.accessToken.split('.')[1]))
    const now = Date.now() / 1000
    const timeUntilExpiry = (tokenPayload.exp - now) * 1000
    
    // Si el token expira en menos de 5 minutos, renovarlo
    if (timeUntilExpiry < TOKEN_REFRESH_BUFFER) {
      return await refreshToken()
    }
    return true
  } catch (error) {
    console.error('Error verificando token:', error)
    return false
  }
}

// Renovar token de acceso
const refreshToken = async () => {
  if (!state.refreshToken) return false
  
  try {
    const response = await apiCall('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: state.refreshToken }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.success) {
      state.accessToken = response.accessToken
      sessionStorage.setItem('accessToken', response.accessToken)
      return true
    } else {
      clearSession()
      return false
    }
  } catch (error) {
    console.error('Error renovando token:', error)
    clearSession()
    return false
  }
}

// Limpiar sesión completamente
const clearSession = () => {
  state.user = null
  state.accessToken = null
  state.refreshToken = null
  state.error = null
  state.lastActivity = null
  
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
  sessionStorage.removeItem('user')
  sessionStorage.removeItem('lastActivity')
  
  stopActivityMonitoring()
}

// Acciones
export const auth = {
  // Estado
  state,

  // Getters
  get isAuthenticated() {
    return !!state.accessToken && !!state.refreshToken && !isSessionExpired()
  },

  get currentUser() {
    return state.user
  },

  // Login
  async login(username, password) {
    state.loading = true
    state.error = null

    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.success) {
        state.user = response.user
        state.accessToken = response.accessToken
        state.refreshToken = response.refreshToken
        state.lastActivity = new Date()
        
        // Guardar en sessionStorage (más seguro)
        sessionStorage.setItem('accessToken', response.accessToken)
        sessionStorage.setItem('refreshToken', response.refreshToken)
        sessionStorage.setItem('user', JSON.stringify(response.user))
        sessionStorage.setItem('lastActivity', state.lastActivity.toISOString())
        
        // Iniciar monitoreo de actividad
        startActivityMonitoring()
        
        return { success: true }
      } else {
        state.error = response.message
        return { success: false, error: response.message }
      }
    } catch (error) {
      state.error = error.message
      return { success: false, error: error.message }
    } finally {
      state.loading = false
    }
  },

  // Logout
  logout() {
    clearSession()
  },

  // Verificar sesión
  async checkSession() {
    if (!state.accessToken || !state.refreshToken) {
      return false
    }
    
    if (isSessionExpired()) {
      clearSession()
      return false
    }
    
    return await checkAndRefreshToken()
  },

  // Recuperar contraseña
  async forgotPassword(email) {
    state.loading = true
    state.error = null

    try {
      const response = await apiCall('/password/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.success) {
        return {
          success: true,
          message: response.message
        }
      } else {
        state.error = response.message
        return { success: false, error: response.message }
      }
    } catch (error) {
      state.error = error.message
      return { success: false, error: error.message }
    } finally {
      state.loading = false
    }
  },

  // Verificar token de recuperación
  async verifyResetToken(token) {
    try {
      const response = await apiCall(`/password/verify-reset-token/${token}`, {
        method: 'GET'
      })

      if (response.success) {
        return {
          success: true,
          data: response.data
        }
      } else {
        return { success: false, error: response.message }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Resetear contraseña
  async resetPassword(token, newPassword) {
    state.loading = true
    state.error = null

    try {
      const response = await apiCall('/password/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.success) {
        return {
          success: true,
          message: response.message
        }
      } else {
        state.error = response.message
        return { success: false, error: response.message }
      }
    } catch (error) {
      state.error = error.message
      return { success: false, error: error.message }
    } finally {
      state.loading = false
    }
  },

  // Cambiar contraseña (usuario autenticado)
  async changePassword(currentPassword, newPassword) {
    state.loading = true
    state.error = null

    try {
      const response = await apiCall('/password/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.success) {
        return {
          success: true,
          message: response.message
        }
      } else {
        state.error = response.message
        return { success: false, error: response.message }
      }
    } catch (error) {
      state.error = error.message
      return { success: false, error: error.message }
    } finally {
      state.loading = false
    }
  },

  // Limpiar errores
  clearError() {
    state.error = null
  }
}
