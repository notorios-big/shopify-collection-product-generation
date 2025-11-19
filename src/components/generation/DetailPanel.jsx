import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import GenerationTab from './GenerationTab';
import SEOTrackingTab from './SEOTrackingTab';

const DetailPanel = ({ group, onClose }) => {
  const [activeTab, setActiveTab] = useState('generation');

  if (!group) return null;

  const isCollection = group.type === 'collection';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {isCollection ? '📚' : '📦'}
            </span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isCollection ? 'Colección' : 'Producto'}: {group.name}
              </h2>
              <p className="text-sm text-gray-600">
                {group.children?.length || 0} keywords • Vol: {group.children?.reduce((sum, k) => sum + (k.volume || 0), 0) || 0}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('generation')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'generation'
                ? 'text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ✨ Generación
            {activeTab === 'generation' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'seo'
                ? 'text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 SEO Tracking
            {activeTab === 'seo' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'generation' && <GenerationTab group={group} />}
          {activeTab === 'seo' && <SEOTrackingTab group={group} />}
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
