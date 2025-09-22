<template>
  <div class="admin-categorias">
    <AdminNavbar />
    
    <main class="main-content">
      <div class="container">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">
              <i class="fas fa-tags"></i>
              Administración de Categorías
            </h1>
            <p class="page-subtitle">
              Gestiona las categorías de productos del catálogo
            </p>
          </div>
          <button class="btn btn-primary" @click="showCreateModal = true">
            <i class="fas fa-plus"></i>
            Nueva Categoría
          </button>
        </div>

        <!-- Estadísticas -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-tags"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ categorias.length }}</div>
              <div class="stat-label">Total Categorías</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-box"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalProductos }}</div>
              <div class="stat-label">Productos Asociados</div>
            </div>
          </div>
        </div>

        <!-- Tabla de categorías -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Lista de Categorías</h3>
            <div class="card-actions">
              <div class="search-box">
                <i class="fas fa-search"></i>
                <input 
                  v-model="searchTerm" 
                  type="text" 
                  placeholder="Buscar categorías..."
                  class="search-input"
                >
              </div>
            </div>
          </div>
          
          <div class="card-body">
            <div v-if="loading" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Cargando categorías...</span>
            </div>
            
            <div v-else-if="categoriasFiltradas.length === 0" class="empty-state">
              <i class="fas fa-tags"></i>
              <h3>No hay categorías</h3>
              <p>Comienza creando tu primera categoría de productos</p>
              <button class="btn btn-primary" @click="showCreateModal = true">
                <i class="fas fa-plus"></i>
                Crear Categoría
              </button>
            </div>
            
            <div v-else class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Productos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="categoria in categoriasFiltradas" :key="categoria.id">
                    <td>{{ categoria.id }}</td>
                    <td>
                      <span class="badge badge-secondary">{{ categoria.codigo }}</span>
                    </td>
                    <td>{{ categoria.nombre }}</td>
                    <td>
                      <span class="product-count">{{ categoria.total_productos || 0 }}</span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button 
                          class="btn btn-sm btn-ghost" 
                          @click="editCategoria(categoria)"
                          title="Editar"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-ghost btn-danger" 
                          @click="deleteCategoria(categoria)"
                          title="Eliminar"
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
        </div>
      </div>
    </main>

    <!-- Modal de Crear/Editar Categoría -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ showEditModal ? 'Editar Categoría' : 'Nueva Categoría' }}
          </h3>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveCategoria" class="modal-body">
          <div class="form-group">
            <label for="codigo" class="form-label">Código *</label>
            <input 
              id="codigo"
              v-model="formData.codigo" 
              type="text" 
              class="form-input"
              placeholder="Ej: CAT001"
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
              placeholder="Ej: Electrónicos"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminNavbar from '@/components/AdminNavbar.vue'
import { apiCall } from '@/config/api'

const router = useRouter()

// Estado reactivo
const categorias = ref([])
const loading = ref(false)
const saving = ref(false)
const searchTerm = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingCategoria = ref(null)
const formData = ref({
  codigo: '',
  nombre: ''
})

// Computed
const categoriasFiltradas = computed(() => {
  if (!searchTerm.value) return categorias.value
  
  return categorias.value.filter(categoria => 
    categoria.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    categoria.codigo.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

const totalProductos = computed(() => {
  return categorias.value.reduce((total, categoria) => total + (categoria.total_productos || 0), 0)
})

// Métodos
const loadCategorias = async () => {
  loading.value = true
  try {
    const response = await apiCall('/catalogo/familias')
    console.log('🔍 Respuesta de familias:', response)
    if (response.success) {
      console.log('🔍 Datos de familias recibidos:', response.data)
      console.log('🔍 Cantidad de familias:', response.data?.length)
      
      // Verificar duplicados por nombre
      const nombres = response.data.map(f => f.nombre)
      const nombresUnicos = [...new Set(nombres)]
      console.log('🔍 Nombres únicos:', nombresUnicos.length, 'vs total:', nombres.length)
      
      // Verificar duplicados por código
      const codigos = response.data.map(f => f.codigo)
      const codigosUnicos = [...new Set(codigos)]
      console.log('🔍 Códigos únicos:', codigosUnicos.length, 'vs total:', codigos.length)
      
      // Mostrar duplicados si los hay
      if (nombresUnicos.length !== nombres.length) {
        const duplicadosNombre = nombres.filter((nombre, index) => nombres.indexOf(nombre) !== index)
        console.log('🔍 Nombres duplicados:', [...new Set(duplicadosNombre)])
      }
      
      if (codigosUnicos.length !== codigos.length) {
        const duplicadosCodigo = codigos.filter((codigo, index) => codigos.indexOf(codigo) !== index)
        console.log('🔍 Códigos duplicados:', [...new Set(duplicadosCodigo)])
      }
      
      categorias.value = response.data
      console.log('🔍 Familias en el componente:', categorias.value)
    }
  } catch (error) {
    console.error('Error cargando categorías:', error)
  } finally {
    loading.value = false
  }
}

const editCategoria = (categoria) => {
  editingCategoria.value = categoria
  formData.value = {
    codigo: categoria.codigo,
    nombre: categoria.nombre
  }
  showEditModal.value = true
}

const deleteCategoria = async (categoria) => {
  if (!confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoria.nombre}"?`)) {
    return
  }
  
  try {
    const response = await apiCall(`/admin/categorias/${categoria.id}`, { method: 'DELETE' })
    if (response.success) {
      console.log('Categoría eliminada exitosamente')
      await loadCategorias()
    }
  } catch (error) {
    console.error('Error eliminando categoría:', error)
    alert('Error al eliminar la categoría: ' + error.message)
  }
}

const saveCategoria = async () => {
  saving.value = true
  try {
    if (showEditModal.value) {
      const response = await apiCall(`/admin/categorias/${editingCategoria.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData.value)
      })
      if (response.success) {
        console.log('Categoría actualizada exitosamente')
      }
    } else {
      const response = await apiCall('/admin/categorias', {
        method: 'POST',
        body: JSON.stringify(formData.value)
      })
      if (response.success) {
        console.log('Categoría creada exitosamente')
      }
    }
    
    await loadCategorias()
    closeModal()
  } catch (error) {
    console.error('Error guardando categoría:', error)
    alert('Error al guardar la categoría: ' + error.message)
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingCategoria.value = null
  formData.value = { codigo: '', nombre: '' }
}

// Lifecycle
onMounted(() => {
  loadCategorias()
})
</script>

<style scoped>
.admin-categorias {
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
  background: #dbeafe;
  color: #3b82f6;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
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
  gap: 1rem;
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

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 0.75rem;
  color: #9ca3af;
}

.search-input {
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  width: 250px;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.table td {
  color: #111827;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-secondary {
  background: #f3f4f6;
  color: #374151;
}

.product-count {
  font-weight: 600;
  color: #3b82f6;
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

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

/* Modal */
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
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
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
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .search-input {
    width: 100%;
  }
  
  .table th,
  .table td {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}
</style>
