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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import {
  getB2BAnalyticsDashboard,
  B2BDashboardData
  B2BDashboardData
} from '@/lib/api';

const formatCurrency = (value: number | undefined | null): string => {
  // Handle undefined, null, or NaN values
  if (value === undefined || value === null || isNaN(value)) {
    return '₹0';
  }

  const numValue = Number(value);

  if (numValue >= 10000000) {
    return `₹${(numValue / 10000000).toFixed(2)}Cr`;
  } else if (numValue >= 100000) {
    return `₹${(numValue / 100000).toFixed(2)}L`;
  } else if (numValue >= 1000) {
    return `₹${(numValue / 1000).toFixed(2)}K`;
const formatCurrency = (value: number | undefined | null): string => {
  // Handle undefined, null, or NaN values
  if (value === undefined || value === null || isNaN(value)) {
    return '₹0';
  }

  const numValue = Number(value);

  if (numValue >= 10000000) {
    return `₹${(numValue / 10000000).toFixed(2)}Cr`;
  } else if (numValue >= 100000) {
    return `₹${(numValue / 100000).toFixed(2)}L`;
  } else if (numValue >= 1000) {
    return `₹${(numValue / 1000).toFixed(2)}K`;
  }
  return `₹${numValue.toFixed(0)}`;
  return `₹${numValue.toFixed(0)}`;
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

      // Log key metrics for debugging
      console.log('📊 B2B Analytics Dashboard Data:');
      console.log('Billed Orders:', dashboardData.overall_metrics.billed_orders);
      console.log('Collections:', dashboardData.overall_metrics.collections);
      console.log('Outstanding Amount:', dashboardData.overall_metrics.outstanding_amount);

      // Log key metrics for debugging
      console.log('📊 B2B Analytics Dashboard Data:');
      console.log('Billed Orders:', dashboardData.overall_metrics.billed_orders);
      console.log('Collections:', dashboardData.overall_metrics.collections);
      console.log('Outstanding Amount:', dashboardData.overall_metrics.outstanding_amount);
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

      <Tabs defaultValue="card" className="w-full">
        <TabsList className="grid w-[200px] grid-cols-2">
          <TabsTrigger value="card">Card</TabsTrigger>
          <TabsTrigger value="sheet">Sheet</TabsTrigger>
        </TabsList>

        <TabsContent value="card" className="space-y-6 mt-6">
          {/* Analytics Export Panel */}
          <AnalyticsExportPanel userRole={userRole} />

          {/* Section 1: Customer & Key Metrics */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Customer Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <B2BMetricCard
                title="Total Customers"
                value={data.overall_metrics.customers?.total || 0}
                subtitle={`${data.overall_metrics.customers?.active || 0} active`}
                icon={<Users className="h-4 w-4" />}
              />

              <B2BMetricCard
                title="Orders Received"
                value={data.overall_metrics.orders_received?.count || 0}
                subtitle={formatCurrency(data.overall_metrics.orders_received?.total_value)}
                icon={<ShoppingCart className="h-4 w-4" />}
              />

              <B2BMetricCard
                title="GOV - B2B"
                value={formatCurrency(data.overall_metrics.gov_b2b)}
                subtitle="Gross Order Value"
                icon={<DollarSign className="h-4 w-4" />}
              />

              <B2BMetricCard
                title="Gross Margin"
                value={formatCurrency(data.overall_metrics.gross_margin?.total)}
                subtitle={`${data.overall_metrics.gross_margin?.avg_percentage || '0'}% avg margin`}
                icon={<TrendingUp className="h-4 w-4" />}
                valueClassName="text-green-600"
              />
            </div>
          </div>

          {/* Section 2: Order Lifecycle Metrics */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Order Lifecycle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <B2BMetricCard
                title="Orders Cancelled"
                value={data.overall_metrics.orders_cancelled?.count || 0}
                subtitle={formatCurrency(data.overall_metrics.orders_cancelled?.total_value)}
                icon={<AlertCircle className="h-4 w-4" />}
                valueClassName="text-red-600"
                alert={(data.overall_metrics.orders_cancelled?.count || 0) > 0}
              />

              <B2BMetricCard
                title="Net Orders"
                value={data.overall_metrics.net_orders?.count || 0}
                subtitle={formatCurrency(data.overall_metrics.net_orders?.total_value)}
                icon={<Package className="h-4 w-4" />}
              />

              <B2BMetricCard
                title="Orders Executed"
                value={data.overall_metrics.orders_executed?.count || 0}
                subtitle={formatCurrency(data.overall_metrics.orders_executed?.total_value)}
                icon={<CheckCircle className="h-4 w-4" />}
              />

              <B2BMetricCard
                title="Collections"
                value={formatCurrency(data.overall_metrics.collections?.total_value)}
                subtitle={`${data.overall_metrics.collections?.count || 0} completed & paid orders`}
                icon={<CheckCircle className="h-4 w-4" />}
                valueClassName="text-green-600"
              />
            </div>
          </div>
      <Tabs defaultValue="card" className="w-full">
        <TabsList className="grid w-[200px] grid-cols-2">
          <TabsTrigger value="card">Card</TabsTrigger>
          <TabsTrigger value="sheet">Sheet</TabsTrigger>
        </TabsList>

        <TabsContent value="card" className="space-y-6 mt-6">
          {/* Analytics Export Panel */}
          <AnalyticsExportPanel userRole={userRole} />

          {/* Section 1: Customer & Key Metrics */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Customer Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <B2BMetricCard
                title="Total Customers"
                value={data.overall_metrics.customers?.total || 0}
                subtitle={`${data.overall_metrics.customers?.active || 0} active`}
                icon={<Users className="h-4 w-4" />}
              />

              <B2BMetricCard
                title="Orders Received"
                value={data.overall_metrics.orders_received?.count || 0}
                subtitle={formatCurrency(data.overall_metrics.orders_received?.total_value)}
                icon={<ShoppingCart className="h-4 w-4" />}
              />

              <B2BMetricCard
                title="GOV - B2B"
                value={formatCurrency(data.overall_metrics.gov_b2b)}
                subtitle="Gross Order Value"
                icon={<DollarSign className="h-4 w-4" />}
              />

              <B2BMetricCard
                title="Gross Margin"
                value={formatCurrency(data.overall_metrics.gross_margin?.total)}
                subtitle={`${data.overall_metrics.gross_margin?.avg_percentage || '0'}% avg margin`}
                icon={<TrendingUp className="h-4 w-4" />}
                valueClassName="text-green-600"
              />
            </div>
          </div>

          {/* Section 2: Order Lifecycle Metrics */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Order Lifecycle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <B2BMetricCard
                title="Orders Cancelled"
                value={data.overall_metrics.orders_cancelled?.count || 0}
                subtitle={formatCurrency(data.overall_metrics.orders_cancelled?.total_value)}
                icon={<AlertCircle className="h-4 w-4" />}
                valueClassName="text-red-600"
                alert={(data.overall_metrics.orders_cancelled?.count || 0) > 0}
              />

              <B2BMetricCard
                title="Net Orders"
                value={data.overall_metrics.net_orders?.count || 0}
                subtitle={formatCurrency(data.overall_metrics.net_orders?.total_value)}
                icon={<Package className="h-4 w-4" />}
              />

              <B2BMetricCard
                title="Orders Executed"
                value={data.overall_metrics.orders_executed?.count || 0}
                subtitle={formatCurrency(data.overall_metrics.orders_executed?.total_value)}
                icon={<CheckCircle className="h-4 w-4" />}
              />

              <B2BMetricCard
                title="Collections"
                value={formatCurrency(data.overall_metrics.collections?.total_value)}
                subtitle={`${data.overall_metrics.collections?.count || 0} completed & paid orders`}
                icon={<CheckCircle className="h-4 w-4" />}
                valueClassName="text-green-600"
              />
            </div>
          </div>

          {/* Section 3: Financial Metrics */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Financial Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <B2BMetricCard
                title="Pending Orders"
                value={data.overall_metrics.pending_orders?.count || 0}
                subtitle={formatCurrency(data.overall_metrics.pending_orders?.total_value)}
                icon={<Clock className="h-4 w-4" />}
              />

              <B2BMetricCard
                title="Billed Orders"
                value={data.overall_metrics.billed_orders?.count || 0}
                subtitle={`${formatCurrency(data.overall_metrics.billed_orders?.total_value)} invoices raised`}
                icon={<Package className="h-4 w-4" />}
              />

              <B2BMetricCard
                title="Outstanding Amount"
                value={formatCurrency(data.overall_metrics.outstanding_amount)}
                subtitle="Unpaid + Overdue + Partial"
                icon={<AlertCircle className="h-4 w-4" />}
                alert={(data.overall_metrics.outstanding_amount || 0) > 0}
                valueClassName={(data.overall_metrics.outstanding_amount || 0) > 0 ? "text-orange-600" : ""}
              />

              <B2BMetricCard
                title="SP Payout"
                value={formatCurrency(data.overall_metrics.sp_payout)}
                subtitle="Paid to service providers"
                icon={<DollarSign className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Section 4: Payment Breakdown */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Payment Status Breakdown</h2>
            <B2BPaymentCollectionChart
              data={data.overall_metrics.payment_breakdown || data.overall_metrics.payment_collection || { paid: 0, pending: 0, overdue: 0, partial: 0 }}
            />
          </div>
          {/* Section 3: Financial Metrics */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Financial Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <B2BMetricCard
                title="Pending Orders"
                value={data.overall_metrics.pending_orders?.count || 0}
                subtitle={formatCurrency(data.overall_metrics.pending_orders?.total_value)}
                icon={<Clock className="h-4 w-4" />}
              />

              <B2BMetricCard
                title="Billed Orders"
                value={data.overall_metrics.billed_orders?.count || 0}
                subtitle={`${formatCurrency(data.overall_metrics.billed_orders?.total_value)} invoices raised`}
                icon={<Package className="h-4 w-4" />}
              />

              <B2BMetricCard
                title="Outstanding Amount"
                value={formatCurrency(data.overall_metrics.outstanding_amount)}
                subtitle="Unpaid + Overdue + Partial"
                icon={<AlertCircle className="h-4 w-4" />}
                alert={(data.overall_metrics.outstanding_amount || 0) > 0}
                valueClassName={(data.overall_metrics.outstanding_amount || 0) > 0 ? "text-orange-600" : ""}
              />

              <B2BMetricCard
                title="SP Payout"
                value={formatCurrency(data.overall_metrics.sp_payout)}
                subtitle="Paid to service providers"
                icon={<DollarSign className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Section 4: Payment Breakdown */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Payment Status Breakdown</h2>
            <B2BPaymentCollectionChart
              data={data.overall_metrics.payment_breakdown || data.overall_metrics.payment_collection || { paid: 0, pending: 0, overdue: 0, partial: 0 }}
            />
          </div>

          <Separator />
          <Separator />

          {/* Section 5: Top Performers */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Top Performing Customers</h2>
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
          </div>
        </TabsContent>

        <TabsContent value="sheet" className="mt-6">
          <div className="rounded-md border bg-white shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold text-lg">Dashboard Sheet View (Rs Lacs)</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-[200px] font-bold">Category</TableHead>
                  <TableHead className="font-bold">Orders Received</TableHead>
                  <TableHead className="font-bold">Orders Billed</TableHead>
                  <TableHead className="font-bold">Collections Amount</TableHead>
                  <TableHead className="font-bold">SP Payment</TableHead>
                  <TableHead className="font-bold">Gross Margin</TableHead>
                  <TableHead className="font-bold">GM %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Completed Orders */}
                <TableRow>
                  <TableCell className="font-medium">Completed Orders</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.orders_executed?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.billed_orders?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.collections?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.sp_payout)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.gross_margin?.total)}</TableCell>
                  <TableCell>{data.overall_metrics.gross_margin?.avg_percentage}%</TableCell>
                </TableRow>

                {/* Work in Progress Orders */}
                <TableRow>
                  <TableCell className="font-medium">Work in Progress Orders</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.wip_orders?.total_value)}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>

                {/* Pending Orders */}
                <TableRow>
                  <TableCell className="font-medium">Pending Orders</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.not_started_orders?.total_value)}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>

                {/* Cancelled Orders */}
                <TableRow>
                  <TableCell className="font-medium">Cancelled Orders</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.orders_cancelled?.total_value)}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>

                {/* Total Orders Received */}
                <TableRow className="bg-gray-50 font-bold border-t-2">
                  <TableCell>Total Orders Received</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.orders_received?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.billed_orders?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.collections?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.sp_payout)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.gross_margin?.total)}</TableCell>
                  <TableCell>{data.overall_metrics.gross_margin?.avg_percentage}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
          {/* Section 5: Top Performers */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Top Performing Customers</h2>
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
          </div>
        </TabsContent>

        <TabsContent value="sheet" className="mt-6">
          <div className="rounded-md border bg-white shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold text-lg">Dashboard Sheet View (Rs Lacs)</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-[200px] font-bold">Category</TableHead>
                  <TableHead className="font-bold">Orders Received</TableHead>
                  <TableHead className="font-bold">Orders Billed</TableHead>
                  <TableHead className="font-bold">Collections Amount</TableHead>
                  <TableHead className="font-bold">SP Payment</TableHead>
                  <TableHead className="font-bold">Gross Margin</TableHead>
                  <TableHead className="font-bold">GM %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Completed Orders */}
                <TableRow>
                  <TableCell className="font-medium">Completed Orders</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.orders_executed?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.billed_orders?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.collections?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.sp_payout)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.gross_margin?.total)}</TableCell>
                  <TableCell>{data.overall_metrics.gross_margin?.avg_percentage}%</TableCell>
                </TableRow>

                {/* Work in Progress Orders */}
                <TableRow>
                  <TableCell className="font-medium">Work in Progress Orders</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.wip_orders?.total_value)}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>

                {/* Pending Orders */}
                <TableRow>
                  <TableCell className="font-medium">Pending Orders</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.not_started_orders?.total_value)}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>

                {/* Cancelled Orders */}
                <TableRow>
                  <TableCell className="font-medium">Cancelled Orders</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.orders_cancelled?.total_value)}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>

                {/* Total Orders Received */}
                <TableRow className="bg-gray-50 font-bold border-t-2">
                  <TableCell>Total Orders Received</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.orders_received?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.billed_orders?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.collections?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.sp_payout)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.gross_margin?.total)}</TableCell>
                  <TableCell>{data.overall_metrics.gross_margin?.avg_percentage}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

