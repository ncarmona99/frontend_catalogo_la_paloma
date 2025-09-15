<template>
  <div class="admin-imagenes">
    <AdminNavbar />
    
    <main class="main-content">
      <div class="container">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">
              <i class="fas fa-images"></i>
              Administración de Imágenes
            </h1>
            <p class="page-subtitle">
              Gestiona las fotografías de productos del catálogo
            </p>
          </div>
          <button class="btn btn-primary" @click="showUploadModal = true">
            <i class="fas fa-upload"></i>
            Subir Imágenes
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
              <label class="filter-label">Buscar Producto</label>
              <input 
                v-model="filters.producto" 
                type="text" 
                placeholder="Buscar por ID o descripción..."
                class="filter-input"
              >
            </div>
            
            <div class="filter-group">
              <label class="filter-label">Tipo de Vista</label>
              <select v-model="filters.tipo" class="filter-select">
                <option value="">Todos los tipos</option>
                <option value="principal">Principal</option>
                <option value="perspectiva">Perspectiva</option>
                <option value="frente">Frente</option>
                <option value="atras">Atrás</option>
                <option value="lateral">Lateral</option>
                <option value="superior">Superior</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">Categoría</label>
              <select v-model="filters.categoria" class="filter-select">
                <option value="">Todas las categorías</option>
                <option v-for="familia in familias" :key="familia.id" :value="familia.codigo">
                  {{ familia.nombre }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-images"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalImagenes }}</div>
              <div class="stat-label">Total Imágenes</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-box"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ productosConImagenes }}</div>
              <div class="stat-label">Productos con Imágenes</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ productosSinImagenes }}</div>
              <div class="stat-label">Sin Imágenes</div>
            </div>
          </div>
        </div>

        <!-- Vista de Imágenes -->
        <div class="images-container">
          <div class="images-header">
            <h3 class="images-title">Imágenes de Productos</h3>
            <div class="view-controls">
              <button 
                class="btn btn-sm"
                :class="viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'"
                @click="viewMode = 'grid'"
              >
                <i class="fas fa-th"></i>
                Cuadrícula
              </button>
              <button 
                class="btn btn-sm"
                :class="viewMode === 'list' ? 'btn-primary' : 'btn-ghost'"
                @click="viewMode = 'list'"
              >
                <i class="fas fa-list"></i>
                Lista
              </button>
            </div>
          </div>

          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Cargando imágenes...</span>
          </div>
          
          <div v-else-if="imagenesFiltradas.length === 0" class="empty-state">
            <i class="fas fa-images"></i>
            <h3>No hay imágenes</h3>
            <p>Comienza subiendo las primeras imágenes de productos</p>
            <button class="btn btn-primary" @click="showUploadModal = true">
              <i class="fas fa-upload"></i>
              Subir Imágenes
            </button>
          </div>
          
          <div v-else class="images-content">
            <!-- Vista Cuadrícula -->
            <div v-if="viewMode === 'grid'" class="images-grid">
              <div 
                v-for="imagen in imagenesFiltradas" 
                :key="imagen.id"
                class="image-card"
              >
                <div class="image-preview">
                  <img 
                    :src="imagen.url" 
                    :alt="imagen.alt_text"
                    @error="handleImageError"
                  >
                  <div class="image-overlay">
                    <div class="image-actions">
                      <button 
                        class="btn btn-sm btn-ghost"
                        @click="editImagen(imagen)"
                        title="Editar"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-ghost btn-danger"
                        @click="deleteImagen(imagen)"
                        title="Eliminar"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="image-info">
                  <div class="image-details">
                    <div class="product-id">ID: {{ imagen.producto_id }}</div>
                    <div class="image-type">
                      <span class="badge" :class="getTipoClass(imagen.tipo)">
                        {{ imagen.tipo }}
                      </span>
                    </div>
                    <div class="image-order">Orden: {{ imagen.orden }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Vista Lista -->
            <div v-else class="images-list">
              <div class="list-header">
                <div class="list-column">Imagen</div>
                <div class="list-column">Producto</div>
                <div class="list-column">Tipo</div>
                <div class="list-column">Orden</div>
                <div class="list-column">Acciones</div>
              </div>
              
              <div 
                v-for="imagen in imagenesFiltradas" 
                :key="imagen.id"
                class="list-item"
              >
                <div class="list-column">
                  <div class="list-image">
                    <img 
                      :src="imagen.url" 
                      :alt="imagen.alt_text"
                      @error="handleImageError"
                    >
                  </div>
                </div>
                <div class="list-column">
                  <div class="product-info">
                    <div class="product-id">ID: {{ imagen.producto_id }}</div>
                  </div>
                </div>
                <div class="list-column">
                  <span class="badge" :class="getTipoClass(imagen.tipo)">
                    {{ imagen.tipo }}
                  </span>
                </div>
                <div class="list-column">
                  {{ imagen.orden }}
                </div>
                <div class="list-column">
                  <div class="action-buttons">
                    <button 
                      class="btn btn-sm btn-ghost"
                      @click="editImagen(imagen)"
                      title="Editar"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-ghost btn-danger"
                      @click="deleteImagen(imagen)"
                      title="Eliminar"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de Subida de Imágenes -->
    <div v-if="showUploadModal" class="modal-overlay" @click="closeUploadModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Subir Imágenes</h3>
          <button class="modal-close" @click="closeUploadModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="upload-form">
            <div class="form-group">
              <label for="producto_id" class="form-label">Producto *</label>
              <select id="producto_id" v-model="uploadData.producto_id" class="form-select" required>
                <option value="">Seleccionar producto</option>
                <option v-for="producto in productos" :key="producto.id" :value="producto.id">
                  {{ producto.codigo_producto }} - {{ producto.descripcion }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="tipo_vista" class="form-label">Tipo de Vista *</label>
              <select id="tipo_vista" v-model="uploadData.tipo" class="form-select" required>
                <option value="">Seleccionar tipo</option>
                <option value="principal">Principal</option>
                <option value="perspectiva">Perspectiva</option>
                <option value="frente">Frente</option>
                <option value="atras">Atrás</option>
                <option value="lateral">Lateral</option>
                <option value="superior">Superior</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="imagenes" class="form-label">Imágenes *</label>
              <input 
                id="imagenes"
                type="file" 
                multiple
                accept="image/*"
                class="form-input"
                @change="handleFileSelect"
                required
              >
              <div class="file-info">
                Formatos soportados: JPG, PNG, WebP
              </div>
            </div>
            
            <div v-if="selectedFiles.length > 0" class="selected-files">
              <h4>Archivos seleccionados:</h4>
              <div class="files-list">
                <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                  <i class="fas fa-image"></i>
                  <span>{{ file.name }}</span>
                  <span class="file-size">({{ formatFileSize(file.size) }})</span>
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-ghost" @click="closeUploadModal">
                Cancelar
              </button>
              <button 
                type="button" 
                class="btn btn-primary" 
                @click="uploadImagenes"
                :disabled="uploading || !canUpload"
              >
                <i v-if="uploading" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-upload"></i>
                Subir Imágenes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminNavbar from '@/components/AdminNavbar.vue'
import { apiCall } from '@/config/api'

// Estado reactivo
const loading = ref(false)
const uploading = ref(false)
const viewMode = ref('grid')
const showUploadModal = ref(false)
const familias = ref([])
const productos = ref([])
const imagenes = ref([])
const selectedFiles = ref([])

const filters = ref({
  producto: '',
  tipo: '',
  categoria: ''
})

const uploadData = ref({
  producto_id: '',
  tipo: '',
  archivos: []
})

// Computed
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => value !== '')
})

const imagenesFiltradas = computed(() => {
  let filtered = imagenes.value

  if (filters.value.producto) {
    filtered = filtered.filter(img => 
      img.producto_id.toString().includes(filters.value.producto) ||
      img.alt_text.toLowerCase().includes(filters.value.producto.toLowerCase())
    )
  }

  if (filters.value.tipo) {
    filtered = filtered.filter(img => img.tipo === filters.value.tipo)
  }

  return filtered
})

const totalImagenes = computed(() => imagenes.value.length)
const productosConImagenes = computed(() => {
  const productosIds = new Set(imagenes.value.map(img => img.producto_id))
  return productosIds.size
})
const productosSinImagenes = computed(() => {
  return productos.value.length - productosConImagenes.value
})

const canUpload = computed(() => {
  return uploadData.value.producto_id && 
         uploadData.value.tipo && 
         selectedFiles.value.length > 0
})

// Métodos
const loadImagenes = async () => {
  loading.value = true
  try {
    const response = await apiCall('/admin/imagenes')
    if (response.success) {
      imagenes.value = response.data
    }
  } catch (error) {
    console.error('Error cargando imágenes:', error)
  } finally {
    loading.value = false
  }
}

const loadFamilias = async () => {
  try {
    const response = await apiCall('/catalogo/familias')
    if (response.success) {
      familias.value = response.data
    }
  } catch (error) {
    console.error('Error cargando familias:', error)
  }
}

const loadProductos = async () => {
  try {
    const response = await apiCall('/catalogo/productos?limite=1000')
    if (response.success) {
      productos.value = response.data
    }
  } catch (error) {
    console.error('Error cargando productos:', error)
  }
}

const clearFilters = () => {
  filters.value = {
    producto: '',
    tipo: '',
    categoria: ''
  }
}

const editImagen = (imagen) => {
  // TODO: Implementar edición de imagen
  console.log('Editando imagen:', imagen.id)
}

const deleteImagen = async (imagen) => {
  if (!confirm(`¿Estás seguro de que quieres eliminar esta imagen?`)) {
    return
  }
  
  try {
    const response = await apiCall(`/admin/imagenes/${imagen.id}`, { method: 'DELETE' })
    if (response.success) {
      console.log('Imagen eliminada exitosamente')
      await loadImagenes()
    }
  } catch (error) {
    console.error('Error eliminando imagen:', error)
    alert('Error al eliminar la imagen: ' + error.message)
  }
}

const handleFileSelect = (event) => {
  selectedFiles.value = Array.from(event.target.files)
}

const uploadImagenes = async () => {
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('producto_id', uploadData.value.producto_id)
    formData.append('tipo', uploadData.value.tipo)
    
    selectedFiles.value.forEach((file, index) => {
      formData.append(`archivos`, file)
    })
    
    const response = await apiCall('/admin/imagenes/upload', {
      method: 'POST',
      body: formData
    })
    
    if (response.success) {
      console.log('Imágenes subidas exitosamente')
      closeUploadModal()
      await loadImagenes()
    }
  } catch (error) {
    console.error('Error subiendo imágenes:', error)
    alert('Error al subir las imágenes: ' + (error.response?.data?.message || error.message))
  } finally {
    uploading.value = false
  }
}

const closeUploadModal = () => {
  showUploadModal.value = false
  uploadData.value = {
    producto_id: '',
    tipo: '',
    archivos: []
  }
  selectedFiles.value = []
}

const handleImageError = (event) => {
  event.target.src = '/images/placeholder-product.svg'
}

const getTipoClass = (tipo) => {
  const classes = {
    principal: 'badge-primary',
    perspectiva: 'badge-secondary',
    frente: 'badge-success',
    atras: 'badge-warning',
    lateral: 'badge-info',
    superior: 'badge-dark'
  }
  return classes[tipo] || 'badge-secondary'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Lifecycle
onMounted(() => {
  loadImagenes()
  loadFamilias()
  loadProductos()
})
</script>

<style scoped>
.admin-imagenes {
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
  background: #fee2e2;
  color: #dc2626;
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

.images-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.images-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.images-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
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

.images-content {
  padding: 1.5rem;
}

/* Vista Cuadrícula */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.image-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.2s ease;
}

.image-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.image-preview {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.image-actions {
  display: flex;
  gap: 0.5rem;
}

.image-info {
  padding: 1rem;
}

.image-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-id {
  font-weight: 600;
  color: #111827;
}

.image-type {
  display: flex;
  justify-content: center;
}

.image-order {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

/* Vista Lista */
.images-list {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.list-header {
  display: grid;
  grid-template-columns: 100px 1fr 120px 80px 120px;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.list-item {
  display: grid;
  grid-template-columns: 100px 1fr 120px 80px 120px;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
}

.list-item:last-child {
  border-bottom: none;
}

.list-column {
  display: flex;
  align-items: center;
}

.list-image {
  width: 60px;
  height: 60px;
  border-radius: 0.25rem;
  overflow: hidden;
}

.list-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-primary {
  background: #dbeafe;
  color: #1e40af;
}

.badge-secondary {
  background: #f3f4f6;
  color: #374151;
}

.badge-success {
  background: #d1fae5;
  color: #059669;
}

.badge-warning {
  background: #fef3c7;
  color: #d97706;
}

.badge-info {
  background: #dbeafe;
  color: #3b82f6;
}

.badge-dark {
  background: #374151;
  color: white;
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

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  max-width: 600px;
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

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.file-info {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.selected-files {
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
  background: #f9fafb;
}

.selected-files h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #374151;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.file-item i {
  color: #3b82f6;
}

.file-size {
  color: #6b7280;
  font-size: 0.75rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
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
  
  .images-grid {
    grid-template-columns: 1fr;
  }
  
  .list-header,
  .list-item {
    grid-template-columns: 80px 1fr 100px;
    gap: 0.5rem;
  }
  
  .list-header .list-column:nth-child(3),
  .list-header .list-column:nth-child(4),
  .list-item .list-column:nth-child(3),
  .list-item .list-column:nth-child(4) {
    display: none;
  }
}
</style>
