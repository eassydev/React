'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { fetchB2BStatusOptions, StatusOption } from '@/lib/api';

interface StatusDropdownProps {
  type: 'status' | 'payment' | 'invoice';
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  type,
  value,
  onChange,
  disabled = false,
  className = '',
  placeholder = 'Select status...'
}) => {
  const [options, setOptions] = useState<StatusOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadStatusOptions = async () => {
      try {
        setLoading(true);
        const response = await fetchB2BStatusOptions();
        
        if (response.success) {
          switch (type) {
            case 'payment':
              setOptions(response.data.payment_status_options);
              break;
            case 'invoice':
              setOptions(response.data.invoice_status_options);
              break;
            default:
              setOptions(response.data.status_options);
          }
        }
      } catch (error) {
        console.error('Failed to load status options:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStatusOptions();
  }, [type]);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}
          ${selectedOption ? 'border-gray-300' : 'border-gray-300'}
          flex items-center justify-between
        `}
        style={{
          borderColor: selectedOption?.color || '#d1d5db',
          color: selectedOption?.color || '#374151'
        }}
      >
        <div className="flex items-center space-x-2">
          {selectedOption && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedOption.color }}
            />
          )}
          <span className="font-medium">
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                flex items-center space-x-2
                ${value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
              `}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: option.color }}
              />
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Status Badge Component
interface StatusBadgeProps {
  type: 'status' | 'payment' | 'invoice';
  value: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  value,
  className = ''
}) => {
  const [options, setOptions] = useState<StatusOption[]>([]);

  useEffect(() => {
    const loadStatusOptions = async () => {
      try {
        const response = await fetchB2BStatusOptions();
        
        if (response.success) {
          switch (type) {
            case 'payment':
              setOptions(response.data.payment_status_options);
              break;
            case 'invoice':
              setOptions(response.data.invoice_status_options);
              break;
            default:
              setOptions(response.data.status_options);
          }
        }
      } catch (error) {
        console.error('Failed to load status options:', error);
      }
    };

    loadStatusOptions();
  }, [type]);

  const option = options.find(opt => opt.value === value);

  if (!option) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
        {value}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${className}`}
      style={{ backgroundColor: option.color }}
    >
      {option.label}
    </span>
  );
};

// Hook for status options
export const useStatusOptions = () => {
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [paymentStatusOptions, setPaymentStatusOptions] = useState<StatusOption[]>([]);
  const [invoiceStatusOptions, setInvoiceStatusOptions] = useState<StatusOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchB2BStatusOptions();
        
        if (response.success) {
          setStatusOptions(response.data.status_options);
          setPaymentStatusOptions(response.data.payment_status_options);
          setInvoiceStatusOptions(response.data.invoice_status_options);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  const getStatusColor = (value: string, type: 'status' | 'payment' | 'invoice' = 'status') => {
    let options;
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
    return option?.color || '#6b7280';
  };

  const getStatusLabel = (value: string, type: 'status' | 'payment' | 'invoice' = 'status') => {
    let options;
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
    return option?.label || value;
  };

  return {
    statusOptions,
    paymentStatusOptions,
    invoiceStatusOptions,
    loading,
    error,
    getStatusColor,
    getStatusLabel
  };
};
