'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Info } from 'lucide-react';
import { fetchB2BOrderById, updateB2BOrderEditableFields, fetchEditableFieldsTemplate } from '@/lib/api';

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

interface EditableFieldsTemplate {
  client_type: string;
  template: {
    required_fields: string[];
    optional_fields: string[];
    field_definitions: Record<string, {
      type: string;
      label: string;
      description: string;
      min?: number;
      max?: number;
      max_length?: number;
    }>;
  };
}

interface B2BOrder {
  id: string;
  order_number: string;
  customer: {
    company_name: string;
    contact_person: string;
    phone: string;
  };
  service_name: string;
  service_address: string;
  custom_price: number;
  service_rate?: number;
  service_area_sqft?: number;
  store_name?: string;
  store_code?: string;
  booking_poc_name?: string;
  booking_poc_number?: string;
  custom_fields?: Record<string, any>;
  notes?: string;
}

export default function EditableFieldsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<B2BOrder | null>(null);
  const [template, setTemplate] = useState<EditableFieldsTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientType, setClientType] = useState('mobile_stores');
  
  const [formData, setFormData] = useState({
    service_rate: '',
    service_area_sqft: '',
    store_name: '',
    store_code: '',
    booking_poc_name: '',
    booking_poc_number: '',
    custom_fields: {} as Record<string, any>,
    notes: '',
  });

  useEffect(() => {
    fetchOrder();
    fetchTemplate();
  }, [params.id, clientType]);

  const fetchOrder = async () => {
    try {
      const data = await fetchB2BOrderById(params.id);
      const orderData = data.data;
      setOrder(orderData);

      // Populate form with existing data
      setFormData({
        service_rate: orderData.service_rate?.toString() || '',
        service_area_sqft: orderData.service_area_sqft?.toString() || '',
        store_name: orderData.store_name || '',
        store_code: orderData.store_code || '',
        booking_poc_name: orderData.booking_poc_name || '',
        booking_poc_number: orderData.booking_poc_number || '',
        custom_fields: orderData.custom_fields || {},
        notes: orderData.notes || '',
      });
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const fetchTemplate = async () => {
    try {
      const data = await fetchEditableFieldsTemplate(clientType);
      setTemplate(data.data);
    } catch (error) {
      console.error('Error fetching template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCustomFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      custom_fields: {
        ...prev.custom_fields,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = {
        ...formData,
        service_rate: formData.service_rate ? parseFloat(formData.service_rate) : undefined,
        service_area_sqft: formData.service_area_sqft ? parseFloat(formData.service_area_sqft) : undefined,
      };

      await updateB2BOrderEditableFields(params.id, submitData);
      router.push('/admin/b2b/orders');
    } catch (error) {
      console.error('Error updating editable fields:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (fieldName: string, fieldDef: any, isRequired: boolean) => {
    const value = formData[fieldName as keyof typeof formData] as string;

    return (
      <div key={fieldName} className="space-y-2">
        <Label htmlFor={fieldName} className="flex items-center space-x-2">
          <span>{fieldDef.label}</span>
          {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
        </Label>
        
        {fieldDef.type === 'decimal' ? (
          <Input
            id={fieldName}
            type="number"
            step="0.01"
            min={fieldDef.min}
            max={fieldDef.max}
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={`Enter ${fieldDef.label.toLowerCase()}`}
          />
        ) : fieldDef.type === 'text' ? (
          <Textarea
            id={fieldName}
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={`Enter ${fieldDef.label.toLowerCase()}`}
            rows={3}
          />
        ) : (
          <Input
            id={fieldName}
            type="text"
            maxLength={fieldDef.max_length}
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={`Enter ${fieldDef.label.toLowerCase()}`}
          />
        )}
        
        {fieldDef.description && (
          <p className="text-sm text-gray-500">{fieldDef.description}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

        {/* Client Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Client Type Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client-type">Select Client Type</Label>
                <Select value={clientType} onValueChange={setClientType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile_stores">Mobile Stores</SelectItem>
                    <SelectItem value="furniture_rental">Furniture Rental</SelectItem>
                    <SelectItem value="ac_manufacturer">AC Manufacturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {template && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Required fields:</strong> {template.template.required_fields.join(', ')}
                    <br />
                    <strong>Optional fields:</strong> {template.template.optional_fields.join(', ')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Editable Fields Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Editable Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {template && (
                <>
                  {/* Required Fields */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Required Fields</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {template.template.required_fields && template.template.required_fields.length > 0 ? template.template.required_fields.map(fieldName => {
                        const fieldDef = template.template.field_definitions[fieldName];
                        return fieldDef ? renderField(fieldName, fieldDef, true) : null;
                      }) : (
                        <div className="text-gray-500">No required fields defined</div>
                      )}
                    </div>
                  </div>

                  {/* Optional Fields */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Optional Fields</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {template.template.optional_fields && template.template.optional_fields.length > 0 ? template.template.optional_fields.map(fieldName => {
                        const fieldDef = template.template.field_definitions[fieldName];
                        return fieldDef ? renderField(fieldName, fieldDef, false) : null;
                      }) : (
                        <div className="text-gray-500">No optional fields defined</div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Custom Fields */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter any additional notes or special requirements"
                    rows={4}
                  />
                </div>
              </div>

              {/* Submit Button */}
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
