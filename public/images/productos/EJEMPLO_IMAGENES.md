# Ejemplos de Imágenes para Probar el Sistema

Para probar el sistema de carrusel de imágenes, puedes usar estas imágenes de ejemplo. Simplemente descarga algunas imágenes de corcheteras o productos similares y nómbralas según esta convención.

## Estructura de Ejemplo para Producto ID 1

```
productos/
├── principal/
│   └── 1_principal_1.jpg          # Imagen principal de la corchetera
├── perspectiva/
│   ├── 1_perspectiva_1.jpg        # Vista en perspectiva 3D
│   └── 1_perspectiva_2.jpg        # Otra vista en perspectiva
├── frente/
│   └── 1_frente_1.jpg             # Vista frontal
├── atras/
│   └── 1_atras_1.jpg              # Vista trasera
├── lateral/
│   └── 1_lateral_1.jpg            # Vista lateral
└── superior/
    └── 1_superior_1.jpg           # Vista desde arriba
```

## Estructura de Ejemplo para Producto ID 2

```
productos/
├── principal/
│   └── 2_principal_1.jpg
├── perspectiva/
│   ├── 2_perspectiva_1.jpg
│   └── 2_perspectiva_2.jpg
└── frente/
    └── 2_frente_1.jpg
```

## Cómo Obtener Imágenes de Prueba

1. **Google Images**: Busca "corchetera" o "stapler" y descarga algunas imágenes
2. **Unsplash**: Busca imágenes de productos de oficina
3. **Pexels**: Imágenes gratuitas de alta calidad
4. **Pixabay**: Imágenes libres de derechos

## Pasos para Probar

1. Descarga 3-5 imágenes de corcheteras
2. Nómbralas según la convención (ej: `1_principal_1.jpg`, `1_perspectiva_1.jpg`, etc.)
3. Colócalas en las carpetas correspondientes
4. Abre el catálogo y busca el producto con ID 1
5. Haz clic en el producto para abrir el modal
6. Prueba las funcionalidades:
   - Navegación con flechas
   - Botones de tipo de vista
   - Zoom con el mouse (desktop)
   - Tap para ampliar (móvil)
   - Thumbnails

## Formatos Soportados

- JPG/JPEG
- PNG
- WebP
- SVG

## Tamaños Recomendados

- **Mínimo**: 400x400px
- **Recomendado**: 800x800px
- **Máximo**: 1200x1200px

## Notas Importantes

- Las imágenes deben tener el mismo aspect ratio (cuadradas)
- Usa imágenes de buena calidad pero optimizadas para web
- El sistema detectará automáticamente las imágenes según el patrón de nomenclatura
- Si no hay imágenes, se mostrará la imagen placeholder por defecto
