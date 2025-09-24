<template>
  <div class="admin-productos">
    <AdminNavbar />

    <main class="main-content">
      <div class="container">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">
              <i class="fas fa-box"></i>
              Administración de Productos
            </h1>
            <p class="page-subtitle">
              Gestiona el catálogo completo de productos
            </p>
          </div>
          <div class="header-actions">
            <button
              @click="openSyncModal"
              class="btn btn-secondary"
              :disabled="syncing"
            >
              <i v-if="syncing" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-sync-alt"></i>
              {{ syncing ? "Sincronizando..." : "Sincronizar Productos" }}
            </button>
            <!-- Botón de crear producto deshabilitado - Solo sincronización -->
            <button
              class="btn btn-primary"
              disabled
              title="Los productos se crean mediante sincronización"
            >
              <i class="fas fa-plus"></i>
              Nuevo Producto (Solo Sincronización)
            </button>
          </div>
        </div>

        <!-- Mensaje informativo sobre sincronización -->
        <div class="info-card">
          <div class="info-content">
            <div class="info-icon">
              <i class="fas fa-info-circle"></i>
            </div>
            <div class="info-text">
              <h4>Gestión de Productos</h4>
              <p>
                Los productos se crean y actualizan automáticamente mediante
                <strong>sincronización</strong>. Puedes editar la información de
                productos existentes, pero no crear nuevos productos
                manualmente.
              </p>
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
              <label class="filter-label">Búsqueda</label>
              <input
                v-model="filters.busqueda"
                type="text"
                placeholder="Buscar por nombre, código, SKU..."
                class="filter-input"
              />
            </div>

            <div class="filter-group">
              <label class="filter-label">Categoría</label>
              <select v-model="filters.familia" class="filter-select">
                <option value="">Todas las categorías</option>
                <option
                  v-for="familia in familias"
                  :key="familia.id"
                  :value="familia.id"
                >
                  {{ familia.nombre }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Marca</label>
              <select v-model="filters.marca" class="filter-select">
                <option value="">Todas las marcas</option>
                <option
                  v-for="marca in marcas"
                  :key="marca.id"
                  :value="marca.id"
                >
                  {{ marca.nombre }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Estado</label>
              <select v-model="filters.estado" class="filter-select">
                <option value="">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="DESCONTINUADO">Descontinuado</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Temporada</label>
              <select v-model="filters.temporada" class="filter-select">
                <option value="">Todas las temporadas</option>
                <option
                  v-for="temporada in temporadas"
                  :key="temporada.id"
                  :value="temporada.id"
                >
                  {{ temporada.nombre }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Venta Zonal</label>
              <select v-model="filters.zona" class="filter-select">
                <option value="">Todos los productos</option>
                <option value="1">Solo Venta Zonal</option>
                <option value="0">Solo No Zonal</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Stock</label>
              <select v-model="filters.stock" class="filter-select">
                <option value="">Todos los productos</option>
                <option value="con_stock">Solo con Stock</option>
                <option value="sin_stock">Solo sin Stock</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-box"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalProductos }}</div>
              <div class="stat-label">Total Productos</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ productosActivos }}</div>
              <div class="stat-label">Productos Activos</div>
            </div>
          </div>
        </div>

        <!-- Tabla de productos -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Lista de Productos</h3>
            <div class="card-actions">
              <div class="pagination-info">
                Mostrando {{ paginationInfo.from }}-{{ paginationInfo.to }} de
                {{ totalProductos }}
              </div>
            </div>
          </div>

          <div class="card-body">
            <div v-if="loading" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Cargando productos...</span>
            </div>

            <div v-else-if="productos.length === 0" class="empty-state">
              <i class="fas fa-box"></i>
              <h3>No hay productos</h3>
              <p>Comienza agregando tu primer producto al catálogo</p>
              <router-link to="/admin/productos/nuevo" class="btn btn-primary">
                <i class="fas fa-plus"></i>
                Crear Producto
              </router-link>
            </div>

            <div v-else class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th
                      @click="sort('id')"
                      class="sortable"
                      :class="getSortClass('id')"
                    >
                      ID
                      <i class="fas fa-sort" v-if="sortField !== 'id'"></i>
                      <i
                        class="fas fa-sort-up"
                        v-if="sortField === 'id' && sortOrder === 'asc'"
                      ></i>
                      <i
                        class="fas fa-sort-down"
                        v-if="sortField === 'id' && sortOrder === 'desc'"
                      ></i>
                    </th>
                    <th>Imagen</th>
                    <th
                      @click="sort('codigo')"
                      class="sortable"
                      :class="getSortClass('codigo')"
                    >
                      Código
                      <i class="fas fa-sort" v-if="sortField !== 'codigo'"></i>
                      <i
                        class="fas fa-sort-up"
                        v-if="sortField === 'codigo' && sortOrder === 'asc'"
                      ></i>
                      <i
                        class="fas fa-sort-down"
                        v-if="sortField === 'codigo' && sortOrder === 'desc'"
                      ></i>
                    </th>
                    <th
                      @click="sort('descripcion')"
                      class="sortable"
                      :class="getSortClass('descripcion')"
                    >
                      Descripción
                      <i
                        class="fas fa-sort"
                        v-if="sortField !== 'descripcion'"
                      ></i>
                      <i
                        class="fas fa-sort-up"
                        v-if="
                          sortField === 'descripcion' && sortOrder === 'asc'
                        "
                      ></i>
                      <i
                        class="fas fa-sort-down"
                        v-if="
                          sortField === 'descripcion' && sortOrder === 'desc'
                        "
                      ></i>
                    </th>
                    <th
                      @click="sort('familia_nombre')"
                      class="sortable"
                      :class="getSortClass('familia_nombre')"
                    >
                      Categoría
                      <i
                        class="fas fa-sort"
                        v-if="sortField !== 'familia_nombre'"
                      ></i>
                      <i
                        class="fas fa-sort-up"
                        v-if="
                          sortField === 'familia_nombre' && sortOrder === 'asc'
                        "
                      ></i>
                      <i
                        class="fas fa-sort-down"
                        v-if="
                          sortField === 'familia_nombre' && sortOrder === 'desc'
                        "
                      ></i>
                    </th>
                    <th
                      @click="sort('marca_nombre')"
                      class="sortable"
                      :class="getSortClass('marca_nombre')"
                    >
                      Marca
                      <i
                        class="fas fa-sort"
                        v-if="sortField !== 'marca_nombre'"
                      ></i>
                      <i
                        class="fas fa-sort-up"
                        v-if="
                          sortField === 'marca_nombre' && sortOrder === 'asc'
                        "
                      ></i>
                      <i
                        class="fas fa-sort-down"
                        v-if="
                          sortField === 'marca_nombre' && sortOrder === 'desc'
                        "
                      ></i>
                    </th>
                    <th
                      @click="sort('stock_total')"
                      class="sortable"
                      :class="getSortClass('stock_total')"
                    >
                      Stock
                      <i
                        class="fas fa-sort"
                        v-if="sortField !== 'stock_total'"
                      ></i>
                      <i
                        class="fas fa-sort-up"
                        v-if="
                          sortField === 'stock_total' && sortOrder === 'asc'
                        "
                      ></i>
                      <i
                        class="fas fa-sort-down"
                        v-if="
                          sortField === 'stock_total' && sortOrder === 'desc'
                        "
                      ></i>
                    </th>
                    <th
                      @click="sort('estado')"
                      class="sortable"
                      :class="getSortClass('estado')"
                    >
                      Estado
                      <i class="fas fa-sort" v-if="sortField !== 'estado'"></i>
                      <i
                        class="fas fa-sort-up"
                        v-if="sortField === 'estado' && sortOrder === 'asc'"
                      ></i>
                      <i
                        class="fas fa-sort-down"
                        v-if="sortField === 'estado' && sortOrder === 'desc'"
                      ></i>
                    </th>
                    <th
                      @click="sort('zona')"
                      class="sortable"
                      :class="getSortClass('zona')"
                    >
                      Venta Zonal
                      <i class="fas fa-sort" v-if="sortField !== 'zona'"></i>
                      <i
                        class="fas fa-sort-up"
                        v-if="sortField === 'zona' && sortOrder === 'asc'"
                      ></i>
                      <i
                        class="fas fa-sort-down"
                        v-if="sortField === 'zona' && sortOrder === 'desc'"
                      ></i>
                    </th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="producto in productos" :key="producto.id">
                    <td>{{ producto.id }}</td>
                    <td>
                      <div class="product-image-cell">
                        <div
                          class="product-image"
                          @click="openImageModal(producto)"
                        >
                          <img
                            :src="getImageUrlWithLog(producto.imagenes[0]?.url)"
                            :alt="producto.descripcion"
                            @error="handleImageError"
                            @load="
                              () =>
                                console.log(
                                  '✅ Imagen cargada:',
                                  producto.imagenes[0]?.url
                                )
                            "
                          />
                          <div class="image-overlay">
                            <i class="fas fa-images"></i>
                            <span class="image-count">{{
                              producto.imagenes?.length || 0
                            }}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="product-codes">
                        <div class="code-main">
                          {{ producto.codigo_producto }}
                        </div>
                        <div class="code-secondary">
                          SKU: {{ producto.sku }}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="product-description">
                        <div class="description-text">
                          {{ producto.descripcion }}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        v-if="producto.familia"
                        class="badge badge-secondary"
                      >
                        {{ producto.familia.nombre }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <span v-if="producto.marca" class="badge badge-outline">
                        {{ producto.marca.nombre }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <div class="stock-info">
                        <div class="stock-main">
                          <span
                            class="stock-value"
                            :class="getStockClass(producto.stock)"
                          >
                            {{ producto.stock?.disponible || 0 }} disp.
                          </span>
                          <span class="stock-total">
                            / {{ producto.stock?.total || 0 }} total
                          </span>
                        </div>
                        <div
                          v-if="producto.stock?.reservado > 0"
                          class="stock-reserved"
                        >
                          {{ producto.stock.reservado }} reservado
                        </div>
                        <div
                          v-if="!producto.stock?.hay_stock"
                          class="stock-warning"
                        >
                          <i class="fas fa-exclamation-triangle"></i>
                          Agotado
                        </div>
                        <div
                          v-if="producto.stock?.fecha_actualizacion"
                          class="stock-updated"
                        >
                          Act:
                          {{
                            formatStockDate(producto.stock.fecha_actualizacion)
                          }}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        class="badge"
                        :class="getEstadoClass(producto.estado)"
                      >
                        {{ producto.estado }}
                      </span>
                    </td>
                    <td>
                      <div class="zonal-indicator">
                        <span
                          v-if="producto.zona === 1"
                          class="badge badge-zonal"
                          title="Producto de venta zonal"
                        >
                          <i class="fas fa-map-marker-alt"></i>
                          Zonal
                        </span>
                        <span
                          v-else
                          class="badge badge-no-zonal"
                          title="Producto de venta no zonal"
                        >
                          <i class="fas fa-ban"></i>
                          No Zonal
                        </span>
                      </div>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button
                          class="btn btn-sm btn-ghost"
                          @click="openImageModal(producto)"
                          title="Gestionar imágenes"
                        >
                          <i class="fas fa-images"></i>
                        </button>
                        <button
                          @click="openEditModal(producto)"
                          class="btn btn-sm btn-ghost"
                          title="Editar"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button
                          class="btn btn-sm btn-ghost"
                          @click="viewProducto(producto)"
                          title="Ver detalles"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        <button
                          class="btn btn-sm btn-ghost btn-danger"
                          @click="deleteProducto(producto)"
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

    <!-- Modal de Gestión de Imágenes -->
    <div v-if="showImageModal" class="modal-overlay" @click="closeImageModal">
      <div class="image-modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fas fa-images"></i>
            Gestión de Imágenes - {{ selectedProduct?.descripcion }}
          </h3>
          <button @click="closeImageModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- Información del Producto -->
          <div class="product-info">
            <div class="product-details">
              <span class="product-id">ID: {{ selectedProduct?.id }}</span>
              <span class="product-code">{{
                selectedProduct?.codigo_producto
              }}</span>
            </div>
          </div>

          <!-- Tabs para tipos de vista -->
          <div class="image-tabs">
            <button
              v-for="tipo in tiposVista"
              :key="tipo.id"
              class="tab-button"
              :class="{ active: activeTab === tipo.id }"
              @click="activeTab = tipo.id"
            >
              <i :class="tipo.icono"></i>
              {{ tipo.nombre }}
              <span class="image-badge">{{
                getImageCountByType(tipo.id)
              }}</span>
            </button>
          </div>

          <!-- Contenido del tab activo -->
          <div class="tab-content">
            <div class="images-section">
              <div class="section-header">
                <h4 class="section-title">
                  {{ getTipoNombre(activeTab) }}
                </h4>
                <button class="btn btn-primary btn-sm" @click="openUploadModal">
                  <i class="fas fa-upload"></i>
                  Subir Imagen
                </button>
              </div>

              <div class="images-grid">
                <div
                  v-for="imagen in getImagesByType(activeTab)"
                  :key="imagen.id"
                  class="image-item"
                >
                  <div class="image-preview">
                    <img
                      :src="getImageUrlWithLog(imagen.url)"
                      :alt="imagen.alt_text"
                      @error="handleImageError"
                      @load="
                        () =>
                          console.log('✅ Imagen modal cargada:', imagen.url)
                      "
                    />
                    <div class="image-actions">
                      <button
                        class="btn btn-sm btn-danger"
                        @click="deleteImage(imagen)"
                        title="Eliminar imagen"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div class="image-info">
                    <span class="image-order">Orden: {{ imagen.orden }}</span>
                  </div>
                </div>

                <!-- Placeholder cuando no hay imágenes -->
                <div
                  v-if="getImagesByType(activeTab).length === 0"
                  class="no-images"
                >
                  <i class="fas fa-image"></i>
                  <p>
                    No hay imágenes de tipo
                    {{ getTipoNombre(activeTab).toLowerCase() }}
                  </p>
                  <button
                    class="btn btn-primary btn-sm"
                    @click="openUploadModal"
                  >
                    <i class="fas fa-upload"></i>
                    Subir Primera Imagen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Subida de Imágenes -->
    <div v-if="showUploadModal" class="modal-overlay" @click="closeUploadModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fas fa-upload"></i>
            Subir Imagen - {{ getTipoNombre(activeTab) }}
          </h3>
          <button @click="closeUploadModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="uploadImage" class="upload-form">
            <div class="form-group">
              <label class="form-label">Archivo de Imagen *</label>
              <input
                type="file"
                ref="fileInput"
                @change="handleFileSelect"
                accept="image/*"
                class="form-input-file"
                required
              />
              <div class="file-info" v-if="selectedFile">
                <i class="fas fa-file-image"></i>
                <span>{{ selectedFile.name }}</span>
                <span class="file-size"
                  >({{ formatFileSize(selectedFile.size) }})</span
                >
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Orden</label>
              <input
                v-model.number="uploadData.orden"
                type="number"
                class="form-input"
                min="1"
                placeholder="1"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Texto Alternativo</label>
              <input
                v-model="uploadData.alt_text"
                type="text"
                class="form-input"
                placeholder="Descripción de la imagen"
              />
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button @click="closeUploadModal" class="btn btn-ghost">
            Cancelar
          </button>
          <button
            @click="uploadImage"
            class="btn btn-primary"
            :disabled="uploading || !selectedFile"
          >
            <i v-if="uploading" class="fas fa-spinner fa-spin"></i>
            {{ uploading ? "Subiendo..." : "Subir Imagen" }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Edición de Producto -->
  <div v-if="editModalOpen" class="modal-overlay" @click="closeEditModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <i class="fas fa-edit"></i>
          Editar Producto
        </h2>
        <button @click="closeEditModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="saveProducto" class="product-form">
          <!-- Información Básica -->
          <div class="form-section">
            <h3 class="section-title">
              <i class="fas fa-info-circle"></i>
              Información Básica
            </h3>

            <div class="form-grid">
              <div class="form-group">
                <label for="edit_codigo_producto" class="form-label"
                  >Código del Producto *</label
                >
                <input
                  id="edit_codigo_producto"
                  v-model="editFormData.codigo_producto"
                  type="text"
                  class="form-input"
                  placeholder="Ej: PROD001"
                  required
                />
              </div>

              <div class="form-group">
                <label for="edit_sku" class="form-label">SKU</label>
                <input
                  id="edit_sku"
                  v-model="editFormData.sku"
                  type="text"
                  class="form-input"
                  placeholder="Ej: SKU123"
                />
              </div>

              <div class="form-group form-group-full">
                <label for="edit_descripcion" class="form-label"
                  >Descripción *</label
                >
                <textarea
                  id="edit_descripcion"
                  v-model="editFormData.descripcion"
                  class="form-textarea"
                  placeholder="Descripción detallada del producto..."
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Clasificación -->
          <div class="form-section">
            <h3 class="section-title">
              <i class="fas fa-tags"></i>
              Clasificación
            </h3>

            <div class="form-grid">
              <div class="form-group">
                <label for="edit_familia_id" class="form-label">Familia</label>
                <select
                  id="edit_familia_id"
                  v-model="editFormData.familia_id"
                  class="form-select"
                >
                  <option value="">Seleccionar familia...</option>
                  <option
                    v-for="familia in familias"
                    :key="familia.id"
                    :value="familia.id"
                  >
                    {{ familia.nombre }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="edit_marca_id" class="form-label">Marca</label>
                <select
                  id="edit_marca_id"
                  v-model="editFormData.marca_id"
                  class="form-select"
                >
                  <option value="">Seleccionar marca...</option>
                  <option
                    v-for="marca in marcas"
                    :key="marca.id"
                    :value="marca.id"
                  >
                    {{ marca.nombre }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="edit_temporadas" class="form-label"
                  >Temporadas</label
                >
                <div class="temporadas-selector">
                  <div
                    v-for="temporada in temporadas"
                    :key="temporada.id"
                    class="temporada-chip"
                    :class="{
                      selected: editFormData.temporadas?.includes(temporada.id),
                    }"
                    @click="toggleTemporada(temporada.id)"
                  >
                    {{ temporada.nombre }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Estado -->
          <div class="form-section">
            <h3 class="section-title">
              <i class="fas fa-toggle-on"></i>
              Estado
            </h3>

            <div class="form-grid">
              <div class="form-group">
                <label for="edit_estado" class="form-label">Estado *</label>
                <select
                  id="edit_estado"
                  v-model="editFormData.estado"
                  class="form-select"
                  required
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                  <option value="SUSPENDIDO">Suspendido</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Venta Zonal</label>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      v-model="editFormData.zona"
                      true-value="1"
                      false-value="0"
                      class="checkbox-input"
                    />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-text">
                      <i class="fas fa-map-marker-alt"></i>
                      Producto de venta zonal
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button @click="closeEditModal" class="btn btn-ghost">Cancelar</button>
        <button
          @click="saveProducto"
          class="btn btn-primary"
          :disabled="saving"
        >
          <i v-if="saving" class="fas fa-spinner fa-spin"></i>
          {{ saving ? "Guardando..." : "Actualizar Producto" }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de Sincronización de Productos -->
  <div v-if="syncModalOpen" class="modal-overlay" @click="closeSyncModal">
    <div class="modal-container sync-modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <i class="fas fa-sync-alt"></i>
          Sincronizar Productos
        </h2>
        <button @click="closeSyncModal" class="btn btn-ghost btn-sm">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="!syncData" class="sync-info">
          <div class="sync-description">
            <p>
              Esta función comparará los productos entre la base de datos
              principal y la base de datos de stock, y agregará automáticamente
              cualquier producto que esté presente en stock pero ausente en el
              catálogo principal.
            </p>
            <div class="sync-warning">
              <i class="fas fa-exclamation-triangle"></i>
              <span>
                Solo se agregarán productos nuevos. Los productos existentes no
                serán modificados.
              </span>
            </div>
          </div>

          <div class="sync-actions">
            <button
              @click="checkSyncData"
              class="btn btn-primary"
              :disabled="loadingSync"
            >
              <i v-if="loadingSync" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-search"></i>
              {{ loadingSync ? "Analizando..." : "Analizar Diferencias" }}
            </button>
          </div>
        </div>

        <div v-if="syncData && !syncing" class="sync-results">
          <div class="sync-stats">
            <div class="stat-card">
              <div class="stat-value">{{ syncData.totalMainProducts }}</div>
              <div class="stat-label">Productos en Catálogo</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ syncData.totalStockProducts }}</div>
              <div class="stat-label">Productos en Stock</div>
            </div>
            <div class="stat-card highlight">
              <div class="stat-value">{{ syncData.missingProducts }}</div>
              <div class="stat-label">Productos a Sincronizar</div>
            </div>
          </div>

          <div v-if="syncData.missingProducts > 0" class="sync-preview">
            <h4>Productos que serán agregados:</h4>
            <div class="products-preview">
              <div
                v-for="product in syncData.productsToSync.slice(0, 5)"
                :key="product.codigo_producto"
                class="preview-item"
              >
                <strong>{{ product.codigo_producto }}</strong>
                <span>{{ product.descripcion || "Sin descripción" }}</span>
              </div>
              <div
                v-if="syncData.productsToSync.length > 5"
                class="preview-more"
              >
                ... y {{ syncData.productsToSync.length - 5 }} productos más
              </div>
            </div>
          </div>

          <div v-else class="sync-up-to-date">
            <i class="fas fa-check-circle"></i>
            <span
              >¡Tu catálogo está actualizado! No hay productos para
              sincronizar.</span
            >
          </div>
        </div>

        <div v-if="syncing" class="sync-progress">
          <div class="progress-indicator">
            <i class="fas fa-sync-alt fa-spin"></i>
            <span>Sincronizando productos...</span>
          </div>
          <p>Por favor espera mientras se agregan los productos faltantes.</p>
        </div>

        <div v-if="syncResult" class="sync-complete">
          <div
            class="result-header"
            :class="{ success: syncResult.success, error: !syncResult.success }"
          >
            <i
              :class="
                syncResult.success
                  ? 'fas fa-check-circle'
                  : 'fas fa-exclamation-circle'
              "
            ></i>
            <span>{{ syncResult.message }}</span>
          </div>

          <div
            v-if="syncResult.success && syncResult.data"
            class="result-details"
          >
            <p>
              <strong>Productos sincronizados:</strong>
              {{ syncResult.data.syncedProducts }}
            </p>
            <p v-if="syncResult.data.errors > 0">
              <strong>Errores:</strong> {{ syncResult.data.errors }}
            </p>
            <div
              v-if="
                syncResult.data.errorDetails &&
                syncResult.data.errorDetails.length > 0
              "
              class="error-details"
            >
              <h5>Detalles de errores:</h5>
              <ul>
                <li v-for="error in syncResult.data.errorDetails" :key="error">
                  {{ error }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeSyncModal" class="btn btn-ghost">
          {{ syncing ? "Cerrar" : "Cancelar" }}
        </button>
        <button
          v-if="
            syncData && syncData.missingProducts > 0 && !syncing && !syncResult
          "
          @click="performSync"
          class="btn btn-primary"
        >
          <i class="fas fa-sync-alt"></i>
          Sincronizar {{ syncData.missingProducts }} Productos
        </button>
        <button
          v-if="syncResult && syncResult.success"
          @click="refreshAfterSync"
          class="btn btn-success"
        >
          <i class="fas fa-refresh"></i>
          Actualizar Lista
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import AdminNavbar from "@/components/AdminNavbar.vue";
import { apiCall, getImageUrl } from "@/config/api";

const router = useRouter();

// Estado reactivo
const productos = ref([]);
const familias = ref([]);
const marcas = ref([]);
const temporadas = ref([]);
const loading = ref(false);
const estadisticas = ref({ productos_activos: 0, productos_sin_stock: 0 });
const pagina = ref(1);
const limite = ref(20);
const totalProductos = ref(0);
const totalPaginas = ref(0);

// Estado para ordenamiento
const sortField = ref("id");
const sortOrder = ref("desc");

const filters = ref({
  busqueda: "",
  familia: "",
  marca: "",
  estado: "",
  temporada: "",
  zona: "",
  stock: "",
});

// Estado para gestión de imágenes
const showImageModal = ref(false);
const showUploadModal = ref(false);
const selectedProduct = ref(null);
const activeTab = ref("principal");
const uploading = ref(false);
const selectedFile = ref(null);
const fileInput = ref(null);

const uploadData = ref({
  orden: 1,
  alt_text: "",
});

// Estado para modal de edición
const editModalOpen = ref(false);
const editingProduct = ref(null);
const saving = ref(false);

const editFormData = ref({
  codigo_producto: "",
  sku: "",
  descripcion: "",
  familia_id: "",
  marca_id: "",
  estado: "ACTIVO",
  zona: 0,
  temporadas: [],
});

// Estado para modal de sincronización
const syncModalOpen = ref(false);
const syncing = ref(false);
const loadingSync = ref(false);
const syncData = ref(null);
const syncResult = ref(null);

// Tipos de vista disponibles
const tiposVista = ref([
  { id: "principal", nombre: "Principal", icono: "fas fa-eye" },
  { id: "perspectiva", nombre: "Perspectiva", icono: "fas fa-cube" },
  { id: "frente", nombre: "Frente", icono: "fas fa-square" },
  { id: "atras", nombre: "Atrás", icono: "fas fa-square" },
  { id: "lateral", nombre: "Lateral", icono: "fas fa-square" },
  { id: "superior", nombre: "Superior", icono: "fas fa-square" },
]);

// Computed
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some((value) => value !== "");
});

const productosActivos = computed(() => {
  return estadisticas.value?.productos_activos || 0;
});

const paginationInfo = computed(() => {
  const from = (pagina.value - 1) * limite.value + 1;
  const to = Math.min(pagina.value * limite.value, totalProductos.value);
  return { from, to };
});

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, pagina.value - 2);
  const end = Math.min(totalPaginas.value, pagina.value + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// Métodos
const loadProductos = async () => {
  loading.value = true;
  try {
    const params = {
      pagina: pagina.value,
      limite: limite.value,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
      ...filters.value,
    };

    const response = await apiCall(
      "/admin/productos?" + new URLSearchParams(params)
    );

    if (response.success) {
      console.log(
        "📊 Primeros 3 productos recibidos:",
        response.data.slice(0, 3).map((p) => ({
          id: p.id,
          codigo: p.codigo_producto,
          precio: p.valor_web,
          stock: p.stock_total,
          zona: p.zona,
          zona_raw: p,
          imagenes: p.imagenes || [],
        }))
      );

      // Verificar imágenes en productos
      const productosConImagenes = response.data.filter(
        (p) => p.imagenes && p.imagenes.length > 0
      );
      console.log("📸 Productos con imágenes:", productosConImagenes.length);
      if (productosConImagenes.length > 0) {
        console.log("📸 Primer producto con imágenes:", {
          id: productosConImagenes[0].id,
          codigo: productosConImagenes[0].codigo_producto,
          imagenes: productosConImagenes[0].imagenes,
        });
      }

      productos.value = response.data || [];
      totalProductos.value = response.total || 0;
      totalPaginas.value = response.pagination?.totalPaginas || 0;
    } else {
      productos.value = [];
      totalProductos.value = 0;
      totalPaginas.value = 0;
    }
  } catch (error) {
    console.error("❌ Error cargando productos:", error);
    productos.value = [];
    totalProductos.value = 0;
    totalPaginas.value = 0;
  } finally {
    loading.value = false;
  }
};

const loadEstadisticas = async () => {
  try {
    const response = await apiCall("/admin/estadisticas");
    if (response.success) {
      estadisticas.value = response.estadisticas || {
        productos_activos: 0,
        productos_sin_stock: 0,
      };
    }
  } catch (error) {
    console.error("❌ Error cargando estadísticas:", error);
    estadisticas.value = { productos_activos: 0, productos_sin_stock: 0 };
  }
};

const loadFamilias = async () => {
  try {
    const response = await apiCall("/catalogo/familias");
    if (response.success) {
      familias.value = response.data || [];
    }
  } catch (error) {
    console.error("Error cargando familias:", error);
    familias.value = [];
  }
};

const loadMarcas = async () => {
  try {
    const response = await apiCall("/catalogo/marcas");
    if (response.success) {
      marcas.value = response.data || [];
    }
  } catch (error) {
    console.error("Error cargando marcas:", error);
    marcas.value = [];
  }
};

const loadTemporadas = async () => {
  try {
    const response = await apiCall("/admin/temporadas");
    if (response.success) {
      temporadas.value = response.data || [];
    }
  } catch (error) {
    console.error("Error cargando temporadas:", error);
    temporadas.value = [];
  }
};

const changePage = (newPage) => {
  pagina.value = newPage;
};

// Funciones de ordenamiento
const sort = (field) => {
  if (sortField.value === field) {
    // Si ya estamos ordenando por este campo, cambiar dirección
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    // Si es un campo nuevo, ordenar ascendente por defecto
    sortField.value = field;
    sortOrder.value = "asc";
  }

  // Resetear a la primera página - NO llamar loadProductos() aquí porque el watcher lo hará
  pagina.value = 1;
};

const getSortClass = (field) => {
  if (sortField.value !== field) return "";
  return sortOrder.value === "asc" ? "sort-asc" : "sort-desc";
};

const clearFilters = () => {
  filters.value = {
    busqueda: "",
    familia: "",
    marca: "",
    estado: "",
    temporada: "",
    zona: "",
    stock: "",
  };
  pagina.value = 1;
};

const viewProducto = (producto) => {
  // TODO: Implementar vista detallada del producto
  console.log("Ver producto:", producto.id);
};

const deleteProducto = async (producto) => {
  if (
    !confirm(
      `¿Estás seguro de que quieres eliminar el producto "${producto.descripcion}"?`
    )
  ) {
    return;
  }

  try {
    const response = await apiCall(`/admin/productos/${producto.id}`, {
      method: "DELETE",
    });
    if (response.success) {
      console.log("Producto eliminado exitosamente");
      await loadProductos();
    }
  } catch (error) {
    console.error("Error eliminando producto:", error);
    alert("Error al eliminar el producto: " + error.message);
  }
};

const getEstadoClass = (estado) => {
  switch (estado) {
    case "ACTIVO":
      return "badge-success";
    case "INACTIVO":
      return "badge-warning";
    case "DESCONTINUADO":
      return "badge-danger";
    default:
      return "badge-secondary";
  }
};

const getStockClass = (stock) => {
  if (!stock) return "stock-unknown";

  if (stock.disponible > 0) {
    return stock.disponible > 5 ? "stock-high" : "stock-low";
  }
  return "stock-out";
};

const formatStockDate = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;

    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch (error) {
    return "";
  }
};

const handleImageError = (event) => {
  console.log("🖼️ Error cargando imagen:", event.target.src);
  console.log("🖼️ Cambiando a placeholder:", "/images/placeholder-product.svg");
  event.target.src = "/images/placeholder-product.svg";
};

// Función para obtener URL de imagen con logs
const getImageUrlWithLog = (imageUrl) => {
  console.log("🔍 getImageUrlWithLog recibió:", imageUrl);
  if (!imageUrl) {
    console.log("⚠️ No hay imageUrl, usando placeholder");
    return "/images/placeholder-product.svg";
  }
  const url = getImageUrl(imageUrl);
  console.log("🖼️ URL construida:", url);
  return url;
};

// Funciones de gestión de imágenes
const openImageModal = (producto) => {
  selectedProduct.value = producto;
  activeTab.value = "principal";
  showImageModal.value = true;
};

const closeImageModal = () => {
  showImageModal.value = false;
  selectedProduct.value = null;
};

const openUploadModal = () => {
  uploadData.value = {
    orden: getNextOrder(),
    alt_text: "",
  };
  selectedFile.value = null;
  showUploadModal.value = true;
};

const closeUploadModal = () => {
  showUploadModal.value = false;
  selectedFile.value = null;
  uploadData.value = {
    orden: 1,
    alt_text: "",
  };
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getImagesByType = (tipo) => {
  if (!selectedProduct.value?.imagenes) return [];
  return selectedProduct.value.imagenes.filter((img) => img.tipo === tipo);
};

const getImageCountByType = (tipo) => {
  return getImagesByType(tipo).length;
};

const getTipoNombre = (tipo) => {
  const tipoObj = tiposVista.value.find((t) => t.id === tipo);
  return tipoObj ? tipoObj.nombre : tipo;
};

const getNextOrder = () => {
  const imagenesDelTipo = getImagesByType(activeTab.value);
  if (imagenesDelTipo.length === 0) return 1;
  const maxOrder = Math.max(...imagenesDelTipo.map((img) => img.orden || 0));
  return maxOrder + 1;
};

const uploadImage = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append("imagen", selectedFile.value);
    formData.append("producto_id", selectedProduct.value.id);
    formData.append("tipo", activeTab.value);
    formData.append("orden", uploadData.value.orden || 1);
    formData.append("alt_text", uploadData.value.alt_text || "");

    const response = await apiCall("/admin/imagenes/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });

    if (response.success) {
      console.log("Imagen subida exitosamente");
      closeUploadModal();
      // Recargar el producto para actualizar las imágenes
      await reloadProductImages();
    }
  } catch (error) {
    console.error("Error subiendo imagen:", error);
    alert("Error al subir la imagen: " + error.message);
  } finally {
    uploading.value = false;
  }
};

const deleteImage = async (imagen) => {
  if (!confirm("¿Estás seguro de que quieres eliminar esta imagen?")) {
    return;
  }

  try {
    const response = await apiCall(`/admin/imagenes/${imagen.id}`, {
      method: "DELETE",
    });

    if (response.success) {
      console.log("Imagen eliminada exitosamente");
      // Recargar el producto para actualizar las imágenes
      await reloadProductImages();
    }
  } catch (error) {
    console.error("Error eliminando imagen:", error);
    alert("Error al eliminar la imagen: " + error.message);
  }
};

const reloadProductImages = async () => {
  try {
    console.log(
      "🔄 Recargando imágenes para producto:",
      selectedProduct.value.id
    );
    // Buscar el producto actualizado en la lista
    const productoActualizado = productos.value.find(
      (p) => p.id === selectedProduct.value.id
    );
    if (productoActualizado) {
      // Recargar las imágenes del producto específico
      const response = await apiCall(
        `/catalogo/productos/${selectedProduct.value.id}`
      );
      console.log("📡 Respuesta de recarga:", response);
      if (response.success && response.data) {
        console.log("📸 Imágenes recibidas:", response.data.imagenes);
        // Actualizar las imágenes del producto en la lista
        productoActualizado.imagenes = response.data.imagenes || [];
        // Actualizar el producto seleccionado en el modal
        selectedProduct.value.imagenes = response.data.imagenes || [];
        console.log(
          "✅ Imágenes actualizadas en producto:",
          productoActualizado.imagenes
        );
        console.log(
          "✅ Imágenes actualizadas en selectedProduct:",
          selectedProduct.value.imagenes
        );
      }
    }
  } catch (error) {
    console.error("Error recargando imágenes:", error);
  }
};

// Funciones para modal de edición
const openEditModal = async (producto) => {
  editingProduct.value = producto;

  // Cargar datos del producto en el formulario
  editFormData.value = {
    codigo_producto: producto.codigo_producto || "",
    sku: producto.sku || "",
    descripcion: producto.descripcion || "",
    familia_id: producto.familia_id || "",
    marca_id: producto.marca_id || "",
    estado: producto.estado || "ACTIVO",
    zona: producto.zona || 0,
    temporadas: producto.temporadas?.map((t) => t.id) || [],
  };

  editModalOpen.value = true;
  document.body.style.overflow = "hidden";
};

const closeEditModal = () => {
  editModalOpen.value = false;
  editingProduct.value = null;
  document.body.style.overflow = "";

  // Limpiar formulario
  editFormData.value = {
    codigo_producto: "",
    sku: "",
    descripcion: "",
    familia_id: "",
    marca_id: "",
    estado: "ACTIVO",
    zona: 0,
    temporadas: [],
  };
};

const toggleTemporada = (temporadaId) => {
  const index = editFormData.value.temporadas.indexOf(temporadaId);
  if (index > -1) {
    editFormData.value.temporadas.splice(index, 1);
  } else {
    editFormData.value.temporadas.push(temporadaId);
  }
};

const saveProducto = async () => {
  if (!editingProduct.value) return;

  saving.value = true;
  try {
    // Preparar datos para enviar
    const payload = {
      ...editFormData.value,
      temporadas: editFormData.value.temporadas,
    };

    const response = await apiCall(
      `/admin/productos/${editingProduct.value.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.success) {
      // Actualizar el producto en la lista local
      const index = productos.value.findIndex(
        (p) => p.id === editingProduct.value.id
      );
      if (index > -1 && response.data) {
        // Usar los datos actualizados de la respuesta
        productos.value[index] = {
          ...productos.value[index],
          ...response.data,
          temporadas: response.data.temporadas || [],
        };
      }

      closeEditModal();

      // Mostrar mensaje de éxito
      console.log("Producto actualizado exitosamente");
    }
  } catch (error) {
    console.error("Error actualizando producto:", error);
    alert("Error al actualizar el producto: " + error.message);
  } finally {
    saving.value = false;
  }
};

// Funciones de sincronización
const openSyncModal = () => {
  syncModalOpen.value = true;
  syncData.value = null;
  syncResult.value = null;
};

const closeSyncModal = () => {
  syncModalOpen.value = false;
  syncData.value = null;
  syncResult.value = null;
  syncing.value = false;
  loadingSync.value = false;
};

const checkSyncData = async () => {
  loadingSync.value = true;
  try {
    const response = await apiCall("/sync/compare", {
      method: "GET",
    });

    if (response.success) {
      syncData.value = response.data;
      console.log("🔍 Datos de sincronización:", response.data);
    }
  } catch (error) {
    console.error("❌ Error obteniendo datos de sincronización:", error);
    alert("Error al analizar los productos: " + error.message);
  } finally {
    loadingSync.value = false;
  }
};

const performSync = async () => {
  syncing.value = true;
  try {
    const response = await apiCall("/sync/sync", {
      method: "POST",
    });

    syncResult.value = response;
    console.log("🔄 Resultado de sincronización:", response);

    if (response.success) {
      console.log(`✅ ${response.message}`);
    }
  } catch (error) {
    console.error("❌ Error en sincronización:", error);
    syncResult.value = {
      success: false,
      message: "Error durante la sincronización: " + error.message,
    };
  } finally {
    syncing.value = false;
  }
};

const refreshAfterSync = async () => {
  closeSyncModal();
  await cargarProductos();
  console.log("🔄 Lista de productos actualizada después de la sincronización");
};

// Watchers
watch(
  filters,
  () => {
    pagina.value = 1;
    loadProductos();
    loadEstadisticas();
  },
  { deep: true }
);

watch(pagina, () => {
  loadProductos();
});

// Watch para cambios en ordenamiento
watch([sortField, sortOrder], () => {
  pagina.value = 1;
  loadProductos();
});

// Lifecycle
onMounted(() => {
  loadProductos();
  loadEstadisticas();
  loadFamilias();
  loadMarcas();
  loadTemporadas();
});
</script>

<style scoped>
.admin-productos {
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

.info-card {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border: 1px solid #bbdefb;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.info-content {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  gap: 1rem;
}

.info-icon {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  background: #2196f3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.info-text h4 {
  margin: 0 0 0.5rem 0;
  color: #1976d2;
  font-size: 1.1rem;
  font-weight: 600;
}

.info-text p {
  margin: 0;
  color: #424242;
  line-height: 1.5;
  font-size: 0.95rem;
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
  grid-template-columns: repeat(4, 1fr);
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

.product-image-cell {
  position: relative;
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 0.375rem;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.product-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem;
  border-radius: 0.25rem 0 0.375rem 0;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.image-count {
  font-weight: 600;
}

.product-codes {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.code-main {
  font-weight: 600;
  color: #111827;
}

.code-secondary {
  font-size: 0.75rem;
  color: #6b7280;
}

.product-description {
  max-width: 200px;
}

.description-text {
  font-size: 0.875rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stock-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
}

.stock-main {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stock-value {
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.stock-value.stock-high {
  background: #d1fae5;
  color: #059669;
}

.stock-value.stock-low {
  background: #fef3c7;
  color: #d97706;
}

.stock-value.stock-out {
  background: #fee2e2;
  color: #dc2626;
}

.stock-value.stock-unknown {
  background: #f3f4f6;
  color: #6b7280;
}

.stock-total {
  font-size: 0.7rem;
  color: #6b7280;
}

.stock-reserved {
  font-size: 0.7rem;
  color: #d97706;
  font-style: italic;
}

.stock-warning {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #dc2626;
  font-size: 0.7rem;
  font-weight: 600;
}

.stock-updated {
  font-size: 0.65rem;
  color: #9ca3af;
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

.badge-danger {
  background: #fee2e2;
  color: #dc2626;
}

.badge-secondary {
  background: #f3f4f6;
  color: #374151;
}

.badge-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.badge-zonal {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 1px solid #10b981;
}

.badge-no-zonal {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #ef4444;
}

.zonal-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
}

.zonal-indicator .badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #d1d5db;
  border-radius: 0.25rem;
  background: white;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox-input:checked + .checkbox-custom {
  background: #3b82f6;
  border-color: #3b82f6;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.875rem;
  font-weight: bold;
}

.checkbox-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-text i {
  color: #6b7280;
}

.checkbox-input:checked ~ .checkbox-text i {
  color: #3b82f6;
}

.text-muted {
  color: #9ca3af;
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

/* Responsive */
@media (max-width: 1024px) {
  .filters-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .table th,
  .table td {
    padding: 0.5rem;
    font-size: 0.875rem;
  }

  .product-description {
    max-width: 150px;
  }
}

/* Estilos para modales de gestión de imágenes */
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

.image-modal-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

/* Información del producto en modal */
.product-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.product-details {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.product-id {
  font-family: monospace;
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
}

.product-code {
  font-weight: 600;
  color: #111827;
}

/* Tabs para tipos de vista */
.image-tabs {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
}

.tab-button {
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.tab-button:hover {
  color: #374151;
  background: #f9fafb;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: #f0f9ff;
}

.image-badge {
  background: #e5e7eb;
  color: #374151;
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.tab-button.active .image-badge {
  background: #dbeafe;
  color: #2563eb;
}

/* Sección de imágenes */
.images-section {
  min-height: 300px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  min-height: 200px;
}

.image-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.2s ease;
}

.image-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.image-preview {
  position: relative;
  aspect-ratio: 1;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.image-info {
  padding: 0.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.image-order {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

/* Estado sin imágenes */
.no-images {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
  text-align: center;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
}

.no-images i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.no-images p {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
}

/* Formulario de subida */
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

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input-file {
  padding: 0.5rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
}

.form-input-file:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
  color: #1e40af;
  font-size: 0.875rem;
}

.file-size {
  color: #6b7280;
}

/* Responsive para modales */
@media (max-width: 768px) {
  .image-modal-content {
    max-width: none;
    margin: 0.5rem;
    max-height: 95vh;
  }

  .modal-content {
    max-width: none;
    margin: 0.5rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .image-tabs {
    flex-wrap: wrap;
  }

  .tab-button {
    flex: 1;
    min-width: 120px;
  }

  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}

/* Estilos para modal de edición */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.modal-close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

/* Formulario de producto */
.product-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group-full {
  grid-column: 1 / -1;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  ring: 2px;
  ring-color: #3b82f6;
  border-color: #3b82f6;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Selector de temporadas */
.temporadas-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.temporada-chip {
  background-color: #f3f4f6;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.temporada-chip:hover {
  background-color: #e5e7eb;
}

.temporada-chip.selected {
  background-color: #3b82f6;
  color: white;
  border-color: #2563eb;
}

/* Checkbox group */
.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin: 0;
}

.checkbox-input {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.checkbox-text {
  font-size: 1rem;
  color: #374151;
}

/* Responsive modal */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-container {
    max-height: 95vh;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    padding: 1rem;
    flex-direction: column;
  }
}

/* Estilos específicos para el modal de sincronización */
.sync-modal {
  max-width: 600px;
}

.sync-info {
  text-align: center;
}

.sync-description p {
  margin-bottom: 1rem;
  color: #6b7280;
  line-height: 1.6;
}

.sync-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef3c7;
  color: #d97706;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.sync-actions {
  margin-top: 1.5rem;
}

.sync-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
}

.stat-card.highlight {
  background: #eff6ff;
  border-color: #3b82f6;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-card.highlight .stat-value {
  color: #3b82f6;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sync-preview {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.sync-preview h4 {
  margin-bottom: 0.75rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
}

.products-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.preview-item strong {
  color: #1f2937;
  min-width: 100px;
}

.preview-item span {
  color: #6b7280;
  text-align: right;
  flex: 1;
}

.preview-more {
  padding: 0.5rem;
  text-align: center;
  color: #6b7280;
  font-style: italic;
  font-size: 0.875rem;
}

.sync-up-to-date {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #d1fae5;
  color: #059669;
  padding: 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
}

.sync-progress {
  text-align: center;
  padding: 2rem 1rem;
}

.progress-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #3b82f6;
}

.progress-indicator i {
  font-size: 1.5rem;
}

.sync-complete {
  padding: 1rem 0;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.result-header.success {
  background: #d1fae5;
  color: #059669;
}

.result-header.error {
  background: #fee2e2;
  color: #dc2626;
}

.result-details {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.result-details p {
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
}

.result-details p:last-child {
  margin-bottom: 0;
}

.error-details {
  margin-top: 1rem;
}

.error-details h5 {
  margin-bottom: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 600;
}

.error-details ul {
  list-style: none;
  padding: 0;
}

.error-details li {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.5rem;
  border-radius: 0.25rem;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.btn.btn-secondary {
  background: #6b7280;
  color: white;
  border: 1px solid #6b7280;
}

.btn.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
  border-color: #4b5563;
}

.btn.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.btn-success {
  background: #059669;
  color: white;
  border: 1px solid #059669;
}

.btn.btn-success:hover {
  background: #047857;
  border-color: #047857;
}
</style>
