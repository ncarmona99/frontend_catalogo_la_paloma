<template>
  <div class="admin-marcas">
    <AdminNavbar />
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">
              <i class="fas fa-calendar-alt"></i>
              Administración de Temporadas
            </h1>
            <p class="page-subtitle">
              Gestiona las temporadas disponibles para clasificar productos
            </p>
          </div>
          <button class="btn btn-primary" @click="openForm(null)">
            <i class="fas fa-plus"></i>
            Nueva Temporada
          </button>
        </div>

        <div class="filters-card">
          <div class="filters-header">
            <h3 class="filters-title">
              <i class="fas fa-filter"></i>
              Filtros
            </h3>
            <button class="btn btn-ghost btn-sm" @click="clearFilters" :disabled="!hasActiveFilters">
              <i class="fas fa-times"></i>
              Limpiar
            </button>
          </div>
          <div class="filters-grid">
            <div class="filter-group">
              <label class="filter-label">Búsqueda</label>
              <input v-model="filters.busqueda" type="text" placeholder="Buscar por nombre o código..." class="filter-input" />
            </div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-calendar-alt"></i></div>
            <div class="stat-content">
              <div class="stat-value">{{ totalTemporadas }}</div>
              <div class="stat-label">Total Temporadas</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Lista de Temporadas</h3>
            <div class="card-actions">
              <div class="pagination-info">
                Mostrando {{ paginationInfo.from }}-{{ paginationInfo.to }} de {{ totalTemporadas }}
              </div>
            </div>
          </div>
          <div class="card-body">
            <div v-if="loading" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Cargando temporadas...</span>
            </div>
            <div v-else-if="temporadas.length === 0" class="empty-state">
              <i class="fas fa-calendar-alt"></i>
              <h3>No hay temporadas</h3>
              <p>Comienza agregando tu primera temporada al sistema</p>
              <button class="btn btn-primary" @click="openForm(null)">
                <i class="fas fa-plus"></i>
                Crear Temporada
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
                    <th @click="sort('productos_count')" class="sortable" :class="getSortClass('productos_count')">Productos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="t in temporadas" :key="t.id">
                    <td>{{ t.id }}</td>
                    <td><span class="codigo-text">{{ t.codigo }}</span></td>
                    <td><span class="nombre-text">{{ t.nombre }}</span></td>
                    <td>
                      <div class="productos-count">
                        <span class="count-value">{{ t.productos_count || 0 }}</span>
                        <span v-if="t.productos_count > 0" class="count-label">productos</span>
                      </div>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="btn btn-sm btn-ghost" @click="openForm(t)" title="Editar">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-ghost btn-danger" @click="confirmDelete(t)" title="Eliminar" :disabled="t.productos_count > 0">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-if="totalPaginas > 1" class="card-footer">
            <div class="pagination">
              <button class="btn btn-ghost btn-sm" :disabled="pagina <= 1" @click="changePage(pagina - 1)">
                <i class="fas fa-chevron-left"></i>
                Anterior
              </button>
              <div class="pagination-pages">
                <button v-for="page in visiblePages" :key="page" class="btn btn-sm" :class="page === pagina ? 'btn-primary' : 'btn-ghost'" @click="changePage(page)">
                  {{ page }}
                </button>
              </div>
              <button class="btn btn-ghost btn-sm" :disabled="pagina >= totalPaginas" @click="changePage(pagina + 1)">
                Siguiente
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

    <!-- Modal de Crear/Editar Temporada -->
    <div v-if="showForm" class="modal-overlay" @click="closeForm">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ form.id ? 'Editar Temporada' : 'Nueva Temporada' }}
          </h3>
          <button class="modal-close" @click="closeForm">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveForm" class="modal-body">
          <div class="form-group">
            <label for="codigo" class="form-label">Código *</label>
            <input 
              id="codigo"
              v-model="form.codigo" 
              type="text" 
              class="form-input"
              placeholder="Ej: TEMP001"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="nombre" class="form-label">Nombre *</label>
            <input 
              id="nombre"
              v-model="form.nombre" 
              type="text" 
              class="form-input"
              placeholder="Ej: Navidad 2024"
              required
            >
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" @click="closeForm">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              {{ form.id ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AdminNavbar from '@/components/AdminNavbar.vue'
import { apiCall } from '@/config/api'

const temporadas = ref([])
const loading = ref(false)
const saving = ref(false)
const pagina = ref(1)
const limite = ref(20)
const totalTemporadas = ref(0)
const totalPaginas = ref(0)
const sortField = ref('id')
const sortOrder = ref('desc')

const filters = ref({ busqueda: '' })

const hasActiveFilters = computed(() => Object.values(filters.value).some(v => v !== ''))

const estadisticas = ref({ total_temporadas: 0 })

const paginationInfo = computed(() => {
  const from = (pagina.value - 1) * limite.value + 1
  const to = Math.min(pagina.value * limite.value, totalTemporadas.value)
  return { from, to }
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, pagina.value - 2)
  const end = Math.min(totalPaginas.value, pagina.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const showForm = ref(false)
const form = ref({ id: null, codigo: '', nombre: '' })

const loadTemporadas = async () => {
  loading.value = true
  try {
    const params = {
      pagina: pagina.value,
      limite: limite.value,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
      ...filters.value
    }
    const response = await apiCall('/admin/temporadas?' + new URLSearchParams(params))
    if (response.success) {
      temporadas.value = response.data || []
      totalTemporadas.value = response.total || 0
      totalPaginas.value = response.pagination?.totalPaginas || 0
    } else {
      temporadas.value = []
      totalTemporadas.value = 0
      totalPaginas.value = 0
    }
  } catch (_) {
    temporadas.value = []
    totalTemporadas.value = 0
    totalPaginas.value = 0
  } finally {
    loading.value = false
  }
}

const loadEstadisticas = async () => {
  try {
    const response = await apiCall('/admin/temporadas/estadisticas')
    if (response.success) estadisticas.value = response.estadisticas
  } catch (_) {}
}

function openForm(t) {
  if (t) form.value = { id: t.id, codigo: t.codigo, nombre: t.nombre }
  else form.value = { id: null, codigo: '', nombre: '' }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

async function saveForm() {
  saving.value = true
  try {
    const payload = { codigo: form.value.codigo, nombre: form.value.nombre }
    const url = form.value.id ? `/admin/temporadas/${form.value.id}` : '/admin/temporadas'
    const method = form.value.id ? 'PUT' : 'POST'
    
    const response = await apiCall(url, { 
      method, 
      body: JSON.stringify(payload) 
    })
    
    if (response.success) {
      console.log(`Temporada ${form.value.id ? 'actualizada' : 'creada'} exitosamente`)
      showForm.value = false
      await loadTemporadas()
      await loadEstadisticas()
    } else {
      alert('Error al guardar la temporada: ' + response.message)
    }
  } catch (error) {
    console.error('Error guardando temporada:', error)
    alert('Error al guardar la temporada: ' + error.message)
  } finally {
    saving.value = false
  }
}

async function confirmDelete(t) {
  if (t.productos_count > 0) {
    alert('No se puede eliminar una temporada que tiene productos asociados')
    return
  }
  if (!confirm(`¿Eliminar temporada "${t.nombre}"?`)) return
  await apiCall(`/admin/temporadas/${t.id}`, { method: 'DELETE' })
  await loadTemporadas()
  await loadEstadisticas()
}

const changePage = (newPage) => { pagina.value = newPage }

const sort = (field) => {
  if (sortField.value === field) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  else { sortField.value = field; sortOrder.value = 'asc' }
  pagina.value = 1
}

const getSortClass = (field) => {
  if (sortField.value !== field) return ''
  return sortOrder.value === 'asc' ? 'sort-asc' : 'sort-desc'
}

const clearFilters = () => { filters.value = { busqueda: '' }; pagina.value = 1 }

watch(filters, () => { pagina.value = 1; loadTemporadas(); loadEstadisticas() }, { deep: true })
watch(pagina, () => { loadTemporadas() })
watch([sortField, sortOrder], () => { pagina.value = 1; loadTemporadas() })

onMounted(() => { loadTemporadas(); loadEstadisticas() })
</script>

<style scoped>
/* Reutilizamos estilos de AdminMarcas para consistencia */
.admin-marcas { min-height: 100vh; background: #f8fafc; }
.main-content { padding: 2rem 0; }
.container { max-width: 1400px; margin: 0 auto; padding: 0 1rem; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; gap: 1rem; }
.page-title { display: flex; align-items: center; gap: 0.75rem; margin: 0 0 0.5rem 0; font-size: 2rem; font-weight: 700; color: #111827; }
.page-title i { color: #3b82f6; }
.page-subtitle { margin: 0; color: #6b7280; font-size: 1.125rem; }
.filters-card { background: white; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 2rem; overflow: hidden; }
.filters-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
.filters-title { display: flex; align-items: center; gap: 0.5rem; margin: 0; font-size: 1.125rem; font-weight: 600; color: #111827; }
.filters-title i { color: #6b7280; }
.filters-grid { padding: 1.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-label { font-weight: 500; color: #374151; font-size: 0.875rem; }
.filter-input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }
.filter-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
.stat-card { background: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 1rem; }
.stat-icon { width: 3rem; height: 3rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
.stat-card:nth-child(1) .stat-icon { background: #dbeafe; color: #3b82f6; }
.stat-card:nth-child(2) .stat-icon { background: #d1fae5; color: #059669; }
.stat-value { font-size: 1.875rem; font-weight: 700; color: #111827; line-height: 1; }
.stat-label { font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem; }
.card { background: white; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
.card-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
.card-title { margin: 0; font-size: 1.25rem; font-weight: 600; color: #111827; }
.card-actions { display: flex; align-items: center; gap: 1rem; }
.pagination-info { font-size: 0.875rem; color: #6b7280; }
.card-body { padding: 1.5rem; }
.loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; color: #6b7280; text-align: center; }
.loading-state i { font-size: 2rem; margin-bottom: 1rem; }
.empty-state i { font-size: 3rem; margin-bottom: 1rem; color: #d1d5db; }
.empty-state h3 { margin: 0 0 0.5rem 0; color: #374151; }
.empty-state p { margin: 0 0 1.5rem 0; }
.table-container { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #f3f4f6; }
.table th { background: #f9fafb; font-weight: 600; color: #374151; font-size: 0.875rem; }
.table th.sortable { cursor: pointer; user-select: none; transition: all 0.2s ease; position: relative; }
.table th.sortable:hover { background: #e5e7eb; color: #1f2937; }
.table th.sortable i { margin-left: 8px; font-size: 0.75rem; color: #9ca3af; transition: color 0.2s ease; }
.table th.sortable.sort-asc i, .table th.sortable.sort-desc i { color: #3b82f6; }
.table th.sortable:hover i { color: #1f2937; }
.codigo-text { font-family: monospace; font-weight: 600; color: #6b7280; }
.nombre-text { font-weight: 500; color: #111827; }
.productos-count { display: flex; align-items: center; gap: 0.25rem; }
.count-value { font-weight: 600; color: #111827; }
.count-label { font-size: 0.75rem; color: #6b7280; }
.action-buttons { display: flex; gap: 0.5rem; }
.btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; font-weight: 500; text-decoration: none; cursor: pointer; transition: all 0.2s ease; font-size: 0.875rem; }
.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }
.btn-ghost { background: transparent; color: #6b7280; }
.btn-ghost:hover { background: #f3f4f6; color: #374151; }
.btn-danger { color: #ef4444; }
.btn-danger:hover { background: #fef2f2; color: #dc2626; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }
.card-footer { padding: 1.5rem; border-top: 1px solid #e5e7eb; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; }
.pagination-pages { display: flex; gap: 0.25rem; }

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

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: stretch; }
  .filters-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .table th, .table td { padding: 0.5rem; font-size: 0.875rem; }
  
  .modal {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>


