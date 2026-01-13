'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import B2BQuotationList from './B2BQuotationList';
import B2BQuotationForm from './B2BQuotationForm';
import B2BQuotationDetail from './B2BQuotationDetail';
import { B2BQuotation } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface B2BQuotationDashboardProps {
  orderId?: string; // Optional: if managing quotations for specific order
}

interface QuotationStats {
  total: number;
  draft: number;
  sent: number;
  approved: number;
  rejected: number;
  expired: number;
  total_value: number;
  average_value: number;
  conversion_rate: number;
  spoc_message?: {
    type: string;
    title: string;
    message: string;
    action: string;
  };
}

const B2BQuotationDashboard: React.FC<B2BQuotationDashboardProps> = ({ orderId }) => {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedQuotation, setSelectedQuotation] = useState<B2BQuotation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<QuotationStats>({
    total: 0,
    draft: 0,
    sent: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
    total_value: 0,
    average_value: 0,
    conversion_rate: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const { toast } = useToast();

  // ✅ FETCH REAL QUOTATION STATISTICS
  const fetchQuotationStats = async () => {
    try {
      setIsLoadingStats(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/admin-api/b2b/quotations/statistics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token || '' // ✅ FIX: Use correct header name
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quotation statistics');
      }

      const result = await response.json();

      if (result.success) {
        setStats(result.data);

        // Show SPOC message if user has no assignments
        if (result.data.spoc_message) {
          toast({
            title: result.data.spoc_message.title,
            description: result.data.spoc_message.message,
            variant: "default"
          });
        }
      } else {
        throw new Error(result.message || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching quotation statistics:', error);
      toast({
        title: "Error",
        description: "Failed to load quotation statistics",
        variant: "destructive"
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Load statistics on component mount
  useEffect(() => {
    fetchQuotationStats();
  }, []);

  const handleCreateQuotation = () => {
    setSelectedQuotation(null);
    setIsCreating(true);
    setIsEditing(false);
    setActiveTab('form');
  };

  const handleEditQuotation = (quotation: B2BQuotation) => {
    setSelectedQuotation(quotation);
    setIsCreating(false);
    setIsEditing(true);
    setActiveTab('form');
  };

  const handleViewQuotation = (quotation: B2BQuotation) => {
    setSelectedQuotation(quotation);
    setActiveTab('detail');
  };

  const handleFormSuccess = (quotation: B2BQuotation) => {
    setSelectedQuotation(quotation);
    setIsCreating(false);
    setIsEditing(false);
    setActiveTab('detail');
    // Refresh statistics after creating/updating quotation
    fetchQuotationStats();
  };

  const handleFormCancel = () => {
    setSelectedQuotation(null);
    setIsCreating(false);
    setIsEditing(false);
    setActiveTab('list');
  };

  const handleBackToList = () => {
    setSelectedQuotation(null);
    setActiveTab('list');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {orderId ? 'Order Quotations' : 'B2B Quotation Management'}
          </h1>
          <p className="text-muted-foreground">
            {orderId
              ? 'Manage quotations for this specific order'
              : 'Create, manage, and track B2B quotations'
            }
          </p>
        </div>

        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href={orderId ? `/admin/b2b/quotations/add?orderId=${orderId}` : '/admin/b2b/quotations/add'}>
            <Plus className="h-4 w-4 mr-2" />
            Create Quotation
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {!orderId && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats.total.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                ₹{isLoadingStats ? '...' : stats.total_value.toLocaleString()} total value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats.draft}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats.sent}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats.approved}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready for service
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats.rejected}
              </div>
              <p className="text-xs text-muted-foreground">
                Need revision
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats.expired}
              </div>
              <p className="text-xs text-muted-foreground">
                Past validity date
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : `${stats.conversion_rate}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                Approval rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SPOC No Assignments Message */}
      {stats.spoc_message && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">{stats.spoc_message.title}</h3>
                <p className="text-sm text-yellow-700 mt-1">{stats.spoc_message.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Quotations List</TabsTrigger>
          <TabsTrigger value="form" disabled={!isCreating && !isEditing}>
            {isEditing ? 'Edit Quotation' : 'Create Quotation'}
          </TabsTrigger>
          <TabsTrigger value="detail" disabled={!selectedQuotation}>
            Quotation Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <B2BQuotationList
            orderId={orderId}
            onViewQuotation={handleViewQuotation}
            onEditQuotation={handleEditQuotation}
          />
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          {(isCreating || isEditing) && (
            <B2BQuotationForm
              quotation={isEditing ? selectedQuotation || undefined : undefined}
              orderId={isCreating ? orderId : undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          )}
        </TabsContent>

        <TabsContent value="detail" className="space-y-4">
          {selectedQuotation && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handleBackToList}
                >
                  ← Back to List
                </Button>
              </div>

              <B2BQuotationDetail
                quotationId={selectedQuotation.id!}
                onEdit={handleEditQuotation}
                onClose={handleBackToList}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default B2BQuotationDashboard;
