# Configuración de Imágenes en cPanel

## Estructura de Carpetas en cPanel

Una vez que subas el proyecto a cPanel, la estructura de carpetas para las imágenes debería ser:

```
public_html/
├── catalogo-la-paloma/
│   ├── public/
│   │   └── images/
│   │       ├── productos/
│   │       │   ├── principal/
│   │       │   ├── perspectiva/
│   │       │   ├── frente/
│   │       │   ├── atras/
│   │       │   ├── lateral/
│   │       │   └── superior/
│   │       └── placeholder-product.svg
│   └── ...
└── api/
    └── ...
```

## Pasos para Configurar en cPanel

### 1. Subir Imágenes

1. Accede a tu cPanel
2. Ve a **File Manager**
3. Navega a `public_html/catalogo-la-paloma/public/images/productos/`
4. Sube las imágenes a las carpetas correspondientes

### 2. Configurar Permisos

Para cada carpeta de imágenes, configura los permisos:
- **Carpetas**: 755
- **Archivos**: 644

### 3. Verificar Rutas

Las URLs de las imágenes serán:
```
https://tudominio.com/catalogo-la-paloma/public/images/productos/principal/1_principal_1.jpg
https://tudominio.com/catalogo-la-paloma/public/images/productos/perspectiva/1_perspectiva_1.jpg
```

### 4. Configurar .htaccess (Opcional)

Si quieres optimizar el acceso a las imágenes, crea un archivo `.htaccess` en la carpeta `public/images/`:

```apache
# Optimización de imágenes
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/webp "access plus 1 month"
</IfModule>

# Compresión de imágenes
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE image/jpg
    AddOutputFilterByType DEFLATE image/jpeg
    AddOutputFilterByType DEFLATE image/png
    AddOutputFilterByType DEFLATE image/webp
</IfModule>
```

## Convención de Nomenclatura

### Formato
```
{producto_id}_{tipo}_{orden}.{extension}
```

### Ejemplos
- `1_principal_1.jpg` - Imagen principal del producto ID 1
- `1_perspectiva_1.jpg` - Primera vista en perspectiva
- `1_perspectiva_2.jpg` - Segunda vista en perspectiva
- `2_frente_1.jpg` - Vista frontal del producto ID 2

### Tipos de Vista Soportados
- `principal` - Imagen principal
- `perspectiva` - Vista en perspectiva 3D
- `frente` - Vista frontal
- `atras` - Vista trasera
- `lateral` - Vista lateral
- `superior` - Vista superior

## Optimización de Imágenes

### Antes de Subir
1. **Redimensionar**: Máximo 1200x1200px
2. **Comprimir**: Usar herramientas como TinyPNG
3. **Formato**: Preferir WebP, luego JPG
4. **Peso**: Máximo 500KB por imagen

### Herramientas Recomendadas
- **Online**: TinyPNG, Squoosh
- **Desktop**: GIMP, Photoshop
- **Batch**: ImageMagick

## Verificación

Para verificar que todo funciona:

1. Sube algunas imágenes de prueba
2. Abre el catálogo en tu navegador
3. Busca un producto que tenga imágenes
4. Haz clic en el producto para abrir el modal
5. Verifica que:
   - Se muestran las imágenes correctamente
   - Funciona la navegación entre imágenes
   - Funciona el zoom en desktop
   - Funciona el tap para ampliar en móvil

## Solución de Problemas

### Las imágenes no se muestran
1. Verifica que las rutas sean correctas
2. Revisa los permisos de archivos (644)
3. Verifica que los nombres coincidan con la convención

### Error 404 en imágenes
1. Verifica que las carpetas existan
2. Revisa la configuración de .htaccess
3. Contacta al soporte de cPanel si es necesario

### Imágenes muy lentas
1. Optimiza las imágenes antes de subir
2. Usa formato WebP cuando sea posible
3. Configura el .htaccess para cache

## Notas Importantes

- El sistema detecta automáticamente las imágenes según el patrón de nomenclatura
- No es necesario configurar nada en la base de datos
- Las imágenes se organizan por tipo de vista automáticamente
- El sistema es escalable y puede manejar múltiples imágenes por producto
