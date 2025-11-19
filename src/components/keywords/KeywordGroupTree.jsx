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

// Componente recursivo para renderizar subgrupos
const GroupItem = ({
  item,
  expandedGroups,
  toggleExpand,
  level,
  onTypeChange,
  onViewDetails,
  onDelete
}) => {
  const isExpanded = expandedGroups.includes(item.id);
  const children = item.children || [];

  // Calcular volumen total y keywords recursivamente
  const calculateGroupStats = (items) => {
    let keywordCount = 0;
    let totalVolume = 0;

    const countRecursive = (subItems) => {
      subItems.forEach((subItem) => {
        if (subItem.isGroup) {
          countRecursive(subItem.children || []);
        } else {
          keywordCount++;
          totalVolume += subItem.volume || 0;
        }
      });
    };

    countRecursive(items);
    return { keywordCount, totalVolume };
  };

  const { keywordCount, totalVolume } = calculateGroupStats(children);
  const status = item.generated?.status || 'not_generated';
  const statusIcon = STATUS_ICONS[status] || '⚪';

  const bgColors = [
    'bg-blue-50 border-blue-200',
    'bg-purple-50 border-purple-200',
    'bg-green-50 border-green-200',
    'bg-yellow-50 border-yellow-200',
  ];
  const bgColor = bgColors[Math.min(level, bgColors.length - 1)];

  return (
    <div className={`border rounded-lg overflow-hidden mb-2 ${bgColor}`}>
      <div className="p-3">
        {/* Header del subgrupo */}
        <div className="flex items-center space-x-2 mb-2">
          <button
            onClick={() => toggleExpand(item.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
          <span className="font-medium text-gray-900 text-sm">
            {item.type === 'product' ? '📦' : item.type === 'collection' ? '📚' : '📁'} {item.name}
          </span>
          <Badge variant={status === 'in_shopify' ? 'success' : 'default'} size="sm">
            {statusIcon}
          </Badge>
          <div className="flex-1" />
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <span>📊 {keywordCount} kws</span>
            <span>vol: {totalVolume.toLocaleString()}</span>
          </div>
        </div>

        {/* Controles del subgrupo */}
        <div className="flex items-center space-x-2 mb-2">
          <Select
            value={item.type || ''}
            onChange={(e) => onTypeChange(item.id, e.target.value || null)}
            options={[
              { value: '', label: 'Sin etiquetar' },
              { value: GROUP_TYPES.PRODUCT, label: 'Producto' },
              { value: GROUP_TYPES.COLLECTION, label: 'Colección' }
            ]}
            className="w-40 text-sm"
          />

          {item.type && (
            <Button
              variant="primary"
              size="sm"
              icon={EyeIcon}
              onClick={() => onViewDetails(item)}
            >
              Ver Detalle
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            icon={TrashIcon}
            onClick={() => onDelete(item.id)}
          >
            Eliminar
          </Button>
        </div>

        {/* Children expandidos */}
        {isExpanded && (
          <div className="mt-2 pl-4 space-y-1">
            {children.map((child) => (
              child.isGroup ? (
                <GroupItem
                  key={child.id}
                  item={child}
                  expandedGroups={expandedGroups}
                  toggleExpand={toggleExpand}
                  level={level + 1}
                  onTypeChange={onTypeChange}
                  onViewDetails={onViewDetails}
                  onDelete={onDelete}
                />
              ) : (
                <div
                  key={child.id}
                  className="flex items-center justify-between py-2 px-3 bg-white rounded text-sm"
                >
                  <span className="text-gray-700">{child.keyword}</span>
                  <span className="text-gray-500">vol: {child.volume}</span>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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

  // Función recursiva para contar keywords y volumen total
  const calculateGroupStats = (children) => {
    let keywordCount = 0;
    let totalVolume = 0;

    const countRecursive = (items) => {
      items.forEach((item) => {
        if (item.isGroup) {
          // Es un subgrupo, contar recursivamente
          countRecursive(item.children || []);
        } else {
          // Es un keyword individual
          keywordCount++;
          totalVolume += item.volume || 0;
        }
      });
    };

    countRecursive(children);
    return { keywordCount, totalVolume };
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
          const children = group.children || [];
          const { keywordCount, totalVolume } = calculateGroupStats(children);
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
                      <span>📊 {keywordCount} keywords</span>
                      <span>Vol total: {totalVolume.toLocaleString()}</span>
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
                    {children.map((item) => (
                      item.isGroup ? (
                        <GroupItem
                          key={item.id}
                          item={item}
                          expandedGroups={expandedGroups}
                          toggleExpand={toggleExpand}
                          level={1}
                          onTypeChange={handleTypeChange}
                          onViewDetails={handleViewDetails}
                          onDelete={handleDelete}
                        />
                      ) : (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm"
                        >
                          <span className="text-gray-700">{item.keyword}</span>
                          <span className="text-gray-500">vol: {item.volume}</span>
                        </div>
                      )
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
