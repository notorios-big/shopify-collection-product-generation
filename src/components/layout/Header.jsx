import { Cog6ToothIcon, DocumentTextIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/Button';

export const Header = ({ onOpenPrompts, onOpenCredentials }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Shopify Product Generator
            </h1>
            <p className="text-xs text-gray-500">
              AI-Powered SEO Content with Tracking
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            icon={DocumentTextIcon}
            onClick={onOpenPrompts}
          >
            Prompts
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Cog6ToothIcon}
            onClick={onOpenCredentials}
          >
            Configuración
          </Button>
          <button className="text-gray-400 hover:text-gray-600">
            <UserCircleIcon className="w-8 h-8" />
          </button>
        </div>
      </div>
    </header>
  );
};
