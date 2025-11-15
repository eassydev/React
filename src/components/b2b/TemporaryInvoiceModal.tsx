'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Loader2 } from 'lucide-react';
import { getTemporaryInvoiceData, generateTemporaryInvoice } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface TemporaryInvoiceModalProps {
  orderId: string;
  orderNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TemporaryInvoiceModal({
  orderId,
  orderNumber,
  isOpen,
  onClose,
}: TemporaryInvoiceModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchInvoiceData();
    }
  }, [isOpen, orderId]);

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      const response = await getTemporaryInvoiceData(orderId);
      if (response.success) {
        setInvoiceData(response.data);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to fetch invoice data',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch invoice data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await generateTemporaryInvoice(orderId, invoiceData);

      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'Invoice created successfully',
        });

        onClose();

        // ✅ Redirect to invoice listing page with search query
        if (response.data?.redirect_to) {
          router.push(response.data.redirect_to);
        } else if (response.data?.invoice_number) {
          router.push(`/admin/b2b/invoices?search=${response.data.invoice_number}`);
        } else {
          router.push('/admin/b2b/invoices');
        }
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to create invoice',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create invoice',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setInvoiceData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCustomerFieldChange = (field: string, value: any) => {
    setInvoiceData((prev: any) => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value,
      },
    }));
  };

  if (!invoiceData && !loading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Temporary Invoice</DialogTitle>
          <DialogDescription>
            Edit invoice details and download PDF. This will not create an official invoice record.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Order Number</Label>
                <Input value={invoiceData?.order_number || ''} disabled />
              </div>
              <div>
                <Label>Invoice Number</Label>
                <Input
                  value={invoiceData?.invoice_number || ''}
                  onChange={(e) => handleFieldChange('invoice_number', e.target.value)}
                  placeholder="TEMP-1234567890"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Invoice Date</Label>
                <Input
                  type="date"
                  value={invoiceData?.invoice_date || ''}
                  onChange={(e) => handleFieldChange('invoice_date', e.target.value)}
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={invoiceData?.due_date || ''}
                  onChange={(e) => handleFieldChange('due_date', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Terms</Label>
                <Input
                  value={invoiceData?.payment_terms || ''}
                  onChange={(e) => handleFieldChange('payment_terms', e.target.value)}
                  placeholder="Net 30 days"
                />
              </div>
            </div>

            {/* Customer Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={invoiceData?.customer?.company_name || ''}
                    onChange={(e) => handleCustomerFieldChange('company_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <Input
                    value={invoiceData?.customer?.contact_person || ''}
                    onChange={(e) => handleCustomerFieldChange('contact_person', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={invoiceData?.customer?.email || ''}
                    onChange={(e) => handleCustomerFieldChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={invoiceData?.customer?.phone || ''}
                    onChange={(e) => handleCustomerFieldChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>GST Number</Label>
                  <Input
                    value={invoiceData?.customer?.gst_number || ''}
                    onChange={(e) => handleCustomerFieldChange('gst_number', e.target.value)}
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={invoiceData?.customer?.state || ''}
                    onChange={(e) => handleCustomerFieldChange('state', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label>Address</Label>
                <Textarea
                  value={invoiceData?.customer?.address || ''}
                  onChange={(e) => handleCustomerFieldChange('address', e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Service Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Service Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Service Name</Label>
                  <Input
                    value={invoiceData?.service_name || ''}
                    onChange={(e) => handleFieldChange('service_name', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label>Service Description</Label>
                <Textarea
                  value={invoiceData?.service_description || ''}
                  onChange={(e) => handleFieldChange('service_description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Financial Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Financial Details</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Subtotal</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={invoiceData?.subtotal || 0}
                    onChange={(e) => handleFieldChange('subtotal', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Tax Amount (18%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={invoiceData?.tax_amount || 0}
                    onChange={(e) => handleFieldChange('tax_amount', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={invoiceData?.total_amount || 0}
                    onChange={(e) => handleFieldChange('total_amount', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="border-t pt-4">
              <Label>Notes</Label>
              <Textarea
                value={invoiceData?.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                rows={3}
                placeholder="Additional notes or terms..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <Button variant="outline" onClick={onClose} disabled={downloading}>
                Cancel
              </Button>
              <Button onClick={handleDownload} disabled={downloading}>
                {downloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Invoice...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Create Invoice
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

