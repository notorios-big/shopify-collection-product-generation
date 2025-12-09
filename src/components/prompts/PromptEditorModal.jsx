import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { DEFAULT_NICHE_DESCRIPTION } from '../../utils/constants';

const PromptEditorModal = ({ isOpen, onClose }) => {
  const { prompts, savePrompts, nicheDescription, saveNicheDescription } = useApp();
  const [activeTab, setActiveTab] = useState('niche');
  const [formData, setFormData] = useState(prompts || {});
  const [nicheData, setNicheData] = useState(nicheDescription || '');

  useEffect(() => {
    if (prompts) {
      setFormData(prompts);
    }
  }, [prompts]);

  useEffect(() => {
    if (nicheDescription) {
      setNicheData(nicheDescription);
    }
  }, [nicheDescription]);

  const handleSave = () => {
    savePrompts(formData);
    saveNicheDescription(nicheData);
    alert('Configuración guardada exitosamente');
    onClose();
  };

  const handleRestorePrompts = () => {
    if (confirm('¿Restaurar prompts por defecto? (No afecta la descripción del nicho)')) {
      window.location.reload();
    }
  };

  const handleRestoreNiche = () => {
    if (confirm('¿Restaurar descripción del nicho por defecto?')) {
      setNicheData(DEFAULT_NICHE_DESCRIPTION);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📝 Editor de Prompts" size="lg">
      <div className="space-y-4">
        {/* Pestañas */}
        <div className="flex space-x-2 border-b">
          <button
            onClick={() => setActiveTab('niche')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'niche'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏪 Descripción del Nicho
          </button>
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
          {activeTab === 'niche' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del Nicho / Contexto del Negocio
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Esta descripción se incluye automáticamente en todos los prompts para dar contexto a la IA sobre tu negocio.
                Define qué productos vendes, cuáles NO vendes, tu público objetivo y tono de comunicación.
              </p>
              <Textarea
                value={nicheData}
                onChange={(e) => setNicheData(e.target.value)}
                rows={12}
                className="font-mono text-sm"
                placeholder="Describe tu negocio, qué vendes, qué NO vendes, tu público objetivo..."
              />
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={handleRestoreNiche}>
                  🔄 Restaurar Default
                </Button>
              </div>
            </div>
          ) : activeTab === 'product' ? (
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

        {/* Variables disponibles - solo mostrar en tabs de prompts */}
        {activeTab !== 'niche' && (
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
              <div>
                <code className="bg-white px-2 py-1 rounded">{'{{relatedKeywords}}'}</code> - Keywords
                relacionadas
              </div>
              <div>
                <code className="bg-white px-2 py-1 rounded">{'{{totalVolume}}'}</code> - Volumen
                total
              </div>
              <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
                <code className="bg-primary-100 px-2 py-1 rounded text-primary-700">{'{{nicheDescription}}'}</code> - Se
                reemplaza automáticamente con la descripción del nicho
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-between pt-4 border-t">
          {activeTab !== 'niche' ? (
            <Button variant="secondary" onClick={handleRestorePrompts}>
              🔄 Restaurar Prompts Default
            </Button>
          ) : (
            <div></div>
          )}
          <div className="space-x-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              💾 Guardar Todo
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PromptEditorModal;
