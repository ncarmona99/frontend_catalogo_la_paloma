<template>
  <div class="admin-producto-form">
    <AdminNavbar />

    <main class="main-content">
      <div class="container">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">
              <i class="fas fa-box"></i>
              {{ isEditing ? "Editar Producto" : "Nuevo Producto" }}
            </h1>
            <p class="page-subtitle">
              {{
                isEditing
                  ? "Modifica la información del producto"
                  : "Agrega un nuevo producto al catálogo"
              }}
            </p>
          </div>
          <div class="header-actions">
            <router-link to="/admin/productos" class="btn btn-ghost">
              <i class="fas fa-arrow-left"></i>
              Volver
            </router-link>
            <button
              class="btn btn-primary"
              @click="saveProducto"
              :disabled="saving"
            >
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-save"></i>
              {{ isEditing ? "Actualizar" : "Crear" }}
            </button>
          </div>
        </div>

        <!-- Formulario -->
        <div class="form-container">
          <form @submit.prevent="saveProducto" class="product-form">
            <!-- Información Básica -->
            <div class="form-section">
              <h3 class="section-title">
                <i class="fas fa-info-circle"></i>
                Información Básica
              </h3>

              <div class="form-grid">
                <div class="form-group">
                  <label for="codigo_producto" class="form-label"
                    >Código del Producto *</label
                  >
                  <input
                    id="codigo_producto"
                    v-model="formData.codigo_producto"
                    type="text"
                    class="form-input"
                    placeholder="Ej: PROD001"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="sku" class="form-label">SKU</label>
                  <input
                    id="sku"
                    v-model="formData.sku"
                    type="text"
                    class="form-input"
                    placeholder="Ej: SKU123"
                  />
                </div>

                <div class="form-group form-group-full">
                  <label for="descripcion" class="form-label"
                    >Descripción *</label
                  >
                  <textarea
                    id="descripcion"
                    v-model="formData.descripcion"
                    class="form-textarea"
                    placeholder="Descripción detallada del producto..."
                    rows="3"
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Categorización -->
            <div class="form-section">
              <h3 class="section-title">
                <i class="fas fa-tags"></i>
                Categorización
              </h3>

              <div class="form-grid">
                <div class="form-group">
                  <label for="familia_id" class="form-label">Categoría</label>
                  <select
                    id="familia_id"
                    v-model="formData.familia_id"
                    class="form-select"
                  >
                    <option value="">Seleccionar categoría</option>
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
                  <label for="marca_id" class="form-label">Marca</label>
                  <select
                    id="marca_id"
                    v-model="formData.marca_id"
                    class="form-select"
                  >
                    <option value="">Seleccionar marca</option>
                    <option
                      v-for="marca in marcas"
                      :key="marca.id"
                      :value="marca.id"
                    >
                      {{ marca.nombre }}
                    </option>
                  </select>
                </div>

                <div class="form-group form-group-full">
                  <label class="form-label">Temporadas</label>
                  <div class="chips-select">
                    <div class="chips">
                      <span
                        v-for="t in selectedTemporadasObjects"
                        :key="t.id"
                        class="chip"
                      >
                        {{ t.nombre }}
                        <button
                          type="button"
                          class="chip-remove"
                          @click="removeTemporada(t.id)"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </span>
                    </div>
                    <div class="chips-actions">
                      <select v-model="tempTemporadaId" class="form-select">
                        <option value="">Agregar temporada…</option>
                        <option
                          v-for="t in temporadas"
                          :key="t.id"
                          :value="t.id"
                          :disabled="formData.temporadas.includes(t.id)"
                        >
                          {{ t.nombre }}
                        </option>
                      </select>
                      <button
                        type="button"
                        class="btn"
                        @click="addTemporada"
                        :disabled="!tempTemporadaId"
                      >
                        Agregar
                      </button>
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
                  <label for="estado" class="form-label"
                    >Estado del Producto</label
                  >
                  <select
                    id="estado"
                    v-model="formData.estado"
                    class="form-select"
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="DESCONTINUADO">Descontinuado</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Sección de Enlace de Stock -->
            <div class="form-section">
              <h3 class="section-title">
                <i class="fas fa-link"></i>
                Enlace de Stock
              </h3>
              <p class="section-description">
                Conecta este producto con un producto de la base de datos de
                stock para obtener información de inventario en tiempo real.
              </p>

              <div class="form-grid">
                <!-- Enlace actual -->
                <div v-if="enlaceActivo" class="form-group form-group-full">
                  <label class="form-label">Enlace Actual</label>
                  <div class="current-link-card">
                    <div class="link-info">
                      <div class="link-details">
                        <span class="link-code">{{
                          enlaceActivo.codigo_stock
                        }}</span>
                        <span class="link-description">{{
                          enlaceActivo.descripcion_stock
                        }}</span>
                      </div>
                      <div class="link-actions">
                        <button
                          type="button"
                          class="btn btn-sm btn-danger"
                          @click="desactivarEnlace"
                          :disabled="saving"
                        >
                          <i class="fas fa-unlink"></i>
                          Desactivar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Selector de nuevo enlace -->
                <div v-else class="form-group form-group-full">
                  <label for="stock_search" class="form-label"
                    >Buscar Producto de Stock</label
                  >
                  <div class="stock-search-container">
                    <input
                      id="stock_search"
                      v-model="stockSearch"
                      type="text"
                      class="form-input"
                      placeholder="Buscar por código o descripción..."
                      @input="searchStockProducts"
                    />
                    <button
                      type="button"
                      class="btn btn-secondary"
                      @click="searchStockProducts"
                      :disabled="loadingStock"
                    >
                      <i v-if="loadingStock" class="fas fa-spinner fa-spin"></i>
                      <i v-else class="fas fa-search"></i>
                    </button>
                  </div>
                </div>

                <!-- Lista de productos de stock disponibles -->
                <div
                  v-if="productosStockDisponibles.length > 0"
                  class="form-group form-group-full"
                >
                  <label class="form-label"
                    >Productos de Stock Disponibles</label
                  >
                  <div class="stock-products-list">
                    <div
                      v-for="producto in productosStockDisponibles"
                      :key="producto.codigo"
                      class="stock-product-item"
                      :class="{
                        selected:
                          selectedStockProduct?.codigo === producto.codigo,
                      }"
                      @click="selectStockProduct(producto)"
                    >
                      <div class="product-info">
                        <div class="product-code">{{ producto.codigo }}</div>
                        <div class="product-description">
                          {{ producto.descripcion }}
                        </div>
                        <div class="product-details">
                          <span class="stock-info"
                            >Stock: {{ producto.stock_actual }}</span
                          >
                          <span class="price-info"
                            >Precio: ${{
                              producto.precio_venta?.toLocaleString()
                            }}</span
                          >
                          <span v-if="producto.marca" class="brand-info">{{
                            producto.marca
                          }}</span>
                        </div>
                      </div>
                      <div class="product-actions">
                        <button
                          type="button"
                          class="btn btn-sm btn-primary"
                          @click.stop="crearEnlaceStock(producto)"
                          :disabled="saving"
                        >
                          <i class="fas fa-link"></i>
                          Enlazar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Mensaje cuando no hay productos -->
                <div
                  v-else-if="stockSearch && !loadingStock"
                  class="form-group form-group-full"
                >
                  <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>
                      No se encontraron productos de stock con ese criterio de
                      búsqueda.
                    </p>
                  </div>
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
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import AdminNavbar from "@/components/AdminNavbar.vue";
import { apiCall } from "@/config/api";

const router = useRouter();
const route = useRoute();

// Estado reactivo
const loading = ref(false);
const saving = ref(false);
const familias = ref([]);
const marcas = ref([]);
const temporadas = ref([]);
const tempTemporadaId = ref("");
const producto = ref(null);

// Variables para enlace de stock
const enlaceActivo = ref(null);
const stockSearch = ref("");
const productosStockDisponibles = ref([]);
const selectedStockProduct = ref(null);
const loadingStock = ref(false);

const formData = ref({
  codigo_producto: "",
  sku: "",
  descripcion: "",
  familia_id: "",
  marca_id: "",
  temporadas: [],
  estado: "ACTIVO",
});

// Computed
const isEditing = computed(() => {
  return route.params.id !== undefined;
});

// Métodos
const loadProducto = async () => {
  if (!isEditing.value) return;

  loading.value = true;
  try {
    const response = await apiCall(`/catalogo/productos/${route.params.id}`);
    if (response.success) {
      producto.value = response.data;

      // Mapear datos del producto al formulario
      formData.value = {
        codigo_producto: producto.value.codigo_producto || "",
        sku: producto.value.sku || "",
        descripcion: producto.value.descripcion || "",
        familia_id: producto.value.familia?.id || "",
        marca_id: producto.value.marca?.id || "",
        temporadas: (producto.value.temporadas || []).map((t) => t.id),
        estado: producto.value.estado || "ACTIVO",
      };
    }
  } catch (error) {
    console.error("Error cargando producto:", error);
  } finally {
    loading.value = false;
  }
};

const loadFamilias = async () => {
  try {
    const response = await apiCall("/catalogo/familias");
    if (response.success) {
      familias.value = response.data;
    }
  } catch (error) {
    console.error("Error cargando familias:", error);
  }
};

const loadMarcas = async () => {
  try {
    const response = await apiCall("/catalogo/marcas");
    if (response.success) {
      marcas.value = response.data;
    }
  } catch (error) {
    console.error("Error cargando marcas:", error);
  }
};

const loadTemporadas = async () => {
  try {
    const response = await apiCall(
      "/admin/temporadas?pagina=1&limite=200&sortField=nombre&sortOrder=asc"
    );
    if (response.success) {
      temporadas.value = response.data || [];
    }
  } catch (error) {
    console.error("Error cargando temporadas:", error);
  }
};

// Métodos para enlace de stock
const loadEnlaceActivo = async () => {
  if (!isEditing.value) return;

  try {
    const response = await apiCall(
      `/api/stock-enlace/enlace/producto/${route.params.id}`
    );
    if (response.success && response.data) {
      enlaceActivo.value = response.data;
    }
  } catch (error) {
    console.error("Error cargando enlace activo:", error);
  }
};

const searchStockProducts = async () => {
  if (!stockSearch.value.trim()) {
    productosStockDisponibles.value = [];
    return;
  }

  loadingStock.value = true;
  try {
    const response = await apiCall(
      `/api/stock-enlace/disponibles?busqueda=${encodeURIComponent(
        stockSearch.value
      )}&limite=20&excluirEnlazados=true`
    );
    if (response.success) {
      productosStockDisponibles.value = response.data;
    }
  } catch (error) {
    console.error("Error buscando productos de stock:", error);
    productosStockDisponibles.value = [];
  } finally {
    loadingStock.value = false;
  }
};

const selectStockProduct = (producto) => {
  selectedStockProduct.value = producto;
};

const crearEnlaceStock = async (productoStock) => {
  if (!isEditing.value) {
    alert(
      "Debes guardar el producto primero antes de crear un enlace de stock."
    );
    return;
  }

  saving.value = true;
  try {
    const response = await apiCall("/api/stock-enlace/enlace", {
      method: "POST",
      body: JSON.stringify({
        producto_id: parseInt(route.params.id),
        codigo_stock: productoStock.codigo,
        descripcion_stock: productoStock.descripcion,
      }),
    });

    if (response.success) {
      // Recargar el enlace activo
      await loadEnlaceActivo();
      // Limpiar búsqueda
      stockSearch.value = "";
      productosStockDisponibles.value = [];
      selectedStockProduct.value = null;

      console.log("Enlace de stock creado exitosamente");
    }
  } catch (error) {
    console.error("Error creando enlace de stock:", error);
    alert("Error al crear el enlace de stock. Inténtalo de nuevo.");
  } finally {
    saving.value = false;
  }
};

const desactivarEnlace = async () => {
  if (!enlaceActivo.value) return;

  if (
    !confirm("¿Estás seguro de que quieres desactivar este enlace de stock?")
  ) {
    return;
  }

  saving.value = true;
  try {
    const response = await apiCall(
      `/api/stock-enlace/enlace/${enlaceActivo.value.id}`,
      {
        method: "DELETE",
      }
    );

    if (response.success) {
      enlaceActivo.value = null;
      console.log("Enlace de stock desactivado exitosamente");
    }
  } catch (error) {
    console.error("Error desactivando enlace de stock:", error);
    alert("Error al desactivar el enlace de stock. Inténtalo de nuevo.");
  } finally {
    saving.value = false;
  }
};

const selectedTemporadasObjects = computed(() => {
  const set = new Set(formData.value.temporadas);
  return temporadas.value.filter((t) => set.has(t.id));
});

function addTemporada() {
  const id = parseInt(tempTemporadaId.value);
  if (!id) return;
  if (!formData.value.temporadas.includes(id)) {
    formData.value.temporadas.push(id);
  }
  tempTemporadaId.value = "";
}

function removeTemporada(id) {
  formData.value.temporadas = formData.value.temporadas.filter(
    (tid) => tid !== id
  );
}

const saveProducto = async () => {
  saving.value = true;
  try {
    const data = {
      ...formData.value,
    };

    if (isEditing.value) {
      const response = await apiCall(`/admin/productos/${route.params.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (response.success) {
        console.log("Producto actualizado exitosamente");
        router.push("/admin/productos");
      }
    } else {
      const response = await apiCall("/admin/productos", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (response.success) {
        console.log("Producto creado exitosamente");
        router.push("/admin/productos");
      }
    }
  } catch (error) {
    console.error("Error guardando producto:", error);
    alert(
      "Error al guardar el producto: " +
        (error.response?.data?.message || error.message)
    );
  } finally {
    saving.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadFamilias();
  loadMarcas();
  loadTemporadas();
  loadProducto();
  loadEnlaceActivo();
});
</script>

<style scoped>
.admin-producto-form {
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

.product-form {
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

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix {
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  z-index: 1;
}

.input-group .form-input {
  padding-left: 2rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.form-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #d1d5db;
  border-radius: 0.25rem;
  cursor: pointer;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
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

  .product-form {
    padding: 1rem;
  }
}

/* Estilos para la sección de enlace de stock */
.section-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.stock-search-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.stock-search-container .form-input {
  flex: 1;
}

.current-link-card {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 0.5rem;
  padding: 1rem;
}

.link-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.link-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.link-code {
  font-weight: 600;
  color: #0c4a6e;
  font-size: 0.875rem;
}

.link-description {
  color: #0369a1;
  font-size: 0.875rem;
}

.stock-products-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
}

.stock-product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stock-product-item:last-child {
  border-bottom: none;
}

.stock-product-item:hover {
  background: #f9fafb;
}

.stock-product-item.selected {
  background: #eff6ff;
  border-color: #3b82f6;
}

.product-info {
  flex: 1;
}

.product-code {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.product-description {
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.product-details {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.product-details span {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.stock-info {
  background: #fef3c7;
  color: #92400e;
}

.price-info {
  background: #d1fae5;
  color: #065f46;
}

.brand-info {
  background: #e0e7ff;
  color: #3730a3;
}

.product-actions {
  margin-left: 1rem;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.no-results i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.no-results p {
  margin: 0;
  font-size: 0.875rem;
}
</style>
