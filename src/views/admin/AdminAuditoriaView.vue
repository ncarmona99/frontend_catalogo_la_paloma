<template>
  <div class="admin-auditoria">
    <AdminNavbar />

    <main class="main-content">
      <div class="container">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">
              <i class="fas fa-clipboard-list"></i>
              Logs de Auditoría
            </h1>
            <p class="page-subtitle">
              Registro de todas las actividades realizadas en el sistema
            </p>
          </div>
          <div class="header-actions">
            <button
              @click="exportLogs"
              class="btn btn-secondary"
              :disabled="loading"
            >
              <i class="fas fa-download"></i>
              Exportar CSV
            </button>
            <button
              @click="refreshLogs"
              class="btn btn-primary"
              :disabled="loading"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Actualizar
            </button>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="stats-grid" v-if="stats">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalLogs }}</div>
              <div class="stat-label">Total de Acciones</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">
                {{ stats.accionesPorUsuario.length }}
              </div>
              <div class="stat-label">Usuarios Activos</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-database"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.accionesPorTabla.length }}</div>
              <div class="stat-label">Tablas Afectadas</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-calendar-day"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ todayLogs }}</div>
              <div class="stat-label">Acciones Hoy</div>
            </div>
          </div>
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
              <label class="filter-label">Buscar</label>
              <input
                v-model="filters.busqueda"
                type="text"
                placeholder="Usuario, descripción o tabla..."
                class="filter-input"
                @input="debouncedSearch"
              />
            </div>

            <div class="filter-group">
              <label class="filter-label">Acción</label>
              <select
                v-model="filters.accion"
                class="filter-select"
                @change="applyFilters"
              >
                <option value="">Todas las acciones</option>
                <option value="CREATE">Crear</option>
                <option value="UPDATE">Actualizar</option>
                <option value="DELETE">Eliminar</option>
                <option value="LOGIN">Iniciar sesión</option>
                <option value="LOGOUT">Cerrar sesión</option>
                <option value="PASSWORD_CHANGE">Cambiar contraseña</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Tabla</label>
              <select
                v-model="filters.tablaAfectada"
                class="filter-select"
                @change="applyFilters"
              >
                <option value="">Todas las tablas</option>
                <option value="Producto">Producto</option>
                <option value="Marca">Marca</option>
                <option value="Usuario">Usuario</option>
                <option value="Familia">Familia</option>
                <option value="Temporada">Temporada</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Usuario</label>
              <select
                v-model="filters.usuarioId"
                class="filter-select"
                @change="applyFilters"
              >
                <option value="">Todos los usuarios</option>
                <option
                  v-for="usuario in usuarios"
                  :key="usuario.id"
                  :value="usuario.id"
                >
                  {{ usuario.username }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Desde</label>
              <input
                v-model="filters.fechaDesde"
                type="date"
                class="filter-input"
                @change="applyFilters"
              />
            </div>

            <div class="filter-group">
              <label class="filter-label">Hasta</label>
              <input
                v-model="filters.fechaHasta"
                type="date"
                class="filter-input"
                @change="applyFilters"
              />
            </div>
          </div>
        </div>

        <!-- Tabla de logs -->
        <div class="logs-section">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando logs de auditoría...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="logs.length === 0" class="empty-state">
            <i class="fas fa-clipboard-list"></i>
            <h3>No se encontraron logs</h3>
            <p>
              No hay registros de auditoría que coincidan con los filtros
              aplicados.
            </p>
          </div>

          <!-- Logs Table -->
          <div v-else class="table-container">
            <table class="logs-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Tabla</th>
                  <th>Registro</th>
                  <th>Descripción</th>
                  <th>IP</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in logs" :key="log.id" class="log-row">
                  <td class="log-date">
                    <div class="date-time">
                      <div class="date">{{ formatDate(log.fecha) }}</div>
                      <div class="time">{{ formatTime(log.fecha) }}</div>
                    </div>
                  </td>
                  <td class="log-user">
                    <div class="user-info">
                      <div class="username">{{ log.usuario_nombre }}</div>
                      <div class="user-id">ID: {{ log.usuario_id }}</div>
                    </div>
                  </td>
                  <td class="log-action">
                    <span
                      class="action-badge"
                      :class="getActionClass(log.accion)"
                    >
                      {{ getActionLabel(log.accion) }}
                    </span>
                  </td>
                  <td class="log-table">
                    <span class="table-badge">{{ log.tabla_afectada }}</span>
                  </td>
                  <td class="log-record">
                    <span v-if="log.registro_id" class="record-id">
                      #{{ log.registro_id }}
                    </span>
                    <span v-else class="no-record">-</span>
                  </td>
                  <td class="log-description">
                    <div class="description-text" :title="log.descripcion">
                      {{ log.descripcion || "-" }}
                    </div>
                  </td>
                  <td class="log-ip">
                    <span class="ip-address">{{ log.ip_address || "-" }}</span>
                  </td>
                  <td class="log-actions">
                    <button
                      @click="viewLogDetails(log)"
                      class="btn btn-sm btn-ghost"
                      title="Ver detalles"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <Pagination
            v-if="pagination.totalPaginas > 1"
            :current-page="pagination.pagina"
            :total-pages="pagination.totalPaginas"
            :total-items="pagination.total"
            :items-per-page="pagination.limite"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </main>

    <!-- Modal de detalles del log -->
    <div v-if="selectedLog" class="modal-overlay" @click="closeLogDetails">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Detalles del Log de Auditoría</h3>
          <button @click="closeLogDetails" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="log-details">
            <div class="detail-section">
              <h4>Información General</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>ID:</label>
                  <span>{{ selectedLog.id }}</span>
                </div>
                <div class="detail-item">
                  <label>Fecha:</label>
                  <span>{{ formatDateTime(selectedLog.fecha) }}</span>
                </div>
                <div class="detail-item">
                  <label>Usuario:</label>
                  <span
                    >{{ selectedLog.usuario_nombre }} (ID:
                    {{ selectedLog.usuario_id }})</span
                  >
                </div>
                <div class="detail-item">
                  <label>Acción:</label>
                  <span
                    class="action-badge"
                    :class="getActionClass(selectedLog.accion)"
                  >
                    {{ getActionLabel(selectedLog.accion) }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Tabla:</label>
                  <span class="table-badge">{{
                    selectedLog.tabla_afectada
                  }}</span>
                </div>
                <div class="detail-item">
                  <label>Registro ID:</label>
                  <span>{{ selectedLog.registro_id || "N/A" }}</span>
                </div>
                <div class="detail-item">
                  <label>IP:</label>
                  <span>{{ selectedLog.ip_address || "N/A" }}</span>
                </div>
                <div class="detail-item">
                  <label>Descripción:</label>
                  <span>{{ selectedLog.descripcion || "N/A" }}</span>
                </div>
              </div>
            </div>

            <div v-if="selectedLog.datos_anteriores" class="detail-section">
              <h4>Datos Anteriores</h4>
              <pre class="json-data">{{
                JSON.stringify(selectedLog.datos_anteriores, null, 2)
              }}</pre>
            </div>

            <div v-if="selectedLog.datos_nuevos" class="detail-section">
              <h4>Datos Nuevos</h4>
              <pre class="json-data">{{
                JSON.stringify(selectedLog.datos_nuevos, null, 2)
              }}</pre>
            </div>

            <div v-if="selectedLog.user_agent" class="detail-section">
              <h4>User Agent</h4>
              <div class="user-agent">{{ selectedLog.user_agent }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminNavbar from "@/components/AdminNavbar.vue";
import Pagination from "@/components/Pagination.vue";
import { api } from "@/config/api";

export default {
  name: "AdminAuditoriaView",
  components: {
    AdminNavbar,
    Pagination,
  },
  data() {
    return {
      loading: false,
      logs: [],
      stats: null,
      usuarios: [],
      selectedLog: null,
      pagination: {
        pagina: 1,
        limite: 50,
        total: 0,
        totalPaginas: 0,
      },
      filters: {
        busqueda: "",
        accion: "",
        tablaAfectada: "",
        usuarioId: "",
        fechaDesde: "",
        fechaHasta: "",
      },
      searchTimeout: null,
    };
  },
  computed: {
    hasActiveFilters() {
      return Object.values(this.filters).some((value) => value !== "");
    },
    totalLogs() {
      return this.pagination.total;
    },
    todayLogs() {
      if (!this.stats?.actividadPorDia) return 0;
      const today = new Date().toISOString().split("T")[0];
      const todayData = this.stats.actividadPorDia.find(
        (item) => item.dia === today
      );
      return todayData ? todayData.total : 0;
    },
  },
  async mounted() {
    await this.loadInitialData();
  },
  methods: {
    async loadInitialData() {
      await Promise.all([
        this.loadLogs(),
        this.loadStats(),
        this.loadUsuarios(),
      ]);
    },
    async loadLogs() {
      this.loading = true;
      try {
        const params = new URLSearchParams({
          pagina: this.pagination.pagina,
          limite: this.pagination.limite,
          ...this.filters,
        });

        const response = await api.get(`/audit/logs?${params}`);

        if (response.data.success) {
          this.logs = response.data.data;
          this.pagination = response.data.pagination;
        }
      } catch (error) {
        console.error("Error cargando logs:", error);
        this.$toast.error("Error al cargar los logs de auditoría");
      } finally {
        this.loading = false;
      }
    },
    async loadStats() {
      try {
        const response = await api.get("/audit/stats");
        if (response.data.success) {
          this.stats = response.data.data;
        }
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      }
    },
    async loadUsuarios() {
      try {
        const response = await api.get("/admin/usuarios");
        if (response.data.success) {
          this.usuarios = response.data.usuarios;
        }
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    },
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.pagination.pagina = 1;
        this.loadLogs();
      }, 500);
    },
    applyFilters() {
      this.pagination.pagina = 1;
      this.loadLogs();
    },
    clearFilters() {
      this.filters = {
        busqueda: "",
        accion: "",
        tablaAfectada: "",
        usuarioId: "",
        fechaDesde: "",
        fechaHasta: "",
      };
      this.pagination.pagina = 1;
      this.loadLogs();
    },
    handlePageChange(page) {
      this.pagination.pagina = page;
      this.loadLogs();
    },
    async refreshLogs() {
      await this.loadInitialData();
    },
    async exportLogs() {
      try {
        const params = new URLSearchParams(this.filters);
        const response = await api.get(`/audit/export?${params}`, {
          responseType: "blob",
        });

        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `audit_logs_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.$toast.success("Logs exportados exitosamente");
      } catch (error) {
        console.error("Error exportando logs:", error);
        this.$toast.error("Error al exportar los logs");
      }
    },
    viewLogDetails(log) {
      this.selectedLog = log;
    },
    closeLogDetails() {
      this.selectedLog = null;
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("es-CL");
    },
    formatTime(dateString) {
      return new Date(dateString).toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    formatDateTime(dateString) {
      return new Date(dateString).toLocaleString("es-CL");
    },
    getActionLabel(accion) {
      const labels = {
        CREATE: "Crear",
        UPDATE: "Actualizar",
        DELETE: "Eliminar",
        LOGIN: "Iniciar sesión",
        LOGOUT: "Cerrar sesión",
        PASSWORD_CHANGE: "Cambiar contraseña",
      };
      return labels[accion] || accion;
    },
    getActionClass(accion) {
      const classes = {
        CREATE: "action-create",
        UPDATE: "action-update",
        DELETE: "action-delete",
        LOGIN: "action-login",
        LOGOUT: "action-logout",
        PASSWORD_CHANGE: "action-password",
      };
      return classes[accion] || "action-default";
    },
  },
};
</script>

<style scoped>
.admin-auditoria {
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

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-size: 2rem;
  font-weight: 700;
}

.header-content h1 i {
  margin-right: 0.75rem;
  color: #3b82f6;
}

.page-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Filtros */
.filters-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filters-title {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.filters-title i {
  margin-right: 0.5rem;
  color: #3b82f6;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.filter-input,
.filter-select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Tabla */
.logs-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table th {
  background: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.logs-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

.log-row:hover {
  background: #f8fafc;
}

.log-date .date-time {
  display: flex;
  flex-direction: column;
}

.log-date .date {
  font-weight: 500;
  color: #1e293b;
}

.log-date .time {
  color: #64748b;
  font-size: 0.75rem;
}

.log-user .user-info {
  display: flex;
  flex-direction: column;
}

.log-user .username {
  font-weight: 500;
  color: #1e293b;
}

.log-user .user-id {
  color: #64748b;
  font-size: 0.75rem;
}

.action-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.action-create {
  background: #dcfce7;
  color: #166534;
}
.action-update {
  background: #dbeafe;
  color: #1e40af;
}
.action-delete {
  background: #fee2e2;
  color: #dc2626;
}
.action-login {
  background: #f0fdf4;
  color: #15803d;
}
.action-logout {
  background: #fef3c7;
  color: #d97706;
}
.action-password {
  background: #f3e8ff;
  color: #7c3aed;
}
.action-default {
  background: #f1f5f9;
  color: #475569;
}

.table-badge {
  padding: 0.25rem 0.5rem;
  background: #e2e8f0;
  color: #475569;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.record-id {
  color: #3b82f6;
  font-weight: 500;
  font-family: monospace;
}

.no-record {
  color: #94a3b8;
  font-style: italic;
}

.description-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ip-address {
  font-family: monospace;
  font-size: 0.75rem;
  color: #64748b;
}

/* Estados */
.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.loading-state .spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.empty-state i {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #374151;
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

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
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
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background: #f1f5f9;
}

.modal-body {
  padding: 1.5rem;
}

.log-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.detail-item span {
  color: #1e293b;
  font-size: 0.875rem;
}

.json-data {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  font-family: "Courier New", monospace;
  font-size: 0.75rem;
  color: #374151;
  overflow-x: auto;
  white-space: pre-wrap;
}

.user-agent {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.875rem;
  color: #374151;
  word-break: break-all;
}

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #64748b;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #475569;
}

.btn-ghost {
  background: transparent;
  color: #64748b;
  border: 1px solid #d1d5db;
}

.btn-ghost:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #9ca3af;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
}

/* Animaciones */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-actions {
    justify-content: stretch;
  }

  .header-actions .btn {
    flex: 1;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .logs-table {
    font-size: 0.75rem;
  }

  .logs-table th,
  .logs-table td {
    padding: 0.75rem 0.5rem;
  }

  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
}
</style>
