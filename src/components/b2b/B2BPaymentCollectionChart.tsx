'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PaymentCollectionData {
  paid: number;
  pending: number;
  overdue: number;
  partial: number;
}

interface B2BPaymentCollectionChartProps {
  data: PaymentCollectionData;
  title?: string;
}

const COLORS = {
  paid: '#22c55e',      // green-500
  pending: '#f59e0b',   // amber-500
  overdue: '#ef4444',   // red-500
  partial: '#3b82f6'    // blue-500
};

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

export default function B2BPaymentCollectionChart({ 
  data, 
  title = 'Payment Collection Breakdown' 
}: B2BPaymentCollectionChartProps) {
  const chartData = [
    { name: 'Paid', value: data.paid, color: COLORS.paid },
    { name: 'Pending', value: data.pending, color: COLORS.pending },
    { name: 'Overdue', value: data.overdue, color: COLORS.overdue },
    { name: 'Partial', value: data.partial, color: COLORS.partial }
  ].filter(item => item.value > 0); // Only show non-zero values

  const total = data.paid + data.pending + data.overdue + data.partial;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">{formatCurrency(data.value)}</p>
          <p className="text-xs text-muted-foreground">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No payment data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total: {formatCurrency(total)}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value, entry: any) => (
                <span className="text-sm">
                  {value}: {formatCurrency(entry.payload.value)}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

