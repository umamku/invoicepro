import React from 'react';
import { useAppContext } from '../context/AppContext';

const ReceiptEditor: React.FC = () => {
  const { receiptData, setReceiptData, clients } = useAppContext();

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReceiptData({ ...receiptData, [name]: value });
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
      <h2>Detail Kwitansi</h2>
      
      <div className="invoice-grid">
        <div className="form-group">
          <label>Nomor Kwitansi</label>
          <input
            type="text"
            name="receiptNumber"
            className="form-control"
            value={receiptData.receiptNumber}
            onChange={handleReceiptChange}
            placeholder="KWT-001"
          />
        </div>
        
        <div className="form-group">
          <label>Pilih dari Klien (Opsional)</label>
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
        <label>Telah terima dari</label>
        <input
          type="text"
          name="receivedFrom"
          className="form-control"
          value={receiptData.receivedFrom}
          onChange={handleReceiptChange}
          placeholder="Nama orang atau perusahaan"
        />
      </div>

      <div className="invoice-grid">
        <div className="form-group">
          <label>Jumlah Uang (Rp)</label>
          <input
            type="number"
            name="amount"
            className="form-control"
            value={receiptData.amount || ''}
            onChange={handleReceiptChange}
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Terbilang (Manual)</label>
          <input
            type="text"
            name="amountInWords"
            className="form-control"
            value={receiptData.amountInWords}
            onChange={handleReceiptChange}
            placeholder="Contoh: Satu Juta Rupiah"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Untuk pembayaran</label>
        <textarea
          name="paymentFor"
          className="form-control"
          rows={3}
          value={receiptData.paymentFor}
          onChange={handleReceiptChange}
          placeholder="Contoh: Pembayaran DP pembelian barang..."
        />
      </div>

      <div className="form-group">
        <label>Tempat & Tanggal (Tanda Tangan)</label>
        <input
          type="text"
          name="locationAndDate"
          className="form-control"
          value={receiptData.locationAndDate}
          onChange={handleReceiptChange}
          placeholder="Contoh: Jakarta, 5 Agustus 2026"
        />
      </div>
    </div>
  );
};

export default ReceiptEditor;
