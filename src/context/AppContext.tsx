import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface CompanySettings {
  id?: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  logo: string; // base64 string
  signatureName: string;
  signatureImage: string; // base64 string
}

export type CompanyProfile = CompanySettings & { id: string };

export interface Client {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  discountPercent: number;
  taxPercent: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  signatureDate: string;
  clientId: string;
  companyId?: string;
  items: InvoiceItem[];
  notes: string;
  amountPaid: number;
}

export interface ReceiptData {
  receiptNumber: string;
  receivedFrom: string; // client name or custom string
  companyId?: string;
  amount: number;
  amountInWords: string;
  paymentFor: string;
  locationAndDate: string;
}

export interface InvoiceHistoryItem {
  id: string;
  printedAt: string;
  invoice: InvoiceData;
  clientName: string;
  totalAmount: number;
  balanceDue: number;
}

export interface ReceiptHistoryItem {
  id: string;
  printedAt: string;
  receipt: ReceiptData;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  settings: CompanySettings;
  companies?: CompanyProfile[];
  activeCompanyId?: string;
  clients: Client[];
  invoiceData: InvoiceData;
  receiptData: ReceiptData;
  invoiceHistory: InvoiceHistoryItem[];
  receiptHistory: ReceiptHistoryItem[];
}

interface AppContextType {
  settings: CompanySettings;
  setSettings: (settings: CompanySettings) => void;
  companies: CompanyProfile[];
  activeCompanyId: string;
  setActiveCompanyId: (id: string) => void;
  addCompanyProfile: (profile?: Partial<CompanyProfile>) => CompanyProfile;
  updateCompanyProfile: (profile: CompanyProfile) => void;
  deleteCompanyProfile: (id: string) => void;
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  invoiceData: InvoiceData;
  setInvoiceData: (data: InvoiceData) => void;
  receiptData: ReceiptData;
  setReceiptData: (data: ReceiptData) => void;
  invoiceHistory: InvoiceHistoryItem[];
  addToInvoiceHistory: (invoice: InvoiceData, clientName?: string, totalAmount?: number, balanceDue?: number) => void;
  deleteInvoiceHistory: (id: string) => void;
  clearInvoiceHistory: () => void;
  receiptHistory: ReceiptHistoryItem[];
  addToReceiptHistory: (receipt: ReceiptData) => void;
  deleteReceiptHistory: (id: string) => void;
  clearReceiptHistory: () => void;
  exportAllData: () => BackupData;
  importAllData: (data: any) => boolean;
}

const defaultSettings: CompanySettings = {
  name: 'Green Shop',
  address: 'Mutiara Darussalam,\nDepok,\nJawa Barat, 16436\nIndonesia',
  email: 'khoirulumam.ku@gmail.com',
  phone: '081286692681',
  logo: '',
  signatureName: 'Khoirul Umam',
  signatureImage: '',
};

const defaultInvoiceData: InvoiceData = {
  invoiceNumber: 'INV/2021/0024',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date().toISOString().split('T')[0],
  signatureDate: '',
  clientId: '',
  items: [{ id: uuidv4(), name: 'Rumput sintetis', description: 'Tipe swiss premium 30mm', quantity: 100, price: 185000, discountPercent: 0, taxPercent: 0 }],
  notes: 'Mohon Melakukan Pembayaran Ke Nomor Rekening: BNI #0361678463',
  amountPaid: 0,
};

const defaultReceiptData: ReceiptData = {
  receiptNumber: 'KWT-001',
  receivedFrom: '',
  amount: 0,
  amountInWords: '',
  paymentFor: '',
  locationAndDate: `Jakarta, ${new Date().getDate()} ${new Date().toLocaleString('id-ID', { month: 'long' })} ${new Date().getFullYear()}`,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companies, setCompaniesState] = useState<CompanyProfile[]>(() => {
    const saved = localStorage.getItem('invoice_companies');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    const oldSettings = localStorage.getItem('invoice_settings');
    const base = oldSettings ? JSON.parse(oldSettings) : defaultSettings;
    return [{
      ...base,
      id: base.id || 'default-company-1',
      name: base.name || 'Usaha Utama',
    }];
  });

  const [activeCompanyId, setActiveCompanyIdState] = useState<string>(() => {
    return localStorage.getItem('invoice_active_company_id') || 'default-company-1';
  });

  const activeCompany: CompanyProfile = companies.find(c => c.id === activeCompanyId) || companies[0] || {
    ...defaultSettings,
    id: 'default-company-1',
  };

  const settings: CompanySettings = activeCompany;

  const setActiveCompanyId = (id: string) => {
    setActiveCompanyIdState(id);
    localStorage.setItem('invoice_active_company_id', id);
    const target = companies.find(c => c.id === id);
    if (target) {
      localStorage.setItem('invoice_settings', JSON.stringify(target));
    }
  };

  const setSettings = (newSettings: CompanySettings) => {
    const updatedCompany: CompanyProfile = {
      ...newSettings,
      id: activeCompany.id || 'default-company-1',
    };
    const updatedCompanies = companies.map(c => c.id === updatedCompany.id ? updatedCompany : c);
    setCompaniesState(updatedCompanies);
    localStorage.setItem('invoice_companies', JSON.stringify(updatedCompanies));
    localStorage.setItem('invoice_settings', JSON.stringify(updatedCompany));
  };

  const addCompanyProfile = (profile?: Partial<CompanyProfile>): CompanyProfile => {
    const newId = uuidv4();
    const newProfile: CompanyProfile = {
      id: newId,
      name: profile?.name || `Profil Usaha ${companies.length + 1}`,
      address: profile?.address || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      logo: profile?.logo || '',
      signatureName: profile?.signatureName || '',
      signatureImage: profile?.signatureImage || '',
    };
    const updated = [...companies, newProfile];
    setCompaniesState(updated);
    setActiveCompanyIdState(newId);
    localStorage.setItem('invoice_companies', JSON.stringify(updated));
    localStorage.setItem('invoice_active_company_id', newId);
    localStorage.setItem('invoice_settings', JSON.stringify(newProfile));
    return newProfile;
  };

  const updateCompanyProfile = (profile: CompanyProfile) => {
    const updated = companies.map(c => c.id === profile.id ? profile : c);
    setCompaniesState(updated);
    localStorage.setItem('invoice_companies', JSON.stringify(updated));
    if (profile.id === activeCompany.id) {
      localStorage.setItem('invoice_settings', JSON.stringify(profile));
    }
  };

  const deleteCompanyProfile = (id: string) => {
    if (companies.length <= 1) {
      alert('Minimal harus ada 1 profil usaha.');
      return;
    }
    const updated = companies.filter(c => c.id !== id);
    setCompaniesState(updated);
    localStorage.setItem('invoice_companies', JSON.stringify(updated));
    if (activeCompanyId === id) {
      const nextActiveId = updated[0].id;
      setActiveCompanyIdState(nextActiveId);
      localStorage.setItem('invoice_active_company_id', nextActiveId);
      localStorage.setItem('invoice_settings', JSON.stringify(updated[0]));
    }
  };

  const [clients, setClientsState] = useState<Client[]>(() => {
    const saved = localStorage.getItem('invoice_clients');
    return saved ? JSON.parse(saved) : [];
  });

  const [invoiceData, setInvoiceDataState] = useState<InvoiceData>(() => {
    const saved = localStorage.getItem('invoice_current');
    return saved ? JSON.parse(saved) : defaultInvoiceData;
  });

  const [receiptData, setReceiptDataState] = useState<ReceiptData>(() => {
    const saved = localStorage.getItem('invoice_receipt_current');
    return saved ? JSON.parse(saved) : defaultReceiptData;
  });

  const [invoiceHistory, setInvoiceHistoryState] = useState<InvoiceHistoryItem[]>(() => {
    const saved = localStorage.getItem('invoice_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [receiptHistory, setReceiptHistoryState] = useState<ReceiptHistoryItem[]>(() => {
    const saved = localStorage.getItem('receipt_history');
    return saved ? JSON.parse(saved) : [];
  });

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: uuidv4() };
    const newClients = [...clients, newClient];
    setClientsState(newClients);
    localStorage.setItem('invoice_clients', JSON.stringify(newClients));
  };

  const updateClient = (updatedClient: Client) => {
    const newClients = clients.map(c => (c.id === updatedClient.id ? updatedClient : c));
    setClientsState(newClients);
    localStorage.setItem('invoice_clients', JSON.stringify(newClients));
  };

  const deleteClient = (id: string) => {
    const newClients = clients.filter(c => c.id !== id);
    setClientsState(newClients);
    localStorage.setItem('invoice_clients', JSON.stringify(newClients));
    if (invoiceData.clientId === id) {
      setInvoiceData({ ...invoiceData, clientId: '' });
    }
  };

  const setInvoiceData = (data: InvoiceData) => {
    setInvoiceDataState(data);
    localStorage.setItem('invoice_current', JSON.stringify(data));
  };

  const setReceiptData = (data: ReceiptData) => {
    setReceiptDataState(data);
    localStorage.setItem('invoice_receipt_current', JSON.stringify(data));
  };

  const addToInvoiceHistory = (invoice: InvoiceData, clientName?: string, totalAmount = 0, balanceDue = 0) => {
    const newItem: InvoiceHistoryItem = {
      id: uuidv4(),
      printedAt: new Date().toISOString(),
      invoice: JSON.parse(JSON.stringify(invoice)),
      clientName: clientName || 'Klien Umum',
      totalAmount,
      balanceDue,
    };
    const updated = [newItem, ...invoiceHistory];
    setInvoiceHistoryState(updated);
    localStorage.setItem('invoice_history', JSON.stringify(updated));
  };

  const deleteInvoiceHistory = (id: string) => {
    const updated = invoiceHistory.filter(item => item.id !== id);
    setInvoiceHistoryState(updated);
    localStorage.setItem('invoice_history', JSON.stringify(updated));
  };

  const clearInvoiceHistory = () => {
    setInvoiceHistoryState([]);
    localStorage.removeItem('invoice_history');
  };

  const addToReceiptHistory = (receipt: ReceiptData) => {
    const newItem: ReceiptHistoryItem = {
      id: uuidv4(),
      printedAt: new Date().toISOString(),
      receipt: JSON.parse(JSON.stringify(receipt)),
    };
    const updated = [newItem, ...receiptHistory];
    setReceiptHistoryState(updated);
    localStorage.setItem('receipt_history', JSON.stringify(updated));
  };

  const deleteReceiptHistory = (id: string) => {
    const updated = receiptHistory.filter(item => item.id !== id);
    setReceiptHistoryState(updated);
    localStorage.setItem('receipt_history', JSON.stringify(updated));
  };

  const clearReceiptHistory = () => {
    setReceiptHistoryState([]);
    localStorage.removeItem('receipt_history');
  };

  const exportAllData = (): BackupData => {
    return {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      settings: activeCompany,
      companies,
      activeCompanyId,
      clients,
      invoiceData,
      receiptData,
      invoiceHistory,
      receiptHistory,
    };
  };

  const importAllData = (backup: any): boolean => {
    try {
      if (!backup || typeof backup !== 'object') {
        throw new Error('Format file cadangan tidak valid');
      }
      if (Array.isArray(backup.companies) && backup.companies.length > 0) {
        setCompaniesState(backup.companies);
        localStorage.setItem('invoice_companies', JSON.stringify(backup.companies));
        const newActiveId = backup.activeCompanyId || backup.companies[0].id;
        setActiveCompanyIdState(newActiveId);
        localStorage.setItem('invoice_active_company_id', newActiveId);
        const comp = backup.companies.find((c: any) => c.id === newActiveId) || backup.companies[0];
        localStorage.setItem('invoice_settings', JSON.stringify(comp));
      } else if (backup.settings && typeof backup.settings === 'object') {
        const singleComp: CompanyProfile = {
          ...backup.settings,
          id: backup.settings.id || 'default-company-1',
        };
        setCompaniesState([singleComp]);
        setActiveCompanyIdState(singleComp.id);
        localStorage.setItem('invoice_companies', JSON.stringify([singleComp]));
        localStorage.setItem('invoice_active_company_id', singleComp.id);
        localStorage.setItem('invoice_settings', JSON.stringify(singleComp));
      }
      if (Array.isArray(backup.clients)) {
        setClientsState(backup.clients);
        localStorage.setItem('invoice_clients', JSON.stringify(backup.clients));
      }
      if (backup.invoiceData && typeof backup.invoiceData === 'object') {
        setInvoiceDataState(backup.invoiceData);
        localStorage.setItem('invoice_current', JSON.stringify(backup.invoiceData));
      }
      if (backup.receiptData && typeof backup.receiptData === 'object') {
        setReceiptDataState(backup.receiptData);
        localStorage.setItem('invoice_receipt_current', JSON.stringify(backup.receiptData));
      }
      if (Array.isArray(backup.invoiceHistory)) {
        setInvoiceHistoryState(backup.invoiceHistory);
        localStorage.setItem('invoice_history', JSON.stringify(backup.invoiceHistory));
      }
      if (Array.isArray(backup.receiptHistory)) {
        setReceiptHistoryState(backup.receiptHistory);
        localStorage.setItem('receipt_history', JSON.stringify(backup.receiptHistory));
      }
      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        setSettings,
        companies,
        activeCompanyId,
        setActiveCompanyId,
        addCompanyProfile,
        updateCompanyProfile,
        deleteCompanyProfile,
        clients,
        addClient,
        updateClient,
        deleteClient,
        invoiceData,
        setInvoiceData,
        receiptData,
        setReceiptData,
        invoiceHistory,
        addToInvoiceHistory,
        deleteInvoiceHistory,
        clearInvoiceHistory,
        receiptHistory,
        addToReceiptHistory,
        deleteReceiptHistory,
        clearReceiptHistory,
        exportAllData,
        importAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
