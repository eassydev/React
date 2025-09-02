'use client';

import React from 'react';

import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import initials from 'initials';
import { DollarSign, Users, CreditCard, Activity } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { DateRangePicker } from '@/components/DateRangePicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { salesData, overviewChartData } from '@/constants/dummyData';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import {
  fetchDashboardSummary,
  formatNumber,
  formatCurrency,
  formatPercentage,
  type DashboardSummaryResponse
} from '@/lib/api';

export default function Page() {
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(undefined);
  const [dashboardData, setDashboardData] = React.useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Load dashboard data on component mount
  React.useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardSummary();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-4">
        <div className="flex-col items-center justify-between space-y-2 md:flex md:flex-row">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex-col items-center space-y-2 md:flex md:flex-row md:space-x-2 md:space-y-0">
            <DateRangePicker selectedRange={selectedRange} onChangeRange={setSelectedRange} />
            <Button className="w-full">Download</Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" disabled>
              Reports
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : dashboardData ? formatCurrency(dashboardData.data.current_month.orders_value) : '$45,231.89'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? '...' : dashboardData ? formatPercentage(dashboardData.data.growth_rates.revenue) + ' from last month' : '+20.1% from last month'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registrations</CardTitle>
                  <Users className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : dashboardData ? formatNumber(dashboardData.data.current_month.registrations) : '+2350'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? '...' : dashboardData ? formatPercentage(dashboardData.data.growth_rates.registrations) + ' from last month' : '+180.1% from last month'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orders</CardTitle>
                  <CreditCard className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : dashboardData ? formatNumber(dashboardData.data.current_month.orders_received) : '+12,234'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? '...' : dashboardData ? formatPercentage(dashboardData.data.growth_rates.orders) + ' from last month' : '+19% from last month'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                  <Activity className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : dashboardData ? formatNumber(dashboardData.data.current_month.downloads) : '+573'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? '...' : dashboardData ? formatPercentage(dashboardData.data.growth_rates.downloads) + ' from last month' : '+201 since last hour'}
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-2 lg:col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={overviewChartData}>
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Bar
                        dataKey="total"
                        fill="currentColor"
                        radius={[4, 4, 0, 0]}
                        className="fill-primary"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>You made 265 sales this month.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {salesData.map((sale) => (
                      <div key={sale.name} className="flex items-center">
                        <Avatar className="size-9">
                          <AvatarFallback>{initials(sale.name)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">{sale.name}</p>
                          <p className="text-xs text-muted-foreground md:text-sm">{sale.email}</p>
                        </div>
                        <div className="ml-auto font-medium">{sale.amount}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsDashboard className="mt-0" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
