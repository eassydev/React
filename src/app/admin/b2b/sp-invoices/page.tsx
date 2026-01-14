'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Eye,
  Check,
  X,
  Edit,
  Clock,
  FileText,
  Download,
  Search,
  Filter,
  Upload,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  fetchSPInvoices,
  fetchSPInvoiceStats,
  fetchSPInvoiceById,
  approveSPInvoice,
  rejectSPInvoice,
  requestSPInvoiceRevision,
  SPInvoice,
  SPInvoiceStats,
  SPInvoiceFilters
} from '@/lib/api';

export default function SPInvoicesPage() {
  const [invoices, setInvoices] = useState<SPInvoice[]>([]);
  const [stats, setStats] = useState<SPInvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<SPInvoice | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  // Filters
  const [filters, setFilters] = useState<SPInvoiceFilters>({
    status: 'all',
    search: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    fetchInvoicesData();
    // fetchStatsData();
  }, [filters]);

  const fetchInvoicesData = async () => {
    try {
      setLoading(true);
      const response = await fetchSPInvoices(filters);

      if (response.success) {
        setInvoices(response.data.invoices);
      }
    } catch (error) {
      console.error('Error fetching SP invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch SP invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatsData = async () => {
    try {
      const response = await fetchSPInvoiceStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewInvoice = async (invoice: SPInvoice) => {
    try {
      // Fetch detailed invoice data with file URL
      const response = await fetchSPInvoiceById(invoice.id);
      if (response.success) {
        setSelectedInvoice(response.data.invoice);
        setAdminNotes(response.data.invoice.admin_notes || '');
        setReviewModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      toast({
        title: "Error",
        description: "Failed to load invoice details",
        variant: "destructive",
      });
    }
  };

  const handleInvoiceAction = async (action: 'approve' | 'reject' | 'request-revision', additionalData?: any) => {
    if (!selectedInvoice) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      
      let response;

      if (action === 'approve') {
        response = await axios.post(
          `${BASE_URL}/b2b/sp-invoices/approval`,
          { id: selectedInvoice.id,
            adminNotes :adminNotes,
           },
          {
            headers: {
              'admin-auth-token': token
            }
          }
        );
      } else {
        const payload = {
          admin_notes: adminNotes,
          ...additionalData
        };

        response = await axios.post(
          `${BASE_URL}/b2b/sp-invoices/${selectedInvoice.id}/${action}`,
          payload,
          {
            headers: {
              'admin-auth-token': token
            }
          }
        );
      }

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Invoice ${action.replace('-', ' ')}d successfully`,
        });
        setReviewModalOpen(false);
        fetchInvoicesData();
        fetchStatsData();
      }
    } catch (error) {
      console.error(`Error ${action}ing invoice:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action.replace('-', ' ')} invoice`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending Review', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'Approved', variant: 'default' as const, icon: Check },
      rejected: { label: 'Rejected', variant: 'destructive' as const, icon: X },
      needs_revision: { label: 'Needs Revision', variant: 'outline' as const, icon: Edit }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SP Invoice Management</h1>
          <p className="text-muted-foreground">
            Review and manage service provider uploaded invoices
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.status_summary.pending}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.status_summary.approved}
                  </p>
                </div>
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Needs Revision</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.status_summary.needs_revision}
                  </p>
                </div>
                <Edit className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pending Amount</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.financial_summary.total_pending_amount)}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by order number, customer, or provider..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
            >
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="needs_revision">Needs Revision</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>SP Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Invoice Details</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading invoices...
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.booking.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.booking.service_name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.booking.customer.company_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.booking.customer.contact_person}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">
                        {invoice.provider.company_name || invoice.provider.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {invoice.invoice_number || 'No number provided'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Invoice File
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(invoice.invoice_amount)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.approval_status)}
                    </TableCell>
                    <TableCell>
                      {formatDate(invoice.uploaded_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review SP Invoice</DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice File Viewer */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Invoice File</h3>
                {selectedInvoice.file_url ? (
                  <div className="space-y-2">
                    <iframe
                      src={selectedInvoice.file_url}
                      className="w-full h-96 border rounded"
                      title="Invoice Preview"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedInvoice.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-1" />
                        Download File
                      </a>
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">File preview not available</p>
                )}
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Booking Details</h3>
                  <p><strong>Order:</strong> {selectedInvoice.booking.order_number}</p>
                  <p><strong>Service:</strong> {selectedInvoice.booking.service_name}</p>
                  <p><strong>Customer:</strong> {selectedInvoice.booking.customer.company_name}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Invoice Details</h3>
                  <p><strong>Invoice Number:</strong> {selectedInvoice.invoice_number || 'N/A'}</p>
                  <p><strong>Amount:</strong> {formatCurrency(selectedInvoice.invoice_amount)}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedInvoice.approval_status)}</p>
                </div>
              </div>

              {/* SP Notes */}
              {selectedInvoice.sp_notes && (
                <div>
                  <h3 className="font-semibold mb-2">SP Notes</h3>
                  <p className="text-sm bg-muted p-3 rounded">{selectedInvoice.sp_notes}</p>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <h3 className="font-semibold mb-2">Admin Notes</h3>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add your review notes..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              {selectedInvoice.approval_status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleInvoiceAction('approve')}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  
                  <Button
                    onClick={() => handleInvoiceAction('request-revision', {
                      revision_reason: 'Please review and resubmit'
                    })}
                    disabled={actionLoading}
                    variant="outline"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Request Revision
                  </Button>
                  
                  <Button
                    onClick={() => handleInvoiceAction('reject', {
                      reason: 'Invoice rejected'
                    })}
                    disabled={actionLoading}
                    variant="destructive"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
