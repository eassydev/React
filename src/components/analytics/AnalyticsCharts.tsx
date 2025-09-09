'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bar, 
  BarChart, 
  Line, 
  LineChart, 
  Area, 
  AreaChart,
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatNumber, formatCurrency, type AnalyticsReportData } from '@/lib/api';

interface AnalyticsChartsProps {
  data: AnalyticsReportData[];
  period: 'monthly' | 'weekly' | 'daily';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsCharts({ data, period }: AnalyticsChartsProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Charts</CardTitle>
          <CardDescription>No data available for visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Select a date range to view charts
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = data.map(item => ({
    period: item.period,
    downloads: item.downloads,
    registrations: item.registrations,
    orders_received: item.orders_received_total,
    orders_value: item.orders_value_total,
    orders_executed: item.orders_executed_total,
    executed_value: item.executed_value_total,
    invoices_raised: item.invoices_raised_total,
    collected: item.collection_value_total,
    overdue: item.overdue_value_total,
    b2c_orders: item.orders_received_b2c,
    b2b_orders: item.orders_received_b2b,
    b2c_value: item.orders_value_b2c,
    b2b_value: item.orders_value_b2b,
  }));

  // Business split data for pie chart
  const totalB2COrders = data.reduce((sum, item) => sum + item.orders_received_b2c, 0);
  const totalB2BOrders = data.reduce((sum, item) => sum + item.orders_received_b2b, 0);
  
  const businessSplitData = [
    { name: 'B2C Orders', value: totalB2COrders, color: '#0088FE' },
    { name: 'B2B Orders', value: totalB2BOrders, color: '#00C49F' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${
                entry.dataKey.includes('value') || entry.dataKey.includes('collected') || entry.dataKey.includes('overdue')
                  ? formatCurrency(entry.value)
                  : formatNumber(entry.value)
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Revenue and Orders Trend */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orders Trend</CardTitle>
            <CardDescription>Orders received vs executed over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="orders_received"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Orders Received"
                />
                <Area
                  type="monotone"
                  dataKey="orders_executed"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name="Orders Executed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Order value vs collections over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="orders_value"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Order Value"
                />
                <Line
                  type="monotone"
                  dataKey="collected"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Collections"
                />
                <Line
                  type="monotone"
                  dataKey="overdue"
                  stroke="#ff7c7c"
                  strokeWidth={2}
                  name="Overdue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Acquisition */}
      <Card>
        <CardHeader>
          <CardTitle>User Acquisition</CardTitle>
          <CardDescription>Downloads and registrations trend</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="downloads" fill="#8884d8" name="Downloads" />
              <Bar dataKey="registrations" fill="#82ca9d" name="Registrations" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Business Split */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Business Type Split</CardTitle>
            <CardDescription>B2B vs B2C order distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={businessSplitData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {businessSplitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>B2B vs B2C Orders</CardTitle>
            <CardDescription>Comparative order volume by business type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="b2c_orders" fill="#0088FE" name="B2C Orders" />
                <Bar dataKey="b2b_orders" fill="#00C49F" name="B2B Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Comparison</CardTitle>
          <CardDescription>B2B vs B2C revenue over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="b2c_value"
                stackId="1"
                stroke="#0088FE"
                fill="#0088FE"
                name="B2C Revenue"
              />
              <Area
                type="monotone"
                dataKey="b2b_value"
                stackId="1"
                stroke="#00C49F"
                fill="#00C49F"
                name="B2B Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
