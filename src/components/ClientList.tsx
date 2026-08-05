import React, { useState } from 'react';
import { useAppContext, type Client } from '../context/AppContext';
import { Edit2, Trash2, Plus } from 'lucide-react';

const ClientList: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient } = useAppContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    name: '',
    address: '',
    email: '',
    phone: '',
  });

  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    setFormData({ name: client.name, address: client.address, email: client.email, phone: client.phone || '' });
  };

  const handleSave = () => {
    if (!formData.name) return;

    if (editingId) {
      updateClient({ ...formData, id: editingId });
      setEditingId(null);
    } else {
      addClient(formData);
    }
    setFormData({ name: '', address: '', email: '', phone: '' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', address: '', email: '', phone: '' });
  };

  return (
    <div>
      <div className="card">
        <h2>{editingId ? 'Edit Client' : 'Add New Client'}</h2>
        <div className="invoice-grid">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              className="form-control"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button className="btn btn-primary" onClick={handleSave}>
            <Plus size={18} /> {editingId ? 'Update Client' : 'Add Client'}
          </button>
          {editingId && (
            <button className="btn btn-outline" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Client List</h2>
        {clients.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No clients added yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id}>
                    <td><strong>{client.name}</strong></td>
                    <td>
                      <div>{client.email}</div>
                      <div>{client.phone}</div>
                    </td>
                    <td style={{ whiteSpace: 'pre-wrap' }}>{client.address}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-outline btn-icon" onClick={() => handleEdit(client)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => deleteClient(client.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientList;
