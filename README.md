# 🎯 Shopify Product & Collection Generator

Sistema completo de generación de contenido SEO-optimizado para Shopify usando IA (GPT-5, Claude 4-5 Sonnet, Gemini 2.5 Pro), con tracking de Google Search Console y generación de imágenes con Nano Banana.

## 🚀 Características

- ✅ **Multi-modelo IA**: GPT-5, Claude 4-5 Sonnet, Gemini 2.5 Pro
- ✅ **Generación de contenido**: Títulos, handles y descripciones SEO-optimizadas
- ✅ **Integración Shopify**: GraphQL API 2025-10 (última estable)
- ✅ **Imágenes con IA**: Nano Banana (Google DeepMind)
- ✅ **SEO Tracking**: Google Search Console con consolidación de redirects
- ✅ **Sistema de versiones**: Historial completo de cambios
- ✅ **Sincronización bidireccional**: Shopify ↔ App local
- ✅ **Encriptación**: Credenciales protegidas con AES-256
- ✅ **Importación masiva**: JSON con keywords agrupadas

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta de Shopify con acceso Admin API
- API Keys de al menos un proveedor de IA:
  - OpenAI (GPT-5)
  - Anthropic (Claude)
  - Google AI (Gemini)

## 🛠️ Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd shopify-collection-product-generation

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
/src
├── /components
│   ├── /layout          # Header, Sidebar, MainLayout
│   ├── /credentials     # Panel de configuración
│   ├── /prompts         # Editor de templates
│   ├── /keywords        # Importador y visualizador
│   ├── /generation      # Panel de generación (próximamente)
│   ├── /images          # Generador de imágenes (próximamente)
│   └── /common          # Button, Input, Modal, etc.
├── /services
│   ├── aiService.js           # GPT-5, Claude, Gemini
│   ├── shopifyService.js      # GraphQL API 2025-10
│   ├── imageService.js        # Nano Banana
│   ├── gscService.js          # Google Search Console
│   └── storageService.js      # LocalStorage encriptado
├── /context
│   └── AppContext.jsx         # Estado global
├── /hooks
│   ├── useGeneration.js       # Hook de generación
│   └── useShopify.js          # Hook de Shopify
└── /utils
    ├── constants.js           # Constantes
    ├── validation.js          # Validaciones
    └── formatters.js          # Formateo de datos
```

## 🔧 Configuración

### 1. Credenciales de IA

Ve a **Configuración** y añade tu API key de al menos uno de estos proveedores:

**OpenAI (GPT-5)**
- Obtén tu API key en: https://platform.openai.com/api-keys
- Formato: `sk-...`

**Anthropic (Claude 4-5 Sonnet)**
- Obtén tu API key en: https://console.anthropic.com/
- Formato: `sk-ant-...`

**Google AI (Gemini 2.5 Pro)**
- Obtén tu API key en: https://makersuite.google.com/app/apikey
- Formato: `AIza...`

### 2. Shopify Admin API

1. Ve a tu tienda Shopify Admin
2. **Apps** → **Develop apps** → **Create an app**
3. Nombre: "Product Generator"
4. **Configure Admin API scopes**:
   - `write_products`
   - `read_products`
   - `write_collections`
   - `read_collections`
   - `write_redirects`
   - `read_redirects`
5. **Install app** y copia el **Admin API access token**

En la app:
- **Store URL**: `tu-tienda.myshopify.com`
- **Access Token**: `shpat_...`

### 3. Google Search Console (Opcional)

Para tracking SEO:

1. Ve a https://console.cloud.google.com/
2. Crea un proyecto nuevo
3. Habilita **Search Console API**
4. **Credentials** → **OAuth 2.0 Client IDs**
5. Configura OAuth consent screen
6. Copia Client ID y Client Secret

## 📝 Uso

### 1. Importar Keywords

1. Prepara un archivo JSON con esta estructura:

```json
[
  {
    "id": "group-1",
    "name": "perfume para el dia",
    "isGroup": true,
    "collapsed": true,
    "children": [
      {
        "id": "kw-1",
        "keyword": "perfume para el dia",
        "volume": 10,
        "isGroup": false
      },
      {
        "id": "kw-2",
        "keyword": "perfume uso diario",
        "volume": 15,
        "isGroup": false
      }
    ]
  }
]
```

2. Ve a **Importar** → Arrastra el archivo o selecciónalo
3. Elige **Reemplazar** o **Fusionar** con grupos existentes

### 2. Etiquetar Grupos

1. Ve a **Grupos de Keywords**
2. Para cada grupo, selecciona el tipo:
   - **Producto**: Genera un producto individual
   - **Colección**: Genera una colección que agrupa productos
3. El botón **Ver Detalle** aparecerá solo cuando esté etiquetado

### 3. Generar Contenido

1. Click en **Ver Detalle** en un grupo
2. Click en **🔄 Generar Contenido**
3. La IA generará:
   - **Título** SEO-optimizado
   - **Handle** URL-friendly
   - **Descripción HTML** con keywords integradas
4. Edita manualmente si es necesario
5. Click en **⬆️ Pasar a Shopify** para publicar

### 4. Prompts Personalizados

1. Click en **📝 Prompts** en el header
2. Edita los templates para productos/colecciones
3. Usa variables:
   - `{{keyword}}` - Keyword principal
   - `{{volume}}` - Volumen de búsqueda
   - `{{groupName}}` - Nombre del grupo
   - `{{keywords}}` - Lista completa de keywords
   - `{{totalVolume}}` - Suma de volúmenes

## 🔒 Seguridad

- **Encriptación AES-256**: Todas las credenciales se almacenan encriptadas en localStorage
- **No hay backend**: Toda la data permanece en tu navegador
- **No se envían datos a terceros**: Solo comunicación directa con APIs oficiales

## 🧪 Testing

```bash
# Verificar que todo compile
npm run build

# Preview de producción
npm run preview
```

## 🐛 Troubleshooting

**Error: "Shopify no está conectado"**
- Verifica que el Store URL termine en `.myshopify.com`
- Verifica que el Access Token sea correcto
- Click en "🧪 Probar Conexión" para validar

**Error: "API key inválida"**
- Verifica que el API key esté completo (sin espacios)
- Verifica que el modelo seleccionado coincida con el API key ingresado

**La aplicación no guarda los datos**
- Verifica que localStorage esté habilitado en tu navegador
- Revisa la consola del navegador para errores

## 📚 Próximas Características

- [ ] Panel de Generación completo con pestañas
- [ ] Panel de SEO Tracking con Google Search Console
- [ ] Generador de imágenes con Nano Banana
- [ ] Sistema de versionado y restauración
- [ ] Exportar/importar configuración completa
- [ ] Generación en batch (múltiples grupos)
- [ ] Preview HTML en tiempo real

## 🤝 Contribuir

Este proyecto está en desarrollo activo. Para contribuir:

1. Fork del repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -am 'Añade nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crea un Pull Request

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles

## 🙋 Soporte

Para reportar bugs o solicitar features, abre un issue en GitHub.

---

**Desarrollado con ❤️ usando React + Vite + TailwindCSS**
