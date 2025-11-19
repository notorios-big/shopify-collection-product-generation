import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useGeneration } from '../../hooks/useGeneration';
import { useShopify } from '../../hooks/useShopify';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Badge } from '../common/Badge';
import { HTMLPreview } from './HTMLPreview';
import ImageGenerator from '../images/ImageGenerator';
import VersionHistory from './VersionHistory';
import storageService from '../../services/storageService';
import {
  SparklesIcon,
  ArrowUpTrayIcon,
  PencilIcon,
  PhotoIcon,
  EyeIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const GenerationTab = ({ group }) => {
  const { updateGroup, addVersion } = useApp();
  const { generateContent, isGenerating } = useGeneration();
  const { pushToShopify, isPushing } = useShopify();

  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState('code'); // 'code' | 'preview'
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [editedContent, setEditedContent] = useState({
    title: group.generated?.title || '',
    handle: group.generated?.handle || '',
    bodyHtml: group.generated?.bodyHtml || ''
  });

  const hasContent = group.generated?.title;
  const isCollection = group.type === 'collection';

  const handleGenerate = async () => {
    const result = await generateContent(group);
    if (result.success) {
      setEditedContent({
        title: result.content.generated.title,
        handle: result.content.generated.handle,
        bodyHtml: result.content.generated.bodyHtml
      });
      setIsEditing(false);
    }
  };

  const handleSave = () => {
    addVersion(group.id, editedContent);
    setIsEditing(false);
  };

  const handlePushToShopify = async () => {
    const result = await pushToShopify(group);
    if (result.success) {
      alert('✅ Contenido subido a Shopify exitosamente!');
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handleImagesSelected = (images) => {
    updateGroup(group.id, {
      generated: {
        ...group.generated,
        images
      }
    });
  };

  const handleRestoreVersion = (version) => {
    storageService.restoreVersion(group.id, version.version);
    const updatedGroup = storageService.getGroups().find(g => g.id === group.id);
    if (updatedGroup) {
      setEditedContent({
        title: updatedGroup.generated.title,
        handle: updatedGroup.generated.handle,
        bodyHtml: updatedGroup.generated.bodyHtml
      });
    }
  };

  if (!hasContent && !isGenerating) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <SparklesIcon className="w-16 h-16 mx-auto text-primary-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay contenido generado aún
          </h3>
          <p className="text-gray-600 mb-6">
            Genera contenido SEO-optimizado usando IA para este {isCollection ? 'colección' : 'producto'}
          </p>
          <Button
            variant="primary"
            size="lg"
            icon={SparklesIcon}
            onClick={handleGenerate}
            loading={isGenerating}
          >
            🔄 Generar Contenido con IA
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📌 Título
        </label>
        {isEditing ? (
          <Input
            value={editedContent.title}
            onChange={(e) => setEditedContent(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Título del producto/colección"
          />
        ) : (
          <div className="text-lg font-semibold text-gray-900 p-3 bg-gray-50 rounded-lg">
            {editedContent.title || group.generated?.title}
          </div>
        )}
      </div>

      {/* Handle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🔗 Handle (SEO)
        </label>
        {isEditing ? (
          <Input
            value={editedContent.handle}
            onChange={(e) => setEditedContent(prev => ({ ...prev, handle: e.target.value }))}
            placeholder="handle-url-friendly"
            className="font-mono"
          />
        ) : (
          <div className="text-sm font-mono text-gray-700 p-3 bg-gray-50 rounded-lg">
            {editedContent.handle || group.generated?.handle}
          </div>
        )}
      </div>

      {/* Descripción */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            📄 Descripción (Body HTML)
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'code'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <CodeBracketIcon className="w-4 h-4 inline mr-1" />
              Code
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'preview'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <EyeIcon className="w-4 h-4 inline mr-1" />
              Preview
            </button>
          </div>
        </div>

        {viewMode === 'code' ? (
          isEditing ? (
            <Textarea
              value={editedContent.bodyHtml}
              onChange={(e) => setEditedContent(prev => ({ ...prev, bodyHtml: e.target.value }))}
              rows={12}
              className="font-mono text-sm"
            />
          ) : (
            <Textarea
              value={editedContent.bodyHtml || group.generated?.bodyHtml}
              readOnly
              rows={12}
              className="font-mono text-sm bg-gray-50"
            />
          )
        ) : (
          <HTMLPreview html={editedContent.bodyHtml || group.generated?.bodyHtml} />
        )}
      </div>

      {/* Imágenes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🖼️ Imágenes
        </label>
        <div className="flex items-center space-x-3">
          {group.generated?.images?.length > 0 ? (
            <div className="flex space-x-2">
              {group.generated.images.map((img, idx) => (
                <div key={idx} className="w-20 h-20 border rounded overflow-hidden">
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-700">Sin imágenes</p>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={PhotoIcon}
            onClick={() => setShowImageGenerator(true)}
          >
            Generar con Nano Banana
          </Button>
        </div>
      </div>

      {/* Shopify Status */}
      <div className="border-t pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🔗 Shopify
        </label>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge variant={group.generated?.status === 'in_shopify' ? 'success' : 'default'}>
              {group.generated?.status || 'not_generated'}
            </Badge>
          </div>
          {group.generated?.shopifyId && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Shopify ID:</span>
                <span className="text-xs font-mono text-gray-700">
                  {group.generated.shopifyId}
                </span>
              </div>
              {group.generated?.shopifyUrl && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">URL:</span>
                  <a
                    href={group.generated.shopifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:underline"
                  >
                    Ver en Shopify →
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Versiones */}
      {group.generated?.versions && group.generated.versions.length > 0 && (
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            📜 Historial de Versiones
          </label>
          <VersionHistory
            groupId={group.id}
            versions={group.generated.versions}
            currentVersion={group.generated.currentVersion}
            onRestore={handleRestoreVersion}
          />
        </div>
      )}

      {/* Acciones */}
      <div className="flex justify-between pt-6 border-t">
        <div className="space-x-2">
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSave}>
                💾 Guardar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                icon={PencilIcon}
                onClick={() => setIsEditing(true)}
              >
                Editar
              </Button>
              <Button
                variant="secondary"
                icon={SparklesIcon}
                onClick={handleGenerate}
                loading={isGenerating}
              >
                Regenerar
              </Button>
            </>
          )}
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={ArrowUpTrayIcon}
          onClick={handlePushToShopify}
          loading={isPushing}
          disabled={isEditing}
        >
          {group.generated?.shopifyId ? 'Actualizar en Shopify' : 'Pasar a Shopify'}
        </Button>
      </div>

      {/* Modal de Generador de Imágenes */}
      {showImageGenerator && (
        <ImageGenerator
          isOpen={showImageGenerator}
          onClose={() => setShowImageGenerator(false)}
          productTitle={editedContent.title || group.name}
          keywords={group.children?.map(k => k.keyword) || []}
          onImagesGenerated={handleImagesSelected}
        />
      )}
    </div>
  );
};

export default GenerationTab;
