import { reactive } from 'vue'
import { apiCall } from '@/config/api'

// Estado global del catálogo
const state = reactive({
  productos: [],
  familias: [],
  marcas: [],
  proveedores: [],
  temporadas: [],
  ubicaciones: [],
  estadisticas: {},
  loading: false,
  loadingStartTime: null,
  error: null,
  
  // Filtros y búsqueda
  filtros: {
    busqueda: '',
    marca: null,
    temporada: null,
    proveedor: null,
    estado: null
  },
  
  // Paginación
  paginacion: {
    pagina: 1,
    limite: 30,
    total: 0,
    hasMore: true
  },
  
  // Modal de producto
  productoSeleccionado: null,
  modalAbierto: false
})

// API calls - ahora usando la configuración centralizada

export const catalogo = {
  // Estado
  state,

  // Getters
  get productos() {
    return state.productos
  },

  get familias() {
    return state.familias
  },

  get marcas() {
    return state.marcas
  },

  get proveedores() {
    return state.proveedores
  },

  get temporadas() {
    return state.temporadas
  },

  get ubicaciones() {
    return state.ubicaciones
  },

  get estadisticas() {
    return state.estadisticas
  },

  get filtrosActivos() {
    const { busqueda, marca, temporada, proveedor, estado } = state.filtros
    return {
      ...(busqueda && { busqueda }),
      ...(marca && { marca }),
      ...(temporada && { temporada }),
      ...(proveedor && { proveedor }),
      ...(estado && { estado })
    }
  },

  get totalFiltrosActivos() {
    return Object.keys(this.filtrosActivos).length
  },

  get filtros() {
    return state.filtros
  },

  get loadingStartTime() {
    return state.loadingStartTime
  },

  get totalPaginas() {
    const total = Math.ceil(state.paginacion.total / state.paginacion.limite)
    return total
  },

  get paginaActual() {
    return state.paginacion.pagina
  },

  get totalProductos() {
    return state.paginacion.total
  },

  get pagination() {
    return {
      pagina: state.paginacion.pagina,
      limite: state.paginacion.limite,
      total: state.paginacion.total,
      totalPaginas: Math.ceil(state.paginacion.total / state.paginacion.limite),
      hasMore: state.paginacion.hasMore
    }
  },

  // Cargar datos iniciales
  async init() {
    try {
      state.loading = true
      
      // Cargar datos en paralelo
      const [familiasData, marcasData, proveedoresData, ubicacionesData, estadisticasData, temporadasData] = await Promise.all([
        apiCall('/catalogo/familias'),
        apiCall('/catalogo/marcas'),
        apiCall('/catalogo/proveedores'),
        apiCall('/catalogo/ubicaciones'),
        apiCall('/catalogo/estadisticas'),
        apiCall('/catalogo/temporadas')
      ])
      
      state.familias = familiasData.data || []
      state.marcas = marcasData.data || []
      state.proveedores = proveedoresData.data || []
      state.ubicaciones = ubicacionesData.data || []
      state.estadisticas = estadisticasData.data || {}
      state.temporadas = temporadasData.data || []
      
      // Cargar productos iniciales
      await this.cargarProductos(true)
      
    } catch (error) {
      state.error = error.message
    } finally {
      state.loading = false
    }
  },

  // Cargar productos con filtros
  async cargarProductos(reset = false) {
    try {
      state.loading = true
      
      if (reset) {
        state.paginacion.pagina = 1
      }
      // NO incrementar página aquí para scroll infinito

      // Construir query params
      const params = new URLSearchParams({
        pagina: state.paginacion.pagina,
        limite: state.paginacion.limite,
        ...this.filtrosActivos
      })

      const response = await apiCall(`/catalogo/productos?${params}`)
      
      // Agregar productos al final (scroll infinito)
      if (reset) {
        state.productos = response.data || []
      } else {
        state.productos = [...state.productos, ...(response.data || [])]
      }
      
      // Actualizar paginación para scroll infinito
      state.paginacion.total = response.total || 0
      state.paginacion.hasMore = response.hasMore || false
      state.paginacion.pagina = response.pagination?.pagina || state.paginacion.pagina
      
    } catch (error) {
      state.error = error.message
    } finally {
      state.loading = false
    }
  },

  // Cargar más productos (scroll infinito)
  async cargarMasProductos() {
    console.log('🚀 cargarMasProductos llamado:', {
      hasMore: state.paginacion.hasMore,
      loading: state.loading,
      paginaActual: state.paginacion.pagina,
      productosCargados: state.productos.length
    })
    
    if (!state.paginacion.hasMore || state.loading) {
      console.log('❌ No se puede cargar más productos:', { hasMore: state.paginacion.hasMore, loading: state.loading })
      return
    }
    
    // Marcar tiempo de inicio para mostrar indicador si es necesario
    const startTime = Date.now()
    state.loadingStartTime = startTime
    
    try {
      state.loading = true
      
      // Incrementar página para la siguiente carga
      const siguientePagina = state.paginacion.pagina + 1
      console.log('📄 Cargando página:', siguientePagina)
      
      // Construir query params
      const params = new URLSearchParams({
        pagina: siguientePagina,
        limite: state.paginacion.limite,
        ...this.filtrosActivos
      })

      console.log('🔗 Llamando API:', `/catalogo/productos?${params}`)
      const response = await apiCall(`/catalogo/productos?${params}`)
      
      console.log('📦 Respuesta recibida:', {
        productosNuevos: response.data?.length || 0,
        total: response.total,
        hasMore: response.hasMore
      })
      
      if (response.data && response.data.length > 0) {
        // Agregar productos al final sin resetear
        state.productos.push(...response.data)
        
        // Actualizar paginación
        state.paginacion.pagina = siguientePagina
        state.paginacion.total = response.total || state.paginacion.total
        state.paginacion.hasMore = response.hasMore || false
        
        console.log('✅ Productos agregados. Total actual:', state.productos.length)
      } else {
        // No hay más productos
        state.paginacion.hasMore = false
        console.log('🏁 No hay más productos para cargar')
      }
      
    } catch (error) {
      state.error = error.message
    } finally {
      const endTime = Date.now()
      const loadingDuration = endTime - startTime
      
      // Si la carga tomó más de 1 segundo, mantener el indicador por un momento
      if (loadingDuration > 1000) {
        setTimeout(() => {
          state.loading = false
          state.loadingStartTime = null
        }, 500)
      } else {
        state.loading = false
        state.loadingStartTime = null
      }
    }
  },

  // Cambiar página (para paginación tradicional)
  async cambiarPagina(nuevaPagina) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas) return
    
    state.paginacion.pagina = nuevaPagina
    await this.cargarProductos(true)
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
      marca: null,
      temporada: null,
      proveedor: null,
      estado: null
    }
    await this.cargarProductos(true)
  },

  // Obtener producto por ID
  async obtenerProducto(id) {
    try {
      state.loading = true
      const response = await apiCall(`/catalogo/productos/${id}`)
      return response.data
    } catch (error) {
      state.error = error.message
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
  },

  // Helpers para obtener información relacionada
  getFamiliaById(id) {
    return state.familias.find(f => f.id === id) || null
  },

  getMarcaById(id) {
    return state.marcas.find(m => m.id === id) || null
  },

  getProveedorById(id) {
    return state.proveedores.find(p => p.id === id) || null
  },

  getUbicacionByCodigo(codigo) {
    return state.ubicaciones.find(u => u.codigo === codigo) || null
  },


}
