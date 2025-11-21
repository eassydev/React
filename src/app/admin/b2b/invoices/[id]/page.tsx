'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, FileText, Calendar, DollarSign, User, Building, RefreshCw } from 'lucide-react';
import { fetchB2BInvoiceById, downloadB2BInvoice, regenerateB2BInvoicePDF } from '@/lib/api';
import { AdditionalCostsManager } from '@/components/b2b/AdditionalCostsManager';
import { useToast } from '@/hooks/use-toast';

interface InvoiceDetails {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_status: string;
  payment_terms: string;
  notes: string;
  currency: string;
  booking: {
    id: string;
    order_number: string;
    service_name: string;
    service_description: string;
    customer: {
      company_name: string;
      contact_person: string;
      email: string;
      phone: string;
      address: string;
      gst_number: string;
    };
  };
}

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const invoiceId = params.id as string;

  useEffect(() => {
    // Check authentication first
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      setIsAuthenticated(true);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInvoiceDetails();
    }
  }, [invoiceId, isAuthenticated]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const response = await fetchB2BInvoiceById(invoiceId);
      setInvoice(response.data);
    } catch (error: any) {
      console.error('Error fetching invoice details:', error);
      setError(error.message || 'Failed to fetch invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadB2BInvoice(invoiceId);
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice: ' + (error.message || 'Unknown error'));
    }
  };

  const handleRegeneratePDF = async () => {
    try {
      setRegenerating(true);
      toast({
        title: "Regenerating PDF",
        description: "Please wait while we regenerate the invoice PDF with updated additional costs...",
      });

      const response = await regenerateB2BInvoicePDF(invoiceId);

      if (response.success) {
        toast({
          title: "PDF Regenerated Successfully",
          description: "Invoice PDF has been updated with the latest additional costs",
        });

        // Refresh invoice data to show updated values
        await fetchInvoiceDetails();
      } else {
        toast({
          title: "PDF Regeneration Failed",
          description: response.message || "Failed to regenerate PDF",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error regenerating PDF:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate PDF",
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
    }
  };

  const handleAdditionalCostsChange = (total: number) => {
    console.log('Additional costs total changed:', total);
    // Optionally show a message to user that they should regenerate the PDF
    toast({
      title: "Additional Costs Updated",
      description: "Click 'Regenerate PDF' to update the invoice with the new costs",
    });
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      unpaid: { label: 'Unpaid', className: 'bg-red-100 text-red-800' },
      partial: { label: 'Partial', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
      overdue: { label: 'Overdue', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">
            {!isAuthenticated ? 'Checking authentication...' : 'Loading invoice details...'}
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">
              {error || 'Invoice not found'}
            </div>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('📋 Invoice data:', invoice);
  console.log('📦 Booking ID:', invoice.booking?.id);
  console.log('🔍 Has booking:', !!invoice.booking);


  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Invoice Details</h1>
            <p className="text-gray-600">{invoice.invoice_number}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleRegeneratePDF}
            variant="outline"
            disabled={regenerating}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Regenerating...' : 'Regenerate PDF'}
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Invoice Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Invoice Number</label>
                  <p className="font-medium">{invoice.invoice_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Order Number</label>
                  <p className="font-medium">{invoice.booking?.order_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Invoice Date</label>
                  <p className="font-medium">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Status</label>
                  <div>{getPaymentStatusBadge(invoice.payment_status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Terms</label>
                  <p className="font-medium">{invoice.payment_terms}</p>
                </div>
              </div>
              {invoice.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="font-medium">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Service Name</label>
                  <p className="font-medium">{invoice.booking?.service_name}</p>
                </div>
                {invoice.booking?.service_description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="font-medium">{invoice.booking.service_description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Amount Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Amount Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (18%)</span>
                <span className="font-medium">₹{invoice.tax_amount.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{invoice.total_amount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Company</label>
                <p className="font-medium">{invoice.booking?.customer?.company_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Person</label>
                <p className="font-medium">{invoice.booking?.customer?.contact_person}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="font-medium">{invoice.booking?.customer?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="font-medium">{invoice.booking?.customer?.phone}</p>
              </div>
              {invoice.booking?.customer?.gst_number && (
                <div>
                  <label className="text-sm font-medium text-gray-500">GST Number</label>
                  <p className="font-medium">{invoice.booking.customer.gst_number}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Costs Section - Full Width */}
      {invoice.booking?.id && (
        <div className="mt-6">
          <AdditionalCostsManager
            entityId={invoice.booking.id}
            entityType="order"
            readonly={false}
            onTotalChange={handleAdditionalCostsChange}
          />
        </div>
      )}

    </div>
  );
}
