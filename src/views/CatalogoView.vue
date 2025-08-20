<template>
  <div class="catalogo-view">
    <!-- Header -->
    <header class="catalogo-header">
      <div class="container">
        <div class="header-content">
          <div class="logo-section">
            <img src="/logo.png" alt="La Paloma" class="logo" />
            <h1 class="catalogo-titulo">Catálogo La Paloma</h1>
          </div>
          
          <!-- Enlace de administración -->
          <router-link to="/login" class="admin-link">
            <i class="fas fa-cog"></i>
            Administración
          </router-link>
        </div>
      </div>
    </header>

    <!-- Búsqueda y filtros -->
    <div class="filtros-section">
      <div class="container">
        <SearchFilters />
      </div>
    </div>

    <!-- Contenido principal -->
    <main class="catalogo-main">
      <div class="container">
        <!-- Loading inicial -->
        <div v-if="catalogo.state.loading && productos.length === 0" class="loading-inicial">
          <div class="productos-grid">
            <div v-for="n in 8" :key="n" class="producto-skeleton">
              <div class="skeleton skeleton-imagen"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text corto"></div>
            </div>
          </div>
        </div>

        <!-- Lista de productos -->
        <div v-else-if="productos.length > 0" class="productos-container">
          <transition-group name="fade" tag="div" class="productos-grid">
            <ProductCard
              v-for="producto in productos"
              :key="producto.id"
              :producto="producto"
            />
          </transition-group>

          <!-- Loading para scroll infinito -->
          <div v-if="catalogo.state.loading" class="scroll-loading">
            <div class="spinner"></div>
            <span>Cargando más productos...</span>
          </div>

          <!-- Indicador de fin -->
          <div v-else-if="!catalogo.state.paginacion.hasMore" class="fin-productos">
            <i class="fas fa-check-circle"></i>
            <span>Has visto todos los productos</span>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="estado-vacio">
          <i class="fas fa-search"></i>
          <h3>No se encontraron productos</h3>
          <p>Intenta ajustar los filtros o buscar con otros términos</p>
          <button v-if="catalogo.totalFiltrosActivos > 0" class="btn btn-primary" @click="limpiarFiltros">
            Limpiar filtros
          </button>
        </div>

        <!-- Error -->
        <div v-if="catalogo.state.error" class="alert alert-error">
          <i class="fas fa-exclamation-triangle"></i>
          {{ catalogo.state.error }}
          <button class="btn btn-ghost btn-sm" @click="catalogo.clearError">
            Cerrar
          </button>
        </div>
      </div>
    </main>

    <!-- Modal del producto -->
    <ProductModal />

    <!-- Botón scroll to top -->
    <transition name="fade">
      <button
        v-if="showScrollTop"
        class="scroll-top-btn"
        @click="scrollToTop"
        title="Volver arriba"
      >
        <i class="fas fa-arrow-up"></i>
      </button>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SearchFilters from '@/components/SearchFilters.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductModal from '@/components/ProductModal.vue'
import { catalogo } from '@/stores/catalogo'

const showScrollTop = ref(false)

// Productos computados
const productos = computed(() => catalogo.productos)

// Scroll infinito
const handleScroll = () => {
  const scrollTop = window.pageYOffset
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // Mostrar botón de scroll to top
  showScrollTop.value = scrollTop > 500

  // Cargar más productos cuando llegue al 80% del scroll
  const scrollPercentage = (scrollTop + windowHeight) / documentHeight
  if (scrollPercentage > 0.8 && catalogo.state.paginacion.hasMore && !catalogo.state.loading) {
    catalogo.cargarMasProductos()
  }
}

// Scroll to top
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Limpiar filtros
const limpiarFiltros = () => {
  catalogo.limpiarFiltros()
}

// Lifecycle
onMounted(async () => {
  // Inicializar catálogo
  await catalogo.init()
  
  // Agregar listener de scroll
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  // Scroll suave al inicio
  scrollToTop()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.catalogo-view {
  min-height: 100vh;
  background: #f8fafc;
}

/* Header */
.catalogo-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  width: 3rem;
  height: 3rem;
  object-fit: contain;
}

.catalogo-titulo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.admin-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.admin-link:hover {
  background: #f3f4f6;
  color: #374151;
}

/* Secciones */
.filtros-section {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
}

.catalogo-main {
  padding: 2rem 0;
}

/* Loading inicial */
.loading-inicial {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Estados */
.fin-productos {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #059669;
  font-weight: 500;
}

.fin-productos i {
  font-size: 1.25rem;
}

/* Botón scroll to top */
.scroll-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3rem;
  height: 3rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transition: all 0.3s ease;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroll-top-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
}

/* Responsive */
@media (max-width: 640px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .catalogo-titulo {
    font-size: 1.25rem;
  }

  .logo {
    width: 2.5rem;
    height: 2.5rem;
  }

  .catalogo-main {
    padding: 1rem 0;
  }

  .scroll-top-btn {
    bottom: 1rem;
    right: 1rem;
    width: 2.5rem;
    height: 2.5rem;
  }
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
