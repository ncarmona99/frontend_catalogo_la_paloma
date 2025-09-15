# Panel Administrativo - Catálogo La Paloma

## Descripción

El panel administrativo del catálogo La Paloma es una interfaz moderna y funcional que permite gestionar completamente el catálogo de productos, incluyendo categorías, productos e imágenes.

## Características Principales

### 🎨 Diseño Moderno
- Interfaz limpia y profesional
- Diseño responsive para todos los dispositivos
- Navegación intuitiva con breadcrumbs
- Iconografía clara y consistente

### 🔐 Seguridad
- Autenticación requerida para todas las funciones administrativas
- Control de acceso basado en roles (solo administradores)
- Validación de datos en frontend y backend
- Middleware de autenticación en todas las rutas

### 📊 Funcionalidades CRUD Completas

#### 1. Gestión de Categorías
- **Crear** nuevas categorías con código y nombre
- **Leer** lista de categorías con estadísticas
- **Actualizar** información de categorías existentes
- **Eliminar** categorías (con validación de productos asociados)
- **Búsqueda** y filtrado en tiempo real
- **Validación** de códigos únicos

#### 2. Gestión de Productos
- **Crear** productos completos con toda la información
- **Leer** lista de productos con filtros avanzados
- **Actualizar** información de productos existentes
- **Eliminar** productos (soft delete)
- **Filtros avanzados**:
  - Búsqueda por nombre, código, SKU
  - Filtro por categoría, marca, estado
  - Filtro por precio mínimo/máximo
  - Filtro por disponibilidad web
- **Paginación** inteligente
- **Estadísticas** en tiempo real

#### 3. Gestión de Imágenes
- **Subir** múltiples imágenes por producto
- **Organizar** por tipo de vista (principal, frente, lateral, etc.)
- **Visualizar** en modo cuadrícula o lista
- **Eliminar** imágenes individuales
- **Filtros** por producto y tipo de vista
- **Estadísticas** de imágenes por producto

## Estructura de Archivos

### Frontend (Vue.js)
```
src/
├── views/admin/
│   ├── AdminCategoriasView.vue      # Gestión de categorías
│   ├── AdminProductosView.vue       # Lista de productos
│   ├── AdminProductoFormView.vue    # Formulario de productos
│   └── AdminImagenesView.vue        # Gestión de imágenes
├── components/
│   └── AdminNavbar.vue              # Navegación administrativa
└── router/
    └── index.js                     # Rutas administrativas
```

### Backend (Node.js/Express)
```
api/src/
├── controllers/
│   └── adminController.js           # Lógica de negocio administrativa
├── routes/
│   └── admin.js                     # Rutas administrativas
└── middleware/
    └── auth.js                      # Autenticación
```

## Rutas del Frontend

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/admin/categorias` | Gestión de categorías | Administradores |
| `/admin/productos` | Lista de productos | Administradores |
| `/admin/productos/nuevo` | Crear producto | Administradores |
| `/admin/productos/editar/:id` | Editar producto | Administradores |
| `/admin/imagenes` | Gestión de imágenes | Administradores |

## Endpoints del Backend

### Categorías
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/admin/categorias` | Crear categoría |
| `PUT` | `/api/admin/categorias/:id` | Actualizar categoría |
| `DELETE` | `/api/admin/categorias/:id` | Eliminar categoría |

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/admin/productos` | Crear producto |
| `PUT` | `/api/admin/productos/:id` | Actualizar producto |
| `DELETE` | `/api/admin/productos/:id` | Eliminar producto |

### Imágenes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/admin/imagenes` | Obtener todas las imágenes |
| `POST` | `/api/admin/imagenes/upload` | Subir imágenes |
| `DELETE` | `/api/admin/imagenes/:id` | Eliminar imagen |

## Características Técnicas

### Frontend
- **Framework**: Vue.js 3 con Composition API
- **Router**: Vue Router con guards de navegación
- **Estado**: Pinia para gestión de estado
- **HTTP**: Axios para comunicación con API
- **UI**: CSS personalizado con diseño moderno
- **Iconos**: Font Awesome

### Backend
- **Framework**: Express.js
- **Base de Datos**: MySQL con pool de conexiones
- **Autenticación**: JWT con middleware
- **Validación**: Validación manual de datos
- **Manejo de errores**: Middleware centralizado

### Seguridad
- **Autenticación**: JWT tokens
- **Autorización**: Control de roles
- **Validación**: Frontend y backend
- **CORS**: Configuración específica
- **Sanitización**: Limpieza de datos de entrada

## Instalación y Configuración

### Prerrequisitos
- Node.js 16+
- MySQL 8.0+
- NPM o Yarn

### Frontend
```bash
cd catalogo-la-paloma
npm install
npm run dev
```

### Backend
```bash
cd api
npm install
npm start
```

### Base de Datos
1. Crear base de datos MySQL
2. Ejecutar scripts SQL de inicialización
3. Configurar variables de entorno

## Variables de Entorno

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=usuario
DB_PASSWORD=password
DB_NAME=lapaloma_db
JWT_SECRET=tu_secreto_jwt
NODE_ENV=development
```

## Uso del Sistema

### 1. Acceso al Panel
1. Iniciar sesión con credenciales de administrador
2. Navegar al dashboard
3. Usar los enlaces de "Acciones Rápidas"

### 2. Gestión de Categorías
1. Ir a "Gestionar Categorías"
2. Crear nuevas categorías con código único
3. Editar o eliminar categorías existentes
4. Usar búsqueda para encontrar categorías

### 3. Gestión de Productos
1. Ir a "Gestionar Productos"
2. Usar filtros para encontrar productos
3. Crear nuevos productos con formulario completo
4. Editar productos existentes
5. Eliminar productos (soft delete)

### 4. Gestión de Imágenes
1. Ir a "Gestionar Imágenes"
2. Subir imágenes por producto y tipo de vista
3. Visualizar imágenes en cuadrícula o lista
4. Eliminar imágenes no deseadas

## Validaciones y Reglas de Negocio

### Categorías
- Código único obligatorio
- Nombre obligatorio
- No se puede eliminar si tiene productos asociados

### Productos
- Código de producto único obligatorio
- Descripción obligatoria
- Validación de precios y stock
- Soft delete (cambia estado a DESCONTINUADO)

### Imágenes
- Formato: JPG, PNG, WebP
- Nomenclatura: `{producto_id}_{tipo}_{orden}.{extension}`
- Tipos de vista: principal, perspectiva, frente, atrás, lateral, superior

## Mantenimiento y Soporte

### Logs
- Logs de errores en consola del servidor
- Logs de operaciones CRUD
- Logs de autenticación

### Backup
- Backup automático de base de datos recomendado
- Backup de imágenes en servidor

### Monitoreo
- Health check endpoint: `/api/health`
- Monitoreo de conexión a base de datos
- Validación de archivos de imágenes

## Próximas Mejoras

### Funcionalidades Planificadas
- [ ] Gestión de usuarios (CRUD completo)
- [ ] Sistema de permisos granular
- [ ] Auditoría de cambios
- [ ] Exportación de datos
- [ ] Importación masiva de productos
- [ ] Editor de imágenes integrado
- [ ] Sistema de notificaciones
- [ ] Dashboard con métricas avanzadas

### Mejoras Técnicas
- [ ] Cache de imágenes
- [ ] Optimización de consultas
- [ ] Compresión de imágenes automática
- [ ] API rate limiting
- [ ] Documentación con Swagger
- [ ] Tests automatizados

## Soporte

Para soporte técnico o consultas sobre el panel administrativo, contactar al equipo de desarrollo.

---

**Versión**: 1.0.0  
**Fecha**: Diciembre 2024  
**Desarrollado por**: Equipo La Paloma
