import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { useApp } from '../../context/AppContext';
import imageService from '../../services/imageService';
import aiService from '../../services/aiService';
import { IMAGE_STYLES, ASPECT_RATIOS } from '../../utils/constants';
import { SparklesIcon, CheckIcon } from '@heroicons/react/24/outline';

const ImageGenerator = ({ isOpen, onClose, productTitle, keywords, onImagesGenerated }) => {
  const { credentials } = useApp();

  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(IMAGE_STYLES.LUXURY);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS.SQUARE);
  const [variationCount, setVariationCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  const apiKey = credentials?.google?.apiKey || credentials?.nanoBanana?.apiKey;

  const handleAutoGeneratePrompt = () => {
    const autoPrompt = aiService.generateImagePrompt(productTitle, keywords);
    setPrompt(autoPrompt);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      alert('Por favor configura tu API key de Google AI primero');
      return;
    }

    if (!prompt) {
      alert('Por favor ingresa un prompt para la imagen');
      return;
    }

    setIsGenerating(true);
    try {
      const images = await imageService.generateImages(prompt, {
        apiKey,
        count: variationCount,
        aspectRatio,
        style
      });

      setGeneratedImages(images);
    } catch (error) {
      console.error('Error generating images:', error);
      alert(`Error generando imágenes: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleImageSelection = (imageId) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleUseSelected = () => {
    const selectedImageUrls = generatedImages
      .filter(img => selectedImages.includes(img.id))
      .map(img => img.url);

    onImagesGenerated(selectedImageUrls);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🖼️ Generador de Imágenes - Nano Banana"
      size="xl"
    >
      <div className="space-y-6">
        {/* Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 Prompt de Imagen
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe la imagen que deseas generar..."
            rows={4}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={SparklesIcon}
            onClick={handleAutoGeneratePrompt}
            className="mt-2"
          >
            🤖 Auto-generar desde producto
          </Button>
        </div>

        {/* Configuración */}
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="✨ Estilo"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            options={[
              { value: IMAGE_STYLES.REALISTIC, label: 'Realista' },
              { value: IMAGE_STYLES.ARTISTIC, label: 'Artístico' },
              { value: IMAGE_STYLES.MINIMALIST, label: 'Minimalista' },
              { value: IMAGE_STYLES.LUXURY, label: 'Lujo' }
            ]}
          />

          <Select
            label="📐 Aspect Ratio"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            options={[
              { value: ASPECT_RATIOS.SQUARE, label: '1:1 (Cuadrado)' },
              { value: ASPECT_RATIOS.LANDSCAPE_43, label: '4:3' },
              { value: ASPECT_RATIOS.LANDSCAPE_169, label: '16:9' }
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔢 Variaciones
            </label>
            <input
              type="number"
              min="1"
              max="8"
              value={variationCount}
              onChange={(e) => setVariationCount(parseInt(e.target.value))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        {/* Botón Generar */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerate}
          loading={isGenerating}
          disabled={!prompt || !apiKey}
          className="w-full"
        >
          🎨 Generar Imágenes
        </Button>

        {/* Progress */}
        {isGenerating && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              <span className="text-sm text-primary-700">
                Generando {variationCount} variaciones...
              </span>
            </div>
          </div>
        )}

        {/* Resultados */}
        {generatedImages.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              🖼️ Resultados ({generatedImages.length})
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((img) => (
                <div
                  key={img.id}
                  className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedImages.includes(img.id)
                      ? 'border-primary-500 ring-2 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleImageSelection(img.id)}
                >
                  <img
                    src={img.url}
                    alt={`Generated ${img.id}`}
                    className="w-full h-48 object-cover"
                  />
                  {selectedImages.includes(img.id) && (
                    <div className="absolute top-2 right-2 bg-primary-500 rounded-full p-1">
                      <CheckIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones finales */}
        {generatedImages.length > 0 && (
          <div className="flex justify-between pt-4 border-t">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <div className="space-x-2">
              <Button
                variant="secondary"
                onClick={handleGenerate}
                loading={isGenerating}
              >
                🔄 Regenerar
              </Button>
              <Button
                variant="primary"
                onClick={handleUseSelected}
                disabled={selectedImages.length === 0}
              >
                ✅ Usar Seleccionadas ({selectedImages.length})
              </Button>
            </div>
          </div>
        )}

        {/* API Key Warning */}
        {!apiKey && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <p className="text-sm text-warning-700">
              ⚠️ Necesitas configurar tu API key de Google AI en la configuración para usar Nano Banana
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImageGenerator;
