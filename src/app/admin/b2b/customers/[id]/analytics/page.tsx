'use client';

import { formatDateToYYYYMMDD } from '@/lib/dateUtils';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DateRange } from 'react-day-picker';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  Package,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import B2BMetricCard from '@/components/b2b/B2BMetricCard';
import B2BTrendsChart from '@/components/b2b/B2BTrendsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from '@/components/DateRangePicker';
import { toast } from 'sonner';
import {
  getB2BCustomerAnalytics,
  getB2BCustomerTrends,
  B2BCustomerAnalyticsData,
  B2BCustomerTrendsData
} from '@/lib/api';

const formatCurrency = (value: number | undefined | null): string => {
  if (!value || typeof value !== 'number') return '₹0';

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(2)}K`;
  }
  return `₹${value.toFixed(0)}`;
};

export default function CustomerAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<B2BCustomerAnalyticsData | null>(null);
  const [trendsData, setTrendsData] = useState<B2BCustomerTrendsData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const fetchAnalytics = async () => {
    try {
      const startDate = dateRange?.from ? formatDateToYYYYMMDD(dateRange.from) : undefined;
      const endDate = dateRange?.to ? formatDateToYYYYMMDD(dateRange.to) : undefined;

      const data = await getB2BCustomerAnalytics(customerId, startDate, endDate);
      setAnalyticsData(data);
    } catch (err: any) {
      console.error('Analytics error:', err);
      toast.error(err.message || 'Failed to fetch analytics');
    }
  };

  const fetchTrends = async () => {
    try {
      const data = await getB2BCustomerTrends(customerId, 12);
      setTrendsData(data);
    } catch (err: any) {
      console.error('Trends error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchTrends();
  }, [customerId, dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading customer analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  const { customer_info, core_metrics, financial_health, relationship_metrics, operational_metrics } = analyticsData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Customer Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Detailed performance metrics and insights
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DateRangePicker
            selectedRange={dateRange}
            onChangeRange={setDateRange}
          />
        </div>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {customer_info.company_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{customer_info.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{customer_info.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Credit Limit: {formatCurrency(customer_info.credit_limit)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Credit Days: {customer_info.credit_days}</span>
            </div>
          </div>
          <div className="mt-4">
            <Badge variant={customer_info.status === 'active' ? 'default' : 'secondary'}>
              {customer_info.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Core Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Core Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <B2BMetricCard
            title="Orders Received"
            value={core_metrics.orders_received.count}
            subtitle={formatCurrency(core_metrics.orders_received.total_value)}
            icon={<ShoppingCart className="h-4 w-4" />}
          />

          <B2BMetricCard
            title="Orders Completed"
            value={core_metrics.orders_completed.count}
            subtitle={formatCurrency(core_metrics.orders_completed.total_value)}
            icon={<CheckCircle className="h-4 w-4" />}
          />

          <B2BMetricCard
            title="Revenue Generated"
            value={formatCurrency(core_metrics.revenue_generated)}
            subtitle="From completed orders"
            icon={<DollarSign className="h-4 w-4" />}
          />

          <B2BMetricCard
            title="Profit Generated"
            value={formatCurrency(core_metrics.profit_generated)}
            subtitle={`${financial_health.profit_margin_percentage}% margin`}
            icon={<TrendingUp className="h-4 w-4" />}
            valueClassName="text-green-600"
          />
        </div>
      </div>

      {/* Financial Health & Relationship Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <B2BMetricCard
          title="Avg Order Value"
          value={formatCurrency(financial_health.avg_order_value)}
          icon={<Activity className="h-4 w-4" />}
        />

        <B2BMetricCard
          title="Outstanding Invoices"
          value={formatCurrency(financial_health.outstanding_invoice_amount)}
          icon={<AlertCircle className="h-4 w-4" />}
          alert={financial_health.outstanding_invoice_amount > 0}
        />

        <B2BMetricCard
          title="Customer Tenure"
          value={`${relationship_metrics.customer_tenure.months} months`}
          subtitle={`Since ${relationship_metrics.customer_tenure.first_order_date}`}
          icon={<Calendar className="h-4 w-4" />}
        />

        <B2BMetricCard
          title="Last Order"
          value={relationship_metrics.last_order_date || 'N/A'}
          subtitle={`${relationship_metrics.total_orders_lifetime} lifetime orders`}
          icon={<Package className="h-4 w-4" />}
        />
      </div>

      {/* Operational Metrics */}
      {operational_metrics && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Operational Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <B2BMetricCard
              title="Order Frequency"
              value={`${operational_metrics.order_frequency.orders_per_month}/month`}
              subtitle={`${operational_metrics.order_frequency.frequency_label} frequency`}
              icon={<Activity className="h-4 w-4" />}
            />

            <B2BMetricCard
              title="Avg Fulfillment Time"
              value={`${operational_metrics.fulfillment_time.avg_days.toFixed(1)} days`}
              subtitle={`${operational_metrics.fulfillment_time.avg_hours.toFixed(0)} hours`}
              icon={<Clock className="h-4 w-4" />}
            />

            <B2BMetricCard
              title="Cancellation Rate"
              value={`${operational_metrics.cancellation_rate.cancellation_rate_percentage.toFixed(1)}%`}
              subtitle={`${operational_metrics.cancellation_rate.cancelled_count} of ${operational_metrics.cancellation_rate.total_count} orders`}
              icon={<XCircle className="h-4 w-4" />}
              alert={operational_metrics.cancellation_rate.cancellation_rate_percentage > 10}
            />

            <B2BMetricCard
              title="Top Service Category"
              value={operational_metrics.service_mix.top_category?.category_name || 'N/A'}
              subtitle={`${operational_metrics.service_mix.top_category?.order_count || 0} orders`}
              icon={<Package className="h-4 w-4" />}
            />
          </div>
        </div>
      )}

      {/* Service Mix Details */}
      {operational_metrics?.service_mix && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Mix by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {operational_metrics.service_mix.by_category.slice(0, 5).map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{cat.category_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {cat.order_count} orders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(cat.total_value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Subcategories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {operational_metrics.service_mix.by_subcategory.slice(0, 5).map((subcat) => (
                  <div key={subcat.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{subcat.subcategory_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {subcat.category_name} • {subcat.order_count} orders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(subcat.total_value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Trends Chart */}
      {trendsData && trendsData.trends && trendsData.trends.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Performance Trends</h2>
          <B2BTrendsChart trends={trendsData.trends} />

          {/* Trends Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <B2BMetricCard
              title="Total Revenue (Period)"
              value={formatCurrency(trendsData.summary.total_revenue)}
              subtitle={`${trendsData.summary.period_months} months`}
              icon={<DollarSign className="h-4 w-4" />}
            />

            <B2BMetricCard
              title="Total Profit (Period)"
              value={formatCurrency(trendsData.summary.total_profit)}
              subtitle={`${trendsData.summary.period_months} months`}
              icon={<TrendingUp className="h-4 w-4" />}
              valueClassName="text-green-600"
            />

            <B2BMetricCard
              title="Avg Monthly Revenue"
              value={formatCurrency(trendsData.summary.avg_monthly_revenue)}
              icon={<Activity className="h-4 w-4" />}
            />

            <B2BMetricCard
              title="Revenue Growth Rate"
              value={`${trendsData.summary.revenue_growth_rate_percentage.toFixed(1)}%`}
              subtitle="Period-over-period"
              icon={<TrendingUp className="h-4 w-4" />}
              trend={{
                value: trendsData.summary.revenue_growth_rate_percentage,
                label: 'growth'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

