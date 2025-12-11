'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Download, Eye, FileText, Filter, Loader2, RefreshCw, Trash } from 'lucide-react';
import { fetchB2BInvoices, downloadB2BInvoice, regenerateB2BInvoicePDF, deleteB2BInvoice } from '@/lib/api';
import { toast } from "@/components/ui/use-toast"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface B2BInvoice {
  id: string;
  invoice_number: string;
  invoice_type: 'standard' | 'consolidated' | 'partial' | 'advance' | 'credit_note'; // ✅ NEW
  booking?: {
    order_number: string;
    service_name: string;
    customer: {
      company_name: string;
      contact_person: string;
    };
  } | null; // ✅ CHANGED: Nullable for consolidated invoices
  orderLinks?: Array<{ // ✅ NEW: For consolidated invoices
    booking: {
      order_number: string;
      service_name: string;
      customer: {
        company_name: string;
        contact_person: string;
      };
    };
    billed_amount: number;
  }>;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number; // ✅ NEW
  outstanding_amount: number; // ✅ NEW
  payment_status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  invoice_file_path?: string;
  created_at: string;
  billing_period_start?: string; // ✅ NEW: For consolidated invoices
  billing_period_end?: string; // ✅ NEW: For consolidated invoices
}

// Component that uses search params - needs to be wrapped in Suspense
function B2BInvoicesContent() {
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<B2BInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // ✅ Initialize search term from URL parameter on component mount
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search');
    console.log('🔍 URL search parameter detected:', urlSearchTerm);
    if (urlSearchTerm) {
      console.log('🔍 Setting search term and fetching invoices with:', urlSearchTerm);
      setSearchTerm(urlSearchTerm);
      // Force a fetch with the search term immediately
      fetchInvoicesWithSearch(urlSearchTerm);
    }
  }, [searchParams]);

  const fetchInvoicesWithSearch = async (searchValue = searchTerm) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching invoices with search value:', searchValue);
      const data = await fetchB2BInvoices(
        currentPage,
        10,
        paymentStatusFilter || 'all',
        dateFromFilter,
        dateToFilter,
        searchValue
      );

      // Ensure we have valid data structure
      if (data && data.data) {
        setInvoices(data.data.invoices || []);
        setTotalPages(data.data.pagination?.total_pages || 1);
        setTotalRecords(data.data.pagination?.total_records || 0);
      } else {
        // Fallback to empty state if data structure is unexpected
        setInvoices([]);
        setTotalPages(1);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      // Set empty state on error
      setInvoices([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // Alias for backward compatibility
  const fetchInvoices = () => fetchInvoicesWithSearch();

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, searchTerm, paymentStatusFilter, dateFromFilter, dateToFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePaymentStatusFilter = (value: string) => {
    setPaymentStatusFilter(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    // ✅ Prevent multiple downloads
    if (downloadingId === invoiceId) return;

    try {
      setDownloadingId(invoiceId);
      console.log('🔽 Downloading invoice:', invoiceId);

      // Find the invoice from the current list to get the direct S3 URL
      const invoice = invoices.find(inv => inv.id === invoiceId);

      if (!invoice || !invoice.invoice_file_path) {
        throw new Error('Invoice file not found');
      }

      // ✅ SIMPLE: Just open the direct S3 URL (it's already public-read)
      window.open(invoice.invoice_file_path, '_blank');

      toast({
        title: "Download Started",
        description: "PDF download has been initiated",
      });

      console.log('✅ Download initiated successfully');
    } catch (error) {
      console.error('❌ Error downloading invoice:', error);
      toast({
        title: "Error",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  // ✅ FIXED: Use centralized API function instead of direct fetch
  const handleRetryPDF = async (invoiceId: string) => {
    // ✅ Prevent multiple regeneration requests
    if (regeneratingId === invoiceId) return;

    try {
      setRegeneratingId(invoiceId);

      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your invoice PDF...",
      });

      // ✅ Use centralized API function from api.tsx
      const response = await regenerateB2BInvoicePDF(invoiceId);

      if (response.success) {
        toast({
          title: "PDF Generated Successfully",
          description: "Invoice PDF has been generated and is now available for download",
        });

        // Refresh the invoices list to show updated PDF status
        fetchInvoices();
      } else {
        toast({
          title: "PDF Generation Failed",
          description: response.message || "Failed to generate PDF",
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
      setRegeneratingId(null);
    }
  };



  const handleDeleteInvoice = async (invoiceId: string) => {
    if (deletingId === invoiceId) return;
    try {
      setDeletingId(invoiceId);
      const response = await deleteB2BInvoice(invoiceId);
      if (response.success) {
        toast({
          title: 'Success',
          description: `${response.message}`,
          variant: 'default'
        });
        fetchInvoices();
      } else {
        toast({
          title: 'Error',
          description: `Failed to delete invoice ${response.message}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete invoice ${error}`,
        variant: 'destructive'
      });
    }
  };

  // ✅ NEW: Helper to get invoice type badge
  const getInvoiceTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      standard: 'bg-blue-100 text-blue-800',
      consolidated: 'bg-purple-100 text-purple-800',
      partial: 'bg-orange-100 text-orange-800',
      advance: 'bg-teal-100 text-teal-800',
      credit_note: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      standard: 'Standard',
      consolidated: 'Consolidated',
      partial: 'Partial',
      advance: 'Advance',
      credit_note: 'Credit Note',
    };

    return (
      <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>
        {labels[type] || type}
      </Badge>
    );
  };

  // ✅ NEW: Helper to get customer info from invoice
  const getCustomerInfo = (invoice: B2BInvoice) => {
    // For standard/partial invoices, use booking.customer
    if (invoice.booking?.customer) {
      return invoice.booking.customer;
    }
    // For consolidated invoices, use first order's customer
    if (invoice.orderLinks && invoice.orderLinks.length > 0) {
      return invoice.orderLinks[0].booking.customer;
    }
    return { company_name: 'N/A', contact_person: '' };
  };

  // ✅ NEW: Helper to get order info from invoice
  const getOrderInfo = (invoice: B2BInvoice) => {
    if (invoice.invoice_type === 'consolidated') {
      const orderCount = invoice.orderLinks?.length || 0;
      return `${orderCount} Orders`;
    }
    return invoice.booking?.order_number || 'N/A';
  };

  // ✅ NEW: Helper to get service info from invoice
  const getServiceInfo = (invoice: B2BInvoice) => {
    if (invoice.invoice_type === 'consolidated') {
      const orderCount = invoice.orderLinks?.length || 0;
      return `Consolidated (${orderCount} services)`;
    }
    return invoice.booking?.service_name || 'N/A';
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      unpaid: 'secondary',
      partial: 'default',
      paid: 'default',
      overdue: 'destructive',
    };

    const colors: Record<string, string> = {
      unpaid: 'bg-gray-100 text-gray-800',
      partial: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">B2B Invoices</h1>
            <p className="text-gray-600 mt-1">Manage B2B invoices and payments</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by invoice number, company name..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={paymentStatusFilter || 'all'} onValueChange={handlePaymentStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-40">
                <Input
                  type="date"
                  placeholder="From Date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
              </div>
              <div className="w-full md:w-40">
                <Input
                  type="date"
                  placeholder="To Date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Showing {invoices.length} of {totalRecords} invoices</span>
          <div className="flex space-x-4">
            <span>Total Value: {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0))}</span>
          </div>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Type</TableHead> {/* ✅ NEW */}
                      <TableHead>Customer</TableHead>
                      <TableHead>Order #</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Invoice Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid/Outstanding</TableHead> {/* ✅ NEW */}
                      <TableHead>Payment Status</TableHead>
                      <TableHead>PDF Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices && invoices.length > 0 ? invoices.map((invoice) => {
                      const customer = getCustomerInfo(invoice);
                      return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoice_number}
                        </TableCell>
                        {/* ✅ NEW: Invoice Type */}
                        <TableCell>
                          {getInvoiceTypeBadge(invoice.invoice_type)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.company_name}</div>
                            <div className="text-sm text-gray-500">{customer.contact_person}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getOrderInfo(invoice)}</TableCell>
                        <TableCell>{getServiceInfo(invoice)}</TableCell>
                        <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                        <TableCell>
                          <div className={new Date(invoice.due_date) < new Date() && invoice.payment_status !== 'paid' ? 'text-red-600 font-medium' : ''}>
                            {formatDate(invoice.due_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{formatCurrency(invoice.total_amount || 0)}</div>
                            <div className="text-sm text-gray-500">
                              Subtotal: {formatCurrency(invoice.subtotal || 0)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Tax: {formatCurrency(invoice.tax_amount || 0)}
                            </div>
                          </div>
                        </TableCell>
                        {/* ✅ NEW: Paid/Outstanding */}
                        <TableCell>
                          <div>
                            <div className="text-sm text-green-600">
                              Paid: {formatCurrency(invoice.paid_amount || 0)}
                            </div>
                            <div className="text-sm text-orange-600 font-medium">
                              Due: {formatCurrency(invoice.outstanding_amount || 0)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getPaymentStatusBadge(invoice.payment_status)}</TableCell>

                        {/* ✅ PDF Status Column */}
                        <TableCell>
                          {invoice.invoice_file_path ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              PDF Ready
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                              PDF Missing
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link href={`/admin/b2b/invoices/${invoice.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>

                            {/* Download Button - only show if PDF exists */}
                            {invoice.invoice_file_path ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadInvoice(invoice.id)}
                                disabled={downloadingId === invoice.id}
                                title={downloadingId === invoice.id ? "Downloading..." : "Download Invoice PDF"}
                              >
                                {downloadingId === invoice.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRetryPDF(invoice.id)}
                                disabled={regeneratingId === invoice.id}
                                title={regeneratingId === invoice.id ? "Generating PDF..." : "Generate PDF"}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                {regeneratingId === invoice.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              disabled={deletingId === invoice.id}
                              title={deletingId === invoice.id ? "Deleting..." : "Delete Invoice"}
                              className="text-red-600 hover:text-red-700"
                            >
                              {deletingId === invoice.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                          {loading ? 'Loading invoices...' : 'No invoices found'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 py-2 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function B2BInvoicesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading invoices...</p>
          </div>
        </div>
      </div>
    }>
      <B2BInvoicesContent />
    </Suspense>
  );
}
