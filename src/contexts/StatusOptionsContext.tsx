'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchB2BStatusOptions, StatusOption } from '@/lib/api';

interface StatusOptionsContextType {
  statusOptions: StatusOption[];
  paymentStatusOptions: StatusOption[];
  invoiceStatusOptions: StatusOption[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getStatusColor: (value: string, type: 'status' | 'payment' | 'invoice') => string;
  getStatusLabel: (value: string, type: 'status' | 'payment' | 'invoice') => string;
}

const StatusOptionsContext = createContext<StatusOptionsContextType | undefined>(undefined);

interface StatusOptionsProviderProps {
  children: ReactNode;
}

export const StatusOptionsProvider: React.FC<StatusOptionsProviderProps> = ({ children }) => {
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [paymentStatusOptions, setPaymentStatusOptions] = useState<StatusOption[]>([]);
  const [invoiceStatusOptions, setInvoiceStatusOptions] = useState<StatusOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadStatusOptions = async () => {
    // ✅ Prevent multiple simultaneous calls
    if (loading && hasLoaded) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading status options from API...');
      const response = await fetchB2BStatusOptions();
      
      if (response.success) {
        setStatusOptions(response.data.status_options);
        setPaymentStatusOptions(response.data.payment_status_options);
        setInvoiceStatusOptions(response.data.invoice_status_options);
        setHasLoaded(true);
        console.log('✅ Status options loaded successfully');
      }
    } catch (err: any) {
      console.error('❌ Failed to load status options:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    setHasLoaded(false);
    await loadStatusOptions();
  };

  const getStatusColor = (value: string, type: 'status' | 'payment' | 'invoice'): string => {
    let options: StatusOption[] = [];
    
    switch (type) {
      case 'payment':
        options = paymentStatusOptions;
        break;
      case 'invoice':
        options = invoiceStatusOptions;
        break;
      default:
        options = statusOptions;
    }
    
    const option = options.find(opt => opt.value === value);
    return option?.color || '#6b7280'; // Default gray color
  };

  const getStatusLabel = (value: string, type: 'status' | 'payment' | 'invoice'): string => {
    let options: StatusOption[] = [];
    
    switch (type) {
      case 'payment':
        options = paymentStatusOptions;
        break;
      case 'invoice':
        options = invoiceStatusOptions;
        break;
      default:
        options = statusOptions;
    }
    
    const option = options.find(opt => opt.value === value);
    return option?.label || value; // Fallback to value if not found
  };

  useEffect(() => {
    if (!hasLoaded) {
      loadStatusOptions();
    }
  }, [hasLoaded]);

  const contextValue: StatusOptionsContextType = {
    statusOptions,
    paymentStatusOptions,
    invoiceStatusOptions,
    loading,
    error,
    refetch,
    getStatusColor,
    getStatusLabel,
  };

  return (
    <StatusOptionsContext.Provider value={contextValue}>
      {children}
    </StatusOptionsContext.Provider>
  );
};

export const useStatusOptions = (): StatusOptionsContextType => {
  const context = useContext(StatusOptionsContext);
  if (context === undefined) {
    throw new Error('useStatusOptions must be used within a StatusOptionsProvider');
  }
  return context;
};

export default StatusOptionsProvider;
