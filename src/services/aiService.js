import axios from 'axios';
import { AI_PROVIDERS, AI_PROVIDER_CONFIG } from '../utils/constants';

class AIService {
  constructor() {
    this.providers = AI_PROVIDER_CONFIG;
  }

  /**
   * Genera contenido de producto/colección
   * @param {string} provider - 'gpt-5' | 'claude-4-5' | 'gemini-2.5-pro'
   * @param {string} prompt - Template del prompt con variables
   * @param {object} variables - Variables a interpolar
   * @param {string} apiKey - API key del provider
   * @returns {Promise<{title, handle, bodyHtml}>}
   */
  async generateContent(provider, prompt, variables, apiKey) {
    try {
      // 1. Interpolar variables en prompt
      const interpolatedPrompt = this.interpolateVariables(prompt, variables);

      // 2. Llamar a API según provider
      const response = await this.callProvider(provider, interpolatedPrompt, apiKey);

      // 3. Parsear respuesta (espera JSON)
      const content = this.parseResponse(response, provider);

      // 4. Validar estructura
      if (!content.title || !content.handle || !content.bodyHtml) {
        throw new Error('Respuesta incompleta del modelo. Asegúrate de que el prompt pida JSON con title, handle y bodyHtml.');
      }

      return content;
    } catch (error) {
      console.error('Error generando contenido:', error);
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
   * Llama al provider específico
   */
  async callProvider(provider, prompt, apiKey) {
    const config = this.providers[provider];

    if (!config) {
      throw new Error(`Provider no soportado: ${provider}`);
    }

    try {
      if (provider === AI_PROVIDERS.GPT5) {
        return await this.callOpenAI(config, prompt, apiKey);
      }

      if (provider === AI_PROVIDERS.CLAUDE45) {
        return await this.callAnthropic(config, prompt, apiKey);
      }

      if (provider === AI_PROVIDERS.GEMINI25PRO) {
        return await this.callGemini(config, prompt, apiKey);
      }
    } catch (error) {
      console.error(`Error llamando a ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Llamada a OpenAI GPT-5
   */
  async callOpenAI(config, prompt, apiKey) {
    const response = await axios.post(
      config.endpoint,
      {
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en SEO y copywriting para ecommerce. Responde siempre con JSON válido.'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { data: response.data, provider: AI_PROVIDERS.GPT5 };
  }

  /**
   * Llamada a Anthropic Claude
   */
  async callAnthropic(config, prompt, apiKey) {
    const response = await axios.post(
      config.endpoint,
      {
        model: config.model,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': config.version,
          'Content-Type': 'application/json'
        }
      }
    );

    return { data: response.data, provider: AI_PROVIDERS.CLAUDE45 };
  }

  /**
   * Llamada a Google Gemini
   */
  async callGemini(config, prompt, apiKey) {
    const response = await axios.post(
      `${config.endpoint}?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.7
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    return { data: response.data, provider: AI_PROVIDERS.GEMINI25PRO };
  }

  /**
   * Parsea respuesta según formato del provider
   */
  parseResponse(response, provider) {
    try {
      if (provider === AI_PROVIDERS.GPT5) {
        const content = response.data.choices[0].message.content;
        return JSON.parse(content);
      }

      if (provider === AI_PROVIDERS.CLAUDE45) {
        const content = response.data.content[0].text;
        return JSON.parse(content);
      }

      if (provider === AI_PROVIDERS.GEMINI25PRO) {
        const content = response.data.candidates[0].content.parts[0].text;
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Error parseando respuesta:', error);
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
   * Valida que la API key funcione
   */
  async validateAPIKey(provider, apiKey) {
    try {
      const testPrompt = 'Responde solo con este JSON: {"test": "ok"}';
      await this.callProvider(provider, testPrompt, apiKey);
      return { valid: true, message: 'API key válida' };
    } catch (error) {
      return {
        valid: false,
        message: error.response?.data?.error?.message || error.message
      };
    }
  }
}

export default new AIService();
