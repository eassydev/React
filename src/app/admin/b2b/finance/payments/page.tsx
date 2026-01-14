'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Filter,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Loader2,
  Upload,
  Wallet,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRightLeft
} from 'lucide-react';
import { fetchB2BPayments, fetchB2BCustomers, fetchB2BPaymentsSummary, B2BPayment, B2BPaymentsSummary } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AllPaymentsPage() {
  const [payments, setPayments] = useState<B2BPayment[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Filters
  const [filters, setFilters] = useState({
    customerId: '',
    verificationStatus: '',
    startDate: '',
    endDate: '',
    search: '', // ✅ NEW: Search filter
    page: 1,
    limit: 20,
  });

  const [exporting, setExporting] = useState(false); // ✅ NEW: Export loading state
  const [showUnallocatedOnly, setShowUnallocatedOnly] = useState(false); // ✅ Drill-down filter for unallocated

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadPayments();
    loadSummary();
  }, [filters, showUnallocatedOnly]);

  const [summary, setSummary] = useState<B2BPaymentsSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

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
      console.error('Failed to load customers:', error);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params: any = { ...filters };
      if (showUnallocatedOnly) {
        params.unallocatedOnly = true;
      }

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await fetchB2BPayments(params);
      setPayments(response.data || []);
      setPagination(response.pagination || { total: 0, page: 1, totalPages: 1 });
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

  const loadSummary = async () => {
    try {
      setSummaryLoading(true);
      const params: any = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const data = await fetchB2BPaymentsSummary(params);
      setSummary(data);
    } catch (error: any) {
      console.error('Failed to load summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      pending: { variant: 'outline', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      verified: { variant: 'outline', className: 'bg-green-50 text-green-700 border-green-200' },
      rejected: { variant: 'outline', className: 'bg-red-50 text-red-700 border-red-200' },
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // ✅ NEW: Handle export to CSV/XLSX
  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      setExporting(true);

      const params = new URLSearchParams();
      params.append('format', format);
      if (filters.customerId) params.append('customerId', filters.customerId);
      if (filters.verificationStatus) params.append('verificationStatus', filters.verificationStatus);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);

      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eassylife.in';

      const response = await fetch(`${API_BASE_URL}/b2b/finance/payments/export?${params.toString()}`, {
        method: 'GET',
        headers: {
          'admin-auth-token': token || '',
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments_export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: `Payments exported to ${format.toUpperCase()} file`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export payments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Payments</h1>
            <p className="text-gray-600 mt-1">View and manage all B2B payments</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={exporting}
            >
              {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('xlsx')}
              disabled={exporting}
            >
              {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
              Export Excel
            </Button>
            <Button asChild>
              <Link href="/admin/b2b/finance/payments/record">
                Record Payment
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/b2b/finance/payments/bulk-upload">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Received</p>
                  <p className="text-2xl font-bold text-green-600">
                    {summaryLoading ? '...' : `₹${(summary?.total_received.value || 0).toLocaleString()}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {summaryLoading ? '' : `${summary?.total_received.count || 0} payments`}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Allocated</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {summaryLoading ? '...' : `₹${(summary?.total_allocated.value || 0).toLocaleString()}`}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-300"
            onClick={() => {
              const newValue = !showUnallocatedOnly;
              setShowUnallocatedOnly(newValue);
              if (newValue) {
                setFilters(prev => ({ ...prev, page: 1 }));
              }
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Yet to Allocate {showUnallocatedOnly && <span className="text-orange-600">(Filtered)</span>}
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {summaryLoading ? '...' : `₹${(summary?.total_unallocated.value || 0).toLocaleString()}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click to {showUnallocatedOnly ? 'show all' : 'filter'}
                  </p>
                </div>
                <ArrowRightLeft className="h-8 w-8 text-orange-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Verification</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {summaryLoading ? '...' : `₹${(summary?.pending_verification.value || 0).toLocaleString()}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {summaryLoading ? '' : `${summary?.pending_verification.count || 0} payments`}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {summaryLoading ? '...' : `₹${(summary?.rejected.value || 0).toLocaleString()}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {summaryLoading ? '' : `${summary?.rejected.count || 0} payments`}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* ✅ NEW: Search Bar */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Transaction ref, notes..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    className="pl-10"
                  />
                </div>
              </div>
              {/* Customer Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer</label>
                <Select
                  value={filters.customerId || "all_customers"}
                  onValueChange={(value) => setFilters({ ...filters, customerId: value === "all_customers" ? "" : value, page: 1 })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_customers">All Customers</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.verificationStatus || "all_statuses"}
                  onValueChange={(value) => setFilters({ ...filters, verificationStatus: value === "all_statuses" ? "" : value, page: 1 })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_statuses">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(filters.customerId || filters.verificationStatus || filters.startDate || filters.endDate || filters.search) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ customerId: '', verificationStatus: '', startDate: '', endDate: '', search: '', page: 1, limit: 20 })}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Payments ({pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading payments...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No payments found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment Received Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Transaction Ref</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Allocated</TableHead>
                        <TableHead>Unallocated</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Bank Statement</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            {payment.customer?.company_name || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-blue-600 font-medium">
                            {payment.transaction_ref || '-'}
                          </TableCell>
                          <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                          <TableCell>₹{payment.allocated_amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={payment.unallocated_amount > 0 ? 'text-orange-600 font-semibold' : ''}>
                              ₹{payment.unallocated_amount.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="capitalize">
                            {payment.payment_mode.replace('_', ' ')}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.verification_status)}</TableCell>
                          <TableCell>
                            {payment.bank_statement_path ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(payment.bank_statement_path, '_blank')}
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {payment.verification_status === 'verified' && payment.unallocated_amount > 0 && (
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/admin/b2b/finance/payments/${payment.id}/allocate`}>
                                  Allocate
                                </Link>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                        disabled={filters.page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                        disabled={filters.page === pagination.totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

