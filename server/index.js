import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Shopify GraphQL Proxy
app.post('/api/shopify/graphql', async (req, res) => {
  const { storeUrl, accessToken } = req.headers;
  const { query, variables } = req.body;

  if (!storeUrl || !accessToken) {
    return res.status(400).json({
      error: 'Missing storeUrl or accessToken in headers'
    });
  }

  try {
    // Normalizar URL de la tienda
    const normalizedUrl = storeUrl.includes('.myshopify.com')
      ? storeUrl
      : `${storeUrl}.myshopify.com`;

    const endpoint = `https://${normalizedUrl}/admin/api/2025-10/graphql.json`;

    console.log(`📡 Shopify Request to: ${endpoint}`);

    const response = await axios.post(
      endpoint,
      { query, variables },
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Shopify Response OK');
    res.json(response.data);
  } catch (error) {
    console.error('❌ Shopify Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Shopify Proxy Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Shopify Proxy Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🛍️  GraphQL endpoint: http://localhost:${PORT}/api/shopify/graphql`);
});
