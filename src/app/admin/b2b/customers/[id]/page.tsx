'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Users, UserCheck, Package, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchB2BCustomerById } from '@/lib/api';

// Import SPOC and Contact components
import { B2BContactManager } from '@/components/b2b/B2BContactManager';
import { B2BSPOCManager } from '@/components/b2b/B2BSPOCManager';

interface B2BCustomer {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gst_number: string;
  pan_number: string;
  credit_limit: number;
  credit_days: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function B2BCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<B2BCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await fetchB2BCustomerById(customerId);

      // ✅ FIXED: Backend now returns data directly, not nested in .customer
      if (response.success && response.data) {
        setCustomer(response.data);
      } else {
        setError('Customer not found');
      }
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', variant: 'default' as const },
      inactive: { label: 'Inactive', variant: 'secondary' as const },
      suspended: { label: 'Suspended', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading customer details...</div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Customer not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/b2b/customers')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{customer.company_name}</h1>
            <p className="text-gray-600">Customer Details & Management</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/b2b/customers/edit/${customer.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Customer
          </Button>
          {getStatusBadge(customer.status)}
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Contact Persons
          </TabsTrigger>
          <TabsTrigger value="spoc" className="flex items-center">
            <UserCheck className="w-4 h-4 mr-2" />
            SPOC Assignments
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Communications
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Name</label>
                  <p className="text-lg font-semibold">{customer.company_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Person</label>
                  <p>{customer.contact_person}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p>{customer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p>{customer.phone}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">GST Number</label>
                  <p>{customer.gst_number || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">PAN Number</label>
                  <p>{customer.pan_number || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Credit Limit</label>
                  <p>₹{customer.credit_limit?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Credit Days</label>
                  <p>{customer.credit_days || '0'} days</p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p>{customer.address}</p>
                  <p>{customer.city}, {customer.state} - {customer.pincode}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Persons Tab */}
        <TabsContent value="contacts" className="mt-6">
          <B2BContactManager customer={customer} />
        </TabsContent>

        {/* SPOC Assignments Tab */}
        <TabsContent value="spoc" className="mt-6">
          <B2BSPOCManager />
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Orders & Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Orders management will be integrated here</p>
                <p className="text-sm">This will show all orders for this customer</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoices & Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Invoice management will be integrated here</p>
                <p className="text-sm">This will show outstanding invoices and payment history</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Communication history will be integrated here</p>
                <p className="text-sm">This will show email history and SPOC communications</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
