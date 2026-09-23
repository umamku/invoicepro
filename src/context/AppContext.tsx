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
