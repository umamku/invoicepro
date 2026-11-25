import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface CompanySettings {
  name: string;
  address: string;
  email: string;
  phone: string;
  logo: string; // base64 string
  signatureName: string;
  signatureImage: string; // base64 string
}

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
  items: InvoiceItem[];
  notes: string;
  amountPaid: number;
}

export interface ReceiptData {
  receiptNumber: string;
  receivedFrom: string; // client name or custom string
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
  clients: Client[];
  invoiceData: InvoiceData;
  receiptData: ReceiptData;
  invoiceHistory: InvoiceHistoryItem[];
  receiptHistory: ReceiptHistoryItem[];
}

interface AppContextType {
  settings: CompanySettings;
  setSettings: (settings: CompanySettings) => void;
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
  const [settings, setSettingsState] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('invoice_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

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

  const setSettings = (newSettings: CompanySettings) => {
    setSettingsState(newSettings);
    localStorage.setItem('invoice_settings', JSON.stringify(newSettings));
  };

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
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
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
      if (backup.settings && typeof backup.settings === 'object') {
        setSettingsState(backup.settings);
        localStorage.setItem('invoice_settings', JSON.stringify(backup.settings));
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
