'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp,
  FileText,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { fetchFinanceDashboard, B2BFinanceDashboard, B2BPayment } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function FinanceDashboardPage() {
  const [dashboard, setDashboard] = useState<B2BFinanceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await fetchFinanceDashboard();
      setDashboard(data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
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
            <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor payments, invoices, and outstanding amounts</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/b2b/finance/payments/record">
                <CreditCard className="w-4 h-4 mr-2" />
                Record Payment
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/b2b/finance/invoices/generate">
                <FileText className="w-4 h-4 mr-2" />
                Generate Invoice
              </Link>
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pending Verification */}
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                Pending Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {dashboard?.pending_verification || 0}
              </div>
              <p className="text-sm text-gray-500 mt-1">Payments awaiting verification</p>
              <Button asChild variant="link" className="mt-2 p-0 h-auto">
                <Link href="/admin/b2b/finance/payments/verify">
                  Review Now <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Unallocated Payments */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-blue-500" />
                Unallocated Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {dashboard?.unallocated_payments?.count || 0}
              </div>
              <p className="text-sm text-gray-500 mt-1">Verified but not allocated</p>
              <Button asChild variant="link" className="mt-2 p-0 h-auto">
                <Link href="/admin/b2b/finance/payments?status=verified&unallocated=true">
                  View Details <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Overdue Invoices */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                Overdue Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {dashboard?.overdue_invoices || 0}
              </div>
              <p className="text-sm text-gray-500 mt-1">Past due date</p>
              <Button asChild variant="link" className="mt-2 p-0 h-auto text-red-600">
                <Link href="/admin/b2b/invoices?status=overdue">
                  View Overdue <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Total Outstanding */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                Total Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                ₹{(dashboard?.total_outstanding || 0).toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">Across all customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Unallocated Payments List */}
        {dashboard?.unallocated_payments && dashboard.unallocated_payments.count > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Unallocated Payments - Action Required</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard.unallocated_payments.payments.map((payment: B2BPayment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {payment.customer?.company_name || 'Unknown Customer'}
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {payment.payment_mode?.replace('_', ' ') || 'N/A'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Amount: ₹{payment.amount.toLocaleString()} |
                        Unallocated: ₹{payment.unallocated_amount.toLocaleString()} |
                        Date: {new Date(payment.payment_date).toLocaleDateString()}
                      </div>
                      {payment.transaction_ref && (
                        <div className="text-xs text-gray-500 mt-1">
                          Ref: {payment.transaction_ref}
                        </div>
                      )}
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/admin/b2b/finance/payments/${payment.id}/allocate`}>
                        Allocate Now
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

