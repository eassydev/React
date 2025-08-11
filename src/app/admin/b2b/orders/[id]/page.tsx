'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Edit, Calendar, MapPin, User, Building, Phone, Mail, CreditCard, Package } from 'lucide-react';
import { fetchB2BOrderById, updateB2BOrderStatus } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface B2BOrder {
  id: string;
  order_number: string;
  customer: {
    company_name: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    gst_number: string;
  };
  service_name: string;
  service_description?: string;
  service_address: string;
  custom_price: number;
  quantity?: number;
  total_amount?: number;
  service_date?: string;
  service_time?: string;
  booking_received_date?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_terms?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function B2BOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<B2BOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Status editing state
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchB2BOrderById(params.id);
      const orderData = data.data;
      setOrder(orderData);
      setNewStatus(orderData.status);
      setNewPaymentStatus(orderData.payment_status);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      setError(error.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order) return;
    
    try {
      setSaving(true);
      setError('');

      const updateData: any = {};
      
      if (newStatus !== order.status) {
        updateData.status = newStatus;
      }
      
      if (newPaymentStatus !== order.payment_status) {
        updateData.payment_status = newPaymentStatus;
      }
      
      if (statusNotes.trim()) {
        updateData.notes = statusNotes.trim();
      }

      if (Object.keys(updateData).length === 0) {
        setEditingStatus(false);
        return;
      }

      await updateB2BOrderStatus(params.id, updateData);
      
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Order status updated successfully',
      });

      // Refresh order data
      await fetchOrder();
      setEditingStatus(false);
      setStatusNotes('');
      
    } catch (error: any) {
      console.error('Error updating status:', error);
      setError(error.message || 'Failed to update order status');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'In Progress', className: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
      rejected: { label: 'Rejected', className: 'bg-gray-100 text-gray-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
      failed: { label: 'Failed', className: 'bg-red-100 text-red-800' },
      refunded: { label: 'Refunded', className: 'bg-gray-100 text-gray-800' },
    };
    
    const config = statusConfig[paymentStatus as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="container mx-auto py-6">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-6">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>Order not found</AlertDescription>
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
            onClick={() => router.push('/admin/b2b/orders')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-2xl font-bold">B2B Order Details</h1>
            <p className="text-gray-600">Order #{order.order_number}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/b2b/orders/${params.id}/editable-fields`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Details
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Company Name</Label>
                  <p className="text-sm font-medium">{order.customer.company_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Contact Person</Label>
                  <p className="text-sm">{order.customer.contact_person}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {order.customer.phone}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {order.customer.email}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <p className="text-sm flex items-start">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5" />
                    {order.customer.address}, {order.customer.city}, {order.customer.state}
                  </p>
                </div>
                {order.customer.gst_number && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">GST Number</Label>
                    <p className="text-sm">{order.customer.gst_number}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Service Name</Label>
                  <p className="text-sm font-medium">{order.service_name}</p>
                </div>
                {order.service_description && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                    <p className="text-sm">{order.service_description}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Service Address</Label>
                  <p className="text-sm flex items-start">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5" />
                    {order.service_address}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Service Date</Label>
                  <p className="text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {order.service_date ? new Date(order.service_date).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Service Time</Label>
                  <p className="text-sm">{order.service_time || 'TBD'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Status Management
                {!editingStatus && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingStatus(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!editingStatus ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Order Status</Label>
                    <div className="mt-1">{getStatusBadge(order.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Payment Status</Label>
                    <div className="mt-1">{getPaymentStatusBadge(order.payment_status)}</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Order Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="payment_status">Payment Status</Label>
                    <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="Add notes about this status change..."
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleStatusUpdate}
                      disabled={saving}
                      size="sm"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingStatus(false);
                        setNewStatus(order.status);
                        setNewPaymentStatus(order.payment_status);
                        setStatusNotes('');
                        setError('');
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Custom Price:</span>
                  <span className="text-sm font-medium">₹{order.custom_price.toLocaleString()}</span>
                </div>
                {order.quantity && order.quantity > 1 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="text-sm font-medium">{order.quantity}</span>
                  </div>
                )}
                {order.total_amount && (
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Total Amount:</span>
                    <span className="text-sm font-bold">₹{order.total_amount.toLocaleString()}</span>
                  </div>
                )}
                {order.payment_terms && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Payment Terms</Label>
                    <p className="text-sm">{order.payment_terms}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <Label className="text-gray-500">Created:</Label>
                  <p>{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Last Updated:</Label>
                  <p>{new Date(order.updated_at).toLocaleString()}</p>
                </div>
                {order.booking_received_date && (
                  <div>
                    <Label className="text-gray-500">Booking Received:</Label>
                    <p>{new Date(order.booking_received_date).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
