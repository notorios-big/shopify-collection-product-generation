import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Modal } from '../common/Modal';
import CredentialsPanel from '../credentials/CredentialsPanel';
import PromptEditorModal from '../prompts/PromptEditorModal';
import KeywordImporter from '../keywords/KeywordImporter';
import KeywordGroupTree from '../keywords/KeywordGroupTree';

export const MainLayout = () => {
  const [activeView, setActiveView] = useState('keywords');
  const [showCredentials, setShowCredentials] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);

  const renderMainContent = () => {
    switch (activeView) {
      case 'keywords':
        return <KeywordGroupTree />;
      case 'import':
        return <KeywordImporter />;
      case 'credentials':
        return <CredentialsPanel />;
      default:
        return <KeywordGroupTree />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        onOpenPrompts={() => setShowPrompts(true)}
        onOpenCredentials={() => setShowCredentials(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto p-6">{renderMainContent()}</div>
        </main>
      </div>

      {/* Modal de Credenciales */}
      <Modal
        isOpen={showCredentials}
        onClose={() => setShowCredentials(false)}
        title="⚙️ Configuración de Credenciales"
        size="lg"
      >
        <CredentialsPanel />
      </Modal>

      {/* Modal de Prompts */}
      <PromptEditorModal
        isOpen={showPrompts}
        onClose={() => setShowPrompts(false)}
      />
    </div>
  );
};
