import {
  FolderIcon,
  DocumentPlusIcon,
  Cog6ToothIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';

export const Sidebar = ({ activeView, onViewChange }) => {
  const { getStats } = useApp();
  const stats = getStats();

  const menuItems = [
    {
      id: 'keywords',
      label: 'Grupos de Keywords',
      icon: FolderIcon,
      badge: stats.totalGroups
    },
    {
      id: 'import',
      label: 'Importar',
      icon: DocumentPlusIcon
    },
    {
      id: 'credentials',
      label: 'Credenciales',
      icon: Cog6ToothIcon
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-lg
                transition-colors text-left
                ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`
                  px-2 py-0.5 rounded-full text-xs font-medium
                  ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600'
                  }
                `}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-primary-900 mb-2">
            Estadísticas
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-primary-700">Total Keywords:</span>
              <span className="font-medium text-primary-900">
                {stats.totalKeywords}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-700">Volumen Total:</span>
              <span className="font-medium text-primary-900">
                {stats.totalVolume}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-700">En Shopify:</span>
              <span className="font-medium text-success-700">
                {stats.byStatus.in_shopify}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
