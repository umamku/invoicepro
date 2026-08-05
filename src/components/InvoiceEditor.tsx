import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const InvoiceEditor: React.FC = () => {
  const { invoiceData, setInvoiceData, clients } = useAppContext();

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

  const addItem = () => {
    const newItem = { id: uuidv4(), name: '', description: '', quantity: 1, price: 0, discountPercent: 0, taxPercent: 0 };
    setInvoiceData({ ...invoiceData, items: [...invoiceData.items, newItem] });
  };

  const removeItem = (id: string) => {
    setInvoiceData({ ...invoiceData, items: invoiceData.items.filter(i => i.id !== id) });
  };

  return (
    <div className="card">
      <h2>Invoice Details</h2>
      
      <div className="invoice-grid">
        <div className="form-group">
          <label>Invoice Number</label>
          <input
            type="text"
            name="invoiceNumber"
            className="form-control"
            value={invoiceData.invoiceNumber}
            onChange={handleInvoiceChange}
          />
        </div>
        <div className="form-group">
          <label>Client</label>
          <select
            name="clientId"
            className="form-control"
            value={invoiceData.clientId}
            onChange={handleInvoiceChange}
          >
            <option value="">Select a Client...</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Invoice Date</label>
          <input
            type="date"
            name="date"
            className="form-control"
            value={invoiceData.date}
            onChange={handleInvoiceChange}
          />
        </div>
        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            name="dueDate"
            className="form-control"
            value={invoiceData.dueDate}
            onChange={handleInvoiceChange}
          />
        </div>
        <div className="form-group">
          <label>Tanggal Tanda Tangan (Teks Bebas)</label>
          <input
            type="text"
            name="signatureDate"
            className="form-control"
            value={invoiceData.signatureDate || ''}
            onChange={handleInvoiceChange}
            placeholder="Contoh: 5 Agu 2026 atau 5 Agustus 2026"
          />
        </div>
        <div className="form-group">
          <label>Amount Paid (optional)</label>
          <input
            type="number"
            name="amountPaid"
            className="form-control"
            value={invoiceData.amountPaid}
            onChange={handleInvoiceChange}
          />
        </div>
      </div>

      <div className="mt-4 mb-4">
        <h3 className="invoice-section-title">Items</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Product / Description</th>
                <th style={{ width: '10%' }}>Qty</th>
                <th style={{ width: '20%' }}>Price</th>
                <th style={{ width: '10%' }}>Disc %</th>
                <th style={{ width: '15%' }}>Tax %</th>
                <th style={{ width: '10%' }}></th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="text"
                      className="form-control mb-4"
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      placeholder="Product name"
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="Description"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={item.quantity}
                      min="1"
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={item.price}
                      min="0"
                      onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={item.discountPercent}
                      min="0"
                      max="100"
                      onChange={(e) => handleItemChange(item.id, 'discountPercent', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={item.taxPercent}
                      min="0"
                      onChange={(e) => handleItemChange(item.id, 'taxPercent', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td>
                    <button className="btn btn-danger btn-icon" onClick={() => removeItem(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn btn-outline mt-4" onClick={addItem}>
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="invoice-grid mt-4">
        <div className="form-group">
          <label>Keterangan / Notes</label>
          <textarea
            name="notes"
            className="form-control"
            rows={4}
            value={invoiceData.notes}
            onChange={handleInvoiceChange}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceEditor;
