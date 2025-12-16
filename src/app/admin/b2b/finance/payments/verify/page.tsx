'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download, 
  FileText,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { 
  fetchB2BPayments, 
  verifyB2BPayment, 
  rejectB2BPayment,
  B2BPayment 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function PaymentVerificationPage() {
  const [payments, setPayments] = useState<B2BPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  // Dialog states
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<B2BPayment | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      const response = await fetchB2BPayments({ verificationStatus: 'pending' });
      setPayments(response.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load payments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedPayment) return;

    try {
      setActionLoading(true);
      await verifyB2BPayment(selectedPayment.id, verificationNotes);
      
      toast({
        title: 'Success',
        description: 'Payment verified successfully',
      });

      setVerifyDialog(false);
      setVerificationNotes('');
      setSelectedPayment(null);
      loadPendingPayments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify payment',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !verificationNotes.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    try {
      setActionLoading(true);
      await rejectB2BPayment(selectedPayment.id, verificationNotes);
      
      toast({
        title: 'Success',
        description: 'Payment rejected',
      });

      setRejectDialog(false);
      setVerificationNotes('');
      setSelectedPayment(null);
      loadPendingPayments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject payment',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openVerifyDialog = (payment: B2BPayment) => {
    setSelectedPayment(payment);
    setVerificationNotes('');
    setVerifyDialog(true);
  };

  const openRejectDialog = (payment: B2BPayment) => {
    setSelectedPayment(payment);
    setVerificationNotes('');
    setRejectDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Verification</h1>
            <p className="text-gray-600 mt-1">
              Review and verify pending payments ({payments.length} pending)
            </p>
          </div>
        </div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                All Caught Up!
              </h3>
              <p className="text-gray-600">
                No payments pending verification at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Customer & Amount */}
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {payment.customer?.company_name || 'Unknown Customer'}
                        </h3>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </div>

                      {/* Payment Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <div className="font-semibold text-gray-900">
                            ₹{payment.amount.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Payment Date:</span>
                          <div className="font-medium text-gray-900">
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Mode:</span>
                          <div className="font-medium text-gray-900 capitalize">
                            {payment.payment_mode.replace('_', ' ')}
                          </div>
                        </div>
                        {payment.transaction_ref && (
                          <div>
                            <span className="text-gray-500">Ref:</span>
                            <div className="font-medium text-gray-900 font-mono text-xs">
                              {payment.transaction_ref}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Order Reference */}
                      {payment.booking && (
                        <div className="text-sm">
                          <span className="text-gray-500">Order:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {payment.booking.order_number}
                          </span>
                        </div>
                      )}

                      {/* Notes */}
                      {payment.notes && (
                        <div className="text-sm">
                          <span className="text-gray-500">Notes:</span>
                          <p className="mt-1 text-gray-700">{payment.notes}</p>
                        </div>
                      )}

                      {/* Bank Statement */}
                      {payment.bank_statement_path && (
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(payment.bank_statement_path, '_blank')}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Bank Statement
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => openVerifyDialog(payment)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openRejectDialog(payment)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Verify Dialog */}
        <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Payment</DialogTitle>
              <DialogDescription>
                Confirm that you have verified this payment of ₹
                {selectedPayment?.amount.toLocaleString()} from{' '}
                {selectedPayment?.customer?.company_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="verify-notes">Verification Notes (Optional)</Label>
                <Textarea
                  id="verify-notes"
                  placeholder="Add any verification notes..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVerifyDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleVerify} disabled={actionLoading}>
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Payment</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this payment of ₹
                {selectedPayment?.amount.toLocaleString()} from{' '}
                {selectedPayment?.customer?.company_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reject-notes">
                  Rejection Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reject-notes"
                  placeholder="e.g., Amount mismatch, invalid bank statement, etc."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading || !verificationNotes.trim()}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

