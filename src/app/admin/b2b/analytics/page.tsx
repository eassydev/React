'use client';

import React, { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Package,
  Clock,
  CheckCircle
} from 'lucide-react';
import B2BMetricCard from '@/components/b2b/B2BMetricCard';
import B2BPaymentCollectionChart from '@/components/b2b/B2BPaymentCollectionChart';
import B2BTopCustomersTable from '@/components/b2b/B2BTopCustomersTable';
import AnalyticsExportPanel from '@/components/b2b/AnalyticsExportPanel';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  getB2BAnalyticsDashboard,
  B2BDashboardData
} from '@/lib/api';

const formatCurrency = (value: number): string => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(2)}K`;
  }
  return `₹${value.toFixed(0)}`;
};

export default function B2BAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<B2BDashboardData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [userRole, setUserRole] = useState<string>('');

  const fetchDashboard = async () => {
    setLoading(true);

    try {
      const startDate = dateRange?.from?.toISOString().split('T')[0];
      const endDate = dateRange?.to?.toISOString().split('T')[0];

      const dashboardData = await getB2BAnalyticsDashboard(startDate, endDate);
      setData(dashboardData);
    } catch (err: any) {
      console.error('Dashboard error:', err);
      toast.error(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [dateRange]);

  // Get user role from localStorage or API response
  useEffect(() => {
    try {
      const adminInfoStr = localStorage.getItem('adminInfo');
      if (adminInfoStr) {
        const adminInfo = JSON.parse(adminInfoStr);
        // Normalize role name: "Super Admin" -> "super_admin", "Manager" -> "manager", "SPOC" -> "spoc"
        const normalizedRole = adminInfo.role?.toLowerCase().replace(/\s+/g, '_') || '';
        setUserRole(normalizedRole);
        console.log('📊 Analytics - User role:', normalizedRole);
      }
    } catch (error) {
      console.error('Error parsing adminInfo:', error);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">B2B Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your B2B business performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DateRangePicker
            selectedRange={dateRange}
            onChangeRange={setDateRange}
          />
        </div>
      </div>
      {/* Analytics Export Panel */}
      <AnalyticsExportPanel userRole={userRole} />
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <B2BMetricCard
          title="Total Customers"
          value={data.overall_metrics.customers.total}
          subtitle={`${data.overall_metrics.customers.active} active`}
          icon={<Users className="h-4 w-4" />}
        />

        <B2BMetricCard
          title="Total Revenue"
          value={formatCurrency(data.overall_metrics.revenue)}
          subtitle={`From ${data.overall_metrics.orders_completed.count} completed orders`}
          icon={<DollarSign className="h-4 w-4" />}
        />

        <B2BMetricCard
          title="Gross Margin"
          value={formatCurrency(data.overall_metrics.profit.total)}
          subtitle={`${data.overall_metrics.profit.avg_margin_percentage}% avg margin`}
          icon={<TrendingUp className="h-4 w-4" />}
          valueClassName="text-green-600"
        />

        <B2BMetricCard
          title="Orders Received"
          value={data.overall_metrics.orders_received.count}
          subtitle={formatCurrency(data.overall_metrics.orders_received.total_value)}
          icon={<ShoppingCart className="h-4 w-4" />}
        />


      </div>

      {/* Secondary Metrics */}
      <B2BMetricCard
        title="Orders Received Amount"
        value={formatCurrency(data.overall_metrics.orders_received.total_value)}
        subtitle={"orders recieved amount"}
        icon={<ShoppingCart className="h-4 w-4" />}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <B2BMetricCard
          title="Outstanding Orders"
          value={data.overall_metrics.outstanding_orders.count}
          subtitle={formatCurrency(data.overall_metrics.outstanding_orders.total_value)}
          icon={<Clock className="h-4 w-4" />}
        />

        <B2BMetricCard
          title="Completed Orders"
          value={data.overall_metrics.orders_completed.count}
          subtitle={formatCurrency(data.overall_metrics.orders_completed.total_value)}
          icon={<CheckCircle className="h-4 w-4" />}
        />

        <B2BMetricCard
          title="Overdue Payments"
          value={formatCurrency(data.overall_metrics.payment_collection.overdue)}
          subtitle="Requires immediate attention"
          icon={<AlertCircle className="h-4 w-4" />}
          alert={data.overall_metrics.payment_collection.overdue > 0}
        />
      </div>

      {/* Payment Collection Chart */}
      <B2BPaymentCollectionChart
        data={data.overall_metrics.payment_collection}
      />

      {/* Top Performers Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <B2BTopCustomersTable
          title="Top Customers by Revenue"
          data={data.top_performers.by_revenue}
          metric="revenue"
        />

        <B2BTopCustomersTable
          title="Top Customers by Margin"
          data={data.top_performers.by_profit}
          metric="profit"
        />

        <B2BTopCustomersTable
          title="Top Customers by Orders"
          data={data.top_performers.by_orders}
          metric="orders"
        />
      </div>

      <Separator />
    </div>
  );
}

