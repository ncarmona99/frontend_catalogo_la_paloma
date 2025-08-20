<template>
  <div 
    class="producto-card"
    :class="{ loading: loading }"
    @click="handleClick"
  >
    <!-- Badge de destacado -->
    <div v-if="producto.destacado" class="producto-badge">
      ⭐ Destacado
    </div>

    <!-- Imagen del producto -->
    <div class="producto-imagen">
      <img 
        :src="imagenPrincipal" 
        :alt="producto.nombre"
        @load="onImageLoad"
        @error="onImageError"
        loading="lazy"
      />
    </div>

    <!-- Información del producto -->
    <div class="producto-info">
      <!-- Marca -->
      <div class="producto-marca">
        {{ producto.marca?.nombre || 'Sin marca' }}
      </div>

      <!-- Nombre -->
      <h3 class="producto-nombre">
        {{ producto.nombre }}
      </h3>

      <!-- Precio -->
      <div class="producto-precio">
        ${{ formatearPrecio(producto.precio) }}
      </div>

      <!-- Stock -->
      <div 
        class="producto-stock"
        :class="{
          'disponible': producto.stock > 0,
          'agotado': producto.stock <= 0
        }"
      >
        {{ producto.stock > 0 ? `${producto.stock} disponibles` : 'Agotado' }}
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

// Imagen principal del producto
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

// Formatear precio con separadores de miles
const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-CL').format(precio)
}

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
/* Los estilos están en catalogo.css para evitar duplicación */
</style>
