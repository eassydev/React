'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { StatusOption } from '@/lib/api';
import { useStatusOptions } from '@/contexts/StatusOptionsContext';

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
  const [isOpen, setIsOpen] = useState(false);
  const { statusOptions, paymentStatusOptions, invoiceStatusOptions, loading } = useStatusOptions();

  // ✅ Get options based on type from context
  const options = React.useMemo(() => {
    switch (type) {
      case 'payment':
        return paymentStatusOptions;
      case 'invoice':
        return invoiceStatusOptions;
      default:
        return statusOptions;
    }
  }, [type, statusOptions, paymentStatusOptions, invoiceStatusOptions]);

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
  const { getStatusColor, getStatusLabel } = useStatusOptions();

  const color = getStatusColor(value, type);
  const label = getStatusLabel(value, type);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}`
      }}
    >
      {label}
    </span>
  );
};

// ✅ Status options are now managed by StatusOptionsContext
// The useStatusOptions hook is imported from @/contexts/StatusOptionsContext
