// Configuración centralizada de la API
export const API_CONFIG = {
  // URL base de la API - se toma de las variables de entorno
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // Configuración de headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Timeout para requests
  TIMEOUT: 10000,
  
  // Configuración de retry
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
}

// Función helper para hacer requests a la API con renovación automática de tokens
export async function apiCall(endpoint, options = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`
  console.log('🌐 API Call:', url)
  
  // Obtener token del sessionStorage
  const accessToken = sessionStorage.getItem('accessToken')
  
  const config = {
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options.headers
    },
    ...options
  }
  
  // Si el body es FormData, no establecer Content-Type
  // El navegador lo establecerá automáticamente con el boundary correcto
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type']
  }
  
  // Agregar token de autorización si existe
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  try {
    const response = await fetch(url, config)
    console.log('📡 Response status:', response.status)
    
    const data = await response.json()
    console.log('📦 Response data:', data)
    
    // Si el token ha expirado, intentar renovarlo
    if (response.status === 401 && data.code === 'TokenExpiredError') {
      console.log('🔄 Token expirado, intentando renovar...')
      
      // Importar auth store dinámicamente para evitar dependencias circulares
      const { auth } = await import('@/stores/auth')
      const refreshed = await auth.checkSession()
      
      if (refreshed) {
        console.log('✅ Token renovado, reintentando request...')
        // Reintentar el request con el nuevo token
        const newToken = sessionStorage.getItem('accessToken')
        config.headers.Authorization = `Bearer ${newToken}`
        
        const retryResponse = await fetch(url, config)
        const retryData = await retryResponse.json()
        
        if (!retryResponse.ok) {
          throw new Error(retryData.message || 'Error en el servidor')
        }
        
        return retryData
      } else {
        // Si no se pudo renovar, limpiar sesión
        console.log('❌ No se pudo renovar token, limpiando sesión')
        auth.logout()
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.')
      }
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Error en el servidor')
    }
    
    return data
  } catch (error) {
    console.error('❌ API Error:', error)
    throw error
  }
}

// Función para obtener la URL completa de un endpoint
export function getApiUrl(endpoint) {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Función para verificar si estamos en desarrollo
export function isDevelopment() {
  return import.meta.env.VITE_APP_ENV === 'development'
}

// Función para verificar si estamos en producción
export function isProduction() {
  return import.meta.env.VITE_APP_ENV === 'production'
}

// Log de configuración al cargar
console.log('🔧 API Config:', {
  BASE_URL: API_CONFIG.BASE_URL,
  ENV: import.meta.env.VITE_APP_ENV,
  TITLE: import.meta.env.VITE_APP_TITLE
})
