'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  FileText, 
  Download, 
  TrendingUp, 
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { 
  fetchB2BCustomers, 
  fetchCustomerStatement,
  fetchCustomerFinanceSummary,
  B2BCustomerFinanceSummary 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function CustomerStatementsPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<B2BCustomerFinanceSummary | null>(null);
  const [statement, setStatement] = useState<any>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      // ✅ Load ALL customers for dropdown (set high limit to get all)
      const response = await fetchB2BCustomers({
        status: 'active',
        page: 1,
        limit: 1000 // High limit to get all active customers
      });
      setCustomers(response.data?.customers || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive',
      });
    }
  };

  const loadStatement = async () => {
    if (!selectedCustomer) {
      toast({
        title: 'Validation Error',
        description: 'Please select a customer',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Load summary
      const summaryResponse = await fetchCustomerFinanceSummary(selectedCustomer);
      setSummary(summaryResponse.data);

      // Load statement
      // ✅ FIX: Pass dates only if they're not empty strings
      const statementResponse = await fetchCustomerStatement(
        selectedCustomer,
        startDate || undefined,
        endDate || undefined
      );
      setStatement(statementResponse.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load statement',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      unpaid: { variant: 'outline', className: 'bg-red-50 text-red-700 border-red-200' },
      partial: { variant: 'outline', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      paid: { variant: 'outline', className: 'bg-green-50 text-green-700 border-green-200' },
      overdue: { variant: 'outline', className: 'bg-red-50 text-red-700 border-red-200' },
    };

    const config = variants[status] || variants.unpaid;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getVerificationBadge = (status: string) => {
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
            <h1 className="text-3xl font-bold text-gray-900">Customer Statements</h1>
            <p className="text-gray-600 mt-1">View customer financial statements and summaries</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Select Customer & Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">
                  Customer <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
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

              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date (Optional)</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date (Optional)</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={loadStatement} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Load Statement
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Unbilled Orders */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Unbilled Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {summary.unbilled_orders_count || 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Amount: ₹{(summary.unbilled_orders_amount || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* Outstanding Invoices */}
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Outstanding Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {summary.outstanding_invoices_count || 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Amount: ₹{(summary.outstanding_invoices_amount || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* Total Receivable */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                  Total Receivable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ₹{(summary.total_receivable || 0).toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Unbilled + Outstanding
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Statement Tables */}
        {statement && (
          <>
            {/* Invoices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Invoices ({statement.invoices?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!statement.invoices || statement.invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No invoices found for the selected period</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Invoice Number</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Paid Amount</TableHead>
                          <TableHead>Outstanding</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statement.invoices.map((invoice: any) => (
                          <TableRow key={invoice.id}>
                            <TableCell>
                              {new Date(invoice.invoice_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium">
                              {invoice.invoice_number}
                            </TableCell>
                            <TableCell className="capitalize">
                              {invoice.invoice_type}
                            </TableCell>
                            <TableCell>₹{invoice.total_amount?.toLocaleString() || 0}</TableCell>
                            <TableCell>₹{invoice.paid_amount?.toLocaleString() || 0}</TableCell>
                            <TableCell className="font-semibold text-orange-600">
                              ₹{invoice.outstanding_amount?.toLocaleString() || 0}
                            </TableCell>
                            <TableCell>{getPaymentStatusBadge(invoice.payment_status)}</TableCell>
                            <TableCell>
                              {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Payments ({statement.payments?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!statement.payments || statement.payments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No payments found for the selected period</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Allocated</TableHead>
                          <TableHead>Unallocated</TableHead>
                          <TableHead>Mode</TableHead>
                          <TableHead>Transaction Ref</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statement.payments.map((payment: any) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              {new Date(payment.payment_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-semibold">
                              ₹{payment.amount?.toLocaleString() || 0}
                            </TableCell>
                            <TableCell>
                              ₹{payment.allocated_amount?.toLocaleString() || 0}
                            </TableCell>
                            <TableCell className="text-orange-600">
                              ₹{payment.unallocated_amount?.toLocaleString() || 0}
                            </TableCell>
                            <TableCell className="capitalize">
                              {payment.payment_mode?.replace('_', ' ')}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {payment.transaction_ref || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {getVerificationBadge(payment.verification_status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!summary && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Statement Loaded
              </h3>
              <p className="text-gray-600">
                Select a customer and click "Load Statement" to view their financial details
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

