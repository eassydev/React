'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2, Users, UserCheck, Wrench, TrendingUp, Filter, Calendar } from 'lucide-react';
import {
  exportCustomerWiseAnalytics,
  exportSPOCWiseAnalytics,
  exportSPWiseAnalytics,
  exportBusinessTrends,
  exportMonthlyReport
} from '@/lib/api';
import { toast } from 'sonner';

interface AnalyticsExportPanelProps {
  userRole: string;
}

type ExportType = 'customer' | 'spoc' | 'sp' | 'trends' | 'monthly';

export default function AnalyticsExportPanel({ userRole }: AnalyticsExportPanelProps) {
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [loadingSPOC, setLoadingSPOC] = useState(false);
  const [loadingSP, setLoadingSP] = useState(false);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  // Dialog state
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [currentExportType, setCurrentExportType] = useState<ExportType | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [dateFilterType, setDateFilterType] = useState<'service' | 'received'>('received');

  // Open filter dialog
  const openFilterDialog = (exportType: ExportType) => {
    setCurrentExportType(exportType);
    setShowFilterDialog(true);
  };

  // Close filter dialog and reset
  const closeFilterDialog = () => {
    setShowFilterDialog(false);
    setCurrentExportType(null);
    setDateFrom('');
    setDateTo('');
    setDateFilterType('received');
  };

  // Execute export with filters
  const executeExport = async () => {
    if (!currentExportType) return;

    const filters = {
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      date_filter_type: dateFilterType
    };

    try {
      switch (currentExportType) {
        case 'customer':
          setLoadingCustomer(true);
          await exportCustomerWiseAnalytics(filters);
          toast.success('Customer Analytics Downloaded!', {
            description: 'Excel file has been downloaded successfully',
          });
          break;
        case 'spoc':
          setLoadingSPOC(true);
          await exportSPOCWiseAnalytics(filters);
          toast.success('SPOC Analytics Downloaded!', {
            description: 'Excel file has been downloaded successfully',
          });
          break;
        case 'sp':
          setLoadingSP(true);
          await exportSPWiseAnalytics(filters);
          toast.success('SP Analytics Downloaded!', {
            description: 'Excel file has been downloaded successfully',
          });
          break;
        case 'trends':
          setLoadingTrends(true);
          await exportBusinessTrends();
          toast.success('Business Trends Downloaded!', {
            description: 'Excel file has been downloaded successfully',
          });
          break;
        case 'monthly':
          setLoadingMonthly(true);
          await exportMonthlyReport(filters);
          toast.success('Monthly Report Downloaded!', {
            description: 'Excel file has been downloaded successfully',
          });
          break;
      }
      closeFilterDialog();
    } catch (error: any) {
      toast.error('Download Failed', {
        description: error.message || 'Failed to download analytics',
      });
    } finally {
      setLoadingCustomer(false);
      setLoadingSPOC(false);
      setLoadingSP(false);
      setLoadingTrends(false);
      setLoadingMonthly(false);
    }
  };

  const isAdminOrManager = userRole === 'super_admin' || userRole === 'manager';

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-[#FFA301]" />
            <CardTitle>Download Analytics Reports</CardTitle>
          </div>
          <CardDescription>
            Export comprehensive analytics data in Excel format with optional date filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Customer-wise Analytics */}
            <div className="space-y-2">
              <Button
                onClick={() => openFilterDialog('customer')}
                disabled={loadingCustomer}
                variant="outline"
                className="w-full h-auto flex-col items-start p-4 hover:bg-[#FFA301]/10 hover:border-[#FFA301]"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-[#FFA301]" />
                  <span className="font-semibold">Customer-wise</span>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  Orders, revenue, profit, payment status per customer
                </p>
                {loadingCustomer && (
                  <Loader2 className="h-4 w-4 animate-spin mt-2" />
                )}
              </Button>
            </div>

            {/* SPOC-wise Analytics */}
            <div className="space-y-2">
              <Button
                onClick={() => openFilterDialog('spoc')}
                disabled={loadingSPOC || !isAdminOrManager}
                variant="outline"
                className="w-full h-auto flex-col items-start p-4 hover:bg-[#FFA301]/10 hover:border-[#FFA301] disabled:opacity-50"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <UserCheck className="h-5 w-5 text-[#FFA301]" />
                  <span className="font-semibold">SPOC-wise</span>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  Assigned customers, orders handled, revenue per SPOC
                </p>
                {loadingSPOC && (
                  <Loader2 className="h-4 w-4 animate-spin mt-2" />
                )}
                {!isAdminOrManager && (
                  <span className="text-xs text-red-500 mt-1">Admin only</span>
                )}
              </Button>
            </div>

            {/* SP-wise Analytics */}
            <div className="space-y-2">
              <Button
                onClick={() => openFilterDialog('sp')}
                disabled={loadingSP}
                variant="outline"
                className="w-full h-auto flex-col items-start p-4 hover:bg-[#FFA301]/10 hover:border-[#FFA301]"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Wrench className="h-5 w-5 text-[#FFA301]" />
                  <span className="font-semibold">SP-wise</span>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  Orders completed, revenue, performance metrics per SP
                </p>
                {loadingSP && (
                  <Loader2 className="h-4 w-4 animate-spin mt-2" />
                )}
              </Button>
            </div>

            {/* Business Trends */}
            <div className="space-y-2">
              <Button
                onClick={() => openFilterDialog('trends')}
                disabled={loadingTrends || !isAdminOrManager}
                variant="outline"
                className="w-full h-auto flex-col items-start p-4 hover:bg-[#FFA301]/10 hover:border-[#FFA301] disabled:opacity-50"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-[#FFA301]" />
                  <span className="font-semibold">Business Trends</span>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  Last 90 days daily breakdown with trends
                </p>
                {loadingTrends && (
                  <Loader2 className="h-4 w-4 animate-spin mt-2" />
                )}
                {!isAdminOrManager && (
                  <span className="text-xs text-red-500 mt-1">Admin only</span>
                )}
              </Button>
            </div>

            {/* Monthly Report - NEW */}
            <div className="space-y-2">
              <Button
                onClick={() => openFilterDialog('monthly')}
                disabled={loadingMonthly}
                variant="outline"
                className="w-full h-auto flex-col items-start p-4 hover:bg-[#FFA301]/10 hover:border-[#FFA301]"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-[#FFA301]" />
                  <span className="font-semibold">Monthly Report</span>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  Comprehensive monthly breakdown with all order details
                </p>
                {loadingMonthly && (
                  <Loader2 className="h-4 w-4 animate-spin mt-2" />
                )}
              </Button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-xs text-amber-800">
              <strong>💡 Tip:</strong> Click any export button to apply optional date filters before downloading.
              All reports are generated in real-time based on your role and permissions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-[#FFA301]" />
              <span>Export Filters</span>
            </DialogTitle>
            <DialogDescription>
              Apply optional date filters to your analytics export. Leave blank to export all data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Date Filter Type */}
            <div className="space-y-2">
              <Label htmlFor="date-filter-type">Date Filter Type</Label>
              <Select value={dateFilterType} onValueChange={(value: 'service' | 'received') => setDateFilterType(value)}>
                <SelectTrigger id="date-filter-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">Booking Received Date</SelectItem>
                  <SelectItem value="service">Service Date</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {dateFilterType === 'received'
                  ? 'Filter by when the order was received/created'
                  : 'Filter by when the service is scheduled'}
              </p>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <Label htmlFor="date-from">From Date (Optional)</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                max={dateTo || undefined}
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label htmlFor="date-to">To Date (Optional)</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || undefined}
              />
            </div>

            {/* Preview */}
            {(dateFrom || dateTo) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800">
                  <strong>Filter Preview:</strong> Exporting data from{' '}
                  <strong>{dateFrom || 'beginning'}</strong> to{' '}
                  <strong>{dateTo || 'now'}</strong> based on{' '}
                  <strong>{dateFilterType === 'received' ? 'booking received date' : 'service date'}</strong>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeFilterDialog}>
              Cancel
            </Button>
            <Button
              onClick={executeExport}
              className="bg-[#FFA301] hover:bg-[#FF8C00] text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Excel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


