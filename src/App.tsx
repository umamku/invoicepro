import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Settings from './components/Settings';
import ClientList from './components/ClientList';
import InvoiceEditor from './components/InvoiceEditor';
import InvoicePreview from './components/InvoicePreview';
import { FileText, Users, Settings as SettingsIcon, Eye } from 'lucide-react';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'clients' | 'settings' | 'preview'>('editor');

  const renderContent = () => {
    switch (activeTab) {
      case 'editor':
        return <InvoiceEditor />;
      case 'clients':
        return <ClientList />;
      case 'settings':
        return <Settings />;
      case 'preview':
        return <InvoicePreview />;
      default:
        return <InvoiceEditor />;
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar no-print">
        <h1>
          <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '6px', borderRadius: '8px' }}>
            <FileText size={20} />
          </div>
          InvoicePro
        </h1>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button 
            className={`nav-link ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <FileText size={18} /> Edit Invoice
          </button>
          <button 
            className={`nav-link ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <Eye size={18} /> Preview & Print
          </button>
          <button 
            className={`nav-link ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            <Users size={18} /> Clients
          </button>
          <button 
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={18} /> Settings
          </button>
        </nav>
      </aside>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
