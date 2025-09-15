<template>
  <div class="admin-usuarios">
    <AdminNavbar />

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Header Section -->
        <div class="page-header">
          <div class="header-content">
            <div class="header-main">
              <h1 class="page-title">Gestión de Usuarios</h1>
              <p class="page-subtitle">Administra los usuarios del sistema</p>
            </div>
            <div class="header-actions">
              <button @click="openCreateModal" class="btn btn-primary">
                <i class="fas fa-plus"></i>
                Nuevo Usuario
              </button>
            </div>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="search-section">
          <div class="search-container">
            <div class="search-input-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar usuarios por nombre, email o rol..."
                class="search-input"
                @input="handleSearch"
              >
            </div>
            <div class="search-filters">
              <select v-model="selectedRole" @change="filterUsers" class="filter-select">
                <option value="">Todos los roles</option>
                <option value="administrador">Administrador</option>
                <option value="usuario">Usuario</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Users List -->
        <div class="users-section">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando usuarios...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredUsers.length === 0" class="empty-state">
            <i class="fas fa-users"></i>
            <h3>No se encontraron usuarios</h3>
            <p v-if="searchQuery || selectedRole">
              Intenta ajustar los filtros de búsqueda
            </p>
            <p v-else>
              No hay usuarios registrados en el sistema
            </p>
          </div>

          <!-- Users Table -->
          <div v-else class="users-table-container">
            <div class="table-header">
              <h3>
                {{ filteredUsers.length }} usuario{{ filteredUsers.length !== 1 ? 's' : '' }} 
                {{ searchQuery || selectedRole ? 'encontrado' + (filteredUsers.length !== 1 ? 's' : '') : 'total' + (filteredUsers.length !== 1 ? 'es' : '') }}
              </h3>
            </div>
            
            <div class="users-table">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th class="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="usuario in filteredUsers" :key="usuario.id" class="user-row">
                      <td class="user-id">{{ usuario.id }}</td>
                      <td class="user-username">
                        <div class="user-info">
                          <div class="user-avatar">
                            <i class="fas fa-user"></i>
                          </div>
                          <span class="username">{{ usuario.username }}</span>
                        </div>
                      </td>
                      <td class="user-email">{{ usuario.email }}</td>
                      <td class="user-role">
                        <span class="role-badge" :class="getRoleClass(usuario.rol)">
                          {{ usuario.rol }}
                        </span>
                      </td>
                      <td class="user-status">
                        <span class="status-badge status-active">Activo</span>
                      </td>
                      <td class="user-actions text-center">
                        <div class="action-buttons">
                          <button
                            @click="openEditModal(usuario)"
                            class="btn btn-sm btn-primary"
                            title="Editar usuario"
                          >
                            <i class="fas fa-edit"></i>
                          </button>
                          <button
                            v-if="usuario.id !== auth.currentUser?.id"
                            @click="openDeleteModal(usuario)"
                            class="btn btn-sm btn-danger"
                            title="Eliminar usuario"
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

        <!-- Error State -->
        <div v-if="error" class="alert alert-error">
          <i class="fas fa-exclamation-triangle"></i>
          {{ error }}
        </div>
      </div>
    </main>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Editar Usuario</h3>
          <button @click="closeEditModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveUser" class="user-form">
            <div class="form-group">
              <label for="username" class="form-label">Nombre de Usuario</label>
              <input
                id="username"
                v-model="editingUser.username"
                type="text"
                class="form-input"
                required
              >
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                v-model="editingUser.email"
                type="email"
                class="form-input"
                required
              >
            </div>

            <div class="form-group">
              <label for="rol" class="form-label">Rol</label>
              <select
                id="rol"
                v-model="editingUser.rol"
                class="form-select"
                required
              >
                <option value="usuario">Usuario</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Nueva Contraseña (opcional)</label>
              <input
                id="password"
                v-model="editingUser.password"
                type="password"
                class="form-input"
                placeholder="Dejar vacío para mantener contraseña actual"
              >
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button @click="closeEditModal" class="btn btn-ghost">
            Cancelar
          </button>
          <button 
            @click="saveUser" 
            class="btn btn-primary"
            :disabled="saving"
          >
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete User Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content modal-danger" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Eliminar Usuario</h3>
          <button @click="closeDeleteModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="warning-content">
            <div class="warning-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="warning-message">
              <h4>¿Estás seguro?</h4>
              <p>
                Vas a eliminar permanentemente al usuario 
                <strong>"{{ deletingUser.username }}"</strong>.
              </p>
              <p class="warning-note">
                Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn btn-ghost">
            Cancelar
          </button>
          <button 
            @click="deleteUser" 
            class="btn btn-danger"
            :disabled="deleting"
          >
            <i v-if="deleting" class="fas fa-spinner fa-spin"></i>
            {{ deleting ? 'Eliminando...' : 'Eliminar Usuario' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create User Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Crear Nuevo Usuario</h3>
          <button @click="closeCreateModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="createUser" class="user-form">
            <div class="form-group">
              <label for="new-username" class="form-label">Nombre de Usuario</label>
              <input
                id="new-username"
                v-model="newUser.username"
                type="text"
                class="form-input"
                required
                placeholder="Ingresa el nombre de usuario"
              >
            </div>

            <div class="form-group">
              <label for="new-email" class="form-label">Email</label>
              <input
                id="new-email"
                v-model="newUser.email"
                type="email"
                class="form-input"
                required
                placeholder="usuario@ejemplo.com"
              >
            </div>

            <div class="form-group">
              <label for="new-rol" class="form-label">Rol</label>
              <select
                id="new-rol"
                v-model="newUser.rol"
                class="form-select"
                required
              >
                <option value="">Selecciona un rol</option>
                <option value="usuario">Usuario</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            <div class="form-group">
              <label for="new-password" class="form-label">Contraseña</label>
              <input
                id="new-password"
                v-model="newUser.password"
                type="password"
                class="form-input"
                required
                placeholder="Contraseña segura"
                minlength="6"
              >
            </div>

            <div class="form-group">
              <label for="confirm-password" class="form-label">Confirmar Contraseña</label>
              <input
                id="confirm-password"
                v-model="newUser.confirmPassword"
                type="password"
                class="form-input"
                required
                placeholder="Confirma la contraseña"
                minlength="6"
              >
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button @click="closeCreateModal" class="btn btn-ghost">
            Cancelar
          </button>
          <button 
            @click="createUser" 
            class="btn btn-primary"
            :disabled="creating || !isFormValid"
          >
            <i v-if="creating" class="fas fa-spinner fa-spin"></i>
            {{ creating ? 'Creando...' : 'Crear Usuario' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/stores/auth'
import { apiCall } from '@/config/api'
import AdminNavbar from '@/components/AdminNavbar.vue'

const router = useRouter()

// Estado
const users = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const selectedRole = ref('')

// Modal state
const showEditModal = ref(false)
const editingUser = ref({})
const saving = ref(false)

// Delete modal state
const showDeleteModal = ref(false)
const deletingUser = ref({})
const deleting = ref(false)

// Create modal state
const showCreateModal = ref(false)
const newUser = ref({
  username: '',
  email: '',
  rol: '',
  password: '',
  confirmPassword: ''
})
const creating = ref(false)

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.rol.toLowerCase().includes(query)
    )
  }

  // Filtrar por rol
  if (selectedRole.value) {
    filtered = filtered.filter(user => 
      user.rol.toLowerCase() === selectedRole.value.toLowerCase()
    )
  }

  return filtered
})

const isFormValid = computed(() => {
  return newUser.value.username.trim() !== '' &&
         newUser.value.email.trim() !== '' &&
         newUser.value.rol !== '' &&
         newUser.value.password.length >= 6 &&
         newUser.value.password === newUser.value.confirmPassword
})

// Métodos
const loadUsers = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const data = await apiCall('/admin/usuarios')
    users.value = data.usuarios || []
  } catch (err) {
    console.error('Error loading users:', err)
    error.value = err.message || 'Error al cargar los usuarios'
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // La búsqueda es reactiva a través del computed
}

const filterUsers = () => {
  // El filtrado es reactivo a través del computed
}

const openEditModal = (user) => {
  editingUser.value = {
    id: user.id,
    username: user.username,
    email: user.email,
    rol: user.rol,
    password: ''
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingUser.value = {}
}

const openDeleteModal = (user) => {
  deletingUser.value = {
    id: user.id,
    username: user.username
  }
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingUser.value = {}
}

const openCreateModal = () => {
  newUser.value = {
    username: '',
    email: '',
    rol: '',
    password: '',
    confirmPassword: ''
  }
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newUser.value = {
    username: '',
    email: '',
    rol: '',
    password: '',
    confirmPassword: ''
  }
}

const createUser = async () => {
  creating.value = true
  error.value = ''

  try {
    // Validar que las contraseñas coincidan
    if (newUser.value.password !== newUser.value.confirmPassword) {
      throw new Error('Las contraseñas no coinciden')
    }

    const userData = {
      username: newUser.value.username,
      email: newUser.value.email,
      rol: newUser.value.rol,
      password: newUser.value.password
    }

    await apiCall('/admin/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData)
    })

    // Recargar usuarios
    await loadUsers()
    closeCreateModal()
    
    // Mostrar mensaje de éxito
    console.log(`Usuario "${newUser.value.username}" creado exitosamente`)
    
  } catch (err) {
    console.error('Error creating user:', err)
    error.value = err.message || 'Error al crear el usuario'
  } finally {
    creating.value = false
  }
}

const deleteUser = async () => {
  deleting.value = true
  error.value = ''

  try {
    await apiCall(`/admin/usuarios/${deletingUser.value.id}`, {
      method: 'DELETE'
    })

    // Recargar usuarios
    await loadUsers()
    closeDeleteModal()
    
    // Mostrar mensaje de éxito
    console.log(`Usuario "${deletingUser.value.username}" eliminado exitosamente`)
    
  } catch (err) {
    console.error('Error deleting user:', err)
    error.value = err.message || 'Error al eliminar el usuario'
  } finally {
    deleting.value = false
  }
}

const saveUser = async () => {
  saving.value = true
  error.value = ''

  try {
    const userData = {
      username: editingUser.value.username,
      email: editingUser.value.email,
      rol: editingUser.value.rol
    }

    // Solo incluir password si se especificó
    if (editingUser.value.password) {
      userData.password = editingUser.value.password
    }

    await apiCall(`/admin/usuarios/${editingUser.value.id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })

    // Recargar usuarios
    await loadUsers()
    closeEditModal()
    
    // Mostrar mensaje de éxito (podrías usar una librería de notificaciones)
    console.log('Usuario actualizado exitosamente')
    
  } catch (err) {
    console.error('Error saving user:', err)
    error.value = err.message || 'Error al guardar los cambios'
  } finally {
    saving.value = false
  }
}

const getRoleClass = (role) => {
  switch (role?.toLowerCase()) {
    case 'administrador':
      return 'role-admin'
    case 'usuario':
      return 'role-user'
    default:
      return 'role-default'
  }
}



// Lifecycle
onMounted(async () => {
  // Verificar autenticación y permisos
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }

  if (auth.currentUser?.rol?.toLowerCase() !== 'administrador') {
    router.push('/dashboard')
    return
  }

  await loadUsers()
})
</script>

<style scoped>
.admin-usuarios {
  min-height: 100vh;
  background: #f8fafc;
}

/* Main Content */
.main-content {
  padding: 2rem 0;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.header-main {
  flex: 1;
}

.page-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.page-subtitle {
  margin: 0;
  font-size: 1.125rem;
  color: #6b7280;
}

.header-actions {
  flex-shrink: 0;
}

/* Search Section */
.search-section {
  margin-bottom: 2rem;
}

.search-container {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  min-width: 160px;
}

/* States */
.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: #374151;
}

/* Users Table */
.users-table-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.table-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.user-row:hover {
  background: #f9fafb;
}

.user-id {
  font-family: monospace;
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.username {
  font-weight: 600;
  color: #111827;
}

.user-email {
  color: #6b7280;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.role-admin {
  background: #fef3c7;
  color: #d97706;
}

.role-user {
  background: #dbeafe;
  color: #2563eb;
}

.role-default {
  background: #f3f4f6;
  color: #6b7280;
}

.user-status {
  text-align: center;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-active {
  background: #d1fae5;
  color: #059669;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
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
  padding: 0.5rem;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

/* Form */
.user-form {
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

.form-input, .form-select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
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
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-danger:disabled {
  opacity: 0.5;
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

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.text-center {
  text-align: center;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

/* Modal danger variant */
.modal-danger .modal-header {
  border-bottom-color: #fecaca;
}

.modal-danger .modal-title {
  color: #dc2626;
}

/* Warning content */
.warning-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.warning-icon {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  font-size: 1.25rem;
}

.warning-message h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.warning-message p {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
  line-height: 1.5;
}

.warning-note {
  font-weight: 500;
  color: #dc2626 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem 0;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .search-container {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input-wrapper {
    min-width: auto;
  }

  .table th, .table td {
    padding: 0.75rem;
    font-size: 0.875rem;
  }

  .user-avatar {
    width: 2rem;
    height: 2rem;
  }

  .modal-content {
    margin: 1rem;
    max-width: none;
  }

  .modal-header, .modal-body, .modal-footer {
    padding: 1rem;
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 640px) {
  .table-responsive {
    font-size: 0.75rem;
  }
  
  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .user-avatar {
    width: 1.5rem;
    height: 1.5rem;
  }
}
</style>
