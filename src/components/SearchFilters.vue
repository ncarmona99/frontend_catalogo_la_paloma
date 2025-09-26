<template>
  <div class="search-filters">
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
          <i
            :class="
              mostrarFiltros ? 'fas fa-chevron-up' : 'fas fa-chevron-down'
            "
          ></i>
        </button>
      </div>

      <transition name="slide-up">
        <div v-show="mostrarFiltros" class="filtros-content">
          <!-- Categoría -->
          <div class="filtro-grupo">
            <label class="filtro-label">Categoría</label>
            <select
              v-model="filtrosLocales.familia"
              class="filtro-select"
              @change="aplicarFiltro('familia', $event.target.value)"
            >
              <option value="">Todas las categorías</option>
              <option
                v-for="familia in catalogo.familias"
                :key="familia.id"
                :value="familia.id"
              >
                {{ familia.nombre }}
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

          <!-- Venta Zonal -->
          <div class="filtro-grupo">
            <label class="filtro-label">Venta Zonal</label>
            <select
              v-model="filtrosLocales.zona"
              class="filtro-select"
              @change="aplicarFiltro('zona', $event.target.value)"
            >
              <option value="">Todos los productos</option>
              <option value="1">Solo Venta Zonal</option>
              <option value="0">Solo No Zonal</option>
            </select>
          </div>

          <!-- Stock -->
          <div class="filtro-grupo">
            <label class="filtro-label">Stock</label>
            <select
              v-model="filtrosLocales.stock"
              class="filtro-select"
              @change="aplicarFiltro('stock', $event.target.value)"
            >
              <option value="">Todos los productos</option>
              <option value="con_stock">Solo con Stock</option>
              <option value="sin_stock">Solo sin Stock</option>
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
import { ref, onMounted, watch } from "vue";
import { catalogo } from "@/stores/catalogo";

// Props
const props = defineProps({
  showResultsInfo: {
    type: Boolean,
    default: true,
  },
});

const filtrosLocales = ref({
  familia: "",
  marca: "",
  temporada: "",
  zona: "",
  stock: "",
});

const mostrarFiltros = ref(false);

// Sincronizar con el store al montar
onMounted(() => {
  filtrosLocales.value = {
    familia: catalogo.state.filtros.familia || "",
    marca: catalogo.state.filtros.marca || "",
    temporada: catalogo.state.filtros.temporada || "",
    zona: catalogo.state.filtros.zona || "",
    stock: catalogo.state.filtros.stock || "",
  };
});

// Aplicar filtro individual
const aplicarFiltro = (tipo, valor) => {
  let valorProcesado = valor || null;

  // Convertir IDs a números
  if (
    (tipo === "familia" || tipo === "marca" || tipo === "temporada") &&
    valor
  ) {
    valorProcesado = parseInt(valor);
  }

  catalogo.aplicarFiltroConURL(tipo, valorProcesado);
};

// Limpiar todos los filtros
const limpiarTodosFiltros = () => {
  filtrosLocales.value = {
    familia: "",
    marca: "",
    temporada: "",
    zona: "",
    stock: "",
  };
  catalogo.limpiarFiltrosConURL();
};

// Auto-expandir filtros (siempre abierto en sidebar)
const checkScreenSize = () => {
  // En el sidebar, los filtros siempre están expandidos
  if (props.showResultsInfo === false) {
    mostrarFiltros.value = true;
  } else {
    mostrarFiltros.value = window.innerWidth >= 1024;
  }
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
});
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
