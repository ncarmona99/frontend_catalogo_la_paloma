<template>
  <div class="search-filters">
    <!-- Buscador -->
    <div class="search-container">
      <i class="fas fa-search search-icon"></i>
      <input
        v-model="busquedaLocal"
        type="text"
        class="search-input"
        placeholder="Buscar productos..."
        @input="onSearchInput"
      />
      <button
        v-if="busquedaLocal"
        class="search-clear"
        @click="limpiarBusqueda"
        title="Limpiar búsqueda"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Filtros -->
    <div class="filtros-container">
      <div class="filtros-header">
        <h3 class="filtros-titulo">
          Filtros 
          <span v-if="catalogo.totalFiltrosActivos > 0" class="filtros-count">
            ({{ catalogo.totalFiltrosActivos }})
          </span>
        </h3>
        <button
          class="filtros-toggle"
          @click="mostrarFiltros = !mostrarFiltros"
          :title="mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros'"
        >
          <i :class="mostrarFiltros ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        </button>
      </div>

      <transition name="slide-up">
        <div v-show="mostrarFiltros" class="filtros-content">
          <!-- Categoría -->
          <div class="filtro-grupo">
            <label class="filtro-label">Categoría</label>
            <select
              v-model="filtrosLocales.categoria"
              class="filtro-select"
              @change="aplicarFiltro('categoria', $event.target.value)"
            >
              <option value="">Todas las categorías</option>
              <option
                v-for="categoria in catalogo.categorias"
                :key="categoria.id"
                :value="categoria.id"
              >
                {{ categoria.nombre }}
              </option>
            </select>
          </div>

          <!-- Marca -->
          <div class="filtro-grupo">
            <label class="filtro-label">Marca</label>
            <select
              v-model="filtrosLocales.marca"
              class="filtro-select"
              @change="aplicarFiltro('marca', $event.target.value)"
            >
              <option value="">Todas las marcas</option>
              <option
                v-for="marca in catalogo.marcas"
                :key="marca.id"
                :value="marca.id"
              >
                {{ marca.nombre }}
              </option>
            </select>
          </div>

          <!-- Disponibilidad -->
          <div class="filtro-grupo">
            <label class="filtro-label">Disponibilidad</label>
            <select
              v-model="filtrosLocales.disponible"
              class="filtro-select"
              @change="aplicarFiltro('disponible', $event.target.value)"
            >
              <option value="">Todos</option>
              <option value="true">En stock</option>
              <option value="false">Agotado</option>
            </select>
          </div>

          <!-- Destacados -->
          <div class="filtro-grupo">
            <label class="filtro-label">Destacados</label>
            <select
              v-model="filtrosLocales.destacado"
              class="filtro-select"
              @change="aplicarFiltro('destacado', $event.target.value)"
            >
              <option value="">Todos</option>
              <option value="true">Solo destacados</option>
              <option value="false">No destacados</option>
            </select>
          </div>
        </div>
      </transition>
    </div>

    <!-- Información de resultados -->
    <div class="resultados-info">
      <span class="resultados-texto">
        {{ catalogo.state.paginacion.total }} productos encontrados
      </span>
      <button
        v-if="catalogo.totalFiltrosActivos > 0"
        class="limpiar-filtros"
        @click="limpiarTodosFiltros"
      >
        Limpiar filtros
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { catalogo } from '@/stores/catalogo'

const busquedaLocal = ref('')
const filtrosLocales = ref({
  categoria: '',
  marca: '',
  disponible: '',
  destacado: ''
})

const mostrarFiltros = ref(false)
let searchTimeout = null

// Sincronizar con el store al montar
onMounted(() => {
  busquedaLocal.value = catalogo.state.filtros.busqueda
  filtrosLocales.value = {
    categoria: catalogo.state.filtros.categoria || '',
    marca: catalogo.state.filtros.marca || '',
    disponible: catalogo.state.filtros.disponible !== null ? String(catalogo.state.filtros.disponible) : '',
    destacado: catalogo.state.filtros.destacado !== null ? String(catalogo.state.filtros.destacado) : ''
  }
})

// Búsqueda con debounce
const onSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    catalogo.buscar(busquedaLocal.value)
  }, 300)
}

// Limpiar búsqueda
const limpiarBusqueda = () => {
  busquedaLocal.value = ''
  catalogo.buscar('')
}

// Aplicar filtro individual
const aplicarFiltro = (tipo, valor) => {
  let valorProcesado = valor || null
  
  // Convertir strings de boolean a boolean real
  if (tipo === 'disponible' || tipo === 'destacado') {
    if (valor === 'true') valorProcesado = true
    else if (valor === 'false') valorProcesado = false
    else valorProcesado = null
  }
  
  // Convertir IDs a números
  if ((tipo === 'categoria' || tipo === 'marca') && valor) {
    valorProcesado = parseInt(valor)
  }
  
  catalogo.aplicarFiltro(tipo, valorProcesado)
}

// Limpiar todos los filtros
const limpiarTodosFiltros = () => {
  busquedaLocal.value = ''
  filtrosLocales.value = {
    categoria: '',
    marca: '',
    disponible: '',
    destacado: ''
  }
  catalogo.limpiarFiltros()
}

// Auto-expandir filtros en desktop
const checkScreenSize = () => {
  mostrarFiltros.value = window.innerWidth >= 1024
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})
</script>

<style scoped>
.filtros-count {
  background: #3b82f6;
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

/* Transición para los filtros */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}
</style>
