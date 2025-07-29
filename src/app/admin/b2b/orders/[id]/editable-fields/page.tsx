'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Info } from 'lucide-react';
import { fetchB2BOrderById, updateB2BOrderEditableFields } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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



interface B2BOrder {
  id: string;
  order_number: string;
  customer: {
    company_name: string;
    contact_person: string;
    phone: string;
  };
  b2b_customer_id: string;
  service_name: string;
  service_description?: string;
  service_address: string;
  category_id?: string;
  subcategory_id?: string;
  custom_price: number;
  quantity?: number;
  service_date?: string;
  service_time?: string;
  booking_received_date?: string;
  service_rate?: number;
  service_area_sqft?: number;
  store_name?: string;
  store_code?: string;
  booking_poc_name?: string;
  booking_poc_number?: string;
  payment_terms?: string;
  notes?: string;
  custom_fields?: Record<string, any>;
}

export default function EditableFieldsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<B2BOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  const [formData, setFormData] = useState({
    // Customer & Service Details
    b2b_customer_id: '',
    service_name: '',
    service_description: '',
    category_id: '',
    subcategory_id: '',

    // Pricing
    custom_price: '',
    quantity: '',

    // Scheduling
    service_date: '',
    service_time: '',
    booking_received_date: '',

    // Store Information
    service_rate: '',
    service_area_sqft: '',
    store_name: '',
    store_code: '',
    booking_poc_name: '',
    booking_poc_number: '',

    // Additional
    payment_terms: '',
    notes: '',
    custom_fields: {} as Record<string, any>,
  });

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      setError(''); // Clear any previous errors
      const data = await fetchB2BOrderById(params.id);
      const orderData = data.data;
      setOrder(orderData);

      // Format dates properly for input fields
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      };

      const formatTimeForInput = (timeString: string) => {
        if (!timeString) return '';
        // If it's already in HH:MM format, return as is
        if (timeString.match(/^\d{2}:\d{2}$/)) return timeString;
        // Otherwise try to parse and format
        const date = new Date(`1970-01-01T${timeString}`);
        return date.toTimeString().slice(0, 5); // HH:MM format
      };

      // Populate form with existing data
      setFormData({
        // Customer & Service Details
        b2b_customer_id: orderData.b2b_customer_id || '',
        service_name: orderData.service_name || '',
        service_description: orderData.service_description || '',
        category_id: orderData.category_id || '',
        subcategory_id: orderData.subcategory_id || '',

        // Pricing
        custom_price: orderData.custom_price?.toString() || '',
        quantity: orderData.quantity?.toString() || '1',

        // Scheduling - properly formatted for input fields
        service_date: formatDateForInput(orderData.service_date),
        service_time: formatTimeForInput(orderData.service_time),
        booking_received_date: formatDateForInput(orderData.booking_received_date),

        // Store Information
        service_rate: orderData.service_rate?.toString() || '',
        service_area_sqft: orderData.service_area_sqft?.toString() || '',
        store_name: orderData.store_name || '',
        store_code: orderData.store_code || '',
        booking_poc_name: orderData.booking_poc_name || '',
        booking_poc_number: orderData.booking_poc_number || '',

        // Additional
        payment_terms: orderData.payment_terms || 'Net 30 days',
        notes: orderData.notes || '',
        custom_fields: orderData.custom_fields || {},
      });
    } catch (error: any) {
      console.error('Error fetching order:', error);
      setError(error.message || 'Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear any previous error when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Basic validation
      if (!formData.service_name.trim()) {
        setError('Service name is required');
        setSaving(false);
        return;
      }

      if (!formData.custom_price || parseFloat(formData.custom_price) <= 0) {
        setError('Valid service price is required');
        setSaving(false);
        return;
      }

      const submitData = {
        ...formData,
        // Parse numeric fields
        custom_price: formData.custom_price ? parseFloat(formData.custom_price) : undefined,
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
        service_rate: formData.service_rate ? parseFloat(formData.service_rate) : undefined,
        service_area_sqft: formData.service_area_sqft ? parseFloat(formData.service_area_sqft) : undefined,
      };

      await updateB2BOrderEditableFields(params.id, submitData);
      setSuccess('Order updated successfully!');

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push('/admin/b2b/orders');
      }, 1500);
    } catch (error: any) {
      console.error('Error updating editable fields:', error);
      setError(error.message || 'Failed to update order. Please try again.');
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if order failed to load
  if (error && !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Order Fields</h1>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Failed to Load Order</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={() => {
                    setError('');
                    setLoading(true);
                    fetchOrder();
                  }}
                  className="mt-3 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Order Fields</h1>
            <p className="text-gray-600 mt-1">
              Order #{order?.order_number} - {order?.customer.company_name}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Service</Label>
                <p className="text-sm">{order?.service_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Base Price</Label>
                <p className="text-sm">₹{order?.custom_price.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Customer POC</Label>
                <p className="text-sm">{order?.customer.contact_person} ({order?.customer.phone})</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Service Address</Label>
                <p className="text-sm">{order?.service_address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comprehensive Edit Form */}
        <form onSubmit={handleSubmit}>
          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_name">Service Name *</Label>
                  <Input
                    id="service_name"
                    value={formData.service_name}
                    onChange={(e) => handleInputChange('service_name', e.target.value)}
                    placeholder="Enter service name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="custom_price">Service Price (₹) *</Label>
                  <Input
                    id="custom_price"
                    type="number"
                    step="0.01"
                    value={formData.custom_price}
                    onChange={(e) => handleInputChange('custom_price', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="service_description">Service Description</Label>
                <Textarea
                  id="service_description"
                  value={formData.service_description}
                  onChange={(e) => handleInputChange('service_description', e.target.value)}
                  placeholder="Enter service description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Select value={formData.payment_terms} onValueChange={(value) => handleInputChange('payment_terms', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net 15 days">Net 15 days</SelectItem>
                      <SelectItem value="Net 30 days">Net 30 days</SelectItem>
                      <SelectItem value="Net 45 days">Net 45 days</SelectItem>
                      <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="service_date">Service Date</Label>
                  <Input
                    id="service_date"
                    type="date"
                    value={formData.service_date}
                    onChange={(e) => handleInputChange('service_date', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="service_time">Service Time</Label>
                  <Input
                    id="service_time"
                    type="time"
                    value={formData.service_time}
                    onChange={(e) => handleInputChange('service_time', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="booking_received_date">Booking Received Date</Label>
                  <Input
                    id="booking_received_date"
                    type="date"
                    value={formData.booking_received_date}
                    onChange={(e) => handleInputChange('booking_received_date', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store Information */}
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store_name">Store Name</Label>
                  <Input
                    id="store_name"
                    value={formData.store_name}
                    onChange={(e) => handleInputChange('store_name', e.target.value)}
                    placeholder="Enter store name"
                  />
                </div>

                <div>
                  <Label htmlFor="store_code">Store Code</Label>
                  <Input
                    id="store_code"
                    value={formData.store_code}
                    onChange={(e) => handleInputChange('store_code', e.target.value)}
                    placeholder="Enter store code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_rate">Service Rate (₹/sqft)</Label>
                  <Input
                    id="service_rate"
                    type="number"
                    step="0.01"
                    value={formData.service_rate}
                    onChange={(e) => handleInputChange('service_rate', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="service_area_sqft">Service Area (sqft)</Label>
                  <Input
                    id="service_area_sqft"
                    type="number"
                    step="0.01"
                    value={formData.service_area_sqft}
                    onChange={(e) => handleInputChange('service_area_sqft', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="booking_poc_name">Booking POC Name</Label>
                  <Input
                    id="booking_poc_name"
                    value={formData.booking_poc_name}
                    onChange={(e) => handleInputChange('booking_poc_name', e.target.value)}
                    placeholder="Enter POC name"
                  />
                </div>

                <div>
                  <Label htmlFor="booking_poc_number">Booking POC Number</Label>
                  <Input
                    id="booking_poc_number"
                    value={formData.booking_poc_number}
                    onChange={(e) => handleInputChange('booking_poc_number', e.target.value)}
                    placeholder="Enter POC number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Enter any additional notes"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
