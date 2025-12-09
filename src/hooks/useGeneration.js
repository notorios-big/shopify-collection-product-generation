import { useState } from 'react';
import aiService from '../services/aiService';
import { useApp } from '../context/AppContext';

export const useGeneration = () => {
  const { credentials, prompts, nicheDescription, updateGroup, addVersion, updateGroupStatus } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateContent = async (group) => {
    console.log('🚀 [useGeneration] Iniciando generación de contenido...');
    console.log('📦 [useGeneration] Group:', group);

    setIsGenerating(true);
    setError(null);

    try {
      // Solo usamos Gemini
      const apiKey = credentials.google?.apiKey;

      console.log('🔑 [useGeneration] Credentials:', {
        hasGoogleKey: !!apiKey,
        keyLength: apiKey?.length || 0,
        keyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : 'NO KEY'
      });

      if (!apiKey) {
        const errorMsg = 'Configura tu API Key de Google (Gemini) en Configuración';
        console.error('❌ [useGeneration]', errorMsg);
        throw new Error(errorMsg);
      }

      // Determinar tipo de prompt
      const isCollection = group.type === 'collection';
      const prompt = isCollection ? prompts.collection : prompts.product;

      console.log('📝 [useGeneration] Tipo:', isCollection ? 'collection' : 'product');
      console.log('📝 [useGeneration] Prompt template length:', prompt?.length || 0);

      // Preparar variables
      const keywords = group.children || [];
      const mainKeyword = keywords[0]?.keyword || group.name;
      const totalVolume = keywords.reduce((sum, k) => sum + (k.volume || 0), 0);

      // Preparar keywords con volumen para el prompt (formato: keyword (volumen))
      const keywordsWithVolume = keywords.map((k) => `${k.keyword} (${k.volume || 0})`).join(', ');

      const variables = {
        keyword: mainKeyword,
        volume: totalVolume,
        groupName: group.name,
        keywords: keywordsWithVolume,
        relatedKeywords: keywordsWithVolume,
        totalVolume,
        nicheDescription: nicheDescription || ''
      };

      console.log('🔧 [useGeneration] Variables:', variables);

      // Actualizar status a "generando"
      updateGroupStatus(group.id, 'generating');
      console.log('⏳ [useGeneration] Status actualizado a "generating"');

      // Llamar a AI service (solo Gemini)
      console.log('🤖 [useGeneration] Llamando a aiService.generateContent...');
      const content = await aiService.generateContent(
        'gemini',
        prompt,
        variables,
        apiKey
      );

      console.log('✅ [useGeneration] Contenido generado:', content);

      // Guardar versión incluyendo las keywords del grupo
      const updated = addVersion(group.id, {
        title: content.title,
        handle: content.handle,
        bodyHtml: content.bodyHtml,
        images: [],
        status: 'generated',
        mainKeyword: mainKeyword,
        keywords: keywords.map((k) => ({ keyword: k.keyword, volume: k.volume || 0 }))
      });

      console.log('💾 [useGeneration] Versión guardada:', updated);

      setIsGenerating(false);
      return { success: true, content: updated };
    } catch (err) {
      console.error('❌ [useGeneration] Error generando contenido:', err);
      console.error('❌ [useGeneration] Error stack:', err.stack);
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
