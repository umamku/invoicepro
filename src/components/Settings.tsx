import React, { useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Upload } from 'lucide-react';

const Settings: React.FC = () => {
  const { settings, setSettings } = useAppContext();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

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
    <div className="card">
      <h2>Company Settings</h2>
      <div className="invoice-grid">
        <div>
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={settings.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              className="form-control"
              rows={4}
              value={settings.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={settings.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
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
            <label>Company Logo</label>
            {settings.logo && (
              <div style={{ marginBottom: '1rem' }}>
                <img src={settings.logo} alt="Company Logo" style={{ maxHeight: '100px', maxWidth: '200px', objectFit: 'contain' }} />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={logoInputRef}
              onChange={(e) => handleFileUpload(e, 'logo')}
            />
            <div>
              <button
                className="btn btn-outline"
                onClick={() => logoInputRef.current?.click()}
              >
                <Upload size={18} /> {settings.logo ? 'Change Logo' : 'Upload Logo'}
              </button>
              {settings.logo && (
                <button
                  className="btn btn-danger"
                  style={{ marginLeft: '10px' }}
                  onClick={() => setSettings({ ...settings, logo: '' })}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)', opacity: 0.5 }} />
          
          <div className="form-group">
            <label>Signature Name</label>
            <input
              type="text"
              name="signatureName"
              className="form-control"
              value={settings.signatureName}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Signature Image</label>
            {settings.signatureImage && (
              <div style={{ marginBottom: '1rem' }}>
                <img src={settings.signatureImage} alt="Signature" style={{ maxHeight: '100px', maxWidth: '200px', objectFit: 'contain' }} />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={signatureInputRef}
              onChange={(e) => handleFileUpload(e, 'signatureImage')}
            />
            <div>
              <button
                className="btn btn-outline"
                onClick={() => signatureInputRef.current?.click()}
              >
                <Upload size={18} /> {settings.signatureImage ? 'Change Signature' : 'Upload Signature'}
              </button>
              {settings.signatureImage && (
                <button
                  className="btn btn-danger"
                  style={{ marginLeft: '10px' }}
                  onClick={() => setSettings({ ...settings, signatureImage: '' })}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
