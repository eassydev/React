'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createBank } from '@/lib/api';
import { Plus } from 'lucide-react';

interface Bank {
  id: string;
  name: string;
}

interface AddBankDialogProps {
  onBankAdded: (bank: Bank) => void;
  trigger?: React.ReactNode;
}

const AddBankDialog: React.FC<AddBankDialogProps> = ({ onBankAdded, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bankName, setBankName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bankName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a bank name.',
      });
      return;
    }

    try {
      setIsCreating(true);
      const newBank = await createBank({ name: bankName.trim() });
      
      const formattedBank = {
        id: newBank.id!.toString(),
        name: newBank.name,
      };
      
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add bank.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setBankName('');
    setIsOpen(false);
  };

  const defaultTrigger = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full justify-center text-blue-600 border-blue-200 hover:bg-blue-50"
    >
      <Plus className="w-4 h-4 mr-2" />
      Add New Bank
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add New Bank</DialogTitle>
        </DialogHeader>
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
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !bankName.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? 'Adding...' : 'Add Bank'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBankDialog;
