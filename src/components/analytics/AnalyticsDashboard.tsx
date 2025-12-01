'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/DateRangePicker';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  FileText,
  CreditCard,
  AlertTriangle,
  Download,
  Calendar,
  BarChart3
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import {
  fetchComprehensiveAnalytics,
  fetchDashboardSummary,
  fetchMTDAnalytics,
  fetchLTDAnalytics,
  fetchDetailedReport,
  fetchFYAnalytics,
  formatNumber,
  formatCurrency,
  formatPercentage,
  type ComprehensiveAnalyticsResponse,
  type DashboardSummaryResponse,
  type AnalyticsReportData
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import AnalyticsTable from './AnalyticsTable';
import AnalyticsCharts from './AnalyticsCharts';
import MetricCard from './MetricCard';
import DetailedReportTable from './DetailedReportTable';

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [businessType, setBusinessType] = useState<'b2b' | 'b2c' | 'both'>('both');
  const [loading, setLoading] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryResponse | null>(null);
  const [comprehensiveData, setComprehensiveData] = useState<ComprehensiveAnalyticsResponse | null>(null);
  const [mtdData, setMtdData] = useState<AnalyticsReportData | null>(null);
  const [ltdData, setLtdData] = useState<AnalyticsReportData | null>(null);
  const { toast } = useToast();

  // Load dashboard summary on component mount
  useEffect(() => {
    loadDashboardSummary();
    loadMTDData();
    loadLTDData();
  }, []);

  // Load comprehensive data when filters change
  useEffect(() => {
    if (selectedRange?.from && selectedRange?.to) {
      loadComprehensiveData();
    }
  }, [selectedRange, period, businessType]);

  const loadDashboardSummary = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardSummary();
      setDashboardSummary(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard summary',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMTDData = async () => {
    try {
      const response = await fetchMTDAnalytics(businessType);
      console.log('📊 MTD Response:', response);
      // The API returns { success, data: { period, business_type, report, generated_at } }
      // We need the 'report' object which contains the actual metrics
      setMtdData(response.data.report);
    } catch (error) {
      console.error('Failed to load MTD data:', error);
    }
  };

  const loadLTDData = async () => {
    try {
      const response = await fetchLTDAnalytics(businessType);
      console.log('📊 LTD Response:', response);
      // The API returns { success, data: { period, business_type, report, generated_at } }
      // We need the 'report' object which contains the actual metrics
      setLtdData(response.data.report);
    } catch (error) {
      console.error('Failed to load LTD data:', error);
    }
  };

  const loadComprehensiveData = async () => {
    if (!selectedRange?.from || !selectedRange?.to) return;

    try {
      setLoading(true);
      // Format dates in local time to avoid timezone shifts (e.g., Nov 1 becoming Oct 31)
      const formatDateLocal = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60000));
        return localDate.toISOString().split('T')[0];
      };

      const startDate = formatDateLocal(selectedRange.from);
      const endDate = formatDateLocal(selectedRange.to);

      const data = await fetchComprehensiveAnalytics(startDate, endDate, period, businessType);
      setComprehensiveData(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: 'Export',
      description: 'Export functionality will be implemented soon',
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive business metrics and performance insights
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2">
          <DateRangePicker
            selectedRange={selectedRange}
            onChangeRange={setSelectedRange}
          />
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Period:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'monthly' | 'weekly' | 'daily')}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Business Type:</label>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value as 'b2b' | 'b2c' | 'both')}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="both">Both B2B & B2C</option>
            <option value="b2b">B2B Only</option>
            <option value="b2c">B2C Only</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Report</TabsTrigger>
          <TabsTrigger value="fy">FY Analytics</TabsTrigger>
          <TabsTrigger value="charts">Charts & Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Cards */}
          {dashboardSummary && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Downloads"
                value={formatNumber(dashboardSummary.data.current_month.downloads)}
                change={dashboardSummary.data.growth_rates.downloads}
                icon={<Download className="h-4 w-4" />}
                description="App downloads this month"
              />
              <MetricCard
                title="Registrations"
                value={formatNumber(dashboardSummary.data.current_month.registrations)}
                change={dashboardSummary.data.growth_rates.registrations}
                icon={<Users className="h-4 w-4" />}
                description="New user registrations"
              />
              <MetricCard
                title="Orders Received"
                value={formatNumber(dashboardSummary.data.current_month.orders_received)}
                change={dashboardSummary.data.growth_rates.orders}
                icon={<ShoppingCart className="h-4 w-4" />}
                description="Total orders this month"
              />
              <MetricCard
                title="Revenue"
                value={formatCurrency(dashboardSummary.data.current_month.orders_value)}
                change={dashboardSummary.data.growth_rates.revenue}
                icon={<CreditCard className="h-4 w-4" />}
                description="Total order value"
              />
            </div>
          )}

          {/* Business Split */}
          {dashboardSummary && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>B2C Performance</CardTitle>
                  <CardDescription>Consumer business metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Orders:</span>
                      <span className="font-medium">
                        {formatNumber(dashboardSummary.data.business_split.b2c.orders)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Value:</span>
                      <span className="font-medium">
                        {formatCurrency(dashboardSummary.data.business_split.b2c.value)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Share:</span>
                      <span className="font-medium">
                        {dashboardSummary.data.business_split.b2c.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>B2B Performance</CardTitle>
                  <CardDescription>Business client metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Orders:</span>
                      <span className="font-medium">
                        {formatNumber(dashboardSummary.data.business_split.b2b.orders)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Value:</span>
                      <span className="font-medium">
                        {formatCurrency(dashboardSummary.data.business_split.b2b.value)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Share:</span>
                      <span className="font-medium">
                        {dashboardSummary.data.business_split.b2b.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* MTD and LTD Summary */}
          <div className="grid gap-4 md:grid-cols-2">
            {mtdData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Month to Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Orders Received:</span>
                      <span className="font-medium">{formatNumber(mtdData.orders_received_total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Orders Executed:</span>
                      <span className="font-medium">{formatNumber(mtdData.orders_executed_total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenue:</span>
                      <span className="font-medium">{formatCurrency(mtdData.orders_value_total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Collections:</span>
                      <span className="font-medium">{formatCurrency(mtdData.collection_value_total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {ltdData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Life to Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Orders:</span>
                      <span className="font-medium">{formatNumber(ltdData.orders_received_total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span className="font-medium">{formatCurrency(ltdData.orders_value_total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Collections:</span>
                      <span className="font-medium">{formatCurrency(ltdData.collection_value_total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Order Value:</span>
                      <span className="font-medium">{formatCurrency(ltdData.avg_order_value_total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <DetailedReportTable businessType={businessType} />
        </TabsContent>

        <TabsContent value="fy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Financial Year Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive analytics across financial years with automatic period calculation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">FY Analytics Coming Soon</p>
                <p className="text-sm">
                  This section will display comprehensive financial year analytics including:
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• FY 23-24, 24-25, 25-26 comparison</li>
                  <li>• Automatic financial year calculation</li>
                  <li>• Year-over-year growth analysis</li>
                  <li>• Seasonal trend identification</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          {comprehensiveData && (
            <AnalyticsCharts
              data={comprehensiveData.data.report}
              period={period}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
