import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Settings from './components/Settings';
import ClientList from './components/ClientList';
import InvoiceEditor from './components/InvoiceEditor';
import InvoicePreview from './components/InvoicePreview';
import ReceiptEditor from './components/ReceiptEditor';
import ReceiptPreview from './components/ReceiptPreview';
import { FileText, Users, Settings as SettingsIcon, Eye, CheckSquare } from 'lucide-react';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'receipt-editor' | 'receipt-preview' | 'clients' | 'settings'>('editor');

  const renderContent = () => {
    switch (activeTab) {
      case 'editor':
        return <InvoiceEditor />;
      case 'preview':
        return <InvoicePreview />;
      case 'receipt-editor':
        return <ReceiptEditor />;
      case 'receipt-preview':
        return <ReceiptPreview />;
      case 'clients':
        return <ClientList />;
      case 'settings':
        return <Settings />;
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
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginTop: '10px', textTransform: 'uppercase' }}>Invoice</div>
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
            <Eye size={18} /> Preview Invoice
          </button>

          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginTop: '10px', textTransform: 'uppercase' }}>Kwitansi</div>
          <button 
            className={`nav-link ${activeTab === 'receipt-editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('receipt-editor')}
          >
            <CheckSquare size={18} /> Edit Kwitansi
          </button>
          <button 
            className={`nav-link ${activeTab === 'receipt-preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('receipt-preview')}
          >
            <Eye size={18} /> Preview Kwitansi
          </button>

          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginTop: '10px', textTransform: 'uppercase' }}>Master Data</div>
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
