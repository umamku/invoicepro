import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { trackPageView, trackEvent } from './utils/analytics';
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
  FileCheck2,
  Download,
  Smartphone,
  Share2,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck
} from 'lucide-react';

type TabType = 'editor' | 'preview' | 'history' | 'receipt-editor' | 'receipt-preview' | 'receipt-history' | 'clients' | 'settings';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState<TabType>('editor');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(() => {
    return localStorage.getItem('privacy_notice_dismissed') !== 'true';
  });
  const { invoiceHistory, receiptHistory } = useAppContext();

  // Track page / tab navigation
  useEffect(() => {
    trackPageView(activeTab);
  }, [activeTab]);

  const dismissPrivacyNotice = () => {
    setShowPrivacyNotice(false);
    localStorage.setItem('privacy_notice_dismissed', 'true');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      trackEvent('pwa_app_opened', { mode: 'standalone' });
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      trackEvent('pwa_installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const isIosDevice = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  };

  const handleInstallClick = async () => {
    trackEvent('pwa_install_clicked');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIosDevice()) {
      setShowIosTip(true);
    } else if (isInstalled) {
      alert('Aplikasi InvoicePro sudah terinstal di perangkat Anda!');
    } else {
      alert('Untuk menginstal InvoicePro:\n1. Klik ikon "Install" di bilah alamat (address bar) browser Anda, atau\n2. Buka menu browser (titik tiga) lalu pilih "Install InvoicePro" / "Tambahkan ke Layar Utama".');
    }
  };

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
        <div className="mobile-header-actions">
          {!isInstalled && (
            <button className="mobile-header-install-btn" onClick={handleInstallClick} title="Instal Aplikasi">
              <Download size={14} />
              <span>Instal</span>
            </button>
          )}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Backdrop for mobile drawer */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-drawer-backdrop no-print"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Sidebar (Desktop sidebar & Mobile Drawer) */}
      <aside className={`sidebar no-print ${isMobileMenuOpen ? 'mobile-drawer-open' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <FileText size={18} />
          </div>
          <div className="brand-title">
            <span className="brand-title-name">Invoice</span>
            <span className="brand-title-badge">PRO</span>
          </div>
          <button 
            className="btn-sidebar-toggle"
            onClick={toggleSidebar}
            title="Sembunyikan Menu Navigasi"
            aria-label="Sembunyikan Menu Navigasi"
          >
            <PanelLeftClose size={17} />
          </button>
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

        <div className="sidebar-footer">
          {!isInstalled ? (
            <button className="btn-install-pwa" onClick={handleInstallClick} title="Instal InvoicePro di perangkat Anda">
              <Download size={15} />
              <span>Instal Aplikasi</span>
            </button>
          ) : (
            <div className="sidebar-installed-badge">
              <Smartphone size={14} />
              <span>Aplikasi Terpasang</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {showPrivacyNotice && (
          <div className="privacy-notice-wrapper no-print">
            <div className="privacy-notice-banner">
              <div className="privacy-notice-icon-box">
                <ShieldCheck size={20} className="text-primary" />
              </div>
              <div className="privacy-notice-content">
                <div className="privacy-notice-title">
                  100% Aman & Privat (Data Tersimpan di Browser Anda)
                </div>
                <div className="privacy-notice-desc">
                  InvoicePro tidak menyimpan data Anda di server pihak ketiga. Seluruh profil usaha, kwitansi, invoice, dan data klien tersimpan aman di memori lokal browser ini. Disarankan untuk mengunduh <strong>Ekspor Cadangan (.json)</strong> di menu Setting agar data tidak hilang saat berganti perangkat atau membersihkan browser.
                </div>
              </div>
              <div className="privacy-notice-actions">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => handleNavClick('settings')}
                >
                  Buka Setting
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={dismissPrivacyNotice}
                >
                  Paham & Tutup ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {isSidebarCollapsed && (
          <div className="top-expand-bar no-print">
            <button 
              className="btn-expand-sidebar"
              onClick={toggleSidebar}
              title="Tampilkan Menu Navigasi"
            >
              <PanelLeftOpen size={16} />
              <span>Tampilkan Menu</span>
            </button>
          </div>
        )}
        <div className={`content-inner ${isSidebarCollapsed ? 'full-width' : ''}`}>
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

      {/* iOS Safari Installation Guide Modal */}
      {showIosTip && (
        <div className="modal-backdrop no-print" onClick={() => setShowIosTip(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex align-center gap-2">
                <Smartphone className="text-primary" size={20} />
                <h3>Instal di iPhone / iPad</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowIosTip(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="mb-4">Untuk memasang InvoicePro di layar utama iPhone/iPad Anda:</p>
              <ol className="ios-steps-list">
                <li>Ketuk tombol <strong>Share</strong> (ikon kotak dengan panah ke atas <Share2 size={15} style={{ display: 'inline', verticalAlign: 'middle', color: '#2563eb' }} />) di bilah bawah browser Safari.</li>
                <li>Gulir ke bawah pada menu yang muncul, lalu pilih <strong>&quot;Add to Home Screen&quot;</strong> (<em>Tambah ke Layar Utama</em>).</li>
                <li>Ketuk <strong>&quot;Add&quot;</strong> (<em>Tambah</em>) di pojok kanan atas layar.</li>
              </ol>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary btn-sm" onClick={() => setShowIosTip(false)}>
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
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
