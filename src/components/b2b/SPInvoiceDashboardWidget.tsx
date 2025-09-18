'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Check, 
  X, 
  Edit, 
  Upload, 
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { fetchSPInvoiceStats, SPInvoiceStats } from '@/lib/api';

const SPInvoiceDashboardWidget: React.FC = () => {
  const [stats, setStats] = useState<SPInvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchSPInvoiceStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching SP invoice stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            SP Invoice Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            SP Invoice Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>{error || 'No data available'}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStats}
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { status_summary, financial_summary } = stats;
  const totalInvoices = Object.values(status_summary).reduce((sum, count) => sum + count, 0);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            SP Invoice Status
          </div>
          <Badge variant="outline" className="text-xs">
            {totalInvoices} Total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Summary Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/admin/b2b/sp-invoices?status=pending">
            <div className="p-3 rounded-lg border hover:bg-orange-50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {status_summary.pending}
                  </p>
                </div>
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Link>

          <Link href="/admin/b2b/sp-invoices?status=approved">
            <div className="p-3 rounded-lg border hover:bg-green-50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {status_summary.approved}
                  </p>
                </div>
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Link>

          <Link href="/admin/b2b/sp-invoices?status=needs_revision">
            <div className="p-3 rounded-lg border hover:bg-yellow-50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revision</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {status_summary.needs_revision}
                  </p>
                </div>
                <Edit className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Link>

          <Link href="/admin/b2b/sp-invoices?status=rejected">
            <div className="p-3 rounded-lg border hover:bg-red-50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {status_summary.rejected}
                  </p>
                </div>
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Link>
        </div>

        {/* Financial Summary */}
        <div className="pt-3 border-t">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pending Amount:</span>
              <span className="font-medium text-orange-600">
                {formatCurrency(financial_summary.total_pending_amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Approved Amount:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(financial_summary.total_approved_amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Avg Invoice:</span>
              <span className="font-medium">
                {formatCurrency(financial_summary.avg_invoice_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t">
          <div className="flex gap-2">
            <Link href="/admin/b2b/sp-invoices" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Upload className="w-4 h-4 mr-1" />
                Manage All
              </Button>
            </Link>
            {status_summary.pending > 0 && (
              <Link href="/admin/b2b/sp-invoices?status=pending" className="flex-1">
                <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                  <Clock className="w-4 h-4 mr-1" />
                  Review ({status_summary.pending})
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Priority Alert */}
        {status_summary.pending > 5 && (
          <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-medium">
                High volume of pending invoices requires attention
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SPInvoiceDashboardWidget;
