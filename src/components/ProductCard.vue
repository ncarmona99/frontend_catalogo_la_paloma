<template>
  <div 
    class="producto-card"
      :class="{ 
    loading: loading
  }"
    @click="handleClick"
  >

    <!-- Imagen del producto -->
    <div class="producto-imagen">
      <img 
        :src="imagenPrincipal" 
        :alt="producto.descripcion"
        @load="onImageLoad"
        @error="onImageError"
        loading="lazy"
      />
    </div>

    <!-- Información del producto -->
    <div class="producto-info">
      <!-- Nombre del producto -->
      <h3 class="producto-nombre">
        {{ producto.descripcion }}
      </h3>

      <!-- Marca -->
      <div v-if="producto.marca" class="producto-marca">
        <i class="fas fa-tag"></i>
        <span>{{ producto.marca.nombre }}</span>
      </div>

      <!-- Categoría/Familia -->
      <div v-if="producto.familia" class="producto-familia">
        <i class="fas fa-folder"></i>
        <span>{{ producto.familia.nombre }}</span>
      </div>

      <!-- Stock -->
      <div v-if="producto.stock" class="producto-stock">
        <div class="stock-indicator" :class="stockClass">
          <i :class="stockIcon"></i>
          <span class="stock-text">{{ stockText }}</span>
        </div>
        <div v-if="producto.stock.disponible > 0" class="stock-cantidad">
          {{ producto.stock.disponible }} disponibles
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { catalogo } from '@/stores/catalogo'

const props = defineProps({
  producto: {
    type: Object,
    required: true
  }
})

const loading = ref(false)
const imageLoaded = ref(false)

// Computed properties
const imagenPrincipal = computed(() => {
  const imagenes = props.producto.imagenes || []
  const principal = imagenes.find(img => img.tipo === 'principal')
  
  if (principal) {
    return principal.url
  }
  
  // Si no hay imagen principal, usar la primera disponible
  if (imagenes.length > 0) {
    return imagenes[0].url
  }
  
  // Imagen placeholder
  return '/images/placeholder-product.svg'
})




// Computed properties para el stock
const stockClass = computed(() => {
  if (!props.producto.stock) return 'stock-unknown'
  
  if (props.producto.stock.disponible > 0) {
    return props.producto.stock.disponible > 5 ? 'stock-high' : 'stock-low'
  }
  return 'stock-out'
})

const stockIcon = computed(() => {
  if (!props.producto.stock) return 'fas fa-question-circle'
  
  if (props.producto.stock.disponible > 0) {
    return props.producto.stock.disponible > 5 ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'
  }
  return 'fas fa-times-circle'
})

const stockText = computed(() => {
  if (!props.producto.stock) return 'Stock no disponible'
  
  if (props.producto.stock.disponible > 0) {
    return props.producto.stock.disponible > 5 ? 'En stock' : 'Últimas unidades'
  }
  return 'Agotado'
})

// Manejar click en la tarjeta
const handleClick = async () => {
  if (loading.value) return
  
  loading.value = true
  await catalogo.abrirModal(props.producto.id)
  loading.value = false
}

// Eventos de imagen
const onImageLoad = () => {
  imageLoaded.value = true
}

const onImageError = (event) => {
  // Si falla la imagen, usar placeholder
  event.target.src = '/images/placeholder-product.svg'
  imageLoaded.value = true
}
</script>

<style scoped>
.producto-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.producto-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}






.producto-imagen {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.producto-imagen img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
  max-width: 100%;
  max-height: 100%;
}

.producto-card:hover .producto-imagen img {
  transform: scale(1.05);
}

.producto-info {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.producto-marca,
.producto-familia {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.producto-marca i,
.producto-familia i {
  color: #3b82f6;
  font-size: 0.9rem;
  width: 16px;
  text-align: center;
}

.producto-nombre {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.producto-stock {
  margin-top: auto;
  padding-top: 0.5rem;
}

.stock-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stock-indicator i {
  font-size: 0.875rem;
  width: 16px;
  text-align: center;
}

.stock-cantidad {
  font-size: 0.7rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

/* Estados del stock */
.stock-high {
  color: #059669;
}

.stock-high i {
  color: #10b981;
}

.stock-low {
  color: #d97706;
}

.stock-low i {
  color: #f59e0b;
}

.stock-out {
  color: #dc2626;
}

.stock-out i {
  color: #ef4444;
}

.stock-unknown {
  color: #6b7280;
}

.stock-unknown i {
  color: #9ca3af;
}




.producto-card.loading {
  pointer-events: none;
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
  .producto-info {
    padding: 0.75rem;
  }
  
  .producto-nombre {
    font-size: 0.9rem;
  }
  
  .precio-actual {
    font-size: 1.1rem;
  }
}
</style>
