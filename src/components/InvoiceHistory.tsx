import React, { useState } from 'react';
import { useAppContext, type InvoiceHistoryItem } from '../context/AppContext';
import { History, Eye, Edit3, Trash2, Search, Calendar, FileText, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InvoiceHistoryProps {
  onNavigate: (tab: 'editor' | 'preview') => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({ onNavigate }) => {
  const { invoiceHistory, setInvoiceData, deleteInvoiceHistory, clearInvoiceHistory } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = invoiceHistory.filter(item => {
    const q = searchTerm.toLowerCase();
    const invNum = (item.invoice.invoiceNumber || '').toLowerCase();
    const client = (item.clientName || '').toLowerCase();
    return invNum.includes(q) || client.includes(q);
  });

  const handleLoadAndEdit = (item: InvoiceHistoryItem) => {
    setInvoiceData(item.invoice);
    onNavigate('editor');
  };

  const handleLoadAndPreview = (item: InvoiceHistoryItem) => {
    setInvoiceData(item.invoice);
    onNavigate('preview');
  };

  const handleCopyNumber = (item: InvoiceHistoryItem) => {
    navigator.clipboard.writeText(item.invoice.invoiceNumber);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalValue = invoiceHistory.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

  return (
    <div className="history-page">
      {/* Header section */}
      <div className="page-header flex justify-between align-center mb-4">
        <div>
          <h2>Riwayat Cetak & Download Invoice</h2>
          <p className="page-subtitle">Daftar invoice yang pernah Anda cetak atau simpan ke PDF. Disimpan aman di browser Anda.</p>
        </div>
        {invoiceHistory.length > 0 && (
          <button 
            className="btn btn-outline btn-sm text-danger"
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat invoice? Data tidak dapat dikembalikan.')) {
                clearInvoiceHistory();
              }
            }}
          >
            <Trash2 size={16} /> Hapus Semua Riwayat
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="stats-grid mb-4">
        <div className="stat-card">
          <div className="stat-icon bg-primary-soft">
            <FileText size={22} className="text-primary" />
          </div>
          <div>
            <div className="stat-label">Total Invoice Dicetak</div>
            <div className="stat-value">{invoiceHistory.length} Dokumen</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-success-soft">
            <CheckCircle2 size={22} className="text-success" />
          </div>
          <div>
            <div className="stat-label">Akumulasi Nilai Invoice</div>
            <div className="stat-value">Rp {formatCurrency(totalValue)}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card mb-4 filter-card">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Cari berdasarkan nomor invoice atau nama klien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* History Items */}
      {invoiceHistory.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon-wrapper">
            <History size={48} className="empty-icon" />
          </div>
          <h3>Belum Ada Riwayat Invoice</h3>
          <p>
            Ketika Anda mengklik tombol <strong>Print / Save PDF</strong> pada menu Preview Invoice, dokumen invoice akan otomatis tersimpan dalam riwayat ini beserta nomor, klien, dan nominalnya.
          </p>
          <button className="btn btn-primary mt-4" onClick={() => onNavigate('editor')}>
            Buat Invoice Baru <ArrowRight size={16} />
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="empty-state card">
          <AlertCircle size={40} className="empty-icon text-muted" />
          <h3>Tidak Ditemukan</h3>
          <p>Tidak ada invoice yang cocok dengan kata kunci &quot;{searchTerm}&quot;.</p>
        </div>
      ) : (
        <div className="history-list">
          {filteredHistory.map((item) => (
            <div key={item.id} className="card history-card">
              <div className="history-card-header">
                <div className="history-meta">
                  <div className="flex align-center gap-2">
                    <span 
                      className="invoice-badge"
                      title="Klik untuk salin nomor invoice"
                      onClick={() => handleCopyNumber(item)}
                    >
                      {item.invoice.invoiceNumber || 'No-Ref'}
                    </span>
                    {copiedId === item.id && (
                      <span className="badge-copied">Tersalin!</span>
                    )}
                  </div>
                  <div className="history-client-name">
                    <strong>{item.clientName || 'Klien Umum'}</strong>
                  </div>
                </div>

                <div className="history-date">
                  <Calendar size={14} />
                  <span>{formatDate(item.printedAt)}</span>
                </div>
              </div>

              <div className="history-card-body">
                <div className="history-item-count">
                  {item.invoice.items?.length || 0} Item produk/jasa tercatat
                </div>
                <div className="history-amount-box">
                  <span className="amount-label">Total Tagihan:</span>
                  <span className="amount-value">Rp {formatCurrency(item.totalAmount)}</span>
                </div>
              </div>

              <div className="history-card-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleLoadAndEdit(item)}
                  title="Muat data invoice ke formulir editor"
                >
                  <Edit3 size={15} /> Edit Ulang
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleLoadAndPreview(item)}
                  title="Lihat preview dan cetak kembali"
                >
                  <Eye size={15} /> Preview & Cetak
                </button>
                <button
                  className="btn btn-danger-soft btn-sm btn-icon"
                  onClick={() => {
                    if (window.confirm(`Hapus invoice ${item.invoice.invoiceNumber} dari riwayat?`)) {
                      deleteInvoiceHistory(item.id);
                    }
                  }}
                  title="Hapus dari riwayat"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoiceHistory;
