'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { fetchAllBanks, createProviderBankDetail } from '@/lib/api';
import { Save, ImageIcon, Type, FileText, Loader2, Plus, Trash2, Globe2 } from 'lucide-react';

const AddProviderBankDetailForm: React.FC = () => {
  const [banks, setBanks] = useState<{ id: string; name: string }[]>([]);
  const [bankId, setBankId] = useState<string>('');
  const [accountHolderName, setAccountHolderName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [accountType, setAccountType] = useState<string>('savings');
  const [status, setStatus] = useState<string>('pending');
  const [isPrimary, setIsPrimary] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();
  const { id: providerId } = useParams(); // Provider ID from URL

  // Fetch list of banks
  useEffect(() => {
    const loadBanks = async () => {
      try {
        const bankData = await fetchAllBanks();

        // Ensure id is a string and filter out banks without an id
        const formattedBankData = bankData
          .filter((bank) => bank.id) // Filter out banks without id
          .map((bank) => ({
            id: bank.id!.toString(), // Ensure id is a string
            name: bank.name,
          }));

        setBanks(formattedBankData);
      } catch (error) {
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Failed to load banks.',
        });
      }
    };

    loadBanks();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const bankDetailData = {
      provider_id: providerId.toString(),
      bank_id: bankId,
      account_holder_name: accountHolderName,
      account_number: accountNumber,
      ifsc_code: ifscCode,
      account_type: accountType as 'savings' | 'current' | 'business', // Cast to specific type
      status: status as 'pending' | 'verified' | 'rejected', // Cast to specific type
      primary: isPrimary, // Added primary field
    };

    try {
      const response = await createProviderBankDetail(bankDetailData);
      toast({
        variant: 'success',
        title: 'Success',
        description: response.message,
      });
      //   router.push(`/admin/provider/${providerId}`);
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Error',
        description: 'Failed to add bank account details.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <CardTitle className="text-xl text-gray-800">Add Bank Account Details</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Bank Name */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Globe2 className="w-4 h-4 text-blue-500" />
                  <span>Select Bank</span>
                </label>
                <Select value={bankId} onValueChange={(value) => setBankId(value)} required>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id} className="text-black">
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Account Holder Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Account Holder Name</label>
                <Input
                  type="text"
                  placeholder="Enter account holder name"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  required
                />
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Account Number</label>
                <Input
                  type="text"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </div>

              {/* IFSC Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">IFSC Code</label>
                <Input
                  type="text"
                  placeholder="Enter IFSC code"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  required
                />
              </div>

              {/* Account Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Account Type</label>
                <Select
                  value={accountType}
                  onValueChange={(value) => setAccountType(value)}
                  required
                >
                  <SelectTrigger className="w-full bg-white border-gray-200">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={status} onValueChange={(value) => setStatus(value)} required>
                  <SelectTrigger className="w-full bg-white border-gray-200">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Primary Switch */}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Primary Account</label>
                <Switch
                  checked={isPrimary}
                  onCheckedChange={setIsPrimary}
                  className="data-[state=checked]:bg-primary"
                />
                <span>{isPrimary ? 'Yes' : 'No'}</span>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" className="w-full bg-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Bank Account'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddProviderBankDetailForm;
