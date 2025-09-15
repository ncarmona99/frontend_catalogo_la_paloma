<template>
  <div class="pagination">
    <!-- Debug info -->
    <div class="debug-info" style="background: #f0f0f0; padding: 0.5rem; margin-bottom: 1rem; border-radius: 4px; font-size: 0.8rem;">
      <strong>Debug:</strong> totalPaginas={{ totalPaginas }}, totalProductos={{ totalProductos }}, paginaActual={{ paginaActual }}, limite={{ limite }}
    </div>
    
    <div v-if="totalPaginas > 1 || totalProductos > 0">
    <!-- Información de paginación -->
    <div class="pagination-info">
      <span>
        Mostrando {{ inicioProducto }}-{{ finProducto }} de {{ totalProductos }} productos
      </span>
    </div>

    <!-- Controles de paginación -->
    <div class="pagination-controls">
      <!-- Botón anterior -->
      <button
        class="pagination-btn"
        :class="{ disabled: paginaActual === 1 }"
        :disabled="paginaActual === 1"
        @click="cambiarPagina(paginaActual - 1)"
        title="Página anterior"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <!-- Números de página -->
      <div class="pagination-numbers">
        <!-- Primera página -->
        <button
          v-if="mostrarPrimeraPagina"
          class="pagination-btn"
          :class="{ active: paginaActual === 1 }"
          @click="cambiarPagina(1)"
        >
          1
        </button>

        <!-- Separador inicial -->
        <span v-if="mostrarSeparadorInicial" class="pagination-separator">...</span>

        <!-- Páginas del medio -->
        <button
          v-for="pagina in paginasVisibles"
          :key="pagina"
          class="pagination-btn"
          :class="{ active: paginaActual === pagina }"
          @click="cambiarPagina(pagina)"
        >
          {{ pagina }}
        </button>

        <!-- Separador final -->
        <span v-if="mostrarSeparadorFinal" class="pagination-separator">...</span>

        <!-- Última página -->
        <button
          v-if="mostrarUltimaPagina"
          class="pagination-btn"
          :class="{ active: paginaActual === totalPaginas }"
          @click="cambiarPagina(totalPaginas)"
        >
          {{ totalPaginas }}
        </button>
      </div>

      <!-- Botón siguiente -->
      <button
        class="pagination-btn"
        :class="{ disabled: paginaActual === totalPaginas }"
        :disabled="paginaActual === totalPaginas"
        @click="cambiarPagina(paginaActual + 1)"
        title="Página siguiente"
      >
        <i class="fas fa-chevron-right"></i>
             </button>
     </div>
   </div>
   
       <div v-else class="pagination-info">
      <span>No hay más páginas disponibles (Total: {{ totalProductos }}, Páginas: {{ totalPaginas }})</span>
    </div>
 </div>
 </template>

<script setup>
import { computed } from 'vue'
import { catalogo } from '@/stores/catalogo'

// Props
const props = defineProps({
  totalProductos: {
    type: Number,
    required: true
  },
  totalPaginas: {
    type: Number,
    required: true
  },
  paginaActual: {
    type: Number,
    required: true
  },
  limite: {
    type: Number,
    required: true
  }
})

// Computed properties
const inicioProducto = computed(() => {
  return (props.paginaActual - 1) * props.limite + 1
})

const finProducto = computed(() => {
  return Math.min(props.paginaActual * props.limite, props.totalProductos)
})

// Lógica para mostrar páginas
const paginasVisibles = computed(() => {
  const paginas = []
  const inicio = Math.max(1, props.paginaActual - 2)
  const fin = Math.min(props.totalPaginas, props.paginaActual + 2)
  
  for (let i = inicio; i <= fin; i++) {
    paginas.push(i)
  }
  
  return paginas
})

const mostrarPrimeraPagina = computed(() => {
  return paginasVisibles.value[0] > 1
})

const mostrarUltimaPagina = computed(() => {
  return paginasVisibles.value[paginasVisibles.value.length - 1] < props.totalPaginas
})

const mostrarSeparadorInicial = computed(() => {
  return paginasVisibles.value[0] > 2
})

const mostrarSeparadorFinal = computed(() => {
  return paginasVisibles.value[paginasVisibles.value.length - 1] < props.totalPaginas - 1
})

// Métodos
const cambiarPagina = async (nuevaPagina) => {
  if (nuevaPagina < 1 || nuevaPagina > props.totalPaginas) return
  
  await catalogo.cambiarPagina(nuevaPagina)
  
  // Scroll to top
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<style scoped>
.pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pagination-info {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-btn {
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0 0.5rem;
  border: 1px solid #e1e5e9;
  background: white;
  color: #374151;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(.disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #111827;
}

.pagination-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.pagination-btn.active:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.disabled:hover {
  background: white;
  border-color: #e1e5e9;
  color: #374151;
}

.pagination-separator {
  padding: 0 0.5rem;
  color: #6b7280;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 640px) {
  .pagination {
    padding: 0.75rem;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .pagination-numbers {
    order: 2;
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
  }
  
  .pagination-btn {
    min-width: 2.25rem;
    height: 2.25rem;
    font-size: 0.8rem;
  }
}
</style>
