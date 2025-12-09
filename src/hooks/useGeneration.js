import { useState } from 'react';
import aiService from '../services/aiService';
import { useApp } from '../context/AppContext';

export const useGeneration = () => {
  const { credentials, prompts, updateGroup, addVersion, updateGroupStatus } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateContent = async (group) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Validar credenciales
      const selectedModel = credentials.selectedAIModel;
      let apiKey;

      if (selectedModel === 'gpt-4') {
        apiKey = credentials.openai.apiKey;
      } else if (selectedModel === 'claude-4-5') {
        apiKey = credentials.anthropic.apiKey;
      } else if (selectedModel === 'gemini-3-pro') {
        apiKey = credentials.google.apiKey;
      }

      if (!apiKey) {
        throw new Error('Configura las credenciales del modelo de IA primero');
      }

      // Determinar tipo de prompt
      const isCollection = group.type === 'collection';
      const prompt = isCollection ? prompts.collection : prompts.product;

      // Preparar variables
      const keywords = group.children || [];
      const mainKeyword = keywords[0]?.keyword || group.name;
      const totalVolume = keywords.reduce((sum, k) => sum + (k.volume || 0), 0);

      const variables = {
        keyword: mainKeyword,
        volume: totalVolume,
        groupName: group.name,
        keywords: keywords.map((k) => k.keyword).join(', '),
        relatedKeywords: keywords.map((k) => k.keyword).join(', '),
        totalVolume
      };

      // Actualizar status a "generando"
      updateGroupStatus(group.id, 'generating');

      // Llamar a AI service
      const content = await aiService.generateContent(
        selectedModel,
        prompt,
        variables,
        apiKey
      );

      // Guardar versión
      const updated = addVersion(group.id, {
        title: content.title,
        handle: content.handle,
        bodyHtml: content.bodyHtml,
        images: [],
        status: 'generated'
      });

      setIsGenerating(false);
      return { success: true, content: updated };
    } catch (err) {
      console.error('Error generando contenido:', err);
      setError(err.message);
      updateGroupStatus(group.id, 'error');
      setIsGenerating(false);
      return { success: false, error: err.message };
    }
  };

  const regenerateContent = async (group) => {
    // Simplemente llamar a generateContent de nuevo
    return generateContent(group);
  };

  return {
    generateContent,
    regenerateContent,
    isGenerating,
    error
  };
};
