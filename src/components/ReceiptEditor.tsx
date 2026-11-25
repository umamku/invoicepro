import React from 'react';
import { useAppContext } from '../context/AppContext';
import { formatTerbilang } from '../utils/terbilang';
import { formatNumberWithDots, parseNumberFromDots } from '../utils/currency';
import { CheckSquare, User, Calendar, FileText, Building2 } from 'lucide-react';

const ReceiptEditor: React.FC = () => {
  const { receiptData, setReceiptData, clients, companies, activeCompanyId, setActiveCompanyId } = useAppContext();

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReceiptData({ ...receiptData, [name]: value });
  };

  const handleAmountChange = (rawStr: string) => {
    const numValue = parseNumberFromDots(rawStr);
    setReceiptData({ 
      ...receiptData, 
      amount: numValue,
      amountInWords: formatTerbilang(numValue)
    });
  };

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClientId = e.target.value;
    const client = clients.find(c => c.id === selectedClientId);
    
    if (client) {
      setReceiptData({ ...receiptData, receivedFrom: client.name });
    }
  };

  return (
    <div className="card">
      <div className="flex align-center gap-2 mb-4">
        <div className="section-icon bg-emerald-soft">
          <CheckSquare size={20} className="text-emerald" />
        </div>
        <div>
          <h2>Formulir Pembuatan Kwitansi</h2>
          <p className="page-subtitle">Isi rincian penerimaan pembayaran. Nilai nominal dan teks terbilang otomatis terkonversi.</p>
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
            value={receiptData.companyId || activeCompanyId}
            onChange={(e) => {
              const selectedId = e.target.value;
              setReceiptData({ ...receiptData, companyId: selectedId });
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
            <span>Nomor Kwitansi</span>
          </label>
          <input
            type="text"
            name="receiptNumber"
            className="form-control"
            value={receiptData.receiptNumber}
            onChange={handleReceiptChange}
            placeholder="Contoh: KWT-001"
          />
        </div>
        
        <div className="form-group">
          <label className="flex align-center gap-2">
            <User size={14} className="text-muted" />
            <span>Pilih dari Daftar Klien (Opsional)</span>
          </label>
          <select
            className="form-control"
            onChange={handleClientSelect}
            defaultValue=""
          >
            <option value="" disabled>Pilih klien untuk mengisi otomatis...</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="flex align-center gap-2">
          <User size={14} className="text-muted" />
          <span>Telah Terima Dari</span>
        </label>
        <input
          type="text"
          name="receivedFrom"
          className="form-control"
          value={receiptData.receivedFrom}
          onChange={handleReceiptChange}
          placeholder="Nama perorangan, instansi, atau perusahaan pembayar..."
        />
      </div>

      <div className="invoice-grid">
        <div className="form-group">
          <label>Jumlah Nominal Uang (Rp)</label>
          <div className="input-prefix-wrapper">
            <span className="input-prefix">Rp</span>
            <input
              type="text"
              name="amount"
              className="form-control input-with-prefix text-right font-medium"
              value={formatNumberWithDots(receiptData.amount)}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Teks Terbilang (Otomatis)</label>
          <input
            type="text"
            name="amountInWords"
            className="form-control font-medium"
            value={receiptData.amountInWords}
            onChange={handleReceiptChange}
            placeholder="Terbilang otomatis terisi..."
          />
        </div>
      </div>

      <div className="form-group">
        <label>Untuk Pembayaran</label>
        <textarea
          name="paymentFor"
          className="form-control"
          rows={3}
          value={receiptData.paymentFor}
          onChange={handleReceiptChange}
          placeholder="Contoh: Pembayaran lunas pelunasan tagihan invoice #INV-001..."
        />
      </div>

      <div className="form-group">
        <label className="flex align-center gap-2">
          <Calendar size={14} className="text-muted" />
          <span>Tempat & Tanggal Penerbitan (Tanda Tangan)</span>
        </label>
        <input
          type="text"
          name="locationAndDate"
          className="form-control"
          value={receiptData.locationAndDate}
          onChange={handleReceiptChange}
          placeholder="Contoh: Jakarta, 25 November 2026"
        />
      </div>
    </div>
  );
};

export default ReceiptEditor;
