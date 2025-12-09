import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import shopifyService from '../../services/shopifyService';
import aiService from '../../services/aiService';

const CredentialsPanel = () => {
  const { credentials, saveCredentials } = useApp();
  const [formData, setFormData] = useState(credentials || {});
  const [testing, setTesting] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (credentials) {
      setFormData(credentials);
    }
  }, [credentials]);

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    console.log('💾 [CredentialsPanel] Guardando credenciales:', {
      ...formData,
      google: { ...formData.google, apiKey: formData.google?.apiKey ? '***HIDDEN***' : 'NO KEY' }
    });
    saveCredentials(formData);
    alert('Credenciales guardadas exitosamente');
  };

  const testGeminiConnection = async () => {
    setTesting((prev) => ({ ...prev, gemini: true }));
    setErrors((prev) => ({ ...prev, gemini: null }));

    try {
      const apiKey = formData.google?.apiKey;
      console.log('🧪 [CredentialsPanel] Testing Gemini API key...');

      if (!apiKey) {
        throw new Error('Ingresa una API Key primero');
      }

      const result = await aiService.validateAPIKey(apiKey);

      if (result.valid) {
        handleChange('google', 'status', 'connected');
        alert('✅ API Key de Gemini válida!');
      } else {
        handleChange('google', 'status', 'error');
        setErrors((prev) => ({ ...prev, gemini: result.message }));
      }
    } catch (error) {
      console.error('❌ [CredentialsPanel] Error testing Gemini:', error);
      handleChange('google', 'status', 'error');
      setErrors((prev) => ({ ...prev, gemini: error.message }));
    } finally {
      setTesting((prev) => ({ ...prev, gemini: false }));
    }
  };

  const testShopifyConnection = async () => {
    setTesting((prev) => ({ ...prev, shopify: true }));
    setErrors((prev) => ({ ...prev, shopify: null }));
    try {
      shopifyService.init(
        formData.shopify.storeUrl,
        formData.shopify.accessToken,
        formData.shopify.apiVersion || '2024-10'
      );
      const result = await shopifyService.testConnection();

      handleChange('shopify', 'status', result.success ? 'connected' : 'error');
      if (result.success) {
        alert(result.message);
      }
      setErrors((prev) => ({
        ...prev,
        shopify: result.success ? null : result.error
      }));
    } catch (error) {
      handleChange('shopify', 'status', 'error');
      setErrors((prev) => ({ ...prev, shopify: error.message }));
    } finally {
      setTesting((prev) => ({ ...prev, shopify: false }));
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'connected') return <CheckCircleIcon className="w-5 h-5 text-success-500" />;
    if (status === 'error') return <XCircleIcon className="w-5 h-5 text-error-500" />;
    return <ClockIcon className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="space-y-8">
      {/* Google Gemini */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🤖 Google Gemini - Generación de Contenido
        </h3>
        <div className="space-y-4 p-4 border-2 border-primary-200 bg-primary-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Gemini 3 Pro Preview</span>
            {getStatusIcon(formData.google?.status)}
          </div>

          <Input
            label="API Key de Google AI"
            type="password"
            placeholder="AIzaSy..."
            value={formData.google?.apiKey || ''}
            onChange={(e) => handleChange('google', 'apiKey', e.target.value)}
          />

          {errors.gemini && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 whitespace-pre-wrap">{errors.gemini}</p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testGeminiConnection}
              loading={testing.gemini}
              disabled={!formData.google?.apiKey}
            >
              🧪 Probar Conexión
            </Button>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:underline"
            >
              Obtener API Key →
            </a>
          </div>
        </div>
      </div>

      {/* Nano Banana */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🖼️ Nano Banana - Generación de Imágenes
        </h3>
        <div className="p-4 border-2 border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">API Key (Google AI)</span>
            {getStatusIcon(formData.nanoBanana?.status)}
          </div>
          <Input
            type="password"
            placeholder="Google AI API Key"
            value={formData.nanoBanana?.apiKey || ''}
            onChange={(e) => handleChange('nanoBanana', 'apiKey', e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-2">
            Usa la misma API key de Google Gemini
          </p>
        </div>
      </div>

      {/* Shopify */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🛍️ Shopify Admin API
        </h3>
        <div className="space-y-4 p-4 border-2 border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Estado</span>
            {getStatusIcon(formData.shopify?.status)}
          </div>

          <Input
            label="Store URL"
            placeholder="mi-tienda.myshopify.com"
            value={formData.shopify?.storeUrl || ''}
            onChange={(e) => handleChange('shopify', 'storeUrl', e.target.value)}
            error={errors.shopify}
          />

          <Input
            label="Admin Access Token"
            type="password"
            placeholder="shpat_..."
            value={formData.shopify?.accessToken || ''}
            onChange={(e) => handleChange('shopify', 'accessToken', e.target.value)}
          />

          <Input
            label="API Version"
            placeholder="2024-10"
            value={formData.shopify?.apiVersion || '2024-10'}
            onChange={(e) => handleChange('shopify', 'apiVersion', e.target.value)}
            helperText="Formato: YYYY-MM (ej: 2025-01, 2024-10). Usa una versión estable."
          />

          {errors.shopify && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 whitespace-pre-wrap">{errors.shopify}</p>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={testShopifyConnection}
            loading={testing.shopify}
            disabled={!formData.shopify?.storeUrl || !formData.shopify?.accessToken}
          >
            🧪 Probar Conexión
          </Button>
        </div>
      </div>

      {/* Google Search Console */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Google Search Console
        </h3>
        <div className="space-y-4 p-4 border-2 border-gray-200 rounded-lg">
          <Input
            label="Project ID"
            placeholder="my-project-id"
            value={formData.gsc?.projectId || ''}
            onChange={(e) => handleChange('gsc', 'projectId', e.target.value)}
          />

          <Input
            label="OAuth 2.0 Client ID"
            placeholder="123456789-abc.apps.googleusercontent.com"
            value={formData.gsc?.clientId || ''}
            onChange={(e) => handleChange('gsc', 'clientId', e.target.value)}
          />

          <Input
            label="Client Secret"
            type="password"
            placeholder="GOCSPX-..."
            value={formData.gsc?.clientSecret || ''}
            onChange={(e) => handleChange('gsc', 'clientSecret', e.target.value)}
          />

          <Input
            label="Site URL"
            placeholder="https://mi-tienda.com"
            value={formData.gsc?.siteUrl || ''}
            onChange={(e) => handleChange('gsc', 'siteUrl', e.target.value)}
          />

          <Button variant="primary" size="sm">
            🔐 Autenticar con Google
          </Button>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          💾 Guardar Credenciales
        </Button>
      </div>
    </div>
  );
};

export default CredentialsPanel;
