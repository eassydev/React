'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  Calendar,
  CalendarClock,
  RefreshCw,
  Loader2,
  AlertCircle,
  CalendarCheck
} from 'lucide-react';
import DailyOperationsMetricCard from '@/components/b2b/DailyOperationsMetricCard';
import EmailTriggerPanel from '@/components/b2b/EmailTriggerPanel';
import AnalyticsExportPanel from '@/components/b2b/AnalyticsExportPanel';
import { getDailyOperationsDashboard, DailyOperationsData } from '@/lib/api';
import { toast } from 'sonner';

export default function DailyOperationsDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DailyOperationsData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  // Fetch dashboard on mount
  useEffect(() => {
    fetchDashboard();
  }, []);

  // Get user role from localStorage or API
  useEffect(() => {
    try {
      const adminInfoStr = localStorage.getItem('adminInfo');
      if (adminInfoStr) {
        const adminInfo = JSON.parse(adminInfoStr);
        // Normalize role name: "Super Admin" -> "super_admin", "Manager" -> "manager", "SPOC" -> "spoc"
        const normalizedRole = adminInfo.role?.toLowerCase().replace(/\s+/g, '_') || 'spoc';
        setUserRole(normalizedRole);
        console.log('📊 Daily Operations - User role from localStorage:', normalizedRole);
      } else {
        setUserRole('spoc'); // Default fallback
      }
    } catch (error) {
      console.error('Error parsing adminInfo:', error);
      setUserRole('spoc'); // Default fallback
    }
  }, []);

  const fetchDashboard = async (isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const dashboardData = await getDailyOperationsDashboard();
      setData(dashboardData);
      setLastUpdated(new Date());
      setUserRole(dashboardData.metadata.role);

      if (isAutoRefresh) {
        toast.success('Dashboard Refreshed', {
          description: 'Data has been updated',
        });
      }
    } catch (error: any) {
      console.error('Dashboard error:', error);
      toast.error('Failed to Load Dashboard', {
        description: error.message || 'An error occurred while fetching dashboard data',
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchDashboard(true);
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';

    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FFA301]" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Dashboard</h3>
              <p className="text-muted-foreground mb-4">
                Unable to fetch dashboard data. Please try again.
              </p>
              <Button onClick={() => fetchDashboard()} className="bg-[#FFA301] hover:bg-[#e69301]">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Operations Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor daily B2B operations and send notifications
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <div className="text-sm text-muted-foreground">
              Last updated: {formatLastUpdated()}
            </div>
          )}
          <Button
            onClick={handleManualRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Role Badge */}
      {data?.metadata?.filteredByCustomers && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-800">
              <strong>SPOC View:</strong> You are viewing data for your assigned customers only.
            </p>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Metrics Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Orders Completed Yesterday */}
        <DailyOperationsMetricCard
          title="Orders Completed Yesterday"
          metric={data?.ordersCompletedYesterday || { count: 0, date: '', orders: [] }}
          icon={<CheckCircle className="h-5 w-5" />}
          badgeColor="bg-green-500"
          emptyMessage="No orders were completed yesterday"
          dateFilter="yesterday"
        />

        {/* Orders Rescheduled Yesterday */}
        <DailyOperationsMetricCard
          title="Orders Rescheduled Yesterday"
          metric={data?.ordersRescheduledYesterday || { count: 0, date: '', orders: [] }}
          icon={<CalendarClock className="h-5 w-5" />}
          badgeColor="bg-yellow-500"
          emptyMessage="No orders were rescheduled yesterday"
          dateFilter="yesterday"
        />

        {/* Orders Scheduled Today */}
        <DailyOperationsMetricCard
          title="Orders Scheduled for Today"
          metric={data?.ordersScheduledToday || { count: 0, date: '', orders: [] }}
          icon={<Calendar className="h-5 w-5" />}
          badgeColor="bg-blue-500"
          emptyMessage="No orders scheduled for today"
          dateFilter="today"
        />

        {/* Orders Scheduled Tomorrow */}
        <DailyOperationsMetricCard
          title="Orders Scheduled for Tomorrow"
          metric={data?.ordersScheduledTomorrow || { count: 0, date: '', orders: [] }}
          icon={<CalendarCheck className="h-5 w-5" />}
          badgeColor="bg-purple-500"
          emptyMessage="No orders scheduled for tomorrow"
          dateFilter="tomorrow"
        />
      </div>

      {/* Metrics Cards - Row 2: Overdue Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Orders Pending Past Service Date */}
        <DailyOperationsMetricCard
          title="Orders Pending (Past Service Date)"
          metric={data?.ordersPendingPastServiceDate || { count: 0, date: '', orders: [] }}
          icon={<AlertCircle className="h-5 w-5" />}
          badgeColor="bg-red-500"
          emptyMessage="No overdue pending orders"
          dateFilter="overdue"
        />
      </div>

      <Separator />

      {/* Email Trigger Panel */}
      <EmailTriggerPanel userRole={userRole} />

      <Separator />

      {/* Analytics Export Panel */}
      <AnalyticsExportPanel userRole={userRole} />

      {/* Footer Info */}
      <Card className="bg-gray-50">
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1">Email Automation</p>
              <p className="text-muted-foreground">Emails sent daily at 7:00 AM (today) and 6:00 PM (tomorrow)</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Data Access</p>
              <p className="text-muted-foreground">
                {data?.metadata?.filteredByCustomers
                  ? 'Showing data for your assigned customers only'
                  : 'Showing data for all customers'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

