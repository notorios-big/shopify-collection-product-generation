// Funciones de validación

export const validateAPIKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  return key.trim().length > 10;
};

export const validateShopifyStore = (storeUrl) => {
  if (!storeUrl) return false;
  // Debe ser formato: nombre.myshopify.com o solo nombre
  const regex = /^[a-zA-Z0-9-]+(.myshopify.com)?$/;
  return regex.test(storeUrl);
};

export const validateHandle = (handle) => {
  if (!handle) return false;
  // Solo lowercase, números, guiones
  const regex = /^[a-z0-9-]+$/;
  return regex.test(handle);
};

export const validateEmail = (email) => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateJSON = (jsonString) => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (e) {
    return false;
  }
};

export const validateKeywordGroupStructure = (groups) => {
  if (!Array.isArray(groups)) return false;

  for (const group of groups) {
    if (!group.id || !group.name || !group.isGroup) return false;
    if (!Array.isArray(group.children)) return false;

    for (const child of group.children) {
      if (!child.id || !child.keyword || child.isGroup !== false) return false;
      if (typeof child.volume !== 'number') return false;
    }
  }

  return true;
};

export const sanitizeHandle = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9-\s]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Multiple hyphens to single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};
