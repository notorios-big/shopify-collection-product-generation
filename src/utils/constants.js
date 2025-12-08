// Constantes de la aplicación

export const AI_PROVIDERS = {
  GPT4: 'gpt-4',
  CLAUDE45: 'claude-4-5',
  GEMINI20FLASH: 'gemini-2.0-flash'
};

export const AI_PROVIDER_CONFIG = {
  [AI_PROVIDERS.GPT4]: {
    name: 'GPT-4o',
    provider: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o'
  },
  [AI_PROVIDERS.CLAUDE45]: {
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-20250514',
    version: '2023-06-01'
  },
  [AI_PROVIDERS.GEMINI20FLASH]: {
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    model: 'gemini-2.0-flash'
  }
};

export const SHOPIFY_API_VERSION = '2025-01';

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
  GROUPS: 'shopify_gen_groups'
};

export const DEFAULT_PROMPTS = {
  product: `Eres un experto en SEO y copywriting para ecommerce.

Genera un producto optimizado para Shopify con base en:

Keyword principal: {{keyword}}
Volumen de búsqueda: {{volume}}
Keywords relacionadas: {{relatedKeywords}}

Debes generar:

1. **Título**: Atractivo, máximo 70 caracteres, incluir keyword principal
2. **Handle**: URL-friendly, lowercase, guiones, sin caracteres especiales
3. **Descripción (HTML)**: 500-800 palabras, usar etiquetas semánticas (<h2>, <p>, <ul>, <li>), incluir keywords naturalmente, enfoque en beneficios

Responde SOLO con JSON válido en este formato:
{
  "title": "...",
  "handle": "...",
  "bodyHtml": "..."
}`,
  collection: `Eres un experto en SEO y organización de catálogos para ecommerce.

Genera una colección manual en Shopify para:

Nombre del grupo: {{groupName}}
Keywords relacionadas: {{keywords}}
Volumen total: {{totalVolume}} búsquedas/mes

Debes generar:

1. **Título**: Descriptivo, máximo 70 caracteres
2. **Handle**: URL-friendly
3. **Descripción (HTML)**: 300-600 palabras, explicar qué productos incluye esta colección, beneficios de comprar de esta categoría

Responde SOLO con JSON válido:
{
  "title": "...",
  "handle": "...",
  "bodyHtml": "..."
}`
};
