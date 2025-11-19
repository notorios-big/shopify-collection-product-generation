import axios from 'axios';
import { SHOPIFY_API_VERSION } from '../utils/constants';

class ShopifyService {
  constructor() {
    this.apiVersion = SHOPIFY_API_VERSION;
    this.storeUrl = null;
    this.accessToken = null;
    // Backend local para desarrollo (evita CORS)
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  }

  /**
   * Inicializa servicio con credenciales
   */
  init(storeUrl, accessToken) {
    // Normalizar URL de la tienda
    const normalizedUrl = storeUrl.includes('.myshopify.com')
      ? storeUrl
      : `${storeUrl}.myshopify.com`;

    this.storeUrl = normalizedUrl;
    this.accessToken = accessToken;
  }

  /**
   * Ejecuta query/mutation de GraphQL
   */
  async graphql(query, variables = {}) {
    if (!this.storeUrl || !this.accessToken) {
      throw new Error('Shopify no está configurado. Inicializa con init() primero.');
    }

    try {
      // Usar backend proxy para evitar CORS
      const response = await axios.post(
        `${this.backendUrl}/api/shopify/graphql`,
        { query, variables },
        {
          headers: {
            'Content-Type': 'application/json',
            'storeUrl': this.storeUrl,
            'accessToken': this.accessToken
          }
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data;
    } catch (error) {
      console.error('Shopify GraphQL Error:', error);
      throw new Error(`Error de Shopify: ${error.message}`);
    }
  }

  /**
   * Valida la conexión con Shopify
   */
  async testConnection() {
    try {
      const query = `
        query {
          shop {
            name
            url
            currencyCode
          }
        }
      `;

      const data = await this.graphql(query);
      return {
        success: true,
        shop: data.shop
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Crea un producto en Shopify
   */
  async createProduct({ title, handle, bodyHtml, images = [] }) {
    const mutation = `
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            onlineStoreUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        title,
        handle,
        descriptionHtml: bodyHtml,
        status: 'DRAFT',
        ...(images.length > 0 && {
          media: images.map((url) => ({
            originalSource: url,
            mediaContentType: 'IMAGE'
          }))
        })
      }
    };

    const data = await this.graphql(mutation, variables);

    if (data.productCreate.userErrors.length > 0) {
      throw new Error(data.productCreate.userErrors[0].message);
    }

    return {
      shopifyId: data.productCreate.product.id,
      shopifyUrl: data.productCreate.product.onlineStoreUrl,
      handle: data.productCreate.product.handle
    };
  }

  /**
   * Actualiza un producto existente
   */
  async updateProduct(shopifyId, { title, handle, bodyHtml, images = [] }) {
    const mutation = `
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            title
            handle
            onlineStoreUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        id: shopifyId,
        title,
        handle,
        descriptionHtml: bodyHtml,
        ...(images.length > 0 && {
          media: images.map((url) => ({
            originalSource: url,
            mediaContentType: 'IMAGE'
          }))
        })
      }
    };

    const data = await this.graphql(mutation, variables);

    if (data.productUpdate.userErrors.length > 0) {
      throw new Error(data.productUpdate.userErrors[0].message);
    }

    return {
      shopifyId: data.productUpdate.product.id,
      shopifyUrl: data.productUpdate.product.onlineStoreUrl,
      handle: data.productUpdate.product.handle
    };
  }

  /**
   * Obtiene información de un producto por ID
   */
  async getProduct(shopifyId) {
    const query = `
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          descriptionHtml
          onlineStoreUrl
          status
        }
      }
    `;

    const data = await this.graphql(query, { id: shopifyId });
    return data.product;
  }

  /**
   * Crea una colección manual
   */
  async createCollection({ title, handle, bodyHtml }) {
    const mutation = `
      mutation collectionCreate($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection {
            id
            title
            handle
            onlineStoreUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        title,
        handle,
        descriptionHtml: bodyHtml,
        ruleSet: {
          appliedDisjunctively: false,
          rules: []
        }
      }
    };

    const data = await this.graphql(mutation, variables);

    if (data.collectionCreate.userErrors.length > 0) {
      throw new Error(data.collectionCreate.userErrors[0].message);
    }

    return {
      shopifyId: data.collectionCreate.collection.id,
      shopifyUrl: data.collectionCreate.collection.onlineStoreUrl,
      handle: data.collectionCreate.collection.handle
    };
  }

  /**
   * Actualiza una colección
   */
  async updateCollection(shopifyId, { title, handle, bodyHtml }) {
    const mutation = `
      mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection {
            id
            title
            handle
            onlineStoreUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        id: shopifyId,
        title,
        handle,
        descriptionHtml: bodyHtml
      }
    };

    const data = await this.graphql(mutation, variables);

    if (data.collectionUpdate.userErrors.length > 0) {
      throw new Error(data.collectionUpdate.userErrors[0].message);
    }

    return {
      shopifyId: data.collectionUpdate.collection.id,
      shopifyUrl: data.collectionUpdate.collection.onlineStoreUrl,
      handle: data.collectionUpdate.collection.handle
    };
  }

  /**
   * Agrega productos a una colección manual
   */
  async addProductsToCollection(collectionId, productIds) {
    const mutation = `
      mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(id: $id, productIds: $productIds) {
          collection {
            id
            productsCount
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      id: collectionId,
      productIds
    };

    const data = await this.graphql(mutation, variables);

    if (data.collectionAddProducts.userErrors.length > 0) {
      throw new Error(data.collectionAddProducts.userErrors[0].message);
    }

    return data.collectionAddProducts.collection;
  }

  /**
   * Obtiene información de una colección por ID
   */
  async getCollection(shopifyId) {
    const query = `
      query getCollection($id: ID!) {
        collection(id: $id) {
          id
          title
          handle
          descriptionHtml
          onlineStoreUrl
          productsCount
        }
      }
    `;

    const data = await this.graphql(query, { id: shopifyId });
    return data.collection;
  }

  /**
   * Obtiene todas las redirecciones que apuntan a una URL
   */
  async getRedirectsToUrl(targetPath) {
    const query = `
      query getUrlRedirects($query: String!) {
        urlRedirects(first: 50, query: $query) {
          edges {
            node {
              id
              path
              target
            }
          }
        }
      }
    `;

    const data = await this.graphql(query, {
      query: `target:${targetPath}`
    });

    return data.urlRedirects.edges.map((edge) => ({
      id: edge.node.id,
      path: edge.node.path,
      target: edge.node.target
    }));
  }

  /**
   * Crea un redirect
   */
  async createRedirect(path, target) {
    const mutation = `
      mutation urlRedirectCreate($urlRedirect: UrlRedirectInput!) {
        urlRedirectCreate(urlRedirect: $urlRedirect) {
          urlRedirect {
            id
            path
            target
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      urlRedirect: { path, target }
    };

    const data = await this.graphql(mutation, variables);

    if (data.urlRedirectCreate.userErrors.length > 0) {
      throw new Error(data.urlRedirectCreate.userErrors[0].message);
    }

    return data.urlRedirectCreate.urlRedirect;
  }
}

export default new ShopifyService();
