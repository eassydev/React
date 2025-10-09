'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  getPaymentStats, 
  searchPayouts, 
  bulkPaymentAction, 
  singlePaymentAction 
} from '@/lib/api';
import { 
  Play, 
  Square, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Ban,
  Search,
  RefreshCw,
  Filter
} from 'lucide-react';

interface PaymentStats {
  readyForTransfer: number;
  blockedTransfers: number;
  completedPayments: number;
  totalPending: number;
  totalCompleted: number;
  totalBlocked: number;
}

interface PaymentControlPanelProps {
  onRefresh?: () => void;
}

export default function PaymentControlPanel({ onRefresh }: PaymentControlPanelProps) {
  const { toast } = useToast();
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    status: 'all',
    allow_transfer: 'all',
    provider_name: '',
    order_id: '',
    date_from: '',
    date_to: '',
    amount_min: '',
    amount_max: ''
  });

  const fetchStats = async () => {
    try {
      const statsData = await getPaymentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch payment statistics.',
      });
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleBulkAction = async (action: string, scope?: string) => {
    const actionMessages = {
      stop: 'stop',
      allow: 'allow',
      'mark-paid': 'mark as paid'
    };

    let confirmMessage = '';
    let requestData: any = { action };

    if (scope === 'all') {
      confirmMessage = `Are you sure you want to ${actionMessages[action as keyof typeof actionMessages]} ALL payments?`;
    } else if (scope === 'pending') {
      confirmMessage = `Are you sure you want to ${actionMessages[action as keyof typeof actionMessages]} all PENDING payments?`;
      requestData.filters = { status: 'Not Initiated' };
    } else if (selectedPayments.size > 0) {
      confirmMessage = `Are you sure you want to ${actionMessages[action as keyof typeof actionMessages]} ${selectedPayments.size} selected payments?`;
      requestData.payment_ids = Array.from(selectedPayments);
    } else {
      toast({
        variant: 'destructive',
        title: 'No Selection',
        description: 'Please select payments or choose a bulk action scope.',
      });
      return;
    }

    if (!confirm(confirmMessage)) return;

    setIsLoading(true);
    try {
      const result = await bulkPaymentAction(action, requestData.payment_ids, requestData.filters);
      
      toast({
        title: 'Success',
        description: result.message,
      });

      // Clear selections and refresh
      setSelectedPayments(new Set());
      await fetchStats();
      if (onRefresh) onRefresh();

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Action failed.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilteredAction = async (action: string) => {
    // Check if any meaningful filters are set (excluding "all" values and empty strings)
    const hasFilters = Object.entries(filters).some(([key, value]) => {
      if (key === 'status' || key === 'allow_transfer') {
        return value !== 'all' && value !== '';
      }
      return value !== '';
    });

    if (!hasFilters) {
      toast({
        variant: 'destructive',
        title: 'No Filters',
        description: 'Please set filters before applying filtered actions.',
      });
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} all payments matching the current filters?`;
    if (!confirm(confirmMessage)) return;

    setIsLoading(true);
    try {
      // Process filters to remove "all" values before sending to API
      const processedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (key === 'status' || key === 'allow_transfer') {
          if (value !== 'all' && value !== '') {
            acc[key] = value;
          }
        } else if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      const result = await bulkPaymentAction(action, undefined, processedFilters);
      
      toast({
        title: 'Success',
        description: result.message,
      });

      await fetchStats();
      if (onRefresh) onRefresh();

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Filtered action failed.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      allow_transfer: 'all',
      provider_name: '',
      order_id: '',
      date_from: '',
      date_to: '',
      amount_min: '',
      amount_max: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Ready for Transfer</p>
                <p className="text-2xl font-bold">{stats?.readyForTransfer || 0}</p>
                <p className="text-blue-100 text-xs">₹{stats?.totalPending?.toFixed(2) || '0.00'}</p>
              </div>
              <Play className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Blocked Transfers</p>
                <p className="text-2xl font-bold">{stats?.blockedTransfers || 0}</p>
                <p className="text-red-100 text-xs">₹{stats?.totalBlocked?.toFixed(2) || '0.00'}</p>
              </div>
              <Ban className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Completed</p>
                <p className="text-2xl font-bold">{stats?.completedPayments || 0}</p>
                <p className="text-green-100 text-xs">₹{stats?.totalCompleted?.toFixed(2) || '0.00'}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Pending</p>
                <p className="text-2xl font-bold">₹{((stats?.totalPending || 0) + (stats?.totalBlocked || 0)).toFixed(2)}</p>
                <p className="text-purple-100 text-xs">{((stats?.readyForTransfer || 0) + (stats?.blockedTransfers || 0))} payments</p>
              </div>
              <Clock className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="destructive" 
              onClick={() => handleBulkAction('stop', 'all')}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop All
            </Button>
            
            <Button 
              variant="default" 
              onClick={() => handleBulkAction('allow', 'all')}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Allow All
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleBulkAction('stop', 'pending')}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Pending
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleBulkAction('allow', 'pending')}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Allow Pending
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Targeted Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Not Initiated">Not Initiated</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="allow_transfer">Transfer Status</Label>
              <Select value={filters.allow_transfer} onValueChange={(value) => setFilters({...filters, allow_transfer: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Transfer Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Allowed</SelectItem>
                  <SelectItem value="no">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="provider_name">Provider Name</Label>
              <Input
                id="provider_name"
                placeholder="Provider Name"
                value={filters.provider_name}
                onChange={(e) => setFilters({...filters, provider_name: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="order_id">Order ID</Label>
              <Input
                id="order_id"
                placeholder="Order ID"
                value={filters.order_id}
                onChange={(e) => setFilters({...filters, order_id: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="date_from">From Date</Label>
              <Input
                id="date_from"
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({...filters, date_from: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="date_to">To Date</Label>
              <Input
                id="date_to"
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({...filters, date_to: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="amount_min">Min Amount</Label>
              <Input
                id="amount_min"
                type="number"
                placeholder="Min Amount"
                value={filters.amount_min}
                onChange={(e) => setFilters({...filters, amount_min: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="amount_max">Max Amount</Label>
              <Input
                id="amount_max"
                type="number"
                placeholder="Max Amount"
                value={filters.amount_max}
                onChange={(e) => setFilters({...filters, amount_max: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Clear Filters
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={() => handleFilteredAction('stop')}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Filtered
            </Button>
            
            <Button 
              variant="default" 
              onClick={() => handleFilteredAction('allow')}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Allow Filtered
            </Button>

            <Button 
              variant="outline" 
              onClick={fetchStats}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Stats
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
