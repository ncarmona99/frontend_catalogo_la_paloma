<template>
  <div class="catalogo-view">
    <!-- Sidebar -->
    <div class="sidebar-overlay" :class="{ 'active': sidebarOpen }" @click="closeSidebar"></div>
    <aside class="sidebar" :class="{ 'open': sidebarOpen }" ref="sidebar">
      <!-- Logo y título -->
      <div class="sidebar-header">
        <div class="logo-section">
          <img src="@/assets/logo.png" alt="La Paloma" class="logo" />
          <h1 class="catalogo-titulo">Catálogo La Paloma</h1>
        </div>
      </div>
      
      <!-- Administración -->
      <div class="sidebar-admin">
        <a href="/login" target="_blank" rel="noopener noreferrer" class="admin-link">
          <i class="fas fa-cog"></i>
          Administración
        </a>
      </div>
      
      <!-- Filtros de búsqueda -->
      <div class="sidebar-filters">
        <SearchFilters 
          :show-results-info="false"
        />
      </div>
    </aside>

    <!-- Header simplificado -->
    <header class="catalogo-header">
      <div class="container">
        <div class="header-content">
          <!-- Hamburger button -->
          <button class="hamburger-btn" @click="toggleSidebar" :class="{ 'active': sidebarOpen }">
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <!-- Logo y título -->
          <div class="header-logo-section">
            <img src="@/assets/logo.png" alt="La Paloma" class="header-logo" />
            <h1 class="header-title">Catálogo La Paloma</h1>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="catalogo-main" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="container">

        <!-- Estado de carga inicial -->
        <div v-if="catalogo.state.loading && catalogo.productos.length === 0" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando productos...</p>
        </div>

        <!-- Lista de productos -->
        <div v-else-if="catalogo.productos.length > 0" class="productos-container">

          <div class="productos-grid">
            <ProductCard
              v-for="producto in catalogo.productos"
              :key="producto.id"
              :producto="producto"
              @click="abrirModal(producto)"
            />
          </div>



          <!-- Indicador de carga sutil (solo si la carga toma más de 1 segundo) -->
          <div v-if="catalogo.state.loading && catalogo.productos.length > 0 && catalogo.loadingStartTime" class="loading-more-indicator">
            <div class="loading-spinner-small"></div>
            <p>Cargando más productos...</p>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="estado-vacio">
          <i class="fas fa-search"></i>
          <h3>No se encontraron productos</h3>
          <p>Intenta ajustar los filtros de búsqueda</p>
          <button @click="limpiarFiltros" class="btn btn-primary">
            Limpiar filtros
          </button>
        </div>

        <!-- Error -->
        <div v-if="catalogo.state.error" class="alert alert-error">
          <i class="fas fa-exclamation-triangle"></i>
          {{ catalogo.state.error }}
        </div>
      </div>
    </main>

    <!-- Modal de producto -->
    <ProductModal
      v-if="productoSeleccionado"
      :producto="productoSeleccionado"
      @cerrar="cerrarModal"
    />

    <!-- Botón de scroll to top -->
    <button
      v-show="showScrollTop"
      @click="scrollToTop"
      class="scroll-top-btn"
      title="Volver arriba"
    >
      <i class="fas fa-arrow-up"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { catalogo } from '@/stores/catalogo'
import SearchFilters from '@/components/SearchFilters.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductModal from '@/components/ProductModal.vue'
import Pagination from '@/components/Pagination.vue'

// Estado del modal
const productoSeleccionado = ref(null)

// Estado del sidebar (inicia cerrado en todos los dispositivos)
const sidebarOpen = ref(false)
const sidebar = ref(null)

// Estado del scroll
const showScrollTop = ref(false)
const scrollTimeout = ref(null)

// Computed
const productos = computed(() => catalogo.productos)

// Métodos
const abrirModal = (producto) => {
  productoSeleccionado.value = producto
}

const cerrarModal = () => {
  productoSeleccionado.value = null
}

const limpiarFiltros = () => {
  catalogo.limpiarFiltros()
}

// Métodos del sidebar
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const openSidebar = () => {
  sidebarOpen.value = true
}

// Funcionalidad de deslizar para móviles
let touchStartX = 0
let touchStartY = 0
let isDragging = false

const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
  isDragging = false
}

const handleTouchMove = (e) => {
  if (!touchStartX) return
  
  const touchCurrentX = e.touches[0].clientX
  const touchCurrentY = e.touches[0].clientY
  const deltaX = touchCurrentX - touchStartX
  const deltaY = touchCurrentY - touchStartY
  
  // Solo procesar si el movimiento es principalmente horizontal
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
    isDragging = true
    
    // Deslizar hacia la derecha desde el borde izquierdo para abrir
    if (deltaX > 50 && touchStartX < 50 && !sidebarOpen.value) {
      openSidebar()
    }
    // Deslizar hacia la izquierda para cerrar
    else if (deltaX < -50 && sidebarOpen.value) {
      closeSidebar()
    }
  }
}

const handleTouchEnd = () => {
  touchStartX = 0
  touchStartY = 0
  isDragging = false
}

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300
  
  // Scroll infinito proactivo - cargar más productos ANTES de llegar al final
  const scrollPosition = window.scrollY + window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  // Calcular cuántos productos están visibles actualmente
  const productosVisibles = Math.ceil((scrollPosition / documentHeight) * catalogo.productos.length)
  const productosRestantes = catalogo.productos.length - productosVisibles
  
  // Cargar más productos cuando queden menos de 10 productos por ver
  // o cuando esté al 70% del scroll
  const shouldLoadMore = (
    (productosRestantes <= 10 && catalogo.state.paginacion.hasMore) ||
    (scrollPosition >= documentHeight * 0.7 && catalogo.state.paginacion.hasMore)
  ) && !catalogo.state.loading
  
  if (shouldLoadMore) {
    // Evitar múltiples llamadas con debounce
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value)
    }
    
    scrollTimeout.value = setTimeout(() => {
      console.log('🔄 Scroll infinito proactivo: Cargando más productos...')
      console.log('📊 Estado actual:', {
        productosCargados: catalogo.productos.length,
        paginaActual: catalogo.state.paginacion.pagina,
        hasMore: catalogo.state.paginacion.hasMore,
        total: catalogo.state.paginacion.total
      })
      catalogo.cargarMasProductos()
    }, 200)
  }
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 CatalogoView montada')
  
  // Agregar listeners
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchmove', handleTouchMove, { passive: true })
  document.addEventListener('touchend', handleTouchEnd, { passive: true })
  
  // Cerrar sidebar al hacer clic fuera en desktop
  document.addEventListener('click', (e) => {
    if (sidebarOpen.value && sidebar.value && !sidebar.value.contains(e.target) && !e.target.closest('.hamburger-btn')) {
      closeSidebar()
    }
  })
  
  try {
    // Inicializar catálogo
    console.log('📡 Inicializando catálogo...')
    await catalogo.init()
    console.log('✅ Catálogo inicializado')
  } catch (error) {
    console.error('❌ Error inicializando catálogo:', error)
  }
})

onUnmounted(() => {
  // Remover listeners
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
  
  // Limpiar timeout
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
  }
})
</script>

<style scoped>
.catalogo-view {
  min-height: 100vh;
  background: #f8fafc;
  position: relative;
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 320px;
  height: 100vh;
  background: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
  overflow-y: auto;
  padding: 1.5rem;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease-in-out;
}

.sidebar-overlay.active {
  opacity: 1;
  visibility: visible;
}

.sidebar-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-header .logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sidebar-header .logo {
  height: 40px;
  width: auto;
}

.sidebar-header .catalogo-titulo {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.sidebar-admin {
  margin-bottom: 2rem;
}

.sidebar-admin .admin-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: background-color 0.2s;
  width: 100%;
  justify-content: center;
}

.sidebar-admin .admin-link:hover {
  background: #2563eb;
}

.sidebar-filters {
  flex: 1;
}

/* Estilos específicos para filtros en sidebar */
.sidebar-filters :deep(.search-filters) {
  margin: 0;
}

.sidebar-filters :deep(.search-container) {
  margin-bottom: 1.5rem;
}

.sidebar-filters :deep(.filtros-container) {
  box-shadow: none;
  border: 1px solid #e5e7eb;
  margin-bottom: 0;
}

.sidebar-filters :deep(.filtros-header) {
  margin-bottom: 1rem;
}

.sidebar-filters :deep(.filtros-content) {
  grid-template-columns: 1fr;
  gap: 1rem;
}

.sidebar-filters :deep(.filtro-grupo) {
  margin-bottom: 0;
}

.sidebar-filters :deep(.search-input) {
  font-size: 0.875rem;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
}

.sidebar-filters :deep(.search-icon) {
  left: 0.75rem;
  font-size: 1rem;
}

/* Header simplificado */
.catalogo-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  position: relative;
}

.header-logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.header-logo {
  height: 40px;
  width: auto;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Hamburger button */
.hamburger-btn {
  background: none;
  border: none;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: all 0.3s ease;
  border-radius: 0.5rem;
}

.hamburger-btn:hover {
  background: #f3f4f6;
}

.hamburger-btn span {
  width: 25px;
  height: 3px;
  background: #374151;
  transition: all 0.3s ease;
  border-radius: 1px;
}

.hamburger-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.hamburger-btn.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Main content */
.catalogo-main {
  padding: 2rem 0;
  transition: margin-left 0.3s ease-in-out;
  width: 100%;
}

.catalogo-main.sidebar-open {
  margin-left: 0;
}

/* Estados */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.estado-vacio {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.estado-vacio i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.estado-vacio h3 {
  margin-bottom: 0.5rem;
  color: #374151;
}

.estado-vacio p {
  margin-bottom: 2rem;
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

/* Productos */
.productos-container {
  margin-top: 2rem;
}

.productos-header {
  margin-bottom: 2rem;
  text-align: center;
}

.productos-header h2 {
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.productos-info {
  color: #6b7280;
  font-size: 0.875rem;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.productos-info-footer {
  text-align: center;
  padding: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.loading-more {
  color: #3b82f6;
  font-style: italic;
}

.loading-more-indicator {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.loading-spinner-small {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 0.5rem;
}

/* Botón scroll to top */
.scroll-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.2s;
  z-index: 1000;
}

.scroll-top-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

/* Botones */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

/* Responsive - Desktop sidebar funcional */
@media (min-width: 1024px) {
  .sidebar {
    width: 350px;
    box-shadow: 2px 0 15px rgba(0, 0, 0, 0.15);
    padding: 2rem;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .catalogo-main.sidebar-open {
    margin-left: 350px;
  }
  
  .hamburger-btn {
    display: flex;
  }
  
  .sidebar-overlay.active {
    background: rgba(0, 0, 0, 0.3);
  }
  
  .sidebar-header {
    margin-bottom: 2.5rem;
  }
  
  .sidebar-header .catalogo-titulo {
    font-size: 1.375rem;
  }
  
  .sidebar-admin {
    margin-bottom: 2.5rem;
  }
  
  .sidebar-filters :deep(.filtros-header) {
    margin-bottom: 1.5rem;
  }
  
  .sidebar-filters :deep(.search-input) {
    font-size: 1rem;
    padding: 1rem 1rem 1rem 3rem;
  }
  
  .sidebar-filters :deep(.search-icon) {
    left: 1rem;
    font-size: 1.125rem;
  }
}

@media (max-width: 1023px) {
  .sidebar {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .header-title {
    font-size: 1.25rem;
  }
  
  .header-logo {
    height: 35px;
  }
  
  .header-logo-section {
    gap: 0.75rem;
  }
  
  .productos-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .scroll-top-btn {
    bottom: 1rem;
    right: 1rem;
    width: 45px;
    height: 45px;
  }
  
  .sidebar {
    width: 260px;
  }
  
  .sidebar-header .catalogo-titulo {
    font-size: 1.1rem;
  }
}
</style>
