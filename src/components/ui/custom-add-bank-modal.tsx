'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createBank } from '@/lib/api';
import { Plus, X } from 'lucide-react';

interface Bank {
  id: string;
  name: string;
}

interface CustomAddBankModalProps {
  onBankAdded: (bank: Bank) => void;
  trigger?: React.ReactNode;
}

const CustomAddBankModal: React.FC<CustomAddBankModalProps> = ({ onBankAdded, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bankName, setBankName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('🔄 handleSubmit called with bankName:', bankName); // Debug log

    if (!bankName.trim()) {
      console.log('❌ Bank name is empty'); // Debug log
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a bank name.',
      });
      return;
    }

    try {
      setIsCreating(true);
      console.log('🚀 Calling createBank API with:', { name: bankName.trim() }); // Debug log

      const newBank = await createBank({ name: bankName.trim() });
      console.log('✅ Bank created successfully:', newBank); // Debug log

      const formattedBank = {
        id: newBank.id!.toString(),
        name: newBank.name,
      };

      console.log('📤 Calling onBankAdded with:', formattedBank); // Debug log

      // Notify parent component
      onBankAdded(formattedBank);

      // Reset and close
      setBankName('');
      setIsOpen(false);

      toast({
        variant: 'default',
        title: 'Success',
        description: 'Bank added successfully.',
      });
    } catch (error) {
      console.error('❌ Error creating bank:', error); // Debug log
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to add bank: ${error}`,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setBankName('');
    setIsOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const defaultTrigger = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full justify-center text-blue-600 border-blue-200 hover:bg-blue-50"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔓 Modal trigger clicked'); // Debug log
        setIsOpen(true);
      }}
    >
      <Plus className="w-4 h-4 mr-2" />
      Add New Bank
    </Button>
  );

  return (
    <>
      {/* Trigger */}
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Modal Content */}
          <div 
            className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add New Bank</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Bank Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter bank name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="border-gray-200"
                  autoFocus
                />
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={isCreating || !bankName.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await handleSubmit(e as any);
                  }}
                >
                  {isCreating ? 'Adding...' : 'Add Bank'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomAddBankModal;