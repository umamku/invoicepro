import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AppProvider, useAppContext } from './context/AppContext';
import Settings from './components/Settings';
import ClientList from './components/ClientList';
import InvoiceEditor from './components/InvoiceEditor';
import InvoicePreview from './components/InvoicePreview';
import ReceiptEditor from './components/ReceiptEditor';
import ReceiptPreview from './components/ReceiptPreview';
import InvoiceHistory from './components/InvoiceHistory';
import ReceiptHistory from './components/ReceiptHistory';
import { 
  FileText, 
  Users, 
  Settings as SettingsIcon, 
  Eye, 
  CheckSquare, 
  History, 
  Menu, 
  X,
  PlusCircle,
  FileCheck2
} from 'lucide-react';

type TabType = 'editor' | 'preview' | 'history' | 'receipt-editor' | 'receipt-preview' | 'receipt-history' | 'clients' | 'settings';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState<TabType>('editor');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { invoiceHistory, receiptHistory } = useAppContext();

  const handleNavClick = (tab: TabType) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'editor':
        return <InvoiceEditor />;
      case 'preview':
        return <InvoicePreview />;
      case 'history':
        return <InvoiceHistory onNavigate={handleNavClick} />;
      case 'receipt-editor':
        return <ReceiptEditor />;
      case 'receipt-preview':
        return <ReceiptPreview />;
      case 'receipt-history':
        return <ReceiptHistory onNavigate={handleNavClick} />;
      case 'clients':
        return <ClientList />;
      case 'settings':
        return <Settings />;
      default:
        return <InvoiceEditor />;
    }
  };

  // Determine current active section title for mobile header
  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'editor':
        return 'Edit Invoice';
      case 'preview':
        return 'Preview Invoice';
      case 'history':
        return 'Riwayat Invoice';
      case 'receipt-editor':
        return 'Edit Kwitansi';
      case 'receipt-preview':
        return 'Preview Kwitansi';
      case 'receipt-history':
        return 'Riwayat Kwitansi';
      case 'clients':
        return 'Data Klien';
      case 'settings':
        return 'Pengaturan';
      default:
        return 'InvoicePro';
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <header className="mobile-header no-print">
        <div className="mobile-header-brand">
          <div className="brand-icon">
            <FileText size={18} />
          </div>
          <div className="brand-text">
            <span className="brand-name">InvoicePro</span>
            <span className="brand-current-page">{getActiveTabTitle()}</span>
          </div>
        </div>
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Backdrop for mobile drawer */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-drawer-backdrop no-print"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Sidebar (Desktop sidebar & Mobile Drawer) */}
      <aside className={`sidebar no-print ${isMobileMenuOpen ? 'mobile-drawer-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <FileText size={18} />
          </div>
          <div className="brand-title">
            <span className="brand-title-name">Invoice</span>
            <span className="brand-title-badge">PRO</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Invoice</div>
          <button 
            className={`nav-link ${activeTab === 'editor' ? 'active active-invoice' : ''}`}
            onClick={() => handleNavClick('editor')}
          >
            <FileText size={17} /> 
            <span>Edit Invoice</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'preview' ? 'active active-invoice' : ''}`}
            onClick={() => handleNavClick('preview')}
          >
            <Eye size={17} /> 
            <span>Preview Invoice</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'history' ? 'active active-invoice' : ''}`}
            onClick={() => handleNavClick('history')}
          >
            <History size={17} /> 
            <span style={{ flex: 1, textAlign: 'left' }}>Riwayat Invoice</span>
            {invoiceHistory.length > 0 && (
              <span className="nav-badge">{invoiceHistory.length}</span>
            )}
          </button>

          <div className="nav-section-title">Kwitansi</div>
          <button 
            className={`nav-link ${activeTab === 'receipt-editor' ? 'active active-receipt' : ''}`}
            onClick={() => handleNavClick('receipt-editor')}
          >
            <CheckSquare size={17} /> 
            <span>Edit Kwitansi</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'receipt-preview' ? 'active active-receipt' : ''}`}
            onClick={() => handleNavClick('receipt-preview')}
          >
            <Eye size={17} /> 
            <span>Preview Kwitansi</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'receipt-history' ? 'active active-receipt' : ''}`}
            onClick={() => handleNavClick('receipt-history')}
          >
            <History size={17} /> 
            <span style={{ flex: 1, textAlign: 'left' }}>Riwayat Kwitansi</span>
            {receiptHistory.length > 0 && (
              <span className="nav-badge nav-badge-emerald">{receiptHistory.length}</span>
            )}
          </button>

          <div className="nav-section-title">Master Data</div>
          <button 
            className={`nav-link ${activeTab === 'clients' ? 'active active-master' : ''}`}
            onClick={() => handleNavClick('clients')}
          >
            <Users size={17} /> 
            <span>Clients</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'settings' ? 'active active-master' : ''}`}
            onClick={() => handleNavClick('settings')}
          >
            <SettingsIcon size={17} /> 
            <span>Settings</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-inner">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (App-like quick switch) */}
      <nav className="mobile-bottom-nav no-print">
        <button 
          className={`mobile-bottom-item ${activeTab === 'editor' || activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => handleNavClick(activeTab === 'preview' ? 'preview' : 'editor')}
        >
          <PlusCircle size={20} />
          <span>Invoice</span>
        </button>
        <button 
          className={`mobile-bottom-item ${activeTab === 'receipt-editor' || activeTab === 'receipt-preview' || activeTab === 'receipt-history' ? 'active' : ''}`}
          onClick={() => handleNavClick(activeTab === 'receipt-preview' ? 'receipt-preview' : 'receipt-editor')}
        >
          <FileCheck2 size={20} />
          <span>Kwitansi</span>
        </button>
        <button 
          className={`mobile-bottom-item ${activeTab === 'history' || activeTab === 'receipt-history' ? 'active' : ''}`}
          onClick={() => handleNavClick(activeTab === 'receipt-history' ? 'receipt-history' : 'history')}
        >
          <div className="mobile-nav-icon-wrapper">
            <History size={20} />
            {(invoiceHistory.length > 0 || receiptHistory.length > 0) && <span className="bottom-nav-dot" />}
          </div>
          <span>Riwayat</span>
        </button>
        <button 
          className={`mobile-bottom-item ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => handleNavClick('clients')}
        >
          <Users size={20} />
          <span>Klien</span>
        </button>
        <button 
          className={`mobile-bottom-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleNavClick('settings')}
        >
          <SettingsIcon size={20} />
          <span>Setting</span>
        </button>
      </nav>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
      <Analytics />
    </AppProvider>
  );
}

export default App;
