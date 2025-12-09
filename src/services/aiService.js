import axios from 'axios';
import { AI_PROVIDERS, AI_PROVIDER_CONFIG } from '../utils/constants';

class AIService {
  constructor() {
    this.config = AI_PROVIDER_CONFIG[AI_PROVIDERS.GEMINI];
  }

  /**
   * Genera contenido de producto/colección usando Gemini
   * @param {string} provider - Solo 'gemini' soportado
   * @param {string} prompt - Template del prompt con variables
   * @param {object} variables - Variables a interpolar
   * @param {string} apiKey - API key de Google
   * @returns {Promise<{title, handle, bodyHtml}>}
   */
  async generateContent(provider, prompt, variables, apiKey) {
    console.log('🤖 [aiService] generateContent llamado');
    console.log('🤖 [aiService] Provider:', provider);
    console.log('🤖 [aiService] Variables:', variables);
    console.log('🤖 [aiService] API Key preview:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NO KEY');

    try {
      // 1. Interpolar variables en prompt
      const interpolatedPrompt = this.interpolateVariables(prompt, variables);
      console.log('📝 [aiService] Prompt interpolado (primeros 500 chars):', interpolatedPrompt.substring(0, 500));

      // 2. Llamar a Gemini API
      console.log('🌐 [aiService] Llamando a Gemini API...');
      const response = await this.callGemini(interpolatedPrompt, apiKey);
      console.log('📥 [aiService] Respuesta raw de Gemini:', response);

      // 3. Parsear respuesta (espera JSON)
      console.log('🔄 [aiService] Parseando respuesta...');
      const content = this.parseResponse(response);
      console.log('✅ [aiService] Contenido parseado:', content);

      // 4. Validar estructura
      if (!content.title || !content.handle || !content.bodyHtml) {
        console.error('❌ [aiService] Respuesta incompleta:', content);
        throw new Error('Respuesta incompleta del modelo. Asegúrate de que el prompt pida JSON con title, handle y bodyHtml.');
      }

      return content;
    } catch (error) {
      console.error('❌ [aiService] Error generando contenido:', error);
      console.error('❌ [aiService] Error response:', error.response?.data);
      throw new Error(`Error al generar contenido: ${error.message}`);
    }
  }

  /**
   * Interpola variables como {{keyword}} con valores reales
   */
  interpolateVariables(template, variables) {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');

      // Si es array, convertir a string
      const stringValue = Array.isArray(value)
        ? value.map(v => v.keyword || v).join(', ')
        : String(value);

      result = result.replace(regex, stringValue);
    }

    return result;
  }

  /**
   * Llamada a Google Gemini 3 Pro Preview
   */
  async callGemini(prompt, apiKey) {
    // Usar proxy en desarrollo para evitar CORS
    const baseUrl = import.meta.env.DEV
      ? '/api/google-ai'
      : 'https://generativelanguage.googleapis.com';

    const model = 'gemini-3-pro-preview';
    const endpoint = `${baseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`;

    console.log('🌐 [aiService] Gemini endpoint:', endpoint.replace(apiKey, 'API_KEY_HIDDEN'));
    console.log('🌐 [aiService] Modelo:', model);

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    };

    console.log('📤 [aiService] Request body:', JSON.stringify(requestBody, null, 2).substring(0, 500) + '...');

    try {
      const response = await axios.post(
        endpoint,
        requestBody,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      console.log('📥 [aiService] Gemini response status:', response.status);
      console.log('📥 [aiService] Gemini response data:', JSON.stringify(response.data, null, 2).substring(0, 1000));

      return response.data;
    } catch (error) {
      console.error('❌ [aiService] Error en llamada Gemini:', error.message);
      console.error('❌ [aiService] Error response status:', error.response?.status);
      console.error('❌ [aiService] Error response data:', error.response?.data);
      throw error;
    }
  }

  /**
   * Parsea respuesta de Gemini
   */
  parseResponse(response) {
    try {
      console.log('🔄 [aiService] Parseando response de Gemini...');

      // Verificar estructura de respuesta
      if (!response.candidates || !response.candidates[0]) {
        console.error('❌ [aiService] No candidates en response:', response);
        throw new Error('Respuesta vacía de Gemini');
      }

      const candidate = response.candidates[0];
      console.log('🔄 [aiService] Candidate:', candidate);

      if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
        console.error('❌ [aiService] No content.parts en candidate:', candidate);
        throw new Error('Estructura de respuesta inesperada');
      }

      const text = candidate.content.parts[0].text;
      console.log('🔄 [aiService] Texto raw:', text);

      // Intentar parsear JSON
      const parsed = JSON.parse(text);
      console.log('✅ [aiService] JSON parseado:', parsed);

      return parsed;
    } catch (error) {
      console.error('❌ [aiService] Error parseando respuesta:', error);
      console.error('❌ [aiService] Response original:', response);
      throw new Error('Error al parsear la respuesta del modelo. Asegúrate de que el prompt pida JSON válido.');
    }
  }

  /**
   * Genera prompt para imagen basado en producto
   */
  generateImagePrompt(productTitle, keywords) {
    const keywordList = Array.isArray(keywords)
      ? keywords.map(k => k.keyword || k).join(', ')
      : keywords;

    return `Professional product photography of ${productTitle}, featuring ${keywordList}, studio lighting, luxury aesthetic, high resolution, marble background, elegant composition, commercial photography`;
  }

  /**
   * Valida que la API key de Gemini funcione
   */
  async validateAPIKey(apiKey) {
    console.log('🔑 [aiService] Validando API key...');
    try {
      const testPrompt = 'Responde solo con este JSON: {"test": "ok"}';
      await this.callGemini(testPrompt, apiKey);
      console.log('✅ [aiService] API key válida');
      return { valid: true, message: 'API key válida' };
    } catch (error) {
      console.error('❌ [aiService] API key inválida:', error.message);
      return {
        valid: false,
        message: error.response?.data?.error?.message || error.message
      };
    }
  }
}

export default new AIService();
