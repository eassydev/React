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
  CheckCircle,
  Calendar
} from 'lucide-react';
import B2BMetricCard from '@/components/b2b/B2BMetricCard';
import B2BPaymentCollectionChart from '@/components/b2b/B2BPaymentCollectionChart';
import B2BTopCustomersTable from '@/components/b2b/B2BTopCustomersTable';
import AnalyticsExportPanel from '@/components/b2b/AnalyticsExportPanel';
import AnalyticsDrillDownModal, { MetricType } from '@/components/b2b/AnalyticsDrillDownModal';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from '@/lib/api';

// ✅ UPDATED: Format currency in Lacs (no "L" suffix, convert Crores to Lacs)
const formatCurrency = (value: number | undefined | null): string => {
  // Handle undefined, null, or NaN values
  if (value === undefined || value === null || isNaN(value)) {
    return '₹0.00';
  }

  const numValue = Number(value);

  // Convert to Lacs (1 Lac = 100,000)
  // 1 Crore = 100 Lacs, so 1.18 Cr = 118.00 Lacs
  const lacs = numValue / 100000;

  return `₹${lacs.toFixed(2)}`;
};

export default function B2BAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<B2BDashboardData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [userRole, setUserRole] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' or 'YYYY-MM' format
  const [useReceivedDate, setUseReceivedDate] = useState<boolean>(false); // Toggle for booking_received_date

  // ✅ NEW: Drill-down modal state
  const [drillDownModal, setDrillDownModal] = useState<{
    isOpen: boolean;
    metricType: MetricType | null;
    metricTitle: string;
  }>({ isOpen: false, metricType: null, metricTitle: '' });

  const openDrillDown = (metricType: MetricType, title: string) => {
    setDrillDownModal({ isOpen: true, metricType, metricTitle: title });
  };

  const closeDrillDown = () => {
    setDrillDownModal({ isOpen: false, metricType: null, metricTitle: '' });
  };

  const fetchDashboard = async () => {
    setLoading(true);

    try {
      let startDate: string | undefined;
      let endDate: string | undefined;

      // ✅ Month filter takes precedence over date range
      if (selectedMonth !== 'all') {
        // Parse YYYY-MM format
        const [year, month] = selectedMonth.split('-');
        const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
        const lastDay = new Date(parseInt(year), parseInt(month), 0);

        startDate = firstDay.toISOString().split('T')[0];
        endDate = lastDay.toISOString().split('T')[0];
      } else if (dateRange?.from && dateRange?.to) {
        startDate = dateRange.from.toISOString().split('T')[0];
        endDate = dateRange.to.toISOString().split('T')[0];
      }

      const dashboardData = await getB2BAnalyticsDashboard(startDate, endDate, useReceivedDate ? 'received' : 'created');
      setData(dashboardData);

      // Log key metrics for debugging
      console.log('📊 B2B Analytics Dashboard Data:');
      console.log('Billed Orders:', dashboardData.overall_metrics.billed_orders);
      console.log('Collections:', dashboardData.overall_metrics.collections);
      console.log('Outstanding Amount:', dashboardData.overall_metrics.outstanding_amount);
      console.log('WIP Orders:', dashboardData.overall_metrics.wip_orders);
    } catch (err: any) {
      console.error('Dashboard error:', err);
      toast.error(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [dateRange, selectedMonth, useReceivedDate]);

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

  // ✅ Generate month options (last 12 months)
  const generateMonthOptions = () => {
    const months = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      months.push({
        value: `${year}-${month}`,
        label: monthName
      });
    }

    return months;
  };

  const monthOptions = generateMonthOptions();

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
          {/* ✅ Month Filter Dropdown */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              {monthOptions.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
                onClick={() => openDrillDown('orders_received', 'Orders Received')}
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
                onClick={() => openDrillDown('orders_cancelled', 'Orders Cancelled')}
              />

              <B2BMetricCard
                title="Net Orders"
                value={data.overall_metrics.net_orders?.count || 0}
                subtitle={formatCurrency(data.overall_metrics.net_orders?.total_value)}
                icon={<Package className="h-4 w-4" />}
                onClick={() => openDrillDown('net_orders', 'Net Orders')}
              />

              <B2BMetricCard
                title="Orders Executed"
                value={data.overall_metrics.orders_executed?.count || 0}
                subtitle={formatCurrency(data.overall_metrics.orders_executed?.total_value)}
                icon={<CheckCircle className="h-4 w-4" />}
                onClick={() => openDrillDown('orders_executed', 'Orders Executed')}
              />

              <B2BMetricCard
                title="Collections"
                value={formatCurrency(data.overall_metrics.collections?.total_value)}
                subtitle={`${data.overall_metrics.collections?.count || 0} completed & paid orders`}
                icon={<CheckCircle className="h-4 w-4" />}
                valueClassName="text-green-600"
                onClick={() => openDrillDown('collections', 'Collections')}
              />
            </div>
          </div>

          {/* Section 2.5: WIP Orders (Work In Progress) */}
          {data.overall_metrics.wip_orders && (
            <div>
              <h2 className="text-lg font-semibold mb-3">WIP Orders (Work In Progress)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <B2BMetricCard
                  title="WIP Orders"
                  value={data.overall_metrics.wip_orders.count || 0}
                  subtitle={formatCurrency(data.overall_metrics.wip_orders.total_value)}
                  icon={<Clock className="h-4 w-4" />}
                  valueClassName="text-blue-600"
                  onClick={() => openDrillDown('wip_orders', 'WIP Orders')}
                />

                <B2BMetricCard
                  title="WIP Billed"
                  value={data.overall_metrics.wip_orders.billed_orders?.count || 0}
                  subtitle={formatCurrency(data.overall_metrics.wip_orders.billed_orders?.total_value || 0)}
                  icon={<Package className="h-4 w-4" />}
                />

                <B2BMetricCard
                  title="WIP Collections"
                  value={formatCurrency(data.overall_metrics.wip_orders.collections?.total_value || 0)}
                  subtitle={`${data.overall_metrics.wip_orders.collections?.count || 0} paid WIP orders`}
                  icon={<CheckCircle className="h-4 w-4" />}
                  valueClassName="text-green-600"
                />

                <B2BMetricCard
                  title="WIP SP Payout"
                  value={formatCurrency(data.overall_metrics.wip_orders.sp_payout || 0)}
                  subtitle="Provider payments for WIP"
                  icon={<DollarSign className="h-4 w-4" />}
                />
              </div>
            </div>
          )}

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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Dashboard Sheet View (₹ Lacs)</h3>
                  <p className="text-sm text-muted-foreground mt-1">All amounts are displayed in Lacs (1 Lac = ₹1,00,000)</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border">
                  <Checkbox
                    id="useReceivedDate"
                    checked={useReceivedDate}
                    onCheckedChange={(checked) => setUseReceivedDate(checked === true)}
                  />
                  <Label htmlFor="useReceivedDate" className="text-sm font-medium cursor-pointer flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Calculate by Order Received Date
                  </Label>
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-[200px] font-bold">Category</TableHead>
                  <TableHead className="font-bold">Orders Received (Lacs)</TableHead>
                  <TableHead className="font-bold">Orders Billed (Lacs)</TableHead>
                  <TableHead className="font-bold">Collections Amount (Lacs)</TableHead>
                  <TableHead className="font-bold">SP Payment (Lacs)</TableHead>
                  <TableHead className="font-bold">Gross Margin (Lacs)</TableHead>
                  <TableHead className="font-bold">GM %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* ✅ REORDERED: Row 1 - Total Orders Received */}
                <TableRow className="bg-blue-50 font-bold border-t-2">
                  <TableCell>Total Orders Received</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.orders_received?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(
                    (data.overall_metrics.billed_orders?.total_value || 0) +
                    (data.overall_metrics.wip_orders?.billed_orders?.total_value || 0)
                  )}</TableCell>
                  <TableCell>{formatCurrency(
                    (data.overall_metrics.collections?.total_value || 0) +
                    (data.overall_metrics.wip_orders?.collections?.total_value || 0)
                  )}</TableCell>
                  <TableCell>{formatCurrency(
                    (data.overall_metrics.sp_payout || 0) +
                    (data.overall_metrics.wip_orders?.sp_payout || 0)
                  )}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.gross_margin?.total)}</TableCell>
                  <TableCell>{data.overall_metrics.gross_margin?.avg_percentage}%</TableCell>
                </TableRow>

                {/* ✅ REORDERED: Row 2 - Cancelled Orders */}
                <TableRow>
                  <TableCell className="font-medium">Cancelled Orders</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.orders_cancelled?.total_value)}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>

                {/* ✅ REORDERED: Row 3 - Completed Orders */}
                <TableRow>
                  <TableCell className="font-medium">Completed Orders</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.orders_executed?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.billed_orders?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.collections?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.sp_payout)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.gross_margin?.total)}</TableCell>
                  <TableCell>{data.overall_metrics.gross_margin?.avg_percentage}%</TableCell>
                </TableRow>

                {/* ✅ REORDERED: Row 4 - Work in Progress Orders */}
                <TableRow>
                  <TableCell className="font-medium">Work In Progress Orders</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.wip_orders?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.wip_orders?.billed_orders?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.wip_orders?.collections?.total_value)}</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.wip_orders?.sp_payout)}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>

                {/* ✅ REORDERED: Row 5 - Pending Orders */}
                <TableRow>
                  <TableCell className="font-medium">Pending Orders</TableCell>
                  <TableCell>{formatCurrency(data.overall_metrics.not_started_orders?.total_value)}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ✅ NEW: Drill-Down Modal */}
      <AnalyticsDrillDownModal
        isOpen={drillDownModal.isOpen}
        onClose={closeDrillDown}
        metricType={drillDownModal.metricType}
        metricTitle={drillDownModal.metricTitle}
        dateRange={dateRange ? { from: dateRange.from, to: dateRange.to } : undefined}
        selectedMonth={selectedMonth}
        useReceivedDate={useReceivedDate}
      />
    </div>
  );
}

