# 🛍️ Configuración de Shopify - Backend Proxy

Este proyecto incluye un **servidor backend Express** que actúa como proxy para la API de Shopify, resolviendo problemas de CORS en desarrollo local.

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias incluyendo:
- `express` - Servidor backend
- `cors` - Manejo de CORS
- `dotenv` - Variables de entorno
- `concurrently` - Ejecutar frontend y backend simultáneamente

### 2. Configurar Variables de Entorno (Opcional)

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Contenido del `.env`:
```env
# Backend Server
PORT=3001

# Vite Frontend
VITE_BACKEND_URL=http://localhost:3001
```

### 3. Ejecutar la Aplicación

Tienes 3 opciones:

#### Opción A: Ejecutar Todo Junto (Recomendado)
```bash
npm run dev:all
```
Esto ejecuta simultáneamente:
- Frontend (Vite) en http://localhost:5173
- Backend (Express) en http://localhost:3001

#### Opción B: Ejecutar Por Separado

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

### 4. Configurar Credenciales de Shopify en la UI

1. Abre la aplicación: http://localhost:5173
2. Ve a la sección **"⚙️ Credenciales"**
3. En la sección **Shopify**, configura:
   - **Store URL**: `aromatista.myshopify.com` (o solo `aromatista`)
   - **Access Token**: Tu token de acceso de Shopify Admin API

## 🔐 Cómo Obtener el Access Token de Shopify

### Método 1: Custom App (Recomendado para Desarrollo)

1. Ve a tu Admin de Shopify: `https://aromatista.myshopify.com/admin`
2. Settings → Apps and sales channels → **Develop apps**
3. **Create an app** → Dale un nombre (ej: "Content Generator")
4. En la pestaña **Configuration**:
   - Habilita **Admin API**
   - Selecciona estos scopes:
     - `write_products`
     - `read_products`
     - `write_collections`
     - `read_collections`
5. **Save** → Ve a **API credentials**
6. **Install app** en tu tienda
7. Copia el **Admin API access token**

### Método 2: Private App (Método Antiguo)

1. Admin → Settings → Apps and sales channels
2. Develop apps → Allow custom app development
3. Create app → Configure Admin API scopes
4. Install app → Copiar Access Token

## 📡 Cómo Funciona el Backend Proxy

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   React     │────────▶│   Express   │────────▶│   Shopify   │
│  (Browser)  │         │   Backend   │         │     API     │
│ :5173       │         │   :3001     │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
                              ↑
                         Evita CORS
```

**Sin backend**: El navegador bloquea las llamadas directas a Shopify por CORS.
**Con backend**: Express hace las llamadas a Shopify y devuelve los resultados al frontend.

## 🔧 Endpoints del Backend

### POST /api/shopify/graphql
Proxy para GraphQL de Shopify

**Headers requeridos:**
- `storeUrl`: URL de tu tienda (ej: aromatista.myshopify.com)
- `accessToken`: Tu token de acceso de Shopify

**Body:**
```json
{
  "query": "query { shop { name } }",
  "variables": {}
}
```

### GET /health
Health check del servidor

## 🐛 Troubleshooting

### Error: "Missing storeUrl or accessToken in headers"
- Asegúrate de configurar las credenciales en la UI
- Verifica que el backend esté corriendo en :3001

### Error: "Network Error" o "Failed to fetch"
- Verifica que el backend esté corriendo: `npm run server`
- Chequea que el frontend apunte a http://localhost:3001

### Error: "Access token is invalid"
- Tu token de Shopify expiró o es incorrecto
- Genera un nuevo token desde Shopify Admin

### Error de CORS
- Asegúrate de usar el backend proxy
- No hagas llamadas directas a Shopify desde el navegador

## 📚 Recursos Adicionales

- [Shopify Admin API Documentation](https://shopify.dev/docs/api/admin-graphql)
- [GraphQL Shopify Explorer](https://shopify.dev/docs/api/admin-graphql)
- [Crear Custom Apps](https://help.shopify.com/en/manual/apps/app-types/custom-apps)

## 💡 Notas Importantes

1. **Nunca commits el archivo .env con credenciales reales**
2. El backend es solo para desarrollo local
3. Para producción, considera usar:
   - Vercel Functions
   - Netlify Functions
   - O una Shopify App oficial

## ✅ Checklist de Configuración

- [ ] Dependencias instaladas (`npm install`)
- [ ] Backend corriendo (`npm run server`)
- [ ] Frontend corriendo (`npm run dev`)
- [ ] Token de Shopify generado
- [ ] Credenciales configuradas en la UI
- [ ] Conexión probada con "Test Connection"
