<template>
  <div class="admin-marca-form">
    <AdminNavbar />
    
    <main class="main-content">
      <div class="container">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">
              <i class="fas fa-tags"></i>
              {{ isEditing ? 'Editar Marca' : 'Nueva Marca' }}
            </h1>
            <p class="page-subtitle">
              {{ isEditing ? 'Modifica la información de la marca' : 'Agrega una nueva marca al sistema' }}
            </p>
          </div>
          <div class="header-actions">
            <router-link to="/admin/marcas" class="btn btn-ghost">
              <i class="fas fa-arrow-left"></i>
              Volver
            </router-link>
            <button 
              class="btn btn-primary" 
              @click="saveMarca"
              :disabled="saving"
            >
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-save"></i>
              {{ isEditing ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </div>

        <!-- Formulario -->
        <div class="form-container">
          <form @submit.prevent="saveMarca" class="marca-form">
            <!-- Información Básica -->
            <div class="form-section">
              <h3 class="section-title">
                <i class="fas fa-info-circle"></i>
                Información Básica
              </h3>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="codigo" class="form-label">Código de la Marca *</label>
                  <input 
                    id="codigo"
                    v-model.number="formData.codigo" 
                    type="number" 
                    class="form-input"
                    placeholder="Ej: 123"
                    required
                    :disabled="isEditing"
                  >
                  <small class="form-help">El código debe ser único y no se puede modificar después de crear la marca</small>
                </div>
                
                <div class="form-group">
                  <label for="nombre" class="form-label">Nombre de la Marca *</label>
                  <input 
                    id="nombre"
                    v-model="formData.nombre" 
                    type="text" 
                    class="form-input"
                    placeholder="Ej: Samsung, Apple, Nike..."
                    required
                  >
                </div>
                
                <div class="form-group">
                  <label for="logo" class="form-label">URL del Logo</label>
                  <input 
                    id="logo"
                    v-model="formData.logo" 
                    type="url" 
                    class="form-input"
                    placeholder="https://ejemplo.com/logo.png"
                  >
                </div>
                
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminNavbar from '@/components/AdminNavbar.vue'
import { apiCall } from '@/config/api'

const router = useRouter()
const route = useRoute()

// Estado reactivo
const loading = ref(false)
const saving = ref(false)
const marca = ref(null)

const formData = ref({
  codigo: '',
  nombre: '',
  logo: ''
})

// Computed
const isEditing = computed(() => {
  return route.params.id !== undefined
})

// Métodos
const loadMarca = async () => {
  if (!isEditing.value) return
  
  loading.value = true
  try {
    const response = await apiCall(`/admin/marcas/${route.params.id}`)
    if (response.success) {
      marca.value = response.data
      
      // Mapear datos de la marca al formulario
      formData.value = {
        codigo: marca.value.codigo || '',
        nombre: marca.value.nombre || '',
        logo: marca.value.logo || ''
      }
    }
  } catch (error) {
    console.error('Error cargando marca:', error)
    alert('Error al cargar la marca: ' + error.message)
  } finally {
    loading.value = false
  }
}

const saveMarca = async () => {
  // Validaciones básicas
  if (!formData.value.codigo.trim()) {
    alert('El código de la marca es obligatorio')
    return
  }
  
  if (!formData.value.nombre.trim()) {
    alert('El nombre de la marca es obligatorio')
    return
  }
  
  saving.value = true
  try {
    const data = {
      ...formData.value,
      codigo: parseInt(formData.value.codigo),
      nombre: formData.value.nombre.trim()
    }
    
    if (isEditing.value) {
      const response = await apiCall(`/admin/marcas/${route.params.id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      if (response.success) {
        console.log('Marca actualizada exitosamente')
        router.push('/admin/marcas')
      }
    } else {
      const response = await apiCall('/admin/marcas', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (response.success) {
        console.log('Marca creada exitosamente')
        router.push('/admin/marcas')
      }
    }
  } catch (error) {
    console.error('Error guardando marca:', error)
    alert('Error al guardar la marca: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadMarca()
})
</script>

<style scoped>
.admin-marca-form {
  min-height: 100vh;
  background: #f8fafc;
}

.main-content {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.form-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.marca-form {
  padding: 2rem;
}

.form-section {
  margin-bottom: 3rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f3f4f6;
}

.section-title i {
  color: #3b82f6;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group-full {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
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
  border: 1px solid #d1d5db;
}

.btn-ghost:hover {
  background: #f3f4f6;
  color: #374151;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .marca-form {
    padding: 1rem;
  }
}
</style>
