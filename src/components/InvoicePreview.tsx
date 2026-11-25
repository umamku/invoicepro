import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Printer, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const formatDateString = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const formatDateNumeric = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};


const InvoicePreview: React.FC = () => {
  const { settings, companies, invoiceData, clients, addToInvoiceHistory } = useAppContext();
  const [savedNotice, setSavedNotice] = useState(false);
  
  const company = (invoiceData.companyId ? companies?.find(c => c.id === invoiceData.companyId) : null) || settings;
  const client = clients.find(c => c.id === invoiceData.clientId);
  
  let subtotal = 0;
  let totalTax = 0;
  
  const calculatedItems = invoiceData.items.map(item => {
    const itemTotalBase = item.price * item.quantity;
    const discountAmount = itemTotalBase * (item.discountPercent / 100);
    const afterDiscount = itemTotalBase - discountAmount;
    const taxAmount = afterDiscount * (item.taxPercent / 100);
    
    subtotal += afterDiscount;
    totalTax += taxAmount;
    
    return {
      ...item,
      itemTotalBase,
      discountAmount,
      afterDiscount,
      taxAmount,
      finalTotal: afterDiscount + taxAmount
    };
  });

  const total = subtotal + totalTax;
  const balanceDue = total - (invoiceData.amountPaid || 0);

  const handlePrint = () => {
    // 1. Simpan ke riwayat cetak/download
    addToInvoiceHistory(invoiceData, client?.name, total, balanceDue);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);

    // 2. Gunakan nomor invoice sebagai nama file default saat dialog cetak / Simpan PDF
    const originalTitle = document.title;
    const cleanInvoiceNumber = (invoiceData.invoiceNumber || 'Invoice').trim().replace(/[/\\?%*:|"<>]/g, '-');
    document.title = cleanInvoiceNumber;

    // 3. Panggil dialog cetak / Simpan PDF
    window.print();

    // 4. Kembalikan judul dokumen setelah print dipanggil
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  return (
    <div>
      <div className="flex justify-between align-center mb-4 no-print flex-wrap gap-2">
        <div>
          <h2>Invoice Preview</h2>
          {savedNotice && (
            <div className="badge-saved-notice">
              <CheckCircle size={14} /> Dokumen berhasil dicatat di Riwayat
            </div>
          )}
        </div>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={18} /> Print / Save PDF
        </button>
      </div>

      <div className="invoice-preview-container">
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            {company.logo ? (
              <img src={company.logo} alt="Company Logo" style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }} />
            ) : (
              <h1 style={{ color: '#4caf50', margin: 0, fontSize: '24px' }}>{company.name}</h1>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ color: '#3b82f6', fontWeight: 400, fontSize: '32px', margin: '0 0 20px 0' }}>Invoice</h1>
            <table style={{ marginLeft: 'auto', textAlign: 'right', fontSize: '13px' }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, paddingRight: '15px', paddingBottom: '5px' }}>Referensi</td>
                  <td style={{ paddingBottom: '5px' }}>{invoiceData.invoiceNumber}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, paddingRight: '15px', paddingBottom: '5px' }}>Tanggal</td>
                  <td style={{ paddingBottom: '5px' }}>{formatDateNumeric(invoiceData.date)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, paddingRight: '15px' }}>Tgl. Jatuh Tempo</td>
                  <td>{formatDateNumeric(invoiceData.dueDate)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Addresses Section */}
        <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>Info Perusahaan</h4>
            <div style={{ borderBottom: '2px solid #ccc', marginBottom: '15px' }}></div>
            <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.5' }}>
              <strong style={{ color: '#000', display: 'block', marginBottom: '10px' }}>{company.name}</strong>
              <div style={{ whiteSpace: 'pre-wrap', marginBottom: '5px' }}>{company.address}</div>
              <div>Telp: {company.phone}</div>
              <div>Email: {company.email}</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>Tagihan Untuk</h4>
            <div style={{ borderBottom: '2px solid #ccc', marginBottom: '15px' }}></div>
            <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.5' }}>
              {client ? (
                <>
                  <strong style={{ color: '#000', display: 'block', marginBottom: '10px' }}>{client.name}</strong>
                  <div style={{ whiteSpace: 'pre-wrap', marginBottom: '5px' }}>{client.address}</div>
                  <div>Telp: {client.phone}</div>
                </>
              ) : (
                <div style={{ fontStyle: 'italic', color: '#999' }}>Belum ada klien dipilih</div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
              <th style={{ padding: '10px', textAlign: 'left', width: '40%' }}>Produk</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Kuantitas</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Harga</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Diskon</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Pajak</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {calculatedItems.map((item, index) => (
              <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white', borderBottom: '2px solid white' }}>
                <td style={{ padding: '10px', verticalAlign: 'top' }}>
                  <strong style={{ display: 'block', color: '#333' }}>{item.name}</strong>
                  <span style={{ color: '#666', fontSize: '12px' }}>{item.description}</span>
                </td>
                <td style={{ padding: '10px', textAlign: 'center', verticalAlign: 'middle' }}>{item.quantity}</td>
                <td style={{ padding: '10px', textAlign: 'right', verticalAlign: 'middle' }}>{formatCurrency(item.price)}</td>
                <td style={{ padding: '10px', textAlign: 'center', verticalAlign: 'middle' }}>{item.discountPercent > 0 ? `${item.discountPercent}%` : '0 %'}</td>
                <td style={{ padding: '10px', textAlign: 'center', verticalAlign: 'middle' }}>{item.taxPercent > 0 ? `${item.taxPercent}%` : '-'}</td>
                <td style={{ padding: '10px', textAlign: 'right', verticalAlign: 'middle' }}>{formatCurrency(item.finalTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <table style={{ width: '350px', fontSize: '13px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 600, color: '#555' }}>Subtotal</td>
                <td style={{ padding: '8px 0', textAlign: 'right', color: '#555' }}>Rp {formatCurrency(subtotal)}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 600, color: '#555' }}>Pajak</td>
                <td style={{ padding: '8px 0', textAlign: 'right', color: '#555' }}>Rp {formatCurrency(totalTax)}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 600, color: '#555' }}>Total</td>
                <td style={{ padding: '8px 0', textAlign: 'right', color: '#555' }}>Rp {formatCurrency(total)}</td>
              </tr>
              <tr>
                <td style={{ padding: '15px 0 8px 0', fontWeight: 700, color: '#333', fontSize: '14px' }}>Sisa Tagihan:</td>
                <td style={{ padding: '15px 0 8px 0', textAlign: 'right', color: '#333', fontSize: '14px' }}>Rp {formatCurrency(balanceDue)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, paddingRight: '40px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>Keterangan</h4>
            <div style={{ borderBottom: '2px solid #ccc', marginBottom: '15px' }}></div>
            <div style={{ fontSize: '13px', color: '#555', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
              {invoiceData.notes}
            </div>
          </div>
          <div style={{ width: '200px', textAlign: 'center' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '20px' }}>
              {invoiceData.signatureDate ? invoiceData.signatureDate : formatDateString(invoiceData.date)}
            </div>
            {company.signatureImage ? (
              <img src={company.signatureImage} alt="Signature" style={{ height: '80px', objectFit: 'contain', marginBottom: '10px' }} />
            ) : (
              <div style={{ height: '80px' }}></div> /* Placeholder space for signature */
            )}
            <div style={{ fontWeight: 600, fontSize: '14px', borderTop: company.signatureImage ? 'none' : '1px solid #ccc', paddingTop: company.signatureImage ? '0' : '10px' }}>
              {company.signatureName}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoicePreview;
