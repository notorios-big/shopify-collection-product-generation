import axios from 'axios';
import { GSC_CONFIG } from '../utils/constants';

class GSCService {
  constructor() {
    this.authEndpoint = GSC_CONFIG.authEndpoint;
    this.apiEndpoint = GSC_CONFIG.apiEndpoint;
    this.accessToken = null;
  }

  /**
   * Normaliza una keyword para comparación
   * - Convierte a minúsculas
   * - Elimina acentos
   * - Convierte plurales a singulares (básico en español)
   * - Elimina espacios extra
   */
  normalizeKeyword(keyword) {
    if (!keyword) return '';

    let normalized = keyword
      .toLowerCase()
      .trim()
      // Eliminar acentos
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Eliminar espacios múltiples
      .replace(/\s+/g, ' ');

    // Convertir plurales básicos a singulares (español)
    // Palabras terminadas en -es (excepciones comunes)
    const esExceptions = ['mes', 'res', 'tes', 'les', 'nes'];
    if (normalized.endsWith('es') && !esExceptions.some(e => normalized.endsWith(e))) {
      // perfumes -> perfume, ofertas -> oferta (si termina en -es después de consonante)
      const withoutEs = normalized.slice(0, -2);
      const lastChar = withoutEs[withoutEs.length - 1];
      if (['c', 'z', 'n', 'r', 'l', 's'].includes(lastChar)) {
        normalized = withoutEs;
      }
    }
    // Palabras terminadas en -s (pero no -es)
    else if (normalized.endsWith('s') && !normalized.endsWith('es')) {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  }

  /**
   * Compara dos keywords normalizadas
   */
  keywordsMatch(kw1, kw2) {
    return this.normalizeKeyword(kw1) === this.normalizeKeyword(kw2);
  }

  /**
   * Busca una keyword en una lista (normalizada)
   */
  findNormalizedKeyword(keyword, keywordList) {
    const normalizedSearch = this.normalizeKeyword(keyword);
    return keywordList.find(kw => {
      const kwText = typeof kw === 'string' ? kw : kw.keyword;
      return this.normalizeKeyword(kwText) === normalizedSearch;
    });
  }

  /**
   * Agrupa keywords similares normalizándolas
   * Retorna un mapa con la keyword normalizada como key y array de keywords originales
   */
  groupSimilarKeywords(keywords) {
    const groups = new Map();

    keywords.forEach(kw => {
      const kwText = typeof kw === 'string' ? kw : kw.keyword;
      const normalized = this.normalizeKeyword(kwText);

      if (!groups.has(normalized)) {
        groups.set(normalized, []);
      }
      groups.get(normalized).push(kw);
    });

    return groups;
  }

  /**
   * Autentica con OAuth 2.0
   */
  async authenticate(clientId, clientSecret, refreshToken) {
    try {
      const response = await axios.post(this.authEndpoint, {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      this.accessToken = response.data.access_token;
      return { success: true, token: this.accessToken };
    } catch (error) {
      console.error('GSC Auth Error:', error);
      return {
        success: false,
        error: error.response?.data?.error_description || error.message
      };
    }
  }

  /**
   * Obtiene datos de posicionamiento para una URL y keywords específicas
   */
  async getKeywordData(siteUrl, pageUrl, keywords, dateRange = 30) {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const requestBody = {
      startDate,
      endDate,
      dimensions: ['query', 'page'],
      dimensionFilterGroups: [
        {
          filters: [
            {
              dimension: 'page',
              expression: pageUrl,
              operator: 'equals'
            }
          ]
        }
      ],
      rowLimit: 1000
    };

    try {
      const response = await axios.post(
        `${this.apiEndpoint}/webmasters/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Filtrar solo las keywords que nos interesan (usando normalización)
      const rows = response.data.rows || [];
      const keywordData = keywords.map((kw) => {
        const keyword = typeof kw === 'string' ? kw : kw.keyword;
        // Buscar coincidencia normalizada
        const row = rows.find((r) => this.keywordsMatch(r.keys[0], keyword));

        return {
          keyword,
          normalizedKeyword: this.normalizeKeyword(keyword),
          gscQuery: row ? row.keys[0] : null, // La query original de GSC
          position: row ? Math.round(row.position) : null,
          clicks: row ? row.clicks : 0,
          impressions: row ? row.impressions : 0,
          ctr: row ? row.ctr * 100 : 0
        };
      });

      return keywordData;
    } catch (error) {
      console.error('GSC Query Error:', error);
      throw new Error(`Error obteniendo datos de GSC: ${error.message}`);
    }
  }

  /**
   * Obtiene todas las queries que traen tráfico a una URL
   */
  async getAllQueriesForUrl(siteUrl, pageUrl, dateRange = 30) {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const requestBody = {
      startDate,
      endDate,
      dimensions: ['query'],
      dimensionFilterGroups: [
        {
          filters: [
            {
              dimension: 'page',
              expression: pageUrl,
              operator: 'equals'
            }
          ]
        }
      ],
      rowLimit: 100
    };

    try {
      const response = await axios.post(
        `${this.apiEndpoint}/webmasters/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return (response.data.rows || []).map((row) => ({
        keyword: row.keys[0],
        position: Math.round(row.position),
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr * 100
      }));
    } catch (error) {
      console.error('GSC Query Error:', error);
      throw new Error(`Error obteniendo queries: ${error.message}`);
    }
  }

  /**
   * Consolida datos de múltiples URLs (URL actual + redirects)
   * Agrupa keywords similares usando normalización
   */
  async getConsolidatedData(siteUrl, urls, keywords, dateRange = 30) {
    try {
      const allData = await Promise.all(
        urls.map((url) => this.getKeywordData(siteUrl, url, keywords, dateRange))
      );

      // Consolidar datos: sumar clicks, impressions, promediar posición
      const consolidated = keywords.map((kw, idx) => {
        const keyword = typeof kw === 'string' ? kw : kw.keyword;
        const volume = typeof kw === 'object' ? kw.volume : 0;
        const dataForKeyword = allData.map((d) => d[idx]);

        const totalClicks = dataForKeyword.reduce((sum, d) => sum + d.clicks, 0);
        const totalImpressions = dataForKeyword.reduce((sum, d) => sum + d.impressions, 0);

        // Recopilar todas las queries de GSC que coincidieron
        const matchedGscQueries = dataForKeyword
          .filter(d => d.gscQuery)
          .map(d => d.gscQuery);

        // Weighted average de posición por impressions
        const positionsWithImpressions = dataForKeyword.filter((d) => d.position !== null);
        const avgPosition =
          positionsWithImpressions.length > 0
            ? positionsWithImpressions.reduce(
                (sum, d) => sum + d.position * d.impressions,
                0
              ) / (totalImpressions || 1)
            : null;

        return {
          keyword,
          volume,
          normalizedKeyword: this.normalizeKeyword(keyword),
          matchedGscQueries: [...new Set(matchedGscQueries)], // Eliminar duplicados
          position: avgPosition ? Math.round(avgPosition) : null,
          clicks: totalClicks,
          impressions: totalImpressions,
          ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
        };
      });

      return {
        keywords: consolidated,
        totalClicks: consolidated.reduce((sum, k) => sum + k.clicks, 0),
        totalImpressions: consolidated.reduce((sum, k) => sum + k.impressions, 0),
        avgCTR:
          consolidated.reduce((sum, k) => sum + k.ctr, 0) / (consolidated.length || 1),
        urlsAnalyzed: urls.length
      };
    } catch (error) {
      console.error('Error consolidando datos:', error);
      throw error;
    }
  }

  /**
   * Detecta keywords que traen tráfico pero no están en el contenido
   * Usa normalización para comparar
   */
  async findMissingKeywords(siteUrl, pageUrl, currentKeywords, contentHtml) {
    try {
      const allQueries = await this.getAllQueriesForUrl(siteUrl, pageUrl);

      // Normalizar el contenido HTML para búsqueda
      const normalizedContent = this.normalizeKeyword(contentHtml);

      // Filtrar queries que:
      // 1. Traen clicks
      // 2. No están en currentKeywords (comparación normalizada)
      // 3. No están en contentHtml (comparación normalizada)
      const missing = allQueries.filter((query) => {
        const normalizedQuery = this.normalizeKeyword(query.keyword);

        const inCurrentKeywords = currentKeywords.some(
          (kw) => this.keywordsMatch(kw, query.keyword)
        );
        const inContent = normalizedContent.includes(normalizedQuery);

        return query.clicks > 0 && !inCurrentKeywords && !inContent;
      });

      return missing.sort((a, b) => b.clicks - a.clicks).slice(0, 10);
    } catch (error) {
      console.error('Error buscando keywords faltantes:', error);
      return [];
    }
  }
}

export default new GSCService();
