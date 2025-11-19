import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { AI_PROVIDER_CONFIG } from '../../utils/constants';
import shopifyService from '../../services/shopifyService';

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
    saveCredentials(formData);
    alert('Credenciales guardadas exitosamente');
  };

  const testShopifyConnection = async () => {
    setTesting((prev) => ({ ...prev, shopify: true }));
    try {
      shopifyService.init(formData.shopify.storeUrl, formData.shopify.accessToken);
      const result = await shopifyService.testConnection();

      const newStatus = result.success ? 'connected' : 'error';
      const updatedFormData = {
        ...formData,
        shopify: {
          ...formData.shopify,
          status: newStatus
        }
      };

      setFormData(updatedFormData);
      saveCredentials(updatedFormData); // Guardar después de probar

      setErrors((prev) => ({
        ...prev,
        shopify: result.success ? null : result.error
      }));
    } catch (error) {
      const updatedFormData = {
        ...formData,
        shopify: {
          ...formData.shopify,
          status: 'error'
        }
      };

      setFormData(updatedFormData);
      saveCredentials(updatedFormData); // Guardar también cuando hay error

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
      {/* Selector de Modelo AI */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🤖 Modelo de Inteligencia Artificial
        </h3>
        <div className="space-y-4">
          {Object.entries(AI_PROVIDER_CONFIG).map(([key, config]) => (
            <label
              key={key}
              className={`
                block p-4 border-2 rounded-lg cursor-pointer transition-all
                ${
                  formData.selectedAIModel === key
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start">
                <input
                  type="radio"
                  name="aiModel"
                  value={key}
                  checked={formData.selectedAIModel === key}
                  onChange={(e) => {
                    const updated = { ...formData, selectedAIModel: e.target.value };
                    setFormData(updated);
                    saveCredentials(updated); // Auto-guardar al cambiar modelo
                  }}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{config.name}</span>
                    {getStatusIcon(formData[key.replace(/-/g, '')]?.status)}
                  </div>
                  <Input
                    type="password"
                    placeholder="API Key"
                    value={formData[key.replace(/-/g, '')]?.apiKey || ''}
                    onChange={(e) =>
                      handleChange(key.replace(/-/g, ''), 'apiKey', e.target.value)
                    }
                    className="mb-0"
                  />
                </div>
              </div>
            </label>
          ))}
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

          <div className="text-sm text-gray-600">
            <span className="font-medium">API Version:</span> 2025-10 (latest stable)
          </div>

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
