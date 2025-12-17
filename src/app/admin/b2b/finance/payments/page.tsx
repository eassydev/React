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
  ChevronRight
} from 'lucide-react';
import { fetchB2BPayments, fetchB2BCustomers, B2BPayment } from '@/lib/api';
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
    page: 1,
    limit: 20,
  });

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
  }, [filters]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Payments</h1>
            <p className="text-gray-600 mt-1">View and manage all B2B payments</p>
          </div>
          <Button asChild>
            <Link href="/admin/b2b/finance/payments/record">
              Record Payment
            </Link>
          </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            {(filters.customerId || filters.verificationStatus || filters.startDate || filters.endDate) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ customerId: '', verificationStatus: '', startDate: '', endDate: '', page: 1, limit: 20 })}
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
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
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

