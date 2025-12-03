'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, FileText } from 'lucide-react';
import { fetchDetailedReport, exportDetailedReportCSV, formatNumber, formatCurrency } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DetailedReportData {
  period: string;
  period_type: string;
  downloads: number;
  registrations: number;
  b2b_registrations: number;
  orders_received: number;
  gov: number;
  orders_cancelled: number;
  cancelled_value: number;
  net_order_position: number;
  net_order_value: number;
  aov: number;
  orders_executed: number;
  executed_value: number;
  money_collected_count: number;
  money_collected_value: number;
  sp_payout: number;
  invoices_raised: number;
  invoice_value: number;
  collections: number;
  collection_value: number;
  overdue: number;
  overdue_value: number;
}

interface DetailedReportTableProps {
  className?: string;
  businessType?: 'b2b' | 'b2c' | 'both';
}

export default function DetailedReportTable({ className, businessType = 'both' }: DetailedReportTableProps) {
  const [data, setData] = useState<DetailedReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadDetailedReport();
  }, [businessType]); // Re-load when business type changes

  const loadDetailedReport = async () => {
    try {
      setLoading(true);
      const response = await fetchDetailedReport(businessType);

      if (response.success) {
        setData(response.data.periods);
        setLastUpdated(new Date(response.data.generated_at).toLocaleString());
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load detailed report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      setLoading(true);
      await exportDetailedReportCSV(businessType);
      toast({
        title: 'Success',
        description: 'Report exported successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPeriodBadgeVariant = (periodType: string) => {
    switch (periodType) {
      case 'fy': return 'default';
      case 'month': return 'secondary';
      case 'day': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Comprehensive Analytics Report
            </CardTitle>
            <CardDescription>
              Financial year, monthly, and daily performance metrics
              {lastUpdated && (
                <span className="block text-xs text-muted-foreground mt-1">
                  Last updated: {lastUpdated}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDetailedReport}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={loading || data.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading detailed report...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Period</TableHead>
                  <TableHead className="text-right">Downloads</TableHead>
                  <TableHead className="text-right">
                    {businessType === 'b2b' ? 'B2B Registrations' : 'Registrations'}
                  </TableHead>
                  <TableHead className="text-right">Orders Received</TableHead>
                  <TableHead className="text-right">GOV (₹)</TableHead>
                  <TableHead className="text-right">Orders Cancelled</TableHead>
                  <TableHead className="text-right">Cancelled Value (₹)</TableHead>
                  <TableHead className="text-right">Net Order Position</TableHead>
                  <TableHead className="text-right">Net Order Value (₹)</TableHead>
                  <TableHead className="text-right">AOV (₹)</TableHead>
                  <TableHead className="text-right">Orders Executed</TableHead>
                  <TableHead className="text-right">Executed Value (₹)</TableHead>
                  <TableHead className="text-right">Money Collected (Count)</TableHead>
                  <TableHead className="text-right">Money Collected (₹)</TableHead>
                  <TableHead className="text-right">SP Payout (₹)</TableHead>
                  <TableHead className="text-right">Invoices Raised</TableHead>
                  <TableHead className="text-right">Invoice Value (₹)</TableHead>
                  <TableHead className="text-right">Collections</TableHead>
                  <TableHead className="text-right">Collection Value (₹)</TableHead>
                  <TableHead className="text-right">Overdue (30+ days)</TableHead>
                  <TableHead className="text-right">Overdue Value (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant={getPeriodBadgeVariant(row.period_type)}>
                          {row.period_type.toUpperCase()}
                        </Badge>
                        {row.period}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(row.downloads)}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(businessType === 'b2b' ? row.b2b_registrations : row.registrations)}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(row.orders_received)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.gov)}</TableCell>
                    <TableCell className="text-right">
                      <span className={row.orders_cancelled > 0 ? 'text-red-600 font-medium' : ''}>
                        {formatNumber(row.orders_cancelled || 0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={row.cancelled_value > 0 ? 'text-red-600 font-medium' : ''}>
                        {formatCurrency(row.cancelled_value || 0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(row.net_order_position || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.net_order_value || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.aov)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.orders_executed)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.executed_value)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.money_collected_count || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.money_collected_value || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.sp_payout || 0)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.invoices_raised)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.invoice_value)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.collections)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.collection_value)}</TableCell>
                    <TableCell className="text-right">
                      <span className={row.overdue > 0 ? 'text-red-600 font-medium' : ''}>
                        {formatNumber(row.overdue)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={row.overdue_value > 0 ? 'text-red-600 font-medium' : ''}>
                        {formatCurrency(row.overdue_value)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {data.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                No data available. Click refresh to load the report.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
