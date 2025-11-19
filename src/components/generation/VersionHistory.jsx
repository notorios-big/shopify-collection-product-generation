import { useState } from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatRelativeTime } from '../../utils/formatters';
import { ClockIcon, ArrowPathIcon, EyeIcon } from '@heroicons/react/24/outline';

/**
 * Componente de Historial de Versiones
 * Muestra todas las versiones de contenido generado para un grupo
 * y permite restaurar versiones anteriores
 */
const VersionHistory = ({ groupId, versions = [], currentVersion, onRestore }) => {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!versions || versions.length === 0) {
    return (
      <div className="text-center py-8">
        <ClockIcon className="w-12 h-12 mx-auto text-gray-500 mb-3" />
        <p className="text-sm font-medium text-gray-700">No hay versiones guardadas aún</p>
        <p className="text-xs text-gray-600 mt-1">
          Las versiones se crean automáticamente al generar o editar contenido
        </p>
      </div>
    );
  }

  const handlePreview = (version) => {
    setSelectedVersion(version);
    setShowPreview(true);
  };

  const handleRestore = (version) => {
    if (confirm(`¿Restaurar a la versión ${version.version}?`)) {
      onRestore(version);
      setShowPreview(false);
      setSelectedVersion(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Lista de versiones */}
      <div className="space-y-2">
        {versions.map((version) => {
          const isCurrent = version.version === currentVersion;

          return (
            <div
              key={version.version}
              className={`border rounded-lg p-3 transition-all ${
                isCurrent
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      Versión {version.version}
                    </span>
                    {isCurrent && (
                      <Badge variant="primary" size="sm">
                        Actual
                      </Badge>
                    )}
                    {version.content?.provider && (
                      <Badge variant="default" size="sm">
                        {version.content.provider}
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-gray-600 mb-2">
                    <ClockIcon className="w-3 h-3 inline mr-1" />
                    {formatRelativeTime(version.timestamp)}
                  </div>

                  {version.content?.title && (
                    <div className="text-sm text-gray-700 truncate">
                      <strong>Título:</strong> {version.content.title}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={EyeIcon}
                    onClick={() => handlePreview(version)}
                  >
                    Ver
                  </Button>

                  {!isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={ArrowPathIcon}
                      onClick={() => handleRestore(version)}
                    >
                      Restaurar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Preview */}
      {showPreview && selectedVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Versión {selectedVersion.version}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatRelativeTime(selectedVersion.timestamp)}
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <div className="text-base text-gray-900 p-3 bg-gray-50 rounded">
                  {selectedVersion.content?.title || 'Sin título'}
                </div>
              </div>

              {/* Handle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Handle
                </label>
                <div className="text-sm font-mono text-gray-700 p-3 bg-gray-50 rounded">
                  {selectedVersion.content?.handle || 'Sin handle'}
                </div>
              </div>

              {/* Body HTML */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenido HTML
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: selectedVersion.content?.bodyHtml || '<p>Sin contenido</p>'
                    }}
                  />
                </div>
              </div>

              {/* Imágenes */}
              {selectedVersion.content?.images && selectedVersion.content.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imágenes ({selectedVersion.content.images.length})
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedVersion.content.images.map((img, idx) => (
                      <div key={idx} className="border rounded overflow-hidden">
                        <img
                          src={img}
                          alt={`Imagen ${idx + 1}`}
                          className="w-full h-24 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t border-gray-200 px-6 py-4">
              <Button variant="ghost" onClick={() => setShowPreview(false)}>
                Cerrar
              </Button>

              {selectedVersion.version !== currentVersion && (
                <Button
                  variant="primary"
                  icon={ArrowPathIcon}
                  onClick={() => handleRestore(selectedVersion)}
                >
                  Restaurar esta versión
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistory;
