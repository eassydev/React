'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatCurrency, type AnalyticsReportData, type AnalyticsSummary } from '@/lib/api';

interface AnalyticsTableProps {
  data: AnalyticsReportData[];
  summary: AnalyticsSummary;
  loading?: boolean;
}

export default function AnalyticsTable({ data, summary, loading }: AnalyticsTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics Report</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics Report</CardTitle>
          <CardDescription>No data available for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Select a date range to view detailed analytics
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.totals.orders_received)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatNumber(summary.averages.orders_per_period)}/period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totals.orders_value)}</div>
            <p className="text-xs text-muted-foreground">
              Avg Order: {formatCurrency(summary.averages.avg_order_value)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averages.collection_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Collected: {formatCurrency(summary.totals.collection_value)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.averages.overdue_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Overdue: {formatCurrency(summary.totals.overdue_value)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Period-wise Analytics</CardTitle>
          <CardDescription>
            Comprehensive metrics breakdown by {data[0]?.period_type || 'period'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Period</TableHead>
                  <TableHead className="text-right">Downloads</TableHead>
                  <TableHead className="text-right">Registrations</TableHead>
                  <TableHead className="text-right">Orders Rec.</TableHead>
                  <TableHead className="text-right">Order Value</TableHead>
                  <TableHead className="text-right">Executed</TableHead>
                  <TableHead className="text-right">Exec. Value</TableHead>
                  <TableHead className="text-right">Invoices</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                  <TableHead className="text-right">Overdue</TableHead>
                  <TableHead className="text-right">Avg Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.period}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.downloads)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.registrations)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.orders_received_total)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.orders_value_total)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span>{formatNumber(row.orders_executed_total)}</span>
                        <Badge variant="outline" className="text-xs">
                          {row.orders_received_total > 0 
                            ? ((row.orders_executed_total / row.orders_received_total) * 100).toFixed(1)
                            : 0}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(row.executed_value_total)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.invoices_raised_total)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span>{formatCurrency(row.collection_value_total)}</span>
                        <Badge variant="outline" className="text-xs">
                          {formatNumber(row.collected_total)} invoices
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span className="text-red-600">{formatCurrency(row.overdue_value_total)}</span>
                        <Badge variant="destructive" className="text-xs">
                          {formatNumber(row.overdue_invoices_total)} invoices
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {row.avg_overdue_days_total > 0 ? (
                        <Badge variant="secondary">
                          {row.avg_overdue_days_total.toFixed(1)} days
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Business Type Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>B2C Performance</CardTitle>
            <CardDescription>Consumer business breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 5).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.period}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.orders_received_b2c)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.orders_value_b2c)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>B2B Performance</CardTitle>
            <CardDescription>Business client breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 5).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.period}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.orders_received_b2b)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.orders_value_b2b)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
