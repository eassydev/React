'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Users, UserCheck, Wrench, TrendingUp } from 'lucide-react';
import {
  exportCustomerWiseAnalytics,
  exportSPOCWiseAnalytics,
  exportSPWiseAnalytics,
  exportBusinessTrends
} from '@/lib/api';
import { toast } from 'sonner';

interface AnalyticsExportPanelProps {
  userRole: string;
}

export default function AnalyticsExportPanel({ userRole }: AnalyticsExportPanelProps) {
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [loadingSPOC, setLoadingSPOC] = useState(false);
  const [loadingSP, setLoadingSP] = useState(false);
  const [loadingTrends, setLoadingTrends] = useState(false);

  const handleExportCustomerWise = async () => {
    setLoadingCustomer(true);
    try {
      await exportCustomerWiseAnalytics();
      toast.success('Customer Analytics Downloaded!', {
        description: 'Excel file has been downloaded successfully',
      });
    } catch (error: any) {
      toast.error('Download Failed', {
        description: error.message || 'Failed to download customer analytics',
      });
    } finally {
      setLoadingCustomer(false);
    }
  };

  const handleExportSPOCWise = async () => {
    setLoadingSPOC(true);
    try {
      await exportSPOCWiseAnalytics();
      toast.success('SPOC Analytics Downloaded!', {
        description: 'Excel file has been downloaded successfully',
      });
    } catch (error: any) {
      toast.error('Download Failed', {
        description: error.message || 'Failed to download SPOC analytics',
      });
    } finally {
      setLoadingSPOC(false);
    }
  };

  const handleExportSPWise = async () => {
    setLoadingSP(true);
    try {
      await exportSPWiseAnalytics();
      toast.success('SP Analytics Downloaded!', {
        description: 'Excel file has been downloaded successfully',
      });
    } catch (error: any) {
      toast.error('Download Failed', {
        description: error.message || 'Failed to download SP analytics',
      });
    } finally {
      setLoadingSP(false);
    }
  };

  const handleExportBusinessTrends = async () => {
    setLoadingTrends(true);
    try {
      await exportBusinessTrends();
      toast.success('Business Trends Downloaded!', {
        description: 'Excel file has been downloaded successfully',
      });
    } catch (error: any) {
      toast.error('Download Failed', {
        description: error.message || 'Failed to download business trends',
      });
    } finally {
      setLoadingTrends(false);
    }
  };

  const isAdminOrManager = userRole === 'super_admin' || userRole === 'manager';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Download className="h-5 w-5 text-[#FFA301]" />
          <CardTitle>Download Analytics Reports</CardTitle>
        </div>
        <CardDescription>
          Export comprehensive analytics data in Excel format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Customer-wise Analytics */}
          <div className="space-y-2">
            <Button
              onClick={handleExportCustomerWise}
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
              onClick={handleExportSPOCWise}
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
              onClick={handleExportSPWise}
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
              onClick={handleExportBusinessTrends}
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
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-xs text-amber-800">
            <strong>Note:</strong> All reports are generated in real-time and include data 
            based on your role and permissions. SPOC users will only see data for their assigned customers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

