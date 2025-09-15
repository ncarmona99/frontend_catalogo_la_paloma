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

          <!-- Temporada -->
          <div class="filtro-grupo">
            <label class="filtro-label">Temporada</label>
            <select
              v-model="filtrosLocales.temporada"
              class="filtro-select"
              @change="aplicarFiltro('temporada', $event.target.value)"
            >
              <option value="">Todas las temporadas</option>
              <option
                v-for="t in catalogo.temporadas"
                :key="t.id"
                :value="t.id"
              >
                {{ t.nombre }}
              </option>
            </select>
          </div>


        </div>
      </transition>
    </div>

    <!-- Información de resultados -->
    <div v-if="showResultsInfo" class="resultados-info">
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

// Props
const props = defineProps({
  showResultsInfo: {
    type: Boolean,
    default: true
  }
})

const busquedaLocal = ref('')
const filtrosLocales = ref({
  marca: '',
  temporada: ''
})

const mostrarFiltros = ref(false)
let searchTimeout = null

// Sincronizar con el store al montar
onMounted(() => {
  busquedaLocal.value = catalogo.state.filtros.busqueda
  filtrosLocales.value = {
    marca: catalogo.state.filtros.marca || '',
    temporada: catalogo.state.filtros.temporada || ''
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
  
  // Convertir IDs a números
  if ((tipo === 'marca' || tipo === 'temporada') && valor) {
    valorProcesado = parseInt(valor)
  }
  
  catalogo.aplicarFiltro(tipo, valorProcesado)
}

// Limpiar todos los filtros
const limpiarTodosFiltros = () => {
  busquedaLocal.value = ''
  filtrosLocales.value = {
    marca: '',
    temporada: ''
  }
  catalogo.limpiarFiltros()
}

// Auto-expandir filtros (siempre abierto en sidebar)
const checkScreenSize = () => {
  // En el sidebar, los filtros siempre están expandidos
  if (props.showResultsInfo === false) {
    mostrarFiltros.value = true
  } else {
    mostrarFiltros.value = window.innerWidth >= 1024
  }
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
