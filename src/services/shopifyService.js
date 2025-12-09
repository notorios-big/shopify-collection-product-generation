import axios from 'axios';
import { SHOPIFY_API_VERSION } from '../utils/constants';

class ShopifyService {
  constructor() {
    this.apiVersion = SHOPIFY_API_VERSION;
    this.accessToken = null;
    this.storeUrl = null;
    // Usar proxy backend
    this.proxyEndpoint = '/api/shopify/graphql';
  }

  /**
   * Cambia la versión de la API
   */
  setApiVersion(version) {
    this.apiVersion = version;
  }

  /**
   * Inicializa servicio con credenciales
   */
  init(storeUrl, accessToken, apiVersion = null) {
    // Normalizar URL de la tienda
    this.storeUrl = storeUrl.includes('.myshopify.com')
      ? storeUrl
      : `${storeUrl}.myshopify.com`;

    // Limpiar posibles https:// o barras
    this.storeUrl = this.storeUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');

    if (apiVersion) {
      this.apiVersion = apiVersion;
    }

    this.accessToken = accessToken;
  }

  /**
   * Ejecuta query/mutation de GraphQL via proxy backend
   */
  async graphql(query, variables = {}) {
    if (!this.storeUrl || !this.accessToken) {
      throw new Error('Shopify no está configurado. Inicializa con init() primero.');
    }

    try {
      const response = await axios.post(
        this.proxyEndpoint,
        {
          storeUrl: this.storeUrl,
          accessToken: this.accessToken,
          apiVersion: this.apiVersion,
          query,
          variables
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      if (response.data.errors) {
        const errorMessage = response.data.errors.map(e => e.message).join(', ');
        throw new Error(errorMessage);
      }

      return response.data.data;
    } catch (error) {
      console.error('Shopify GraphQL Error:', error);

      // Error de conexión al proxy backend
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error(
          `Error de red: No se puede conectar al servidor proxy.\n` +
          `Asegúrate de que el servidor backend esté corriendo (npm run dev).`
        );
      }

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          throw new Error('Token de acceso inválido o expirado. Verifica tu Admin API Access Token.');
        }
        if (status === 403) {
          throw new Error('Acceso denegado. El token no tiene permisos suficientes para esta operación.');
        }
        if (status === 404) {
          throw new Error(`Tienda no encontrada. Verifica que "${this.storeUrl}" sea correcta y la versión de API "${this.apiVersion}" exista.`);
        }

        // Error del proxy con detalles de Shopify
        if (data?.error) {
          throw new Error(`Error de Shopify: ${JSON.stringify(data.error)}`);
        }

        throw new Error(`Error ${status}: ${JSON.stringify(data)}`);
      }

      throw new Error(`Error: ${error.message}`);
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
            plan {
              displayName
            }
          }
        }
      `;

      const data = await this.graphql(query);
      return {
        success: true,
        shop: data.shop,
        message: `✅ Conectado a: ${data.shop.name} (${data.shop.plan?.displayName || 'Plan básico'})`
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
