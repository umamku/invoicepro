import React, { useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { trackEvent } from '../utils/analytics';
import { 
  Upload, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  FileText, 
  CheckSquare,
  Building2,
  FileUp,
  FileDown,
  Plus,
  Trash2,
  ShieldCheck
} from 'lucide-react';

const Settings: React.FC = () => {
  const { 
    settings, 
    setSettings, 
    companies,
    activeCompanyId,
    setActiveCompanyId,
    addCompanyProfile,
    deleteCompanyProfile,
    clients, 
    invoiceHistory, 
    receiptHistory, 
    exportAllData, 
    importAllData 
  } = useAppContext();
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  const handleExportBackup = () => {
    try {
      const data = exportAllData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoicepro-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      trackEvent('backup_exported');
      showNotification('success', 'File cadangan berhasil diunduh! Simpan file ini untuk memindahkan data kapan saja.');
    } catch (err) {
      console.error(err);
      showNotification('error', 'Gagal membuat file cadangan data.');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const success = importAllData(parsed);
        if (success) {
          trackEvent('backup_imported');
          showNotification('success', 'Data cadangan berhasil dipulihkan! Semua profil, data klien, dan riwayat telah diperbarui.');
        } else {
          showNotification('error', 'Format file tidak sesuai atau rusak.');
        }
      } catch (err) {
        console.error(err);
        showNotification('error', 'Gagal membaca file JSON. Pastikan file merupakan file cadangan InvoicePro.');
      }
      // reset file input
      if (backupFileInputRef.current) {
        backupFileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'signatureImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {/* Backup & Restore Section */}
      <div className="card mb-4">
        <div className="flex align-center gap-2 mb-3">
          <div className="section-icon bg-primary-soft">
            <Database size={20} className="text-primary" />
          </div>
          <div>
            <h2>Cadangan & Pemulihan Data (Backup & Restore)</h2>
            <p className="page-subtitle">
              Pindahkan data Anda dengan mudah antar perangkat, antar browser, atau saat berganti domain URL.
            </p>
          </div>
        </div>

        {notification && (
          <div 
            style={{
              padding: '0.85rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: notification.type === 'success' ? '#065f46' : '#991b1b',
              border: `1px solid ${notification.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Status Count Pills */}
        <div className="backup-status-grid">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <Users size={16} className="text-primary" />
            <span>Klien Tersimpan:</span>
            <span style={{ backgroundColor: '#e2e8f0', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', color: '#1e293b' }}>
              {clients.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <FileText size={16} className="text-primary" />
            <span>Riwayat Invoice:</span>
            <span style={{ backgroundColor: '#e2e8f0', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', color: '#1e293b' }}>
              {invoiceHistory.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <CheckSquare size={16} style={{ color: 'var(--emerald-color)' }} />
            <span>Riwayat Kwitansi:</span>
            <span style={{ backgroundColor: '#e2e8f0', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', color: '#1e293b' }}>
              {receiptHistory.length}
            </span>
          </div>
        </div>

        {/* Info Callout */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.65rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#eff6ff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #bfdbfe',
          marginBottom: '1.25rem',
          fontSize: '0.825rem',
          color: '#1e3a8a',
          lineHeight: '1.5'
        }}>
          <ShieldCheck size={18} className="text-primary flex-shrink-0" style={{ marginTop: '2px' }} />
          <div>
            <strong>Privasi & Keamanan:</strong> Seluruh data disimpan langsung di browser perangkat ini (Client-Side). Hindari menggunakan mode <em>Incognito / Private Browsing</em> jika ingin data tersimpan permanen, dan unduh file cadangan (*Backup*) secara berkala.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="backup-actions-grid">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleExportBackup}
          >
            <FileDown size={18} />
            <span>Ekspor Cadangan (.json)</span>
          </button>

          <input 
            type="file" 
            accept=".json"
            style={{ display: 'none' }}
            ref={backupFileInputRef}
            onChange={handleImportBackup}
          />

          <button 
            type="button" 
            className="btn btn-outline"
            onClick={() => backupFileInputRef.current?.click()}
          >
            <FileUp size={18} />
            <span>Impor Cadangan (.json)</span>
          </button>
        </div>
      </div>

      {/* Company Settings Card */}
      <div className="card">
        <div className="flex align-center gap-2 mb-4">
          <div className="section-icon bg-primary-soft">
            <Building2 size={20} className="text-primary" />
          </div>
          <div>
            <h2>Profil Usaha (Company Settings)</h2>
            <p className="page-subtitle">Kelola satu atau beberapa profil usaha. Anda dapat memilih profil mana yang digunakan saat membuat invoice & kwitansi.</p>
          </div>
        </div>

        {/* Profile Switcher / Management Bar */}
        <div className="profile-switcher-bar">
          <div className="profile-switcher-select-group">
            <Building2 size={18} className="text-primary flex-shrink-0" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Pilih Profil Usaha:
            </span>
            <select
              className="form-control profile-switcher-select"
              value={activeCompanyId}
              onChange={(e) => setActiveCompanyId(e.target.value)}
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name || 'Profil Tanpa Nama'}</option>
              ))}
            </select>
          </div>

          <div className="profile-switcher-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                const newP = addCompanyProfile();
                trackEvent('company_profile_created');
                showNotification('success', `Profil baru "${newP.name}" berhasil dibuat. Silakan sesuaikan datanya.`);
              }}
              title="Tambah profil usaha baru"
            >
              <Plus size={15} />
              <span>Tambah Profil Baru</span>
            </button>
            {companies.length > 1 && (
              <button
                type="button"
                className="btn btn-danger-soft btn-sm"
                onClick={() => {
                  if (confirm(`Yakin ingin menghapus profil "${settings.name}"?`)) {
                    deleteCompanyProfile(activeCompanyId);
                    showNotification('success', 'Profil usaha berhasil dihapus.');
                  }
                }}
                title="Hapus profil usaha yang sedang aktif ini"
              >
                <Trash2 size={15} />
                <span>Hapus Profil</span>
              </button>
            )}
          </div>
        </div>

        <div className="invoice-grid">
          <div>
            <div className="form-group">
              <label>Nama Usaha / Toko</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={settings.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Alamat Lengkap</label>
              <textarea
                name="address"
                className="form-control"
                rows={4}
                value={settings.address}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Email Usaha</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={settings.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={settings.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div>
            <div className="form-group">
              <label>Logo Usaha (Company Logo)</label>
              {settings.logo && (
                <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', display: 'inline-block' }}>
                  <img src={settings.logo} alt="Company Logo" style={{ maxHeight: '90px', maxWidth: '200px', objectFit: 'contain', display: 'block' }} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={logoInputRef}
                onChange={(e) => handleFileUpload(e, 'logo')}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Upload size={17} /> {settings.logo ? 'Ganti Logo' : 'Unggah Logo'}
                </button>
                {settings.logo && (
                  <button
                    type="button"
                    className="btn btn-danger-soft"
                    onClick={() => setSettings({ ...settings, logo: '' })}
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>

            <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border-color)', opacity: 0.6 }} />
            
            <div className="form-group">
              <label>Nama Penandatangan (Signature Name)</label>
              <input
                type="text"
                name="signatureName"
                className="form-control"
                value={settings.signatureName}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Gambar Tanda Tangan (Signature Image)</label>
              {settings.signatureImage && (
                <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', display: 'inline-block' }}>
                  <img src={settings.signatureImage} alt="Signature" style={{ maxHeight: '90px', maxWidth: '200px', objectFit: 'contain', display: 'block' }} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={signatureInputRef}
                onChange={(e) => handleFileUpload(e, 'signatureImage')}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => signatureInputRef.current?.click()}
                >
                  <Upload size={17} /> {settings.signatureImage ? 'Ganti Tanda Tangan' : 'Unggah Tanda Tangan'}
                </button>
                {settings.signatureImage && (
                  <button
                    type="button"
                    className="btn btn-danger-soft"
                    onClick={() => setSettings({ ...settings, signatureImage: '' })}
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
