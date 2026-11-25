import React, { useState } from 'react';
import { useAppContext, type ReceiptHistoryItem } from '../context/AppContext';
import { History, Eye, Edit3, Trash2, Search, Calendar, CheckSquare, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReceiptHistoryProps {
  onNavigate: (tab: 'receipt-editor' | 'receipt-preview') => void;
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

export const ReceiptHistory: React.FC<ReceiptHistoryProps> = ({ onNavigate }) => {
  const { receiptHistory, setReceiptData, deleteReceiptHistory, clearReceiptHistory } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = receiptHistory.filter(item => {
    const q = searchTerm.toLowerCase();
    const recNum = (item.receipt.receiptNumber || '').toLowerCase();
    const from = (item.receipt.receivedFrom || '').toLowerCase();
    const payFor = (item.receipt.paymentFor || '').toLowerCase();
    return recNum.includes(q) || from.includes(q) || payFor.includes(q);
  });

  const handleLoadAndEdit = (item: ReceiptHistoryItem) => {
    setReceiptData(item.receipt);
    onNavigate('receipt-editor');
  };

  const handleLoadAndPreview = (item: ReceiptHistoryItem) => {
    setReceiptData(item.receipt);
    onNavigate('receipt-preview');
  };

  const handleCopyNumber = (item: ReceiptHistoryItem) => {
    navigator.clipboard.writeText(item.receipt.receiptNumber);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalValue = receiptHistory.reduce((sum, item) => sum + (item.receipt.amount || 0), 0);

  return (
    <div className="history-page">
      {/* Header section */}
      <div className="page-header flex justify-between align-center mb-4">
        <div>
          <h2>Riwayat Cetak & Download Kwitansi</h2>
          <p className="page-subtitle">Daftar kwitansi pembayaran yang pernah Anda cetak atau simpan ke PDF. Disimpan aman di browser Anda.</p>
        </div>
        {receiptHistory.length > 0 && (
          <button 
            className="btn btn-outline btn-sm text-danger"
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat kwitansi? Data tidak dapat dikembalikan.')) {
                clearReceiptHistory();
              }
            }}
          >
            <Trash2 size={16} /> Hapus Semua Riwayat
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="stats-grid mb-4">
        <div className="stat-card stat-card-receipt">
          <div className="stat-icon bg-emerald-soft">
            <CheckSquare size={22} className="text-emerald" />
          </div>
          <div>
            <div className="stat-label">Total Kwitansi Dicetak</div>
            <div className="stat-value">{receiptHistory.length} Dokumen</div>
          </div>
        </div>
        <div className="stat-card stat-card-receipt">
          <div className="stat-icon bg-success-soft">
            <CheckCircle2 size={22} className="text-success" />
          </div>
          <div>
            <div className="stat-label">Total Nominal Penerimaan</div>
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
            placeholder="Cari berdasarkan nomor kwitansi, nama pembayar, atau peruntukan..."
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
      {receiptHistory.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon-wrapper bg-emerald-soft">
            <History size={48} className="empty-icon text-emerald" />
          </div>
          <h3>Belum Ada Riwayat Kwitansi</h3>
          <p>
            Ketika Anda mengklik tombol <strong>Print / Save PDF</strong> pada menu Preview Kwitansi, bukti kwitansi akan otomatis tercatat di sini lengkap dengan nominal dan terbilangnya.
          </p>
          <button className="btn btn-emerald mt-4" onClick={() => onNavigate('receipt-editor')}>
            Buat Kwitansi Baru <ArrowRight size={16} />
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="empty-state card">
          <AlertCircle size={40} className="empty-icon text-muted" />
          <h3>Tidak Ditemukan</h3>
          <p>Tidak ada kwitansi yang cocok dengan kata kunci &quot;{searchTerm}&quot;.</p>
        </div>
      ) : (
        <div className="history-list">
          {filteredHistory.map((item) => (
            <div key={item.id} className="card history-card history-card-receipt-item">
              <div className="history-card-header">
                <div className="history-meta">
                  <div className="flex align-center gap-2">
                    <span 
                      className="receipt-badge"
                      title="Klik untuk salin nomor kwitansi"
                      onClick={() => handleCopyNumber(item)}
                    >
                      {item.receipt.receiptNumber || 'No-KWT'}
                    </span>
                    {copiedId === item.id && (
                      <span className="badge-copied">Tersalin!</span>
                    )}
                  </div>
                  <div className="history-client-name">
                    <strong>Telah terima dari: </strong> {item.receipt.receivedFrom || '-'}
                  </div>
                </div>

                <div className="history-date">
                  <Calendar size={14} />
                  <span>{formatDate(item.printedAt)}</span>
                </div>
              </div>

              <div className="history-card-body">
                <div className="history-receipt-details">
                  <div className="receipt-purpose-text">
                    <strong>Untuk: </strong> {item.receipt.paymentFor || 'Tanpa keterangan'}
                  </div>
                  {item.receipt.amountInWords && (
                    <div className="receipt-in-words-text">
                      <em>&quot;{item.receipt.amountInWords}&quot;</em>
                    </div>
                  )}
                </div>
                <div className="history-amount-box">
                  <span className="amount-label">Jumlah Uang:</span>
                  <span className="amount-value text-emerald">Rp {formatCurrency(item.receipt.amount)}</span>
                </div>
              </div>

              <div className="history-card-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleLoadAndEdit(item)}
                  title="Muat data kwitansi ke formulir editor"
                >
                  <Edit3 size={15} /> Edit Ulang
                </button>
                <button
                  className="btn btn-emerald btn-sm"
                  onClick={() => handleLoadAndPreview(item)}
                  title="Lihat preview dan cetak kembali"
                >
                  <Eye size={15} /> Preview & Cetak
                </button>
                <button
                  className="btn btn-danger-soft btn-sm btn-icon"
                  onClick={() => {
                    if (window.confirm(`Hapus kwitansi ${item.receipt.receiptNumber} dari riwayat?`)) {
                      deleteReceiptHistory(item.id);
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

export default ReceiptHistory;
