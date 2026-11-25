import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Printer, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const ReceiptPreview: React.FC = () => {
  const { settings, receiptData, addToReceiptHistory } = useAppContext();
  const [savedNotice, setSavedNotice] = useState(false);

  const handlePrint = () => {
    // 1. Catat ke riwayat kwitansi
    addToReceiptHistory(receiptData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);

    // 2. Set document.title agar nama file PDF otomatis menjadi nomor kwitansi
    const originalTitle = document.title;
    const cleanReceiptNumber = (receiptData.receiptNumber || 'Kwitansi').trim().replace(/[/\\?%*:|"<>]/g, '-');
    document.title = cleanReceiptNumber;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  return (
    <div>
      <div className="flex justify-between align-center mb-4 no-print flex-wrap gap-2">
        <div>
          <h2>Kwitansi Preview</h2>
          {savedNotice && (
            <div className="badge-saved-notice">
              <CheckCircle size={14} /> Dokumen kwitansi berhasil dicatat di Riwayat
            </div>
          )}
        </div>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={18} /> Print / Save PDF
        </button>
      </div>

      <div className="receipt-preview-container" style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'serif', /* Kwitansi often looks better in serif or a standard formal font */
        border: '1px solid #ccc',
        position: 'relative'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px double #333', paddingBottom: '15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {settings.logo ? (
              <img src={settings.logo} alt="Company Logo" style={{ maxWidth: '120px', maxHeight: '80px', objectFit: 'contain' }} />
            ) : (
              <h2 style={{ margin: 0, color: '#333' }}>{settings.name}</h2>
            )}
            <div style={{ fontSize: '14px', color: '#555' }}>
              {!settings.logo && <strong>{settings.name}</strong>}
              <div style={{ whiteSpace: 'pre-wrap' }}>{settings.address}</div>
              <div>{settings.phone}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '32px', letterSpacing: '2px', margin: '0 0 10px 0', color: '#333', textTransform: 'uppercase' }}>Kwitansi</h1>
            <div style={{ fontSize: '14px' }}>
              <strong>No. </strong> <span style={{ borderBottom: '1px dotted #333', padding: '0 10px' }}>{receiptData.receiptNumber || '..............'}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ fontSize: '16px', lineHeight: '2' }}>
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <div style={{ width: '200px', fontWeight: 'bold', fontStyle: 'italic' }}>Telah terima dari</div>
            <div style={{ flex: 1, borderBottom: '1px dotted #333', paddingLeft: '10px' }}>
              : {receiptData.receivedFrom}
            </div>
          </div>
          
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <div style={{ width: '200px', fontWeight: 'bold', fontStyle: 'italic' }}>Uang sejumlah</div>
            <div style={{ flex: 1, backgroundColor: '#f3f4f6', padding: '0 10px', fontStyle: 'italic', display: 'flex', alignItems: 'center' }}>
              : {receiptData.amountInWords ? receiptData.amountInWords : ''}
            </div>
          </div>

          <div style={{ display: 'flex', marginBottom: '30px' }}>
            <div style={{ width: '200px', fontWeight: 'bold', fontStyle: 'italic' }}>Untuk pembayaran</div>
            <div style={{ flex: 1, borderBottom: '1px dotted #333', paddingLeft: '10px', minHeight: '60px' }}>
              : {receiptData.paymentFor}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
          {/* Amount Box */}
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            border: '2px solid #333', 
            padding: '10px 20px', 
            backgroundColor: '#f9fafb',
            minWidth: '250px'
          }}>
            Rp. {formatCurrency(receiptData.amount)}
          </div>

          {/* Signature Area */}
          <div style={{ textAlign: 'center', width: '250px' }}>
            <div style={{ marginBottom: '10px' }}>
              {receiptData.locationAndDate}
            </div>
            <div style={{ height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {settings.signatureImage ? (
                <img src={settings.signatureImage} alt="Signature" style={{ maxHeight: '80px', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: '#ccc', fontStyle: 'italic' }}>(Tanda Tangan)</span>
              )}
            </div>
            <div style={{ borderBottom: '1px solid #333', width: '80%', margin: '0 auto 5px auto' }}></div>
            <div style={{ fontWeight: 'bold' }}>
              {settings.signatureName}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReceiptPreview;
