<template>
  <teleport to="body">
    <transition name="modal">
      <div
        v-if="catalogo.state.modalAbierto"
        class="modal-overlay"
        @click="cerrarModal"
      >
        <div class="modal-container" @click.stop>
          <!-- Header del modal -->
          <div class="modal-header">
            <h2 class="modal-title">{{ producto?.nombre }}</h2>
            <button class="modal-close" @click="cerrarModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Contenido del modal -->
          <div class="modal-content">
            <!-- Galería de imágenes -->
            <div class="imagen-section">
              <div class="imagen-principal">
                <img
                  :src="imagenActual"
                  :alt="producto?.nombre"
                  class="imagen-main"
                />
              </div>

              <!-- Thumbnails -->
              <div v-if="imagenes.length > 1" class="thumbnails">
                <button
                  v-for="(imagen, index) in imagenes"
                  :key="imagen.id"
                  class="thumbnail"
                  :class="{ active: imagenSeleccionada === index }"
                  @click="imagenSeleccionada = index"
                >
                  <img :src="imagen.url" :alt="imagen.alt_text" />
                </button>
              </div>

              <!-- Indicadores de vista -->
              <div v-if="imagenes.length > 1" class="vista-indicators">
                <span
                  v-for="tipo in tiposVista"
                  :key="tipo.tipo"
                  class="vista-indicator"
                  :class="{ active: tipoVistaActual === tipo.tipo }"
                >
                  <i :class="tipo.icono"></i>
                  {{ tipo.nombre }}
                </span>
              </div>
            </div>

            <!-- Información del producto -->
            <div class="info-section">
              <!-- Precio y stock -->
              <div class="precio-stock">
                <div class="precio">
                  ${{ formatearPrecio(producto?.precio) }}
                </div>
                <div 
                  class="stock"
                  :class="{
                    'disponible': producto?.stock > 0,
                    'agotado': producto?.stock <= 0
                  }"
                >
                  {{ producto?.stock > 0 ? `${producto.stock} disponibles` : 'Agotado' }}
                </div>
              </div>

              <!-- Marca y categoría -->
              <div class="meta-info">
                <div class="meta-item">
                  <i class="fas fa-tag"></i>
                  <span>{{ producto?.marca?.nombre || 'Sin marca' }}</span>
                </div>
                <div class="meta-item">
                  <i class="fas fa-folder"></i>
                  <span>{{ producto?.categoria?.nombre || 'Sin categoría' }}</span>
                </div>
                <div v-if="producto?.sku" class="meta-item">
                  <i class="fas fa-barcode"></i>
                  <span>{{ producto.sku }}</span>
                </div>
              </div>

              <!-- Descripción -->
              <div v-if="producto?.descripcion" class="descripcion">
                <h3>Descripción</h3>
                <p>{{ producto.descripcion }}</p>
              </div>

              <!-- Especificaciones técnicas -->
              <div v-if="tieneEspecificaciones" class="especificaciones">
                <h3>Especificaciones Técnicas</h3>
                <div class="specs-grid">
                  <div v-if="producto?.alto" class="spec-item">
                    <span class="spec-label">Alto:</span>
                    <span class="spec-value">{{ producto.alto }} cm</span>
                  </div>
                  <div v-if="producto?.ancho" class="spec-item">
                    <span class="spec-label">Ancho:</span>
                    <span class="spec-value">{{ producto.ancho }} cm</span>
                  </div>
                  <div v-if="producto?.profundidad" class="spec-item">
                    <span class="spec-label">Profundidad:</span>
                    <span class="spec-value">{{ producto.profundidad }} cm</span>
                  </div>
                  <div v-if="producto?.peso" class="spec-item">
                    <span class="spec-label">Peso:</span>
                    <span class="spec-value">{{ producto.peso }} g</span>
                  </div>
                  <div v-if="producto?.color" class="spec-item">
                    <span class="spec-label">Color:</span>
                    <span class="spec-value">{{ producto.color }}</span>
                  </div>
                  <div v-if="producto?.material" class="spec-item">
                    <span class="spec-label">Material:</span>
                    <span class="spec-value">{{ producto.material }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { catalogo } from '@/stores/catalogo'

const imagenSeleccionada = ref(0)

// Producto actual
const producto = computed(() => catalogo.state.productoSeleccionado)

// Imágenes del producto
const imagenes = computed(() => {
  if (!producto.value?.imagenes) return []
  return producto.value.imagenes.sort((a, b) => a.orden - b.orden)
})

// Imagen actual seleccionada
const imagenActual = computed(() => {
  if (imagenes.value.length === 0) return '/images/placeholder-product.svg'
  return imagenes.value[imagenSeleccionada.value]?.url || '/images/placeholder-product.svg'
})

// Tipo de vista actual
const tipoVistaActual = computed(() => {
  if (imagenes.value.length === 0) return 'principal'
  return imagenes.value[imagenSeleccionada.value]?.tipo || 'principal'
})

// Tipos de vista disponibles
const tiposVista = computed(() => {
  const tipos = [
    { tipo: 'principal', nombre: 'Principal', icono: 'fas fa-eye' },
    { tipo: 'perspectiva', nombre: 'Perspectiva', icono: 'fas fa-cube' },
    { tipo: 'frente', nombre: 'Frente', icono: 'fas fa-square' },
    { tipo: 'atras', nombre: 'Atrás', icono: 'fas fa-square' },
    { tipo: 'lateral', nombre: 'Lateral', icono: 'fas fa-square' },
    { tipo: 'superior', nombre: 'Superior', icono: 'fas fa-square' }
  ]

  return tipos.filter(tipo => 
    imagenes.value.some(img => img.tipo === tipo.tipo)
  )
})

// Verificar si tiene especificaciones
const tieneEspecificaciones = computed(() => {
  if (!producto.value) return false
  
  return !!(producto.value.alto || 
           producto.value.ancho || 
           producto.value.profundidad || 
           producto.value.peso || 
           producto.value.color || 
           producto.value.material)
})

// Formatear precio
const formatearPrecio = (precio) => {
  if (!precio) return '0'
  return new Intl.NumberFormat('es-CL').format(precio)
}

// Cerrar modal
const cerrarModal = () => {
  catalogo.cerrarModal()
}

// Reset imagen seleccionada cuando cambia el producto
watch(producto, () => {
  imagenSeleccionada.value = 0
})

// Manejar tecla Escape
const handleEscape = (event) => {
  if (event.key === 'Escape') {
    cerrarModal()
  }
}

// Agregar/remover listener para Escape
watch(() => catalogo.state.modalAbierto, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', handleEscape)
  } else {
    document.removeEventListener('keydown', handleEscape)
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  max-width: 4xl;
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
  background: #f3f4f6;
  color: #374151;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding: 2rem;
}

@media (min-width: 768px) {
  .modal-content {
    grid-template-columns: 1fr 1fr;
  }
}

/* Sección de imagen */
.imagen-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.imagen-principal {
  aspect-ratio: 1;
  border-radius: 1rem;
  overflow: hidden;
  background: #f8f9fa;
}

.imagen-main {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnails {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem 0;
}

.thumbnail {
  flex-shrink: 0;
  width: 4rem;
  height: 4rem;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.thumbnail.active {
  border-color: #3b82f6;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vista-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.vista-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  background: #f3f4f6;
  color: #6b7280;
  transition: all 0.2s;
}

.vista-indicator.active {
  background: #3b82f6;
  color: white;
}

/* Sección de información */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.precio-stock {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.precio {
  font-size: 2rem;
  font-weight: 700;
  color: #059669;
}

.stock {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.stock.disponible {
  background: #d1fae5;
  color: #065f46;
}

.stock.agotado {
  background: #fee2e2;
  color: #991b1b;
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.meta-item i {
  width: 1rem;
  color: #9ca3af;
}

.descripcion h3,
.especificaciones h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
}

.descripcion p {
  color: #6b7280;
  line-height: 1.6;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.spec-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.spec-value {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 600;
}

/* Transiciones del modal */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    margin: 0;
    border-radius: 1rem 1rem 0 0;
    max-height: 95vh;
  }
  
  .modal-content {
    padding: 1rem;
    gap: 1rem;
  }
  
  .precio {
    font-size: 1.5rem;
  }
}
</style>
