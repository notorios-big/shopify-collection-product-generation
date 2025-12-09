// Constantes de la aplicación

export const AI_PROVIDERS = {
  GEMINI: 'gemini'
};

export const AI_PROVIDER_CONFIG = {
  [AI_PROVIDERS.GEMINI]: {
    name: 'Gemini 3 Pro Preview',
    provider: 'Google',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent',
    model: 'gemini-3-pro-preview'
  }
};

export const SHOPIFY_API_VERSION = '2024-10';

export const NANO_BANANA_CONFIG = {
  endpoint: 'https://generativelanguage.googleapis.com/v1/models/imagen-3.0-generate-001:predict',
  model: 'imagen-3.0-generate-001'
};

export const GSC_CONFIG = {
  authEndpoint: 'https://oauth2.googleapis.com/token',
  apiEndpoint: 'https://searchconsole.googleapis.com/v1'
};

export const GROUP_TYPES = {
  PRODUCT: 'product',
  COLLECTION: 'collection',
  UNTAGGED: null
};

export const STATUS = {
  NOT_GENERATED: 'not_generated',
  GENERATING: 'generating',
  GENERATED: 'generated',
  IN_SHOPIFY: 'in_shopify',
  ERROR: 'error'
};

export const STATUS_ICONS = {
  [STATUS.NOT_GENERATED]: '⚪',
  [STATUS.GENERATING]: '⏳',
  [STATUS.GENERATED]: '🟡',
  [STATUS.IN_SHOPIFY]: '🟢',
  [STATUS.ERROR]: '🔴'
};

export const IMAGE_STYLES = {
  REALISTIC: 'realista',
  ARTISTIC: 'artistico',
  MINIMALIST: 'minimalista',
  LUXURY: 'luxury'
};

export const ASPECT_RATIOS = {
  SQUARE: '1:1',
  LANDSCAPE_43: '4:3',
  LANDSCAPE_169: '16:9'
};

export const LOCAL_STORAGE_KEYS = {
  ENCRYPTION_KEY: '_ek',
  CREDENTIALS: 'shopify_gen_credentials',
  PROMPTS: 'shopify_gen_prompts',
  GROUPS: 'shopify_gen_groups',
  NICHE_DESCRIPTION: 'shopify_gen_niche_description'
};

export const DEFAULT_NICHE_DESCRIPTION = `# CONTEXTO DEL NEGOCIO
Considera lo siguiente sobre el negocio:

- Tipo de tienda: [Ej: Perfumería online]
- Productos que vende: [Ej: Perfumes de marcas reconocidas, originales y de alta calidad]
- Productos que NO vende: [Ej: No vendemos imitaciones ni productos de dudosa procedencia]
- Público objetivo: [Ej: Hombres y mujeres de 25-55 años que buscan fragancias de calidad]
- Propuesta de valor: [Ej: Precios competitivos, envío gratis en compras mayores a $50, garantía de autenticidad]
- Tono de comunicación: [Ej: Profesional pero cercano, enfocado en la experiencia sensorial]

Usa esta información para contextualizar todas las generaciones y asegurar coherencia con la marca.`;

export const DEFAULT_PROMPTS = {
  product: `# ROL
Eres un experto en SEO y copywriting para ecommerce.

{{nicheDescription}}

# OBJETIVO
Genera un producto optimizado para Shopify con base en:

Keyword principal: {{keyword}}
Volumen de búsqueda: {{volume}}
Keywords relacionadas: {{relatedKeywords}}

# INSTRUCCIONES
Debes generar:

1. **Título**: Atractivo, máximo 60 caracteres, incluir keyword principal
2. **Handle**: URL-friendly, lowercase, guiones, sin caracteres especiales. Debe tener la keyword principal de manera literal. Si la keyword principal es: "perfume sauvage", el handle debe ser perfume-sauvage.
3. **Descripción (HTML)**: 500-700 palabras, usar etiquetas semánticas:
3.1 <h2> para usar las keywords relacionadas en el título cuando sean de mayor volumen que sus keywords sinonimas, por ejemplo tienes: {{"perfumes en oferta", 30},{"ofertas en perfumes", 10}, {"oferta perfumes hombres", 10}} En este caso "perfumes en oferta" y "ofertas en perfumes" son sinonimos pero la kw de  "perfumes en oferta" tiene más volumen, entonces esa es la que debes usar.
Creas h2 siempre y cuando tengas un sub grupo dentro, en este caso como existe oferta perfumes hombres, usas un h2 para esta kw.
3.2 Para usar las kewyords sinonimas del grupo de menor volumen como "ofertas en perfumes" <p>, <ul>, <li>.

En ambos casos debes incluir keywords naturalmente, con enfoque en beneficios.

# FORMATO DE ENTREGA

Responde SOLO con JSON válido en este formato:
{
  "title": "...",
  "handle": "...",
  "bodyHtml": "..."
}`,
  collection: `# ROL
Eres un experto en SEO y organización de catálogos para ecommerce.

{{nicheDescription}}

# OBJETIVO
Genera una colección optimizada para Shopify con base en:

Nombre del grupo: {{groupName}}
Keywords del grupo: {{keywords}}
Volumen total: {{totalVolume}} búsquedas/mes

# INSTRUCCIONES
Debes generar:

1. **Título**: Descriptivo, máximo 60 caracteres, incluir la keyword principal del grupo
2. **Handle**: URL-friendly, lowercase, guiones, sin caracteres especiales. Debe tener la keyword principal de manera literal. Si la keyword principal es: "perfumes baratos", el handle debe ser perfumes-baratos.
3. **Descripción (HTML)**: 400-600 palabras, usar etiquetas semánticas:
3.1 <h2> para las keywords de mayor volumen del grupo
3.2 <h3> para subgrupos o categorías dentro de la colección
3.3 <p>, <ul>, <li> para describir beneficios, características y productos que incluye esta colección

Incluir keywords naturalmente. Explicar qué tipo de productos encontrará el usuario en esta colección y por qué comprar de esta categoría.

# FORMATO DE ENTREGA

Responde SOLO con JSON válido:
{
  "title": "...",
  "handle": "...",
  "bodyHtml": "..."
}`
};
