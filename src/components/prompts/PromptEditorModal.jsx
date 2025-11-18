import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

const PromptEditorModal = ({ isOpen, onClose }) => {
  const { prompts, savePrompts } = useApp();
  const [activeTab, setActiveTab] = useState('product');
  const [formData, setFormData] = useState(prompts || {});

  useEffect(() => {
    if (prompts) {
      setFormData(prompts);
    }
  }, [prompts]);

  const handleSave = () => {
    savePrompts(formData);
    alert('Prompts guardados exitosamente');
    onClose();
  };

  const handleRestore = () => {
    if (confirm('¿Restaurar prompts por defecto?')) {
      // Los defaults se cargan automáticamente desde storageService
      window.location.reload();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📝 Editor de Prompts" size="lg">
      <div className="space-y-4">
        {/* Pestañas */}
        <div className="flex space-x-2 border-b">
          <button
            onClick={() => setActiveTab('product')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'product'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📦 Productos
          </button>
          <button
            onClick={() => setActiveTab('collection')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'collection'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 Colecciones
          </button>
        </div>

        {/* Contenido */}
        <div>
          {activeTab === 'product' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt para Productos
              </label>
              <Textarea
                value={formData.product || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, product: e.target.value }))
                }
                rows={15}
                className="font-mono text-sm"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt para Colecciones
              </label>
              <Textarea
                value={formData.collection || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, collection: e.target.value }))
                }
                rows={15}
                className="font-mono text-sm"
              />
            </div>
          )}
        </div>

        {/* Variables disponibles */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            💡 Variables disponibles:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <code className="bg-white px-2 py-1 rounded">{'{{keyword}}'}</code> - Keyword
              principal
            </div>
            <div>
              <code className="bg-white px-2 py-1 rounded">{'{{volume}}'}</code> - Volumen de
              búsqueda
            </div>
            <div>
              <code className="bg-white px-2 py-1 rounded">{'{{groupName}}'}</code> - Nombre del
              grupo
            </div>
            <div>
              <code className="bg-white px-2 py-1 rounded">{'{{keywords}}'}</code> - Lista de
              keywords
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="secondary" onClick={handleRestore}>
            🔄 Restaurar Defaults
          </Button>
          <div className="space-x-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              💾 Guardar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PromptEditorModal;
