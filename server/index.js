import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Proxy para Shopify Admin API
 * POST /api/shopify/graphql
 */
app.post('/api/shopify/graphql', async (req, res) => {
  const { storeUrl, accessToken, apiVersion, query, variables } = req.body;

  if (!storeUrl || !accessToken) {
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

  console.log(`[Shopify Proxy] Request to: ${endpoint}`);

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

    console.log(`[Shopify Proxy] Success:`, response.status);
    res.json(response.data);
  } catch (error) {
    console.error('[Shopify Proxy] Error:', error.message);

    if (error.response) {
      console.error('[Shopify Proxy] Status:', error.response.status);
      console.error('[Shopify Proxy] Data:', JSON.stringify(error.response.data, null, 2));

      // Devolver el error real de Shopify
      return res.status(error.response.status).json({
        error: error.response.data,
        status: error.response.status,
        endpoint: endpoint
      });
    }

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

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`   Shopify endpoint: POST /api/shopify/graphql`);
});
