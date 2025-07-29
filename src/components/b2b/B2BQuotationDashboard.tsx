'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import B2BQuotationList from './B2BQuotationList';
import B2BQuotationForm from './B2BQuotationForm';
import B2BQuotationDetail from './B2BQuotationDetail';
import { B2BQuotation } from '@/lib/api';

interface B2BQuotationDashboardProps {
  orderId?: string; // Optional: if managing quotations for specific order
}

const B2BQuotationDashboard: React.FC<B2BQuotationDashboardProps> = ({ orderId }) => {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedQuotation, setSelectedQuotation] = useState<B2BQuotation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Mock stats - in real app, these would come from API
  const stats = {
    total: 156,
    draft: 23,
    sent: 45,
    approved: 67,
    rejected: 21
  };

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

        <Button onClick={handleCreateQuotation} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Quotation
        </Button>
      </div>

      {/* Stats Cards */}
      {!orderId && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draft}</div>
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
              <div className="text-2xl font-bold">{stats.sent}</div>
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
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">
                Ready for service
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">76%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>
        </div>
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
