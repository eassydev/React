'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface TrendData {
  month: string;
  order_count: number;
  revenue: number;
  profit: number;
  completed_count: number;
  cancelled_count: number;
  completion_rate: number;
}

interface B2BTrendsChartProps {
  trends: TrendData[];
  title?: string;
}

const formatCurrency = (value: number): string => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toFixed(0)}`;
};

const formatMonth = (monthStr: string): string => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

export default function B2BTrendsChart({ 
  trends, 
  title = 'Monthly Trends' 
}: B2BTrendsChartProps) {
  const [activeView, setActiveView] = useState<'revenue' | 'orders' | 'performance'>('revenue');

  if (!trends || trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No trend data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedData = trends.map(item => ({
    ...item,
    monthLabel: formatMonth(item.month)
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {
                entry.dataKey.includes('revenue') || entry.dataKey.includes('profit')
                  ? formatCurrency(entry.value)
                  : entry.dataKey.includes('rate')
                  ? `${entry.value}%`
                  : entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
            <TabsList>
              <TabsTrigger value="revenue">Revenue & Profit</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          {activeView === 'revenue' && (
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Revenue" 
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Profit" 
                dot={{ r: 4 }}
              />
            </LineChart>
          )}
          
          {activeView === 'orders' && (
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="order_count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Total Orders" 
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="completed_count" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Completed" 
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="cancelled_count" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Cancelled" 
                dot={{ r: 4 }}
              />
            </LineChart>
          )}
          
          {activeView === 'performance' && (
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="completion_rate" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Completion Rate %" 
                dot={{ r: 4 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

