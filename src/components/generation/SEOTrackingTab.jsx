import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useShopify } from '../../hooks/useShopify';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import gscService from '../../services/gscService';
import { formatNumber, formatPercentage } from '../../utils/formatters';
import { ArrowPathIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const SEOTrackingTab = ({ group }) => {
  const { credentials } = useApp();
  const { getRedirects } = useShopify();

  const [seoData, setSeoData] = useState(null);
  const [redirects, setRedirects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasShopifyLink = group.generated?.shopifyId && group.generated?.shopifyUrl;
  const isGSCConfigured = credentials?.gsc?.clientId && credentials?.gsc?.clientSecret;

  useEffect(() => {
    if (hasShopifyLink && isGSCConfigured) {
      fetchSEOData();
    }
  }, [hasShopifyLink, isGSCConfigured]);

  const fetchSEOData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Obtener redirects de Shopify
      const redirectsResult = await getRedirects(group.generated.shopifyUrl);
      if (redirectsResult.success) {
        setRedirects(redirectsResult.redirects);
      }

      // Autenticar con GSC
      const authResult = await gscService.authenticate(
        credentials.gsc.clientId,
        credentials.gsc.clientSecret,
        credentials.gsc.refreshToken
      );

      if (!authResult.success) {
        throw new Error('Error autenticando con Google Search Console');
      }

      // Obtener keywords del grupo
      const keywords = group.children?.map(k => k.keyword) || [];

      // URLs para consultar (actual + redirects)
      const urls = [
        group.generated.shopifyUrl,
        ...redirectsResult.redirects.map(r => r.path)
      ];

      // Obtener datos consolidados
      const consolidated = await gscService.getConsolidatedData(
        credentials.gsc.siteUrl,
        urls,
        keywords
      );

      // Buscar keywords faltantes
      const missingKeywords = await gscService.findMissingKeywords(
        credentials.gsc.siteUrl,
        group.generated.shopifyUrl,
        keywords,
        group.generated.bodyHtml
      );

      setSeoData({
        ...consolidated,
        missingKeywords
      });
    } catch (err) {
      console.error('Error fetching SEO data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPositionColor = (position) => {
    if (!position) return 'text-gray-400';
    if (position <= 3) return 'text-success-600';
    if (position <= 10) return 'text-warning-600';
    return 'text-error-600';
  };

  const getPositionIcon = (position) => {
    if (!position) return '🔴';
    if (position <= 3) return '🟢';
    if (position <= 10) return '🟡';
    return '🔴';
  };

  if (!hasShopifyLink) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <ChartBarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay datos de SEO disponibles
          </h3>
          <p className="text-gray-600 mb-6">
            Primero debes subir este {group.type === 'collection' ? 'colección' : 'producto'} a Shopify
            para poder trackear su posicionamiento SEO.
          </p>
          <Button variant="outline" onClick={() => {}}>
            Ir a Generación →
          </Button>
        </div>
      </div>
    );
  }

  if (!isGSCConfigured) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-warning-900 mb-2">
              ⚠️ Google Search Console no configurado
            </h3>
            <p className="text-warning-700 mb-4">
              Para usar el tracking SEO, necesitas configurar las credenciales de Google Search Console.
            </p>
            <Button variant="primary" onClick={() => {}}>
              Ir a Configuración
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Información de Shopify */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          🔗 Información de Shopify
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Shopify ID:</span>
            <span className="text-xs font-mono text-gray-700">
              {group.generated.shopifyId}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">URL Actual:</span>
            <a
              href={group.generated.shopifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-600 hover:underline"
            >
              {group.generated.shopifyUrl}
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Handle Actual:</span>
            <span className="text-xs font-mono text-gray-700">
              {group.generated.handle}
            </span>
          </div>
        </div>
      </div>

      {/* Historial de Redirecciones */}
      {redirects.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🔀 Historial de Redirecciones
          </h3>
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-700 mb-3">
              💡 Se encontraron {redirects.length} redirecciones. Los datos SEO se consolidan
              desde todas estas URLs.
            </p>
            <div className="space-y-2">
              {redirects.map((redirect, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white rounded px-3 py-2"
                >
                  <span className="text-sm font-mono text-gray-700">{redirect.path}</span>
                  <span className="text-xs text-gray-500">→ URL actual</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Datos de SEO */}
      {isLoading ? (
        <div className="text-center py-12">
          <ArrowPathIcon className="w-12 h-12 mx-auto text-primary-500 animate-spin mb-4" />
          <p className="text-gray-600">Cargando datos de Google Search Console...</p>
        </div>
      ) : error ? (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <p className="text-error-700">❌ Error: {error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={fetchSEOData}
          >
            Reintentar
          </Button>
        </div>
      ) : seoData ? (
        <>
          {/* Estadísticas consolidadas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                📈 Posicionamiento de Keywords
              </h3>
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowPathIcon}
                onClick={fetchSEOData}
              >
                Actualizar
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4">
                <div className="text-sm text-primary-700 mb-1">Total Clicks</div>
                <div className="text-2xl font-bold text-primary-900">
                  {formatNumber(seoData.totalClicks)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-lg p-4">
                <div className="text-sm text-success-700 mb-1">Impresiones</div>
                <div className="text-2xl font-bold text-success-900">
                  {formatNumber(seoData.totalImpressions)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-warning-50 to-warning-100 rounded-lg p-4">
                <div className="text-sm text-warning-700 mb-1">CTR Promedio</div>
                <div className="text-2xl font-bold text-warning-900">
                  {formatPercentage(seoData.avgCTR)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                <div className="text-sm text-gray-700 mb-1">URLs Analizadas</div>
                <div className="text-2xl font-bold text-gray-900">
                  {seoData.urlsAnalyzed}
                </div>
              </div>
            </div>

            {/* Tabla de Keywords */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Keyword
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Posición
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Clicks
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Impresiones
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      CTR
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {seoData.keywords.map((kw, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {kw.keyword}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-medium ${getPositionColor(kw.position)}`}>
                          {getPositionIcon(kw.position)} {kw.position || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {formatNumber(kw.clicks)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {formatNumber(kw.impressions)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {formatPercentage(kw.ctr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Keywords Faltantes */}
          {seoData.missingKeywords && seoData.missingKeywords.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ⚠️ Oportunidades de Mejora
              </h3>
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                <p className="text-sm text-warning-700 mb-3">
                  <strong>Keywords que traen tráfico pero no están en el contenido:</strong>
                </p>
                <div className="space-y-2">
                  {seoData.missingKeywords.map((kw, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white rounded px-3 py-2"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {kw.keyword}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({kw.clicks} clicks, pos {kw.position})
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        + Agregar al contenido
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <ChartBarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No hay datos de SEO disponibles</p>
          <Button variant="primary" onClick={fetchSEOData}>
            Cargar Datos de GSC
          </Button>
        </div>
      )}
    </div>
  );
};

export default SEOTrackingTab;
