# 🎨 Frontend - Catálogo La Paloma

## 🚀 Configuración de Variables de Entorno

### Desarrollo Local
```bash
# El archivo env.development se usa automáticamente
npm run dev
```

### Producción
```bash
# El archivo env.production se usa automáticamente
npm run build
```

## 📁 Estructura de Archivos de Configuración

```
catalogo-la-paloma/
├── env.development          # Variables para desarrollo
├── env.production           # Variables para producción
├── src/
│   └── config/
│       └── api.js          # Configuración centralizada de API
└── vite.config.js          # Configuración de Vite
```

## 🔧 Variables de Entorno Disponibles

### Desarrollo (env.development)
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=Catálogo La Paloma (Desarrollo)
VITE_APP_ENV=development
```

### Producción (env.production)
```env
VITE_API_URL=https://catalogo.librerialapaloma.cl/api
VITE_APP_TITLE=Catálogo La Paloma
VITE_APP_ENV=production
```

## 📦 Uso en el Código

### Importar configuración
```javascript
import { apiCall, API_CONFIG, isDevelopment, isProduction } from '@/config/api'

// Usar la función apiCall
const data = await apiCall('/productos')

// Verificar entorno
if (isDevelopment()) {
  console.log('Modo desarrollo')
}

// Obtener URL completa
const url = API_CONFIG.BASE_URL + '/productos'
```

### Variables de entorno en componentes
```javascript
// En cualquier componente Vue
console.log(import.meta.env.VITE_API_URL)
console.log(import.meta.env.VITE_APP_TITLE)
```

## 🏗️ Scripts de Build

### Desarrollo
```bash
npm run dev
# Usa env.development automáticamente
```

### Producción
```bash
npm run build
# Usa env.production automáticamente
```

### Preview de producción
```bash
npm run preview
# Para probar el build de producción localmente
```

## 🔄 Actualización para cPanel

### 1. Build para producción
```bash
npm run build
```

### 2. Subir archivos
Subir la carpeta `dist/` completa a tu directorio web en cPanel.

### 3. Configurar .htaccess (si es necesario)
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## 🐛 Debugging

### Verificar configuración
```javascript
// En la consola del navegador
console.log('API URL:', import.meta.env.VITE_API_URL)
console.log('Environment:', import.meta.env.VITE_APP_ENV)
```

### Logs de API
Los logs de API se muestran en la consola del navegador:
- 🌐 API Call: URL que se está llamando
- 📡 Response status: Código de respuesta
- 📦 Response data: Datos recibidos
- ❌ API Error: Errores si los hay

## 📱 Responsive Design

La aplicación está configurada para ser responsive y funcionar en:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

## 🔒 Seguridad

- Las variables de entorno que empiezan con `VITE_` son públicas
- No incluir información sensible en variables públicas
- Usar variables de entorno del servidor para datos sensibles
