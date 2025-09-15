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
            <h2 class="modal-title">{{ producto?.descripcion }}</h2>
            <button class="modal-close" @click="cerrarModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Contenido del modal -->
          <div class="modal-content">
            <!-- Galería de imágenes -->
            <div class="imagen-section">
              <div class="imagen-principal-container">
                <div 
                  class="imagen-principal"
                  @mousemove="handleMouseMove"
                  @mouseleave="handleMouseLeave"
                  @click="handleImageClick"
                  ref="imagenContainer"
                >
                  <img
                    :src="imagenActual"
                    :alt="producto?.descripcion"
                    class="imagen-main"
                    :class="{ 'zoom-active': isZoomed }"
                    :style="zoomStyle"
                    ref="imagenMain"
                  />
                  
                  <!-- Overlay de zoom para móvil -->
                  <div v-if="isMobile && !isZoomed" class="zoom-overlay">
                    <i class="fas fa-search-plus"></i>
                    <span>Toca para ampliar</span>
                  </div>
                </div>

                <!-- Controles de navegación -->
                <div v-if="imagenes.length > 1" class="imagen-controls">
                  <button 
                    class="control-btn prev"
                    @click="imagenAnterior"
                    :disabled="imagenSeleccionada === 0"
                  >
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <button 
                    class="control-btn next"
                    @click="imagenSiguiente"
                    :disabled="imagenSeleccionada === imagenes.length - 1"
                  >
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>

                <!-- Indicadores de imagen -->
                <div v-if="imagenes.length > 1" class="imagen-indicators">
                  <span 
                    v-for="(imagen, index) in imagenes" 
                    :key="imagen.id"
                    class="indicator-dot"
                    :class="{ active: imagenSeleccionada === index }"
                    @click="imagenSeleccionada = index"
                  ></span>
                </div>
              </div>

              <!-- Botones de tipo de vista -->
              <div v-if="tiposVistaDisponibles.length > 1" class="vista-buttons">
                <button
                  v-for="tipo in tiposVistaDisponibles"
                  :key="tipo.tipo"
                  class="vista-btn"
                  :class="{ 
                    active: tipoVistaActual === tipo.tipo,
                    'has-images': tieneImagenesTipo(tipo.tipo)
                  }"
                  @click="cambiarTipoVista(tipo.tipo)"
                >
                  <i :class="tipo.icono"></i>
                  <span>{{ tipo.nombre }}</span>
                </button>
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
                  <div class="thumbnail-overlay">
                    <i :class="getIconoTipo(imagen.tipo)"></i>
                  </div>
                </button>
              </div>
            </div>

            <!-- Información del producto -->
            <div class="info-section">


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

              <!-- Información de Stock -->
              <div v-if="producto?.stock" class="stock-info">
                <div class="stock-header">
                  <h3>Disponibilidad</h3>
                  <div class="stock-status" :class="stockStatusClass">
                    <i :class="stockIcon"></i>
                    <span>{{ stockStatus }}</span>
                  </div>
                </div>
                
                <div class="stock-details">
                  <div class="stock-item">
                    <span class="stock-label">Stock Total:</span>
                    <span class="stock-value">{{ producto.stock.total || 0 }} unidades</span>
                  </div>
                  <div class="stock-item">
                    <span class="stock-label">Disponible:</span>
                    <span class="stock-value">{{ producto.stock.disponible || 0 }} unidades</span>
                  </div>
                  <div v-if="producto.stock.reservado > 0" class="stock-item">
                    <span class="stock-label">Reservado:</span>
                    <span class="stock-value">{{ producto.stock.reservado }} unidades</span>
                  </div>
                  <div v-if="producto.stock.fecha_actualizacion" class="stock-item">
                    <span class="stock-label">Actualizado:</span>
                    <span class="stock-value">{{ formatStockDate(producto.stock.fecha_actualizacion) }}</span>
                  </div>
                </div>
              </div>

              <!-- Descripción -->
              <div v-if="producto?.descripcion_real" class="descripcion">
                <h3>Descripción</h3>
                <p>{{ producto.descripcion_real }}</p>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { catalogo } from '@/stores/catalogo'

const imagenSeleccionada = ref(0)
const isZoomed = ref(false)
const zoomStyle = ref({})
const isMobile = ref(false)
const imagenContainer = ref(null)
const imagenMain = ref(null)

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
const tiposVistaDisponibles = computed(() => {
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

// Computed properties para el stock
const stockStatusClass = computed(() => {
  if (!producto.value?.stock) return 'stock-unknown'
  
  if (producto.value.stock.disponible > 0) {
    return producto.value.stock.disponible > 5 ? 'stock-high' : 'stock-low'
  }
  return 'stock-out'
})

const stockIcon = computed(() => {
  if (!producto.value?.stock) return 'fas fa-question-circle'
  
  if (producto.value.stock.disponible > 0) {
    return producto.value.stock.disponible > 5 ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'
  }
  return 'fas fa-times-circle'
})

const stockStatus = computed(() => {
  if (!producto.value?.stock) return 'Stock no disponible'
  
  if (producto.value.stock.disponible > 0) {
    return producto.value.stock.disponible > 5 ? 'En stock' : 'Últimas unidades disponibles'
  }
  return 'Producto agotado'
})

// Formatear fecha de actualización del stock
const formatStockDate = (dateString) => {
  if (!dateString) return 'No disponible'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Fecha inválida'
  }
}

// Cerrar modal
const cerrarModal = () => {
  catalogo.cerrarModal()
}

// Navegación de imágenes
const imagenAnterior = () => {
  if (imagenSeleccionada.value > 0) {
    imagenSeleccionada.value--
  }
}

const imagenSiguiente = () => {
  if (imagenSeleccionada.value < imagenes.value.length - 1) {
    imagenSeleccionada.value++
  }
}

// Cambiar tipo de vista
const cambiarTipoVista = (tipo) => {
  const imagenIndex = imagenes.value.findIndex(img => img.tipo === tipo)
  if (imagenIndex !== -1) {
    imagenSeleccionada.value = imagenIndex
  }
}

// Verificar si tiene imágenes de un tipo específico
const tieneImagenesTipo = (tipo) => {
  return imagenes.value.some(img => img.tipo === tipo)
}

// Obtener icono según tipo
const getIconoTipo = (tipo) => {
  const iconos = {
    principal: 'fas fa-eye',
    perspectiva: 'fas fa-cube',
    frente: 'fas fa-square',
    atras: 'fas fa-square',
    lateral: 'fas fa-square',
    superior: 'fas fa-square'
  }
  return iconos[tipo] || 'fas fa-image'
}

// Funciones de zoom
const handleMouseMove = (event) => {
  if (isMobile.value) return
  
  const rect = imagenContainer.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  const xPercent = (x / rect.width) * 100
  const yPercent = (y / rect.height) * 100
  
  zoomStyle.value = {
    transform: 'scale(1.5)',
    transformOrigin: `${xPercent}% ${yPercent}%`
  }
  isZoomed.value = true
}

const handleMouseLeave = () => {
  if (isMobile.value) return
  
  zoomStyle.value = {}
  isZoomed.value = false
}

const handleImageClick = () => {
  if (isMobile.value) {
    if (isZoomed.value) {
      // Si está ampliada, reducir
      zoomStyle.value = {}
      isZoomed.value = false
    } else {
      // Si no está ampliada, ampliar
      zoomStyle.value = {
        transform: 'scale(2)',
        transformOrigin: 'center'
      }
      isZoomed.value = true
    }
  }
}

// Detectar si es móvil
const detectarDispositivo = () => {
  isMobile.value = window.innerWidth <= 768
}

// Reset imagen seleccionada cuando cambia el producto
watch(producto, () => {
  imagenSeleccionada.value = 0
  isZoomed.value = false
  zoomStyle.value = {}
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

// Lifecycle hooks
onMounted(() => {
  detectarDispositivo()
  window.addEventListener('resize', detectarDispositivo)
})

onUnmounted(() => {
  window.removeEventListener('resize', detectarDispositivo)
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
  max-width: 95vw;
  width: 1000px;
  max-height: 95vh;
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
  gap: 1.5rem;
  padding: 1.5rem;
}

@media (min-width: 768px) {
  .modal-content {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 2rem;
  }
}

/* Sección de imagen */
.imagen-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.imagen-principal-container {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 1rem;
  overflow: hidden;
  background: #f8f9fa;
  max-height: 400px;
}

.imagen-principal {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: zoom-in;
}

.imagen-main {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
  max-width: 100%;
  max-height: 100%;
}

.imagen-main.zoom-active {
  cursor: zoom-out;
}

/* Controles de navegación */
.imagen-controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  pointer-events: none;
}

.control-btn {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #374151;
  transition: all 0.2s;
  pointer-events: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.control-btn:hover:not(:disabled) {
  background: white;
  transform: scale(1.1);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Indicadores de imagen */
.imagen-indicators {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
}

.indicator-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.indicator-dot.active {
  background: white;
  transform: scale(1.2);
}

/* Botones de tipo de vista */
.vista-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.vista-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.vista-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.vista-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.vista-btn.has-images {
  border-color: #10b981;
  color: #10b981;
}

.vista-btn.has-images:hover {
  background: #10b981;
  color: white;
}

.vista-btn.has-images.active {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

/* Overlay de zoom para móvil */
.zoom-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  pointer-events: none;
}

.zoom-overlay i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: block;
}

.zoom-overlay span {
  font-size: 0.875rem;
}

/* Thumbnails */
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
  position: relative;
}

.thumbnail.active {
  border-color: #3b82f6;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.thumbnail:hover .thumbnail-overlay {
  opacity: 1;
}

/* Sección de información */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

/* Estilos para información de stock */
.stock-info {
  background: #f8fafc;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 1.5rem 0;
  border: 1px solid #e2e8f0;
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.stock-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.stock-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
}

.stock-status i {
  font-size: 1rem;
}

.stock-status.stock-high {
  background: #d1fae5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.stock-status.stock-low {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.stock-status.stock-out {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.stock-status.stock-unknown {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.stock-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.stock-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.stock-value {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 600;
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
    margin: 0.5rem;
    border-radius: 1rem;
    max-height: 98vh;
    width: auto;
  }
  
  .modal-content {
    padding: 1rem;
    gap: 1rem;
  }
  
  .imagen-principal-container {
    aspect-ratio: 4/3;
    max-height: 300px;
  }
  

  
  .vista-buttons {
    justify-content: flex-start;
  }
  
  .vista-btn {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
  
  .control-btn {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }
}
</style>
