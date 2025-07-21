'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Home, Wrench, Calculator } from 'lucide-react';

interface B2BEditableFieldsFormProps {
  clientType: 'mobile_stores' | 'furniture_rental' | 'ac_manufacturer' | 'general';
  formData: any;
  onChange: (field: string, value: string) => void;
}

export const B2BEditableFieldsForm: React.FC<B2BEditableFieldsFormProps> = ({
  clientType,
  formData,
  onChange
}) => {
  const getClientTypeConfig = () => {
    switch (clientType) {
      case 'mobile_stores':
        return {
          title: 'Mobile Store Details',
          icon: <Store className="h-5 w-5" />,
          fields: [
            { key: 'service_rate', label: 'Service Rate (₹)', type: 'number', placeholder: 'Rate per service', required: true },
            { key: 'store_name', label: 'Store Name', type: 'text', placeholder: 'e.g., Mobile World Pune', required: true },
            { key: 'store_code', label: 'Store Code', type: 'text', placeholder: 'e.g., MW-PUN-001', required: true },
            { key: 'booking_poc_name', label: 'Store Manager', type: 'text', placeholder: 'Store manager name' },
            { key: 'booking_poc_number', label: 'Store Contact', type: 'tel', placeholder: 'Store contact number' },
          ]
        };
      
      case 'furniture_rental':
        return {
          title: 'Furniture Rental Details',
          icon: <Home className="h-5 w-5" />,
          fields: [
            { key: 'service_rate', label: 'Rate per Sq.Ft (₹)', type: 'number', placeholder: 'Rate per square foot', required: true },
            { key: 'service_area_sqft', label: 'Service Area (Sq.Ft)', type: 'number', placeholder: 'Area in square feet', required: true },
            { key: 'store_name', label: 'Location Name', type: 'text', placeholder: 'e.g., Client Office Mumbai' },
            { key: 'booking_poc_name', label: 'Site Contact', type: 'text', placeholder: 'On-site contact person' },
            { key: 'booking_poc_number', label: 'Site Contact Number', type: 'tel', placeholder: 'On-site contact number' },
          ]
        };
      
      case 'ac_manufacturer':
        return {
          title: 'AC Installation Details',
          icon: <Wrench className="h-5 w-5" />,
          fields: [
            { key: 'service_rate', label: 'Installation Rate (₹)', type: 'number', placeholder: 'Rate per AC unit', required: true },
            { key: 'service_area_sqft', label: 'Room Area (Sq.Ft)', type: 'number', placeholder: 'Room area in square feet' },
            { key: 'store_name', label: 'Installation Site', type: 'text', placeholder: 'e.g., Customer Home/Office' },
            { key: 'booking_poc_name', label: 'Customer Contact', type: 'text', placeholder: 'Customer contact person' },
            { key: 'booking_poc_number', label: 'Customer Number', type: 'tel', placeholder: 'Customer contact number' },
          ]
        };
      
      default:
        return {
          title: 'Service Details',
          icon: <Calculator className="h-5 w-5" />,
          fields: [
            { key: 'service_rate', label: 'Service Rate (₹)', type: 'number', placeholder: 'Service rate' },
            { key: 'store_name', label: 'Service Location', type: 'text', placeholder: 'Service location name' },
            { key: 'booking_poc_name', label: 'Contact Person', type: 'text', placeholder: 'Contact person name' },
            { key: 'booking_poc_number', label: 'Contact Number', type: 'tel', placeholder: 'Contact number' },
          ]
        };
    }
  };

  const config = getClientTypeConfig();

  const calculateTotal = () => {
    const rate = parseFloat(formData.service_rate) || 0;
    const area = parseFloat(formData.service_area_sqft) || 1;
    const quantity = parseInt(formData.quantity) || 1;
    
    if (clientType === 'furniture_rental' && formData.service_area_sqft) {
      return rate * area * quantity;
    }
    
    return rate * quantity;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {config.icon}
          <span>{config.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.fields.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id={field.key}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.key] || ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                required={field.required}
                step={field.type === 'number' ? '0.01' : undefined}
                min={field.type === 'number' ? '0' : undefined}
              />
            </div>
          ))}
        </div>

        {/* Service Address */}
        <div>
          <Label htmlFor="store_address">Service Address</Label>
          <Textarea
            id="store_address"
            placeholder="Complete service address where work will be performed"
            value={formData.store_address || ''}
            onChange={(e) => onChange('store_address', e.target.value)}
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            This is where the actual service will be performed (different from company registered address)
          </p>
        </div>

        {/* Calculation Display for Area-based Services */}
        {(clientType === 'furniture_rental' || clientType === 'ac_manufacturer') && 
         formData.service_rate && (formData.service_area_sqft || formData.quantity) && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Rate Calculation</h4>
            <div className="text-sm text-blue-800 space-y-1">
              {clientType === 'furniture_rental' && formData.service_area_sqft && (
                <>
                  <div>Rate per Sq.Ft: ₹{formData.service_rate}</div>
                  <div>Service Area: {formData.service_area_sqft} sq.ft</div>
                  <div>Quantity: {formData.quantity || 1}</div>
                  <div className="font-medium border-t border-blue-200 pt-1">
                    Calculated Total: ₹{calculateTotal().toFixed(2)}
                  </div>
                </>
              )}
              {clientType === 'ac_manufacturer' && (
                <>
                  <div>Rate per Unit: ₹{formData.service_rate}</div>
                  <div>Quantity: {formData.quantity || 1} units</div>
                  {formData.service_area_sqft && (
                    <div>Room Area: {formData.service_area_sqft} sq.ft</div>
                  )}
                  <div className="font-medium border-t border-blue-200 pt-1">
                    Calculated Total: ₹{calculateTotal().toFixed(2)}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Client Type Specific Instructions */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
          <div className="text-sm text-gray-600">
            {clientType === 'mobile_stores' && (
              <ul className="list-disc list-inside space-y-1">
                <li>Store Name and Code are required for chain store management</li>
                <li>Store Manager contact helps with on-site coordination</li>
                <li>Service rate is per service visit</li>
              </ul>
            )}
            {clientType === 'furniture_rental' && (
              <ul className="list-disc list-inside space-y-1">
                <li>Rate is calculated per square foot of service area</li>
                <li>Service area should be the actual area being serviced</li>
                <li>Site contact person should be available during service</li>
              </ul>
            )}
            {clientType === 'ac_manufacturer' && (
              <ul className="list-disc list-inside space-y-1">
                <li>Installation rate is per AC unit</li>
                <li>Room area helps determine installation complexity</li>
                <li>Customer contact is essential for installation coordination</li>
              </ul>
            )}
            {clientType === 'general' && (
              <ul className="list-disc list-inside space-y-1">
                <li>Fill in relevant details based on your service requirements</li>
                <li>Service location should be where work will be performed</li>
                <li>Contact person should be available during service</li>
              </ul>
            )}
          </div>
        </div>

        {/* Custom Fields (JSON) */}
        <div>
          <Label htmlFor="custom_fields_json">Additional Custom Fields (JSON)</Label>
          <Textarea
            id="custom_fields_json"
            placeholder='{"field_name": "value", "another_field": "another_value"}'
            value={formData.custom_fields ? JSON.stringify(formData.custom_fields, null, 2) : ''}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value || '{}');
                onChange('custom_fields', parsed);
              } catch (error) {
                // Invalid JSON, store as string for now
                onChange('custom_fields', e.target.value);
              }
            }}
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Add any additional fields specific to this client in JSON format
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
