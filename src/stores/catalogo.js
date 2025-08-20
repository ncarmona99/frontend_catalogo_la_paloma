import { reactive } from 'vue'

// Estado global del catálogo
const state = reactive({
  productos: [],
  categorias: [],
  marcas: [],
  loading: false,
  error: null,
  
  // Filtros y búsqueda
  filtros: {
    busqueda: '',
    categoria: null,
    marca: null,
    precioMin: 0,
    precioMax: 100000,
    disponible: null,
    destacado: null
  },
  
  // Paginación
  paginacion: {
    pagina: 1,
    limite: 12,
    total: 0,
    hasMore: true
  },
  
  // Modal de producto
  productoSeleccionado: null,
  modalAbierto: false
})

// API calls
const API_URL = 'http://localhost:3000/api'

async function apiCall(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`
  console.log('🌐 API Call:', url)
  
  const config = {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  }

  try {
    const response = await fetch(url, config)
    console.log('📡 Response status:', response.status)
    
    const data = await response.json()
    console.log('📦 Response data:', data)
    
    if (!response.ok) {
      throw new Error(data.message || 'Error en el servidor')
    }
    
    return data
  } catch (error) {
    console.error('❌ API Error:', error)
    throw error
  }
}

export const catalogo = {
  // Estado
  state,

  // Getters
  get productos() {
    return state.productos
  },

  get categorias() {
    return state.categorias
  },

  get marcas() {
    return state.marcas
  },

  get filtrosActivos() {
    const { busqueda, categoria, marca, precioMin, precioMax, disponible, destacado } = state.filtros
    return {
      ...(busqueda && { busqueda }),
      ...(categoria && { categoria }),
      ...(marca && { marca }),
      ...(precioMin > 0 && { precioMin }),
      ...(precioMax < 100000 && { precioMax }),
      ...(disponible !== null && { disponible }),
      ...(destacado !== null && { destacado })
    }
  },

  get totalFiltrosActivos() {
    return Object.keys(this.filtrosActivos).length
  },

  // Cargar datos iniciales
  async init() {
    try {
      state.loading = true
      
      // Cargar categorías y marcas en paralelo
      const [categoriasData, marcasData] = await Promise.all([
        apiCall('/categorias'),
        apiCall('/marcas')
      ])
      
      state.categorias = categoriasData.data || []
      state.marcas = marcasData.data || []
      
      // Cargar productos iniciales
      await this.cargarProductos(true)
      
    } catch (error) {
      state.error = error.message
      console.error('Error inicializando catálogo:', error)
    } finally {
      state.loading = false
    }
  },

  // Cargar productos con filtros
  async cargarProductos(reset = false) {
    try {
      console.log('🔄 Cargando productos, reset:', reset)
      state.loading = true
      
      if (reset) {
        state.paginacion.pagina = 1
        state.productos = []
      }

      // Construir query params
      const params = new URLSearchParams({
        pagina: state.paginacion.pagina,
        limite: state.paginacion.limite,
        ...this.filtrosActivos
      })

      console.log('📋 Parámetros:', Object.fromEntries(params))

      const response = await apiCall(`/productos?${params}`)
      
      console.log('✅ Respuesta recibida:', response)
      
      if (reset) {
        state.productos = response.data || []
      } else {
        // Scroll infinito - agregar productos
        state.productos.push(...(response.data || []))
      }
      
      // Actualizar paginación
      state.paginacion.total = response.total || 0
      state.paginacion.hasMore = response.hasMore || false
      
      console.log(`📊 Total productos cargados: ${state.productos.length}`)
      
    } catch (error) {
      state.error = error.message
      console.error('❌ Error cargando productos:', error)
    } finally {
      state.loading = false
    }
  },

  // Cargar más productos (scroll infinito)
  async cargarMasProductos() {
    if (!state.paginacion.hasMore || state.loading) return
    
    state.paginacion.pagina++
    await this.cargarProductos(false)
  },

  // Búsqueda en tiempo real
  async buscar(termino) {
    state.filtros.busqueda = termino
    await this.cargarProductos(true)
  },

  // Aplicar filtro
  async aplicarFiltro(tipo, valor) {
    state.filtros[tipo] = valor
    await this.cargarProductos(true)
  },

  // Limpiar filtros
  async limpiarFiltros() {
    state.filtros = {
      busqueda: '',
      categoria: null,
      marca: null,
      precioMin: 0,
      precioMax: 100000,
      disponible: null,
      destacado: null
    }
    await this.cargarProductos(true)
  },

  // Obtener producto por ID
  async obtenerProducto(id) {
    try {
      state.loading = true
      const response = await apiCall(`/productos/${id}`)
      return response.data
    } catch (error) {
      state.error = error.message
      console.error('Error obteniendo producto:', error)
      return null
    } finally {
      state.loading = false
    }
  },

  // Modal del producto
  async abrirModal(productoId) {
    const producto = await this.obtenerProducto(productoId)
    if (producto) {
      state.productoSeleccionado = producto
      state.modalAbierto = true
      // Evitar scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden'
    }
  },

  cerrarModal() {
    state.productoSeleccionado = null
    state.modalAbierto = false
    document.body.style.overflow = ''
  },

  // Limpiar errores
  clearError() {
    state.error = null
  }
}
