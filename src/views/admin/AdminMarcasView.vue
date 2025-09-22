<template>
  <div class="admin-marcas">
    <AdminNavbar />
    
    <main class="main-content">
      <div class="container">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">
              <i class="fas fa-tags"></i>
              Administración de Marcas
            </h1>
            <p class="page-subtitle">
              Gestiona las marcas disponibles para los productos
            </p>
          </div>
          <button class="btn btn-primary" @click="showCreateModal = true">
            <i class="fas fa-plus"></i>
            Nueva Marca
          </button>
        </div>

        <!-- Filtros -->
        <div class="filters-card">
          <div class="filters-header">
            <h3 class="filters-title">
              <i class="fas fa-filter"></i>
              Filtros
            </h3>
            <button 
              class="btn btn-ghost btn-sm" 
              @click="clearFilters"
              :disabled="!hasActiveFilters"
            >
              <i class="fas fa-times"></i>
              Limpiar
            </button>
          </div>
          
          <div class="filters-grid">
            <div class="filter-group">
              <label class="filter-label">Búsqueda</label>
              <input 
                v-model="filters.busqueda" 
                type="text" 
                placeholder="Buscar por nombre o código..."
                class="filter-input"
              >
            </div>
            
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-tags"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalMarcas }}</div>
              <div class="stat-label">Total Marcas</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-box"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ marcasConProductos }}</div>
              <div class="stat-label">Con Productos</div>
            </div>
          </div>
        </div>

        <!-- Tabla de marcas -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Lista de Marcas</h3>
            <div class="card-actions">
              <div class="pagination-info">
                Mostrando {{ paginationInfo.from }}-{{ paginationInfo.to }} de {{ totalMarcas }}
              </div>
            </div>
          </div>
          
          <div class="card-body">
            <div v-if="loading" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Cargando marcas...</span>
            </div>
            
            <div v-else-if="marcas.length === 0" class="empty-state">
              <i class="fas fa-tags"></i>
              <h3>No hay marcas</h3>
              <p>Comienza agregando tu primera marca al sistema</p>
              <button class="btn btn-primary" @click="showCreateModal = true">
                <i class="fas fa-plus"></i>
                Crear Marca
              </button>
            </div>
            
            <div v-else class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th @click="sort('id')" class="sortable" :class="getSortClass('id')">
                      ID
                      <i class="fas fa-sort" v-if="sortField !== 'id'"></i>
                      <i class="fas fa-sort-up" v-if="sortField === 'id' && sortOrder === 'asc'"></i>
                      <i class="fas fa-sort-down" v-if="sortField === 'id' && sortOrder === 'desc'"></i>
                    </th>
                    <th @click="sort('codigo')" class="sortable" :class="getSortClass('codigo')">
                      Código
                      <i class="fas fa-sort" v-if="sortField !== 'codigo'"></i>
                      <i class="fas fa-sort-up" v-if="sortField === 'codigo' && sortOrder === 'asc'"></i>
                      <i class="fas fa-sort-down" v-if="sortField === 'codigo' && sortOrder === 'desc'"></i>
                    </th>
                    <th @click="sort('nombre')" class="sortable" :class="getSortClass('nombre')">
                      Nombre
                      <i class="fas fa-sort" v-if="sortField !== 'nombre'"></i>
                      <i class="fas fa-sort-up" v-if="sortField === 'nombre' && sortOrder === 'asc'"></i>
                      <i class="fas fa-sort-down" v-if="sortField === 'nombre' && sortOrder === 'desc'"></i>
                    </th>
                    <th>Productos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="marca in marcas" :key="marca.id">
                    <td>{{ marca.id }}</td>
                    <td>
                      <div class="marca-codigo">
                        <span class="codigo-text">{{ marca.codigo }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="marca-nombre">
                        <span class="nombre-text">{{ marca.nombre }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="productos-count">
                        <span class="count-value">{{ marca.productos_count || 0 }}</span>
                        <span v-if="marca.productos_count > 0" class="count-label">productos</span>
                      </div>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button 
                          class="btn btn-sm btn-ghost"
                          @click="editMarca(marca)"
                          title="Editar"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-ghost btn-danger"
                          @click="deleteMarca(marca)"
                          title="Eliminar"
                          :disabled="marca.productos_count > 0"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Paginación -->
          <div v-if="totalPaginas > 1" class="card-footer">
            <div class="pagination">
              <button 
                class="btn btn-ghost btn-sm"
                :disabled="pagina <= 1"
                @click="changePage(pagina - 1)"
              >
                <i class="fas fa-chevron-left"></i>
                Anterior
              </button>
              
              <div class="pagination-pages">
                <button 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="btn btn-sm"
                  :class="page === pagina ? 'btn-primary' : 'btn-ghost'"
                  @click="changePage(page)"
                >
                  {{ page }}
                </button>
              </div>
              
              <button 
                class="btn btn-ghost btn-sm"
                :disabled="pagina >= totalPaginas"
                @click="changePage(pagina + 1)"
              >
                Siguiente
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de Crear/Editar Marca -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ showEditModal ? 'Editar Marca' : 'Nueva Marca' }}
          </h3>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveMarca" class="modal-body">
          <div class="form-group">
            <label for="codigo" class="form-label">Código *</label>
            <input 
              id="codigo"
              v-model="formData.codigo" 
              type="text" 
              class="form-input"
              placeholder="Ej: MAR001"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="nombre" class="form-label">Nombre *</label>
            <input 
              id="nombre"
              v-model="formData.nombre" 
              type="text" 
              class="form-input"
              placeholder="Ej: Samsung"
              required
            >
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" @click="closeModal">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              {{ showEditModal ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminNavbar from '@/components/AdminNavbar.vue'
import { apiCall } from '@/config/api'

const router = useRouter()

// Estado reactivo
const marcas = ref([])
const loading = ref(false)
const saving = ref(false)
const estadisticas = ref({ marcas_activas: 0, marcas_con_productos: 0 })
const pagina = ref(1)
const limite = ref(20)
const totalMarcas = ref(0)
const totalPaginas = ref(0)

// Estado del modal
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingMarca = ref(null)
const formData = ref({
  codigo: '',
  nombre: ''
})

// Estado para ordenamiento
const sortField = ref('id')
const sortOrder = ref('desc')

const filters = ref({
  busqueda: ''
})

// Computed
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => 
    value !== ''
  )
})


const marcasConProductos = computed(() => {
  return estadisticas.value?.marcas_con_productos || 0
})

const paginationInfo = computed(() => {
  const from = (pagina.value - 1) * limite.value + 1
  const to = Math.min(pagina.value * limite.value, totalMarcas.value)
  return { from, to }
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, pagina.value - 2)
  const end = Math.min(totalPaginas.value, pagina.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Métodos
const loadMarcas = async () => {
  loading.value = true
  try {
    const params = {
      pagina: pagina.value,
      limite: limite.value,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
      ...filters.value
    }
    
    const response = await apiCall('/admin/marcas?' + new URLSearchParams(params))
    
    if (response.success) {
      marcas.value = response.data || []
      totalMarcas.value = response.total || 0
      totalPaginas.value = response.pagination?.totalPaginas || 0
    } else {
      marcas.value = []
      totalMarcas.value = 0
      totalPaginas.value = 0
    }
  } catch (error) {
    console.error('❌ Error cargando marcas:', error)
    marcas.value = []
    totalMarcas.value = 0
    totalPaginas.value = 0
  } finally {
    loading.value = false
  }
}

const loadEstadisticas = async () => {
  try {
    const response = await apiCall('/admin/marcas/estadisticas')
    if (response.success) {
      estadisticas.value = response.estadisticas || { marcas_activas: 0, marcas_con_productos: 0 }
    }
  } catch (error) {
    console.error('❌ Error cargando estadísticas:', error)
    estadisticas.value = { marcas_activas: 0, marcas_con_productos: 0 }
  }
}

const changePage = (newPage) => {
  pagina.value = newPage
}

// Funciones de ordenamiento
const sort = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
  pagina.value = 1
}

const getSortClass = (field) => {
  if (sortField.value !== field) return ''
  return sortOrder.value === 'asc' ? 'sort-asc' : 'sort-desc'
}

const clearFilters = () => {
  filters.value = {
    busqueda: ''
  }
  pagina.value = 1
}

const deleteMarca = async (marca) => {
  if (marca.productos_count > 0) {
    alert('No se puede eliminar una marca que tiene productos asignados')
    return
  }
  
  if (!confirm(`¿Estás seguro de que quieres eliminar la marca "${marca.nombre}"?`)) {
    return
  }
  
  try {
    const response = await apiCall(`/admin/marcas/${marca.id}`, { method: 'DELETE' })
    if (response.success) {
      console.log('Marca eliminada exitosamente')
      await loadMarcas()
      await loadEstadisticas()
    }
  } catch (error) {
    console.error('Error eliminando marca:', error)
    alert('Error al eliminar la marca: ' + error.message)
  }
}

// Métodos del modal
const editMarca = (marca) => {
  editingMarca.value = marca
  formData.value = {
    codigo: marca.codigo,
    nombre: marca.nombre
  }
  showEditModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingMarca.value = null
  formData.value = {
    codigo: '',
    nombre: ''
  }
}

const saveMarca = async () => {
  saving.value = true
  try {
    const isEditing = showEditModal.value
    const url = isEditing ? `/admin/marcas/${editingMarca.value.id}` : '/admin/marcas'
    const method = isEditing ? 'PUT' : 'POST'
    
    const response = await apiCall(url, {
      method,
      body: JSON.stringify(formData.value)
    })
    
    if (response.success) {
      console.log(`Marca ${isEditing ? 'actualizada' : 'creada'} exitosamente`)
      closeModal()
      await loadMarcas()
      await loadEstadisticas()
    } else {
      alert('Error al guardar la marca: ' + response.message)
    }
  } catch (error) {
    console.error('Error guardando marca:', error)
    alert('Error al guardar la marca: ' + error.message)
  } finally {
    saving.value = false
  }
}


// Watchers
watch(filters, () => {
  pagina.value = 1
  loadMarcas()
  loadEstadisticas()
}, { deep: true })

watch(pagina, () => {
  loadMarcas()
})

// Watch para cambios en ordenamiento
watch([sortField, sortOrder], () => {
  pagina.value = 1
  loadMarcas()
})

// Lifecycle
onMounted(() => {
  loadMarcas()
  loadEstadisticas()
})
</script>

<style scoped>
.admin-marcas {
  min-height: 100vh;
  background: #f8fafc;
}

.main-content {
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.page-title i {
  color: #3b82f6;
}

.page-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 1.125rem;
}

.filters-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.filters-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.filters-title i {
  color: #6b7280;
}

.filters-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.filter-input,
.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-card:nth-child(1) .stat-icon {
  background: #dbeafe;
  color: #3b82f6;
}

.stat-card:nth-child(2) .stat-icon {
  background: #d1fae5;
  color: #059669;
}

.stat-card:nth-child(3) .stat-icon {
  background: #fef3c7;
  color: #d97706;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.card-body {
  padding: 1.5rem;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
  text-align: center;
}

.loading-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
}

.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  position: relative;
}

.table th.sortable:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.table th.sortable i {
  margin-left: 8px;
  font-size: 0.75rem;
  color: #9ca3af;
  transition: color 0.2s ease;
}

.table th.sortable.sort-asc i,
.table th.sortable.sort-desc i {
  color: #3b82f6;
}

.table th.sortable:hover i {
  color: #1f2937;
}

.table td {
  color: #111827;
}

.marca-codigo {
  font-family: monospace;
  font-weight: 600;
  color: #6b7280;
}

.marca-nombre {
  font-weight: 500;
  color: #111827;
}

.productos-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.count-value {
  font-weight: 600;
  color: #111827;
}

.count-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-success {
  background: #d1fae5;
  color: #059669;
}

.badge-warning {
  background: #fef3c7;
  color: #d97706;
}

.badge-secondary {
  background: #f3f4f6;
  color: #374151;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
}

.btn-ghost:hover {
  background: #f3f4f6;
  color: #374151;
}

.btn-danger {
  color: #ef4444;
}

.btn-danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.card-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .table th,
  .table td {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
  
  .modal {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
