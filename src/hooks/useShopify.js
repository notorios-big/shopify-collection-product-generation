import { useState, useEffect } from 'react';
import shopifyService from '../services/shopifyService';
import { useApp } from '../context/AppContext';

export const useShopify = () => {
  const { credentials, updateGroup } = useApp();
  const [isConnected, setIsConnected] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [error, setError] = useState(null);

  // Inicializar conexión cuando cambien las credenciales
  useEffect(() => {
    if (credentials?.shopify?.storeUrl && credentials?.shopify?.accessToken) {
      initShopify();
    }
  }, [credentials]);

  const initShopify = () => {
    try {
      shopifyService.init(
        credentials.shopify.storeUrl,
        credentials.shopify.accessToken
      );
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setIsConnected(false);
      setError(err.message);
    }
  };

  const testConnection = async () => {
    try {
      const result = await shopifyService.testConnection();
      setIsConnected(result.success);
      return result;
    } catch (err) {
      setIsConnected(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const pushToShopify = async (group) => {
    if (!isConnected) {
      throw new Error('Shopify no está conectado');
    }

    setIsPushing(true);
    setError(null);

    try {
      const { title, handle, bodyHtml, images, shopifyId } = group.generated || {};

      if (!title || !handle || !bodyHtml) {
        throw new Error('El contenido no está completo');
      }

      let result;
      const isCollection = group.type === 'collection';

      if (shopifyId) {
        // UPDATE
        if (isCollection) {
          result = await shopifyService.updateCollection(shopifyId, {
            title,
            handle,
            bodyHtml
          });
        } else {
          result = await shopifyService.updateProduct(shopifyId, {
            title,
            handle,
            bodyHtml,
            images
          });
        }
      } else {
        // CREATE
        if (isCollection) {
          result = await shopifyService.createCollection({
            title,
            handle,
            bodyHtml
          });
        } else {
          result = await shopifyService.createProduct({
            title,
            handle,
            bodyHtml,
            images
          });
        }
      }

      // Actualizar grupo con IDs de Shopify
      const updated = updateGroup(group.id, {
        generated: {
          ...group.generated,
          shopifyId: result.shopifyId,
          shopifyUrl: result.shopifyUrl,
          status: 'in_shopify'
        }
      });

      setIsPushing(false);
      return { success: true, result, group: updated };
    } catch (err) {
      console.error('Error subiendo a Shopify:', err);
      setError(err.message);
      setIsPushing(false);
      return { success: false, error: err.message };
    }
  };

  const syncFromShopify = async (group) => {
    if (!isConnected) {
      throw new Error('Shopify no está conectado');
    }

    try {
      const shopifyId = group.generated?.shopifyId;
      if (!shopifyId) {
        throw new Error('Este grupo no tiene un producto/colección en Shopify');
      }

      const isCollection = group.type === 'collection';
      const shopifyData = isCollection
        ? await shopifyService.getCollection(shopifyId)
        : await shopifyService.getProduct(shopifyId);

      return {
        success: true,
        data: {
          title: shopifyData.title,
          handle: shopifyData.handle,
          bodyHtml: shopifyData.descriptionHtml,
          shopifyUrl: shopifyData.onlineStoreUrl
        }
      };
    } catch (err) {
      console.error('Error sincronizando desde Shopify:', err);
      return { success: false, error: err.message };
    }
  };

  const addProductsToCollection = async (collectionId, productIds) => {
    if (!isConnected) {
      throw new Error('Shopify no está conectado');
    }

    try {
      await shopifyService.addProductsToCollection(collectionId, productIds);
      return { success: true };
    } catch (err) {
      console.error('Error agregando productos a colección:', err);
      return { success: false, error: err.message };
    }
  };

  const getRedirects = async (url) => {
    if (!isConnected) {
      throw new Error('Shopify no está conectado');
    }

    try {
      const redirects = await shopifyService.getRedirectsToUrl(url);
      return { success: true, redirects };
    } catch (err) {
      console.error('Error obteniendo redirects:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    isConnected,
    isPushing,
    error,
    testConnection,
    pushToShopify,
    syncFromShopify,
    addProductsToCollection,
    getRedirects
  };
};
