'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ✅ IMPORT EXISTING COMPONENTS (REUSE INSTEAD OF RECREATE)
import { CategorySelector } from '@/components/service/CategorySelector';
import { SubcategorySelector } from '@/components/service/SubcategorySelector';
import { ProviderSelector } from '@/components/provider/ProviderSelector';
import { RateCardSelector } from '@/components/service/RateCardSelector';
import { FilterAttributeSelector } from '@/components/service/FilterAttributeSelector';
import { ServiceAddressSelector } from '@/components/address/ServiceAddressSelector';

// ✅ IMPORT B2B SPECIFIC COMPONENTS
import { B2BCustomerSelector } from '@/components/b2b/B2BCustomerSelector';
import { B2BServiceAddressManager } from '@/components/b2b/B2BServiceAddressManager';
import { B2BEditableFieldsForm } from '@/components/b2b/B2BEditableFieldsForm';

// API imports
import { 
  fetchB2BCustomers, 
  createB2BOrder,
  fetchCategories,
  fetchSubcategories,
  fetchProviders,
  fetchRateCards,
  fetchServiceSegments
} from '@/lib/api';

interface B2BOrderFormData {
  // Customer & Address
  b2b_customer_id: string;
  b2b_service_address_id: string;
  service_address_override: any;
  
  // Service Selection (✅ INTEGRATED WITH EXISTING SYSTEM)
  rate_card_id: string;
  category_id: string;
  subcategory_id: string;
  segment_id: string;
  package_id: string;
  filter_attributes: any;
  selection_type: 'rate_card' | 'package' | 'custom';
  
  // Provider Selection (✅ REUSE EXISTING COMPONENTS)
  provider_id: string;
  staff_id: string;
  
  // Service Details
  service_name: string;
  service_description: string;
  service_type: 'service' | 'package';
  
  // Pricing (✅ RATE CARD + CUSTOM OVERRIDE)
  base_price: string;
  custom_price_override: string;
  final_price: string;
  quantity: string;
  discount_amount: string;
  
  // Scheduling
  service_date: string;
  service_time: string;
  start_service_time: string;
  end_service_time: string;
  
  // B2B Specific Editable Fields
  service_rate: string;
  service_area_sqft: string;
  store_name: string;
  store_code: string;
  store_address: string;
  booking_poc_name: string;
  booking_poc_number: string;
  custom_fields: any;
  
  // Additional
  payment_terms: string;
  notes: string;
}

export default function CorrectedB2BOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ✅ INTEGRATED STATE MANAGEMENT
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedSegment, setSelectedSegment] = useState<string>('');
  const [selectedRateCard, setSelectedRateCard] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [selectedServiceAddress, setSelectedServiceAddress] = useState<any>(null);
  const [filterAttributes, setFilterAttributes] = useState<any>({});

  const [formData, setFormData] = useState<B2BOrderFormData>({
    b2b_customer_id: '',
    b2b_service_address_id: '',
    service_address_override: null,
    rate_card_id: '',
    category_id: '',
    subcategory_id: '',
    segment_id: '',
    package_id: '',
    filter_attributes: {},
    selection_type: 'rate_card',
    provider_id: '',
    staff_id: '',
    service_name: '',
    service_description: '',
    service_type: 'service',
    base_price: '',
    custom_price_override: '',
    final_price: '',
    quantity: '1',
    discount_amount: '0',
    service_date: '',
    service_time: '',
    start_service_time: '',
    end_service_time: '',
    service_rate: '',
    service_area_sqft: '',
    store_name: '',
    store_code: '',
    store_address: '',
    booking_poc_name: '',
    booking_poc_number: '',
    custom_fields: {},
    payment_terms: 'Net 30 days',
    notes: '',
  });

  // ✅ HANDLERS FOR INTEGRATED COMPONENTS
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      b2b_customer_id: customer.id,
      // Auto-populate POC from customer if not overridden
      booking_poc_name: customer.contact_person,
      booking_poc_number: customer.phone,
    }));
  };

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category.id);
    setFormData(prev => ({
      ...prev,
      category_id: category.id,
      subcategory_id: '', // Reset dependent fields
      segment_id: '',
      rate_card_id: '',
    }));
  };

  const handleSubcategorySelect = (subcategory: any) => {
    setSelectedSubcategory(subcategory.id);
    setFormData(prev => ({
      ...prev,
      subcategory_id: subcategory.id,
      segment_id: '', // Reset dependent fields
      rate_card_id: '',
    }));
  };

  const handleFilterAttributeSelect = (attributes: any) => {
    setFilterAttributes(attributes);
    setFormData(prev => ({
      ...prev,
      filter_attributes: attributes,
      rate_card_id: '', // Reset rate card when filters change
    }));
  };

  const handleRateCardSelect = (rateCard: any) => {
    setSelectedRateCard(rateCard);
    setFormData(prev => ({
      ...prev,
      rate_card_id: rateCard.id,
      service_name: rateCard.name,
      base_price: rateCard.price.toString(),
      final_price: prev.custom_price_override || rateCard.price.toString(),
    }));
  };

  const handleProviderSelect = (provider: any) => {
    setSelectedProvider(provider);
    setFormData(prev => ({
      ...prev,
      provider_id: provider.id,
    }));
  };

  const handleServiceAddressSelect = (address: any) => {
    setSelectedServiceAddress(address);
    setFormData(prev => ({
      ...prev,
      b2b_service_address_id: address.id,
      store_name: address.store_name,
      store_code: address.store_code,
      store_address: `${address.address_line_1}, ${address.city}, ${address.state} ${address.pincode}`,
      booking_poc_name: address.contact_person || prev.booking_poc_name,
      booking_poc_number: address.contact_phone || prev.booking_poc_number,
    }));
  };

  const handleCustomPriceOverride = (value: string) => {
    const override = parseFloat(value) || 0;
    const basePrice = parseFloat(formData.base_price) || 0;
    
    setFormData(prev => ({
      ...prev,
      custom_price_override: value,
      final_price: override > 0 ? value : prev.base_price,
    }));
  };

  const calculateTotalAmount = () => {
    const finalPrice = parseFloat(formData.final_price) || 0;
    const quantity = parseInt(formData.quantity) || 1;
    const discount = parseFloat(formData.discount_amount) || 0;
    
    const totalBeforeTax = (finalPrice * quantity) - discount;
    const gstAmount = totalBeforeTax * 0.18; // 18% GST
    const finalAmount = totalBeforeTax + gstAmount;
    
    return {
      totalBeforeTax: totalBeforeTax.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      finalAmount: finalAmount.toFixed(2),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const totals = calculateTotalAmount();
      
      const submitData = {
        ...formData,
        // Convert string values to appropriate types
        base_price: parseFloat(formData.base_price),
        custom_price_override: formData.custom_price_override ? parseFloat(formData.custom_price_override) : null,
        final_price: parseFloat(formData.final_price),
        quantity: parseInt(formData.quantity),
        discount_amount: parseFloat(formData.discount_amount),
        total_amount: parseFloat(totals.totalBeforeTax),
        gst_amount: parseFloat(totals.gstAmount),
        final_amount: parseFloat(totals.finalAmount),
        service_rate: formData.service_rate ? parseFloat(formData.service_rate) : null,
        service_area_sqft: formData.service_area_sqft ? parseFloat(formData.service_area_sqft) : null,
      };

      await createB2BOrder(submitData);
      router.push('/admin/b2b/orders');
    } catch (error: any) {
      console.error('Error creating B2B order:', error);
      setError(error.message || 'Failed to create order. Please check your input and try again.');
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotalAmount();

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create B2B Order</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error creating order</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ✅ CUSTOMER SELECTION - REUSE EXISTING COMPONENT */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <B2BCustomerSelector onSelect={handleCustomerSelect} />
          </CardContent>
        </Card>

        {/* ✅ SERVICE SELECTION - INTEGRATED WITH EXISTING SYSTEM */}
        {selectedCustomer && (
          <Card>
            <CardHeader>
              <CardTitle>Service Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CategorySelector onSelect={handleCategorySelect} />
              
              {selectedCategory && (
                <SubcategorySelector 
                  categoryId={selectedCategory} 
                  onSelect={handleSubcategorySelect} 
                />
              )}
              
              {selectedSubcategory && (
                <FilterAttributeSelector
                  categoryId={selectedCategory}
                  subcategoryId={selectedSubcategory}
                  onSelect={handleFilterAttributeSelect}
                />
              )}
              
              {selectedSubcategory && (
                <RateCardSelector
                  categoryId={selectedCategory}
                  subcategoryId={selectedSubcategory}
                  filters={filterAttributes}
                  onSelect={handleRateCardSelect}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* ✅ PROVIDER SELECTION - REUSE EXISTING COMPONENT */}
        {selectedRateCard && (
          <Card>
            <CardHeader>
              <CardTitle>Service Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <ProviderSelector
                categoryId={selectedCategory}
                subcategoryId={selectedSubcategory}
                serviceDate={formData.service_date}
                onSelect={handleProviderSelect}
              />
            </CardContent>
          </Card>
        )}

        {/* ✅ SERVICE ADDRESS - B2B SPECIFIC MANAGEMENT */}
        {selectedProvider && (
          <Card>
            <CardHeader>
              <CardTitle>Service Address</CardTitle>
            </CardHeader>
            <CardContent>
              <B2BServiceAddressManager
                customerId={selectedCustomer.id}
                onSelect={handleServiceAddressSelect}
              />
            </CardContent>
          </Card>
        )}

        {/* ✅ PRICING - RATE CARD + CUSTOM OVERRIDE */}
        {selectedRateCard && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Rate Card Price</Label>
                  <Input value={`₹${formData.base_price}`} disabled />
                </div>
                <div>
                  <Label>Custom Price Override</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Leave empty to use rate card price"
                    value={formData.custom_price_override}
                    onChange={(e) => handleCustomPriceOverride(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Final Price</Label>
                  <Input value={`₹${formData.final_price}`} disabled />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Discount Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Payment Terms</Label>
                  <Select value={formData.payment_terms} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_terms: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net 15 days">Net 15 days</SelectItem>
                      <SelectItem value="Net 30 days">Net 30 days</SelectItem>
                      <SelectItem value="Net 45 days">Net 45 days</SelectItem>
                      <SelectItem value="Net 60 days">Net 60 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Pricing Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{totals.totalBeforeTax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%):</span>
                    <span>₹{totals.gstAmount}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Amount:</span>
                    <span>₹{totals.finalAmount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ✅ B2B EDITABLE FIELDS - CLIENT TYPE SPECIFIC */}
        {selectedServiceAddress && (
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              <B2BEditableFieldsForm
                clientType={selectedCustomer.client_type || 'mobile_stores'}
                formData={formData}
                onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
              />
            </CardContent>
          </Card>
        )}

        {/* ✅ SCHEDULING */}
        {selectedServiceAddress && (
          <Card>
            <CardHeader>
              <CardTitle>Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Service Date *</Label>
                  <Input
                    type="date"
                    value={formData.service_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={formData.start_service_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_service_time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.end_service_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_service_time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or special instructions"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !selectedServiceAddress}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Creating Order...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  );
}
