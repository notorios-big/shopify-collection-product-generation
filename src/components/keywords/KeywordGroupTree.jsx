import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Badge } from '../common/Badge';
import { STATUS_ICONS, GROUP_TYPES } from '../../utils/constants';
import DetailPanel from '../generation/DetailPanel';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const KeywordGroupTree = () => {
  const { groups, updateGroup, deleteGroup } = useApp();
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState(null);

  const toggleExpand = (groupId) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleTypeChange = (groupId, type) => {
    updateGroup(groupId, { type });
  };

  const handleDelete = (groupId) => {
    if (confirm('¿Eliminar este grupo?')) {
      deleteGroup(groupId);
    }
  };

  const handleViewDetails = (group) => {
    setSelectedGroup(group);
  };

  const filteredGroups = groups.filter((g) => {
    if (filter === 'all') return true;
    if (filter === 'product') return g.type === 'product';
    if (filter === 'collection') return g.type === 'collection';
    if (filter === 'untagged') return !g.type;
    if (filter === 'in_shopify') return g.generated?.status === 'in_shopify';
    return true;
  });

  if (groups.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay grupos de keywords
          </h3>
          <p className="text-gray-600 mb-6">
            Importa un archivo JSON para comenzar a generar contenido
          </p>
          <Button variant="primary" onClick={() => window.location.hash = '#import'}>
            📥 Ir a Importar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">🌲 Grupos de Keywords</h2>
          <p className="text-sm text-gray-600">
            {filteredGroups.length} de {groups.length} grupos
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'product', label: 'Productos' },
              { value: 'collection', label: 'Colecciones' },
              { value: 'untagged', label: 'Sin etiquetar' },
              { value: 'in_shopify', label: 'En Shopify' }
            ]}
            className="w-48"
          />
          <Button variant="ghost" size="sm" onClick={() => setExpandedGroups(groups.map(g => g.id))}>
            Expandir Todos
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setExpandedGroups([])}>
            Colapsar Todos
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.id);
          const keywords = group.children || [];
          const totalVolume = keywords.reduce((sum, k) => sum + (k.volume || 0), 0);
          const status = group.generated?.status || 'not_generated';
          const statusIcon = STATUS_ICONS[status] || '⚪';

          return (
            <div
              key={group.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <button
                        onClick={() => toggleExpand(group.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? (
                          <ChevronDownIcon className="w-5 h-5" />
                        ) : (
                          <ChevronRightIcon className="w-5 h-5" />
                        )}
                      </button>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {group.type === 'product' ? '📦' : group.type === 'collection' ? '📚' : '📝'}{' '}
                        {group.name}
                      </h3>
                      <Badge variant={status === 'in_shopify' ? 'success' : 'default'}>
                        {statusIcon} {status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span>📊 {keywords.length} keywords</span>
                      <span>Vol total: {totalVolume}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Select
                        value={group.type || ''}
                        onChange={(e) => handleTypeChange(group.id, e.target.value || null)}
                        options={[
                          { value: '', label: 'Sin etiquetar' },
                          { value: GROUP_TYPES.PRODUCT, label: 'Producto' },
                          { value: GROUP_TYPES.COLLECTION, label: 'Colección' }
                        ]}
                        className="w-48"
                      />

                      {group.type && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={EyeIcon}
                          onClick={() => handleViewDetails(group)}
                        >
                          Ver Detalle
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={TrashIcon}
                        onClick={() => handleDelete(group.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pl-8 space-y-1">
                    {keywords.map((kw) => (
                      <div
                        key={kw.id}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm"
                      >
                        <span className="text-gray-700">{kw.keyword}</span>
                        <span className="text-gray-500">vol: {kw.volume}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DetailPanel Modal */}
      {selectedGroup && (
        <DetailPanel
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
};

export default KeywordGroupTree;
