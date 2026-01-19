'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Upload, CreditCard, Loader2 } from 'lucide-react';
import { recordB2BPayment, fetchB2BCustomers, fetchB2BOrders } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { getTodayYYYYMMDD } from '@/lib/dateUtils';

export default function RecordPaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    bookingId: '',
    amount: '',
    paymentDate: getTodayYYYYMMDD(),
    paymentMode: 'bank_transfer',
    transactionRef: '',
    notes: '',
  });
  const [bankStatement, setBankStatement] = useState<File | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (formData.customerId) {
      loadCustomerOrders(formData.customerId);
    } else {
      setOrders([]);
      setFormData(prev => ({ ...prev, bookingId: '' }));
    }
  }, [formData.customerId]);

  const loadCustomers = async () => {
    try {
      // ✅ Load ALL customers for dropdown (set high limit to get all)
      const response = await fetchB2BCustomers({
        status: 'active',
        page: 1,
        limit: 1000 // High limit to get all active customers
      });
      // Extract customers array from nested response structure
      setCustomers(response.data?.customers || response.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive',
      });
    }
  };

  const loadCustomerOrders = async (customerId: string) => {
    try {
      setLoadingOrders(true);
      const response = await fetchB2BOrders({ customerId, status: 'completed' });
      // Extract orders array from nested response structure
      setOrders(response.data?.orders || response.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId || !formData.amount || !formData.paymentDate) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append('customerId', formData.customerId);
      if (formData.bookingId) data.append('bookingId', formData.bookingId);
      data.append('amount', formData.amount);
      data.append('paymentDate', formData.paymentDate);
      data.append('paymentMode', formData.paymentMode);
      if (formData.transactionRef) data.append('transactionRef', formData.transactionRef);
      if (formData.notes) data.append('notes', formData.notes);
      if (bankStatement) data.append('bankStatement', bankStatement);

      await recordB2BPayment(data);

      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });

      router.push('/admin/b2b/finance/payments/verify');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/b2b/finance/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Record Payment</h1>
            <p className="text-gray-600 mt-1">Record a new B2B customer payment</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Selection */}
              <div className="space-y-2">
                <Label htmlFor="customerId">
                  Customer <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Order Selection (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="bookingId">Order (Optional)</Label>
                <Select
                  value={formData.bookingId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, bookingId: value === "none" ? "" : value })}
                  disabled={!formData.customerId || loadingOrders}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingOrders ? 'Loading orders...' : 'Select order (optional)'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None - General Payment</SelectItem>
                    {orders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.order_number} - ₹{order.final_amount?.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Link payment to a specific order or leave blank for general payment
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="10000.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                {/* Payment Date */}
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">
                    Payment Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Mode */}
                <div className="space-y-2">
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <Select
                    value={formData.paymentMode}
                    onValueChange={(value) => setFormData({ ...formData, paymentMode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Transaction Reference */}
                <div className="space-y-2">
                  <Label htmlFor="transactionRef">Transaction Reference</Label>
                  <Input
                    id="transactionRef"
                    placeholder="TXN123456"
                    value={formData.transactionRef}
                    onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                  />
                </div>
              </div>

              {/* Bank Statement Upload */}
              <div className="space-y-2">
                <Label htmlFor="bankStatement">Bank Statement (PDF)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="bankStatement"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setBankStatement(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  {bankStatement && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setBankStatement(null)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Upload bank statement as proof of payment (recommended)
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this payment..."
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Record Payment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

