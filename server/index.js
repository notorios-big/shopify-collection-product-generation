import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Archivo de credenciales (en el directorio del proyecto)
const CREDENTIALS_FILE = path.join(__dirname, '..', '.credentials.json');

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Leer credenciales desde archivo
 */
const readCredentialsFromFile = () => {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const data = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('[Credentials] Error reading file:', error.message);
  }
  return null;
};

/**
 * Guardar credenciales en archivo
 */
const saveCredentialsToFile = (credentials) => {
  try {
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('[Credentials] Error saving file:', error.message);
    return false;
  }
};

/**
 * GET /api/credentials - Obtener credenciales guardadas
 */
app.get('/api/credentials', (req, res) => {
  const credentials = readCredentialsFromFile();
  if (credentials) {
    console.log('[Credentials] Loaded from file');
    res.json({ success: true, credentials });
  } else {
    res.json({ success: false, message: 'No credentials found' });
  }
});

/**
 * POST /api/credentials - Guardar credenciales
 */
app.post('/api/credentials', (req, res) => {
  const { credentials } = req.body;

  if (!credentials) {
    return res.status(400).json({ success: false, error: 'No credentials provided' });
  }

  const saved = saveCredentialsToFile(credentials);
  if (saved) {
    console.log('[Credentials] Saved to file');
    res.json({ success: true, message: 'Credentials saved' });
  } else {
    res.status(500).json({ success: false, error: 'Failed to save credentials' });
  }
});

/**
 * Proxy para Shopify Admin API
 * POST /api/shopify/graphql
 */
app.post('/api/shopify/graphql', async (req, res) => {
  const { storeUrl, accessToken, apiVersion, query, variables } = req.body;

  console.log('[Shopify Proxy] Received request');
  console.log('[Shopify Proxy] storeUrl:', storeUrl);
  console.log('[Shopify Proxy] apiVersion:', apiVersion);
  console.log('[Shopify Proxy] hasAccessToken:', !!accessToken);

  if (!storeUrl || !accessToken) {
    console.log('[Shopify Proxy] Missing parameters');
    return res.status(400).json({
      error: 'Faltan parámetros: storeUrl y accessToken son requeridos'
    });
  }

  // Normalizar URL
  let normalizedStore = storeUrl.includes('.myshopify.com')
    ? storeUrl
    : `${storeUrl}.myshopify.com`;
  normalizedStore = normalizedStore.replace(/^https?:\/\//, '').replace(/\/+$/, '');

  const version = apiVersion || '2024-10';
  const endpoint = `https://${normalizedStore}/admin/api/${version}/graphql.json`;

  console.log(`[Shopify Proxy] Calling: ${endpoint}`);

  try {
    const response = await axios.post(
      endpoint,
      { query, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        },
        timeout: 30000
      }
    );

    console.log(`[Shopify Proxy] Success! Status: ${response.status}`);
    res.json(response.data);
  } catch (error) {
    console.error('[Shopify Proxy] Error:', error.message);

    if (error.response) {
      console.error('[Shopify Proxy] Response Status:', error.response.status);
      console.error('[Shopify Proxy] Response Data:', JSON.stringify(error.response.data, null, 2));

      // Devolver el error real de Shopify
      return res.status(error.response.status).json({
        error: error.response.data,
        status: error.response.status,
        endpoint: endpoint
      });
    }

    // Error de red o timeout
    console.error('[Shopify Proxy] Network/Timeout error');
    res.status(500).json({
      error: error.message,
      endpoint: endpoint
    });
  }
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`   Shopify endpoint: POST /api/shopify/graphql`);
  console.log(`   Credentials: GET/POST /api/credentials`);
  console.log(`   Health: GET /api/health`);
  console.log(`   Credentials file: ${CREDENTIALS_FILE}`);
});

// Mantener el servidor corriendo
server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    process.exit(0);
  });
});
