import axios from 'axios';
import { GSC_CONFIG } from '../utils/constants';

class GSCService {
  constructor() {
    this.authEndpoint = GSC_CONFIG.authEndpoint;
    this.apiEndpoint = GSC_CONFIG.apiEndpoint;
    this.accessToken = null;
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

      // Filtrar solo las keywords que nos interesan
      const rows = response.data.rows || [];
      const keywordData = keywords.map((kw) => {
        const keyword = typeof kw === 'string' ? kw : kw.keyword;
        const row = rows.find((r) => r.keys[0].toLowerCase() === keyword.toLowerCase());

        return {
          keyword,
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
   */
  async getConsolidatedData(siteUrl, urls, keywords, dateRange = 30) {
    try {
      const allData = await Promise.all(
        urls.map((url) => this.getKeywordData(siteUrl, url, keywords, dateRange))
      );

      // Consolidar datos: sumar clicks, impressions, promediar posición
      const consolidated = keywords.map((kw, idx) => {
        const keyword = typeof kw === 'string' ? kw : kw.keyword;
        const dataForKeyword = allData.map((d) => d[idx]);

        const totalClicks = dataForKeyword.reduce((sum, d) => sum + d.clicks, 0);
        const totalImpressions = dataForKeyword.reduce((sum, d) => sum + d.impressions, 0);

        // Weighted average de posición por impressions
        const positionsWithImpressions = dataForKeyword.filter((d) => d.position !== null);
        const avgPosition =
          positionsWithImpressions.length > 0
            ? positionsWithImpressions.reduce(
                (sum, d) => sum + d.position * d.impressions,
                0
              ) / totalImpressions
            : null;

        return {
          keyword,
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
   */
  async findMissingKeywords(siteUrl, pageUrl, currentKeywords, contentHtml) {
    try {
      const allQueries = await this.getAllQueriesForUrl(siteUrl, pageUrl);

      // Filtrar queries que:
      // 1. Traen clicks
      // 2. No están en currentKeywords
      // 3. No están en contentHtml
      const missing = allQueries.filter((query) => {
        const inCurrentKeywords = currentKeywords.some(
          (kw) => kw.toLowerCase() === query.keyword.toLowerCase()
        );
        const inContent = contentHtml.toLowerCase().includes(query.keyword.toLowerCase());

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
