import axios from 'axios';
import { NANO_BANANA_CONFIG, IMAGE_STYLES } from '../utils/constants';

class ImageService {
  constructor() {
    this.endpoint = NANO_BANANA_CONFIG.endpoint;
    this.model = NANO_BANANA_CONFIG.model;
  }

  /**
   * Genera imágenes con Nano Banana (Google Gemini API)
   */
  async generateImages(prompt, options = {}) {
    const {
      apiKey,
      count = 4,
      aspectRatio = '1:1',
      style = IMAGE_STYLES.LUXURY,
      referenceImage = null
    } = options;

    if (!apiKey) {
      throw new Error('API key de Google requerida para Nano Banana');
    }

    try {
      const enhancedPrompt = this.enhancePrompt(prompt, style);

      const response = await axios.post(
        `${this.endpoint}?key=${apiKey}`,
        {
          prompt: enhancedPrompt,
          number_of_images: count,
          aspect_ratio: aspectRatio,
          ...(referenceImage && {
            reference_image: referenceImage,
            mode: 'edit'
          })
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      // Mapear respuesta a formato uniforme
      return response.data.predictions.map((pred, index) => ({
        id: `img-${Date.now()}-${index}`,
        url: pred.image_url,
        thumbnail: pred.thumbnail_url || pred.image_url
      }));
    } catch (error) {
      console.error('Nano Banana Error:', error);
      throw new Error(`Error generando imágenes: ${error.message}`);
    }
  }

  /**
   * Mejora prompt según estilo seleccionado
   */
  enhancePrompt(basePrompt, style) {
    const styleEnhancements = {
      [IMAGE_STYLES.REALISTIC]: ', photorealistic, 8K, ultra detailed, natural lighting',
      [IMAGE_STYLES.ARTISTIC]: ', artistic, painterly, creative lighting, expressive',
      [IMAGE_STYLES.MINIMALIST]: ', clean, minimalist, simple composition, white background',
      [IMAGE_STYLES.LUXURY]: ', luxury aesthetic, premium, elegant, high-end, sophisticated lighting'
    };

    return basePrompt + (styleEnhancements[style] || '');
  }

  /**
   * Edita una imagen existente con Nano Banana
   */
  async editImage(imageUrl, editPrompt, apiKey) {
    try {
      const response = await axios.post(
        `${this.endpoint}?key=${apiKey}`,
        {
          prompt: editPrompt,
          reference_image: imageUrl,
          mode: 'edit',
          number_of_images: 1
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return {
        id: `img-edited-${Date.now()}`,
        url: response.data.predictions[0].image_url,
        thumbnail: response.data.predictions[0].thumbnail_url
      };
    } catch (error) {
      console.error('Error editando imagen:', error);
      throw new Error(`Error al editar imagen: ${error.message}`);
    }
  }

  /**
   * Convierte imagen a base64 (para subir a Shopify)
   */
  async imageToBase64(imageUrl) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      });

      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      const mimeType = response.headers['content-type'];

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error('Error convirtiendo imagen a base64:', error);
      throw error;
    }
  }

  /**
   * Valida que la URL de imagen sea accesible
   */
  async validateImageUrl(url) {
    try {
      const response = await axios.head(url);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export default new ImageService();
