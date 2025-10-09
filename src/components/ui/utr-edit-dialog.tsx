'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Save, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { updatePayoutUTR } from '@/lib/api';

interface UTREditDialogProps {
  payoutId: string;
  currentUTR?: string;
  onUTRUpdate?: (payoutId: string, newUTR: string) => void;
  disabled?: boolean;
}

export function UTREditDialog({
  payoutId,
  currentUTR,
  onUTRUpdate,
  disabled = false
}: UTREditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [utrValue, setUtrValue] = useState(currentUTR || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // ✅ Don't allow editing if UTR already exists
  const hasExistingUTR = currentUTR && currentUTR.trim().length > 0;
  const isEditDisabled = disabled || hasExistingUTR;

  const handleSave = async () => {
    if (!utrValue.trim()) {
      toast({
        title: "Error",
        description: "UTR number cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // Basic UTR validation (12 digits)
    if (!/^\d{12}$/.test(utrValue.trim())) {
      toast({
        title: "Invalid UTR",
        description: "UTR number must be exactly 12 digits",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await updatePayoutUTR(payoutId, utrValue.trim());

      if (result.success) {
        toast({
          title: "Success",
          description: "UTR number updated successfully",
        });

        // Call the callback to update parent component
        if (onUTRUpdate) {
          onUTRUpdate(payoutId, utrValue.trim());
        }

        setIsOpen(false);
      } else {
        throw new Error(result.error || 'Failed to update UTR');
      }

    } catch (error) {
      console.error('Error updating UTR:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update UTR number",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUtrValue(currentUTR || '');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isEditDisabled}
          className={`h-6 w-6 p-0 ${hasExistingUTR ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
          title={hasExistingUTR ? "UTR cannot be edited once set" : (currentUTR ? "Edit UTR" : "Add UTR")}
        >
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {currentUTR ? 'Edit UTR Number' : 'Add UTR Number'}
          </DialogTitle>
          <DialogDescription>
            Enter the 12-digit UTR (Unique Transaction Reference) number from the bank transfer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="utr" className="text-right">
              UTR Number
            </Label>
            <Input
              id="utr"
              value={utrValue}
              onChange={(e) => setUtrValue(e.target.value)}
              placeholder="123456789012"
              className="col-span-3 font-mono"
              maxLength={12}
              pattern="\d{12}"
            />
          </div>
          
          <div className="text-xs text-gray-500 ml-4 col-span-4">
            <p>• UTR must be exactly 12 digits</p>
            <p>• This is the bank reference number for the transfer</p>
            <p>• You can find this in your bank statement or Razorpay dashboard</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save UTR'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
