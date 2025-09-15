# Estructura de Imágenes de Productos

Esta carpeta contiene las imágenes de los productos organizadas por tipo de vista.

## Estructura de Carpetas

```
productos/
├── principal/     # Imagen principal del producto
├── perspectiva/   # Vista en perspectiva 3D
├── frente/        # Vista frontal
├── atras/         # Vista trasera
├── lateral/       # Vista lateral
└── superior/      # Vista superior
```

## Convención de Nomenclatura

Para asociar imágenes a un producto específico, usa el siguiente formato:

```
{producto_id}_{tipo}_{orden}.{extension}
```

### Ejemplos:
- `1_principal_1.jpg` - Imagen principal del producto ID 1
- `1_perspectiva_1.jpg` - Primera vista en perspectiva del producto ID 1
- `1_frente_1.jpg` - Vista frontal del producto ID 1
- `1_lateral_1.jpg` - Vista lateral del producto ID 1
- `1_superior_1.jpg` - Vista superior del producto ID 1

## Tipos de Vista Soportados

1. **principal** - Imagen principal/representativa del producto
2. **perspectiva** - Vista en perspectiva 3D o ángulo oblicuo
3. **frente** - Vista frontal del producto
4. **atras** - Vista trasera del producto
5. **lateral** - Vista lateral (izquierda o derecha)
6. **superior** - Vista desde arriba

## Formatos Soportados

- JPG/JPEG
- PNG
- WebP
- SVG (para iconos)

## Tamaños Recomendados

- **Imagen principal**: 800x800px mínimo
- **Vistas adicionales**: 600x600px mínimo
- **Thumbnails**: Se generan automáticamente

## Configuración en cPanel

Para configurar en cPanel:

1. Sube las imágenes a la carpeta correspondiente
2. Asegúrate de que los permisos sean 644
3. Las URLs serán: `/images/productos/{tipo}/{nombre_archivo}`

## Ejemplo de Uso

Si tienes un producto con ID 123, puedes crear:

```
productos/
├── principal/
│   └── 123_principal_1.jpg
├── perspectiva/
│   ├── 123_perspectiva_1.jpg
│   └── 123_perspectiva_2.jpg
├── frente/
│   └── 123_frente_1.jpg
└── lateral/
    └── 123_lateral_1.jpg
```

El sistema automáticamente detectará y mostrará estas imágenes en el carrusel del modal del producto.
