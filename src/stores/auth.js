import { reactive } from 'vue'

// Estado global simple
const state = reactive({
  user: null,
  token: null,
  loading: false,
  error: null
})

// Inicializar desde localStorage
const token = localStorage.getItem('token')
const user = localStorage.getItem('user')
if (token && user) {
  state.token = token
  state.user = JSON.parse(user)
}

// API simple
const API_URL = 'http://localhost:3000/api'

async function apiCall(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(state.token && { Authorization: `Bearer ${state.token}` })
    },
    ...options
  }

  const response = await fetch(url, config)
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'Error en el servidor')
  }
  
  return data
}

// Acciones
export const auth = {
  // Estado
  state,

  // Getters
  get isAuthenticated() {
    return !!state.token
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
        body: JSON.stringify({ username, password })
      })

      if (response.success) {
        state.user = response.user
        state.token = response.token
        
        // Guardar en localStorage
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
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
    state.user = null
    state.token = null
    state.error = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Recuperar contraseña (simulado)
  async forgotPassword(email) {
    state.loading = true
    state.error = null

    try {
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      return {
        success: true,
        message: 'Se ha enviado un enlace de recuperación a tu correo electrónico.'
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
