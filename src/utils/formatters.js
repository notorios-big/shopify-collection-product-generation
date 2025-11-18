// Funciones de formateo

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Justo ahora';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;

  return formatDate(dateString);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('es-ES').format(num);
};

export const formatPercentage = (num, decimals = 1) => {
  return `${num.toFixed(decimals)}%`;
};

export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const formatKeywordsList = (keywords) => {
  if (!Array.isArray(keywords)) return '';
  return keywords.map(k => k.keyword || k).join(', ');
};

export const formatVolume = (volume) => {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toString();
};

export const normalizeShopifyId = (id) => {
  // Asegurar que el ID tenga el formato GID correcto
  if (id.startsWith('gid://shopify/')) return id;
  return `gid://shopify/Product/${id}`;
};

export const extractIdFromGid = (gid) => {
  // Extraer el ID numérico de un GID de Shopify
  const parts = gid.split('/');
  return parts[parts.length - 1];
};
