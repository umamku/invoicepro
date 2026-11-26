import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2, FileText, Calendar, User, Clock, PenTool, CreditCard, Receipt, Building2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { formatNumberWithDots, parseNumberFromDots, formatCurrency } from '../utils/currency';
import { trackEvent } from '../utils/analytics';

const InvoiceEditor: React.FC = () => {
  const { invoiceData, setInvoiceData, clients, companies, activeCompanyId, setActiveCompanyId } = useAppContext();

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData({ ...invoiceData, [name]: value });
  };

  const handleItemChange = (id: string, field: string, value: string | number) => {
    const updatedItems = invoiceData.items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setInvoiceData({ ...invoiceData, items: updatedItems });
  };

  const handlePriceChange = (id: string, rawStr: string) => {
    const numericValue = parseNumberFromDots(rawStr);
    handleItemChange(id, 'price', numericValue);
  };

  const handleAmountPaidChange = (rawStr: string) => {
    const numericValue = parseNumberFromDots(rawStr);
    setInvoiceData({ ...invoiceData, amountPaid: numericValue });
  };

  const addItem = () => {
    trackEvent('invoice_item_added');
    const newItem = {
      id: uuidv4(),
      name: '',
      description: '',
      quantity: 1,
      price: 0,
      discountPercent: 0,
      taxPercent: 0,
    };
    setInvoiceData({ ...invoiceData, items: [...invoiceData.items, newItem] });
  };

  const removeItem = (id: string) => {
    if (invoiceData.items.length <= 1) {
      alert('Minimal harus ada 1 item di dalam invoice.');
      return;
    }
    setInvoiceData({ ...invoiceData, items: invoiceData.items.filter(i => i.id !== id) });
  };

  // Calculate live totals for the editor
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  const itemCalculations = invoiceData.items.map(item => {
    const base = item.price * (item.quantity || 0);
    const discAmount = base * ((item.discountPercent || 0) / 100);
    const afterDisc = base - discAmount;
    const taxAmount = afterDisc * ((item.taxPercent || 0) / 100);
    const lineTotal = afterDisc + taxAmount;

    subtotal += afterDisc;
    totalDiscount += discAmount;
    totalTax += taxAmount;

    return {
      ...item,
      lineTotal,
    };
  });

  const grandTotal = subtotal + totalTax;
  const balanceDue = grandTotal - (invoiceData.amountPaid || 0);

  return (
    <div className="editor-container">
      {/* Invoice Meta Details Card */}
      <div className="card mb-4">
        <div className="flex align-center gap-2 mb-4">
          <div className="section-icon bg-primary-soft">
            <FileText size={20} className="text-primary" />
          </div>
          <div>
            <h2>Detail Informasi Invoice</h2>
            <p className="page-subtitle">Isi nomor invoice, data klien, serta batas tanggal pembayaran.</p>
          </div>
        </div>
        
        <div className="invoice-grid">
          <div className="form-group">
            <label className="flex align-center gap-2">
              <Building2 size={14} className="text-muted" />
              <span>Profil Usaha (Penerbit)</span>
            </label>
            <select
              name="companyId"
              className="form-control"
              value={invoiceData.companyId || activeCompanyId}
              onChange={(e) => {
                const selectedId = e.target.value;
                setInvoiceData({ ...invoiceData, companyId: selectedId });
                setActiveCompanyId(selectedId);
              }}
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name || 'Profil Tanpa Nama'}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="flex align-center gap-2">
              <FileText size={14} className="text-muted" />
              <span>Nomor Invoice</span>
            </label>
            <input
              type="text"
              name="invoiceNumber"
              className="form-control"
              value={invoiceData.invoiceNumber}
              onChange={handleInvoiceChange}
              placeholder="Contoh: INV/2026/001"
            />
          </div>

          <div className="form-group">
            <label className="flex align-center gap-2">
              <User size={14} className="text-muted" />
              <span>Pilih Klien / Pelanggan</span>
            </label>
            <select
              name="clientId"
              className="form-control"
              value={invoiceData.clientId}
              onChange={handleInvoiceChange}
            >
              <option value="">Pilih Klien Tersimpan...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="flex align-center gap-2">
              <Calendar size={14} className="text-muted" />
              <span>Tanggal Terbit</span>
            </label>
            <input
              type="date"
              name="date"
              className="form-control"
              value={invoiceData.date}
              onChange={handleInvoiceChange}
            />
          </div>

          <div className="form-group">
            <label className="flex align-center gap-2">
              <Clock size={14} className="text-muted" />
              <span>Jatuh Tempo (Due Date)</span>
            </label>
            <input
              type="date"
              name="dueDate"
              className="form-control"
              value={invoiceData.dueDate}
              onChange={handleInvoiceChange}
            />
          </div>

          <div className="form-group">
            <label className="flex align-center gap-2">
              <PenTool size={14} className="text-muted" />
              <span>Tanggal Tanda Tangan (Format Bebas)</span>
            </label>
            <input
              type="text"
              name="signatureDate"
              className="form-control"
              value={invoiceData.signatureDate || ''}
              onChange={handleInvoiceChange}
              placeholder="Contoh: Jakarta, 25 November 2026"
            />
          </div>

          <div className="form-group">
            <label className="flex align-center gap-2">
              <CreditCard size={14} className="text-muted" />
              <span>Uang Muka / Sudah Dibayar (Rp)</span>
            </label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix">Rp</span>
              <input
                type="text"
                name="amountPaid"
                className="form-control input-with-prefix text-right font-medium"
                value={formatNumberWithDots(invoiceData.amountPaid)}
                onChange={(e) => handleAmountPaidChange(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Items Section Card */}
      <div className="card mb-4">
        <div className="flex justify-between align-center mb-4 flex-wrap gap-2">
          <div className="flex align-center gap-2">
            <div className="section-icon bg-primary-soft">
              <Receipt size={20} className="text-primary" />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Daftar Produk & Jasa</h3>
              <p className="page-subtitle">Harga satuan dan nominal otomatis menggunakan format ribuan.</p>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={addItem}>
            <Plus size={16} /> Tambah Baris
          </button>
        </div>

        <div className="table-wrapper">
          <table className="table items-table">
            <thead>
              <tr>
                <th style={{ width: '42%' }}>Produk & Deskripsi</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Kuantitas</th>
                <th style={{ width: '18%', textAlign: 'right' }}>Harga Satuan (Rp)</th>
                <th style={{ width: '9%', textAlign: 'center' }}>Disc %</th>
                <th style={{ width: '9%', textAlign: 'center' }}>Pajak %</th>
                <th style={{ width: '18%', textAlign: 'right' }}>Total (Rp)</th>
                <th style={{ width: '4%' }}></th>
              </tr>
            </thead>
            <tbody>
              {itemCalculations.map((item) => (
                <tr key={item.id} className="item-row">
                  <td style={{ verticalAlign: 'top' }}>
                    <div className="product-inputs">
                      <input
                        type="text"
                        className="form-control font-medium"
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        placeholder="Nama produk atau layanan jasa..."
                      />
                      <input
                        type="text"
                        className="form-control text-sm text-secondary"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="Deskripsi / keterangan tambahan (opsional)..."
                      />
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'top', textAlign: 'center' }}>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={item.quantity || ''}
                      min="1"
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td style={{ verticalAlign: 'top' }}>
                    <div className="input-prefix-wrapper">
                      <span className="input-prefix">Rp</span>
                      <input
                        type="text"
                        className="form-control input-with-prefix text-right font-medium"
                        value={formatNumberWithDots(item.price)}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'top', textAlign: 'center' }}>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={item.discountPercent || ''}
                      min="0"
                      max="100"
                      placeholder="0"
                      onChange={(e) => handleItemChange(item.id, 'discountPercent', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td style={{ verticalAlign: 'top', textAlign: 'center' }}>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={item.taxPercent || ''}
                      min="0"
                      placeholder="0"
                      onChange={(e) => handleItemChange(item.id, 'taxPercent', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                    <div className="line-total-display">
                      Rp {formatCurrency(item.lineTotal)}
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'top', textAlign: 'center' }}>
                    <button
                      className="btn-trash-item"
                      onClick={() => removeItem(item.id)}
                      title="Hapus baris ini"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn btn-outline btn-sm mt-4" onClick={addItem}>
          <Plus size={16} /> Tambah Baris Produk
        </button>
      </div>

      {/* Bottom Notes & Live Calculation Summary */}
      <div className="invoice-bottom-grid">
        {/* Left: Notes / Bank Info */}
        <div className="card mb-4">
          <h3 className="mb-4">Catatan / Keterangan Pembayaran</h3>
          <div className="form-group">
            <textarea
              name="notes"
              className="form-control"
              rows={6}
              value={invoiceData.notes}
              onChange={handleInvoiceChange}
              placeholder="Contoh: Mohon transfer ke Rekening Bank BSI..."
            />
          </div>
        </div>

        {/* Right: Live Calculation Summary */}
        <div className="card mb-4 summary-card">
          <h3 className="mb-4">Ringkasan Perhitungan Invoice</h3>
          <div className="summary-list">
            <div className="summary-row">
              <span className="summary-label">Subtotal Produk</span>
              <span className="summary-val">Rp {formatCurrency(subtotal)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="summary-row text-danger">
                <span className="summary-label">Total Diskon</span>
                <span className="summary-val">- Rp {formatCurrency(totalDiscount)}</span>
              </div>
            )}
            {totalTax > 0 && (
              <div className="summary-row">
                <span className="summary-label">Total Pajak</span>
                <span className="summary-val">+ Rp {formatCurrency(totalTax)}</span>
              </div>
            )}
            <div className="summary-row grand-total-row">
              <span className="summary-label">Grand Total Tagihan</span>
              <span className="summary-val">Rp {formatCurrency(grandTotal)}</span>
            </div>
            {invoiceData.amountPaid > 0 && (
              <div className="summary-row text-success">
                <span className="summary-label">Telah Dibayar</span>
                <span className="summary-val">Rp {formatCurrency(invoiceData.amountPaid)}</span>
              </div>
            )}
            <div className="summary-row balance-due-row">
              <span className="summary-label">Sisa Tagihan (Balance Due)</span>
              <span className="summary-val">Rp {formatCurrency(balanceDue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceEditor;
