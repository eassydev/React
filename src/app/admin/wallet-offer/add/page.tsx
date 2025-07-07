'use client';

import React, { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, Calendar } from 'lucide-react';
import { createWalletOffer, WalletOffer } from '@/lib/api'; // Import the API function and WalletOffer interface

const WalletOfferAddForm: React.FC = () => {
  const [eventType, setEventType] = useState<string>('sign_up');
  const [esCash, setEsCash] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [orderAmount, setOrderAmount] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!eventType || !esCash || !startDate || !endDate) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'All required fields must be filled.',
      });
      setIsSubmitting(false);
      return;
    }

    const newWalletOffer: WalletOffer = {
      event_type: eventType as WalletOffer['event_type'],
      es_cash: parseFloat(esCash),
      start_date: startDate,
      end_date: endDate,
      is_active: isActive,
      order_amount: orderAmount ? parseInt(orderAmount) : null,
    };

    try {
      await createWalletOffer(newWalletOffer);
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Wallet offer created successfully.',
      });

      // Reset form fields
      setEventType('sign_up');
      setEsCash('');
      setStartDate('');
      setEndDate('');
      setIsActive(true);
      setOrderAmount('');
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to create wallet offer.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Wallet Offers Management</h1>
          <p className="text-gray-500">Create Wallet Offer</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">New Wallet Offer</CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below to create a new wallet offer
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Event Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full border rounded-md p-2"
                >
                  <option value="sign_up">Sign Up</option>
                  <option value="order">Order</option>
                  <option value="referral">Referral</option>
                  <option value="sign_up_referral">Sign Up Referral</option>
                </select>
              </div>

              {/* ES Cash */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">ES Cash</label>
                <Input
                  value={esCash}
                  onChange={(e) => setEsCash(e.target.value)}
                  placeholder="Enter ES Cash amount"
                  required
                />
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              {/* Order Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Order Amount (Optional)</label>
                <Input
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  placeholder="Enter order amount"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} className="bg-primary" />
                <span className="text-sm text-gray-700">Active</span>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full h-11 bg-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Wallet Offer</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletOfferAddForm;
