'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, DollarSign, FileText, Loader2, AlertCircle } from 'lucide-react';
import { 
  fetchB2BPaymentById, 
  fetchOutstandingInvoices, 
  allocateB2BPayment,
  B2BPayment 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface InvoiceAllocation {
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  outstandingAmount: number;
  allocatedAmount: number;
  selected: boolean;
}

export default function AllocatePaymentPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [payment, setPayment] = useState<B2BPayment | null>(null);
  const [invoices, setInvoices] = useState<InvoiceAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentId, setPaymentId] = useState<string>('');

  useEffect(() => {
    if (params?.id) {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      setPaymentId(id);
    }
  }, [params]);

  useEffect(() => {
    if (paymentId) {
      loadData();
    }
  }, [paymentId]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (!paymentId) {
        console.error('No payment ID provided');
        return;
      }

      console.log('Loading payment data for ID:', paymentId);

      // Load payment details
      const paymentResponse = await fetchB2BPaymentById(paymentId);
      console.log('Payment response:', paymentResponse);

      const paymentData = paymentResponse.data;

      if (!paymentData) {
        throw new Error('Payment data not found');
      }

      setPayment(paymentData);

      // Load outstanding invoices for the customer
      if (paymentData.b2b_customer_id) {
        console.log('Loading invoices for customer:', paymentData.b2b_customer_id);
        const invoicesResponse = await fetchOutstandingInvoices(paymentData.b2b_customer_id);
        console.log('Invoices response:', invoicesResponse);

        const invoicesData = invoicesResponse.data || [];

        // Transform to allocation format
        const allocations: InvoiceAllocation[] = invoicesData.map((inv: any) => ({
          invoiceId: inv.id,
          invoiceNumber: inv.invoice_number,
          totalAmount: inv.total_amount || 0,
          outstandingAmount: inv.outstanding_amount || 0,
          allocatedAmount: 0,
          selected: false,
        }));

        setInvoices(allocations);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAllocationChange = (invoiceId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setInvoices(prev =>
      prev.map(inv =>
        inv.invoiceId === invoiceId
          ? { ...inv, allocatedAmount: numAmount, selected: numAmount > 0 }
          : inv
      )
    );
  };

  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    setInvoices(prev =>
      prev.map(inv =>
        inv.invoiceId === invoiceId
          ? { 
              ...inv, 
              selected: checked,
              allocatedAmount: checked ? inv.outstandingAmount : 0
            }
          : inv
      )
    );
  };

  const getTotalAllocated = () => {
    const total = invoices.reduce((sum, inv) => sum + inv.allocatedAmount, 0);
    return parseFloat(total.toFixed(2)); // Round to 2 decimal places
  };

  const getRemainingAmount = () => {
    const remaining = (payment?.unallocated_amount || 0) - getTotalAllocated();
    return parseFloat(remaining.toFixed(2)); // Round to 2 decimal places
  };

  const formatCurrency = (amount: number | undefined | null) => {
    const numAmount = Number(amount) || 0;
    return numAmount.toFixed(2);
  };

  const validateAllocations = () => {
    const totalAllocated = getTotalAllocated();
    const unallocated = payment?.unallocated_amount || 0;

    if (totalAllocated === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please allocate amount to at least one invoice',
        variant: 'destructive',
      });
      return false;
    }

    if (totalAllocated > unallocated) {
      toast({
        title: 'Validation Error',
        description: `Total allocation (₹${totalAllocated.toLocaleString()}) exceeds unallocated amount (₹${unallocated.toLocaleString()})`,
        variant: 'destructive',
      });
      return false;
    }

    // Check individual invoice allocations
    for (const inv of invoices) {
      if (inv.allocatedAmount > inv.outstandingAmount) {
        toast({
          title: 'Validation Error',
          description: `Allocation for ${inv.invoiceNumber} (₹${inv.allocatedAmount.toLocaleString()}) exceeds outstanding amount (₹${inv.outstandingAmount.toLocaleString()})`,
          variant: 'destructive',
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateAllocations()) return;

    try {
      setSubmitting(true);

      // Prepare allocations array
      const allocations = invoices
        .filter(inv => inv.allocatedAmount > 0)
        .map(inv => ({
          invoiceId: inv.invoiceId,
          amount: inv.allocatedAmount,
        }));

      await allocateB2BPayment(paymentId, allocations);

      toast({
        title: 'Success',
        description: 'Payment allocated successfully',
      });

      router.push('/admin/b2b/finance/payments');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to allocate payment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!paymentId || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Not Found</h3>
              <p className="text-gray-600 mb-4">The payment you're looking for doesn't exist.</p>
              <Button asChild>
                <Link href="/admin/b2b/finance/payments">Back to Payments</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalAllocated = getTotalAllocated();
  const remainingAmount = getRemainingAmount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/b2b/finance/payments">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Allocate Payment</h1>
            <p className="text-gray-600 mt-1">Allocate payment to outstanding invoices</p>
          </div>
        </div>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-sm text-gray-500">Customer</span>
                <div className="font-semibold text-gray-900 mt-1">
                  {payment?.customer?.company_name || 'Unknown'}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Payment Date</span>
                <div className="font-medium text-gray-900 mt-1">
                  {payment?.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Payment Mode</span>
                <div className="font-medium text-gray-900 mt-1 capitalize">
                  {payment?.payment_mode ? payment.payment_mode.replace('_', ' ') : 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Amount</span>
                <div className="font-semibold text-gray-900 mt-1">
                  ₹{formatCurrency(payment?.amount)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Already Allocated</span>
                <div className="font-medium text-gray-900 mt-1">
                  ₹{formatCurrency(payment?.allocated_amount)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Unallocated Amount</span>
                <div className="font-semibold text-blue-600 mt-1">
                  ₹{formatCurrency(payment?.unallocated_amount)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allocation Summary */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-500">Available to Allocate</span>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{formatCurrency(payment?.unallocated_amount)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Allocating Now</span>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{formatCurrency(totalAllocated)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Remaining</span>
                <div className={`text-2xl font-bold ${remainingAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{formatCurrency(remainingAmount)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Outstanding Invoices ({invoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No outstanding invoices found for this customer</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>Invoice Number</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Allocate Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.invoiceId}>
                        <TableCell>
                          <Checkbox
                            checked={invoice.selected}
                            onCheckedChange={(checked) => 
                              handleSelectInvoice(invoice.invoiceId, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          ₹{formatCurrency(invoice.totalAmount)}
                        </TableCell>
                        <TableCell className="font-semibold text-orange-600">
                          ₹{formatCurrency(invoice.outstandingAmount)}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max={invoice.outstandingAmount}
                            value={invoice.allocatedAmount || ''}
                            onChange={(e) => 
                              handleAllocationChange(invoice.invoiceId, e.target.value)
                            }
                            placeholder="0.00"
                            className="w-32"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || totalAllocated === 0 || remainingAmount < 0}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Allocating...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Allocate Payment
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

