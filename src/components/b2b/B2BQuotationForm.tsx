'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, Send, Calculator } from 'lucide-react';
import { createB2BQuotation, updateB2BQuotation, createB2BQuotationForOrder, B2BQuotation, B2BQuotationItem, getAllB2BCustomers, B2BCustomer } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface B2BQuotationFormProps {
  quotation?: B2BQuotation; // For editing existing quotation
  orderId?: string; // For creating quotation for specific order
  onSuccess?: (quotation: B2BQuotation) => void;
  onCancel?: () => void;
}

const B2BQuotationForm: React.FC<B2BQuotationFormProps> = ({
  quotation,
  orderId,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<B2BCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>(quotation?.b2b_customer_id || '');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // ✅ Determine quotation mode
  const isBookingBased = !!orderId;
  const isStandalone = !orderId && !quotation?.b2b_booking_id;

  const [formData, setFormData] = useState<Partial<B2BQuotation>>({
    b2b_booking_id: orderId || quotation?.b2b_booking_id || '',
    b2b_customer_id: quotation?.b2b_customer_id || '',
    service_name: quotation?.service_name || '', // ✅ NEW: Required for standalone quotations
    service_description: quotation?.service_description || '', // ✅ NEW: Optional description
    site_address: quotation?.site_address || '', // ✅ NEW: Site address field
    initial_amount: quotation?.initial_amount || 0,
    final_amount: quotation?.final_amount || 0,
    quotation_items: quotation?.quotation_items || [],
    terms_and_conditions: quotation?.terms_and_conditions || 'Payment in advance as mutually agreed by the Parties.',
    validity_days: quotation?.validity_days || 30,
    sp_notes: quotation?.sp_notes || '',
    admin_notes: quotation?.admin_notes || '',
    status: quotation?.status || 'draft'
  });

  const [quotationItems, setQuotationItems] = useState<B2BQuotationItem[]>(
    quotation?.quotation_items || [
      { service: '', description: '', quantity: 1, rate: 0, amount: 0 }
    ]
  );

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = quotationItems.reduce((sum, item) => sum + item.amount, 0);
    const gstAmount = subtotal * 0.18; // 18% GST
    const totalAmount = subtotal + gstAmount;

    setFormData(prev => ({
      ...prev,
      initial_amount: subtotal,
      final_amount: subtotal,
      gst_amount: gstAmount,
      total_amount: totalAmount
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [quotationItems]);

  // ✅ Load customers for standalone quotations
  useEffect(() => {
    if (isStandalone) {
      const loadCustomers = async () => {
        try {
          setCustomersLoading(true);
          console.log('🔍 Loading customers for standalone quotation...');
          const response = await getAllB2BCustomers();
          console.log('📥 Customer API response:', response);

          if (response.success) {
            const customerList = response.data.customers || [];
            console.log('👥 Loaded customers:', customerList.length, 'customers');
            setCustomers(customerList);

            if (customerList.length === 0) {
              toast({
                title: 'No Customers',
                description: 'No active customers found. Please add customers first.',
                variant: 'destructive',
              });
            }
          } else {
            console.error('❌ API returned success: false');
            toast({
              title: 'Error',
              description: response.message || 'Failed to load customers',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('❌ Error loading customers:', error);
          toast({
            title: 'Error',
            description: 'Failed to load customers. Please check your connection.',
            variant: 'destructive',
          });
        } finally {
          setCustomersLoading(false);
        }
      };
      loadCustomers();
    }
  }, [isStandalone]);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.customer-search-container')) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Filter customers based on search query
  const filteredCustomers = customers.filter(customer => {
    if (!customerSearch.trim()) return true;
    const searchLower = customerSearch.toLowerCase();
    return (
      customer.company_name?.toLowerCase().includes(searchLower) ||
      customer.contact_person?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(customerSearch.trim())
    );
  });

  // ✅ Get selected customer details
  const selectedCustomerDetails = customers.find(c => c.id === selectedCustomer);

  // ✅ Handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(customerId);
    setFormData(prev => ({ ...prev, b2b_customer_id: customerId }));
    setShowCustomerDropdown(false);

    // Set search to selected customer name for better UX
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setCustomerSearch(`${customer.company_name} - ${customer.contact_person}`);
    }
  };

  const handleItemChange = (index: number, field: keyof B2BQuotationItem, value: string | number) => {
    const updatedItems = [...quotationItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Recalculate amount for this item
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }

    setQuotationItems(updatedItems);
  };

  const addQuotationItem = () => {
    setQuotationItems([
      ...quotationItems,
      { service: '', description: '', quantity: 1, rate: 0, amount: 0 }
    ]);
  };

  const removeQuotationItem = (index: number) => {
    if (quotationItems.length > 1) {
      setQuotationItems(quotationItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (action: 'save' | 'send' = 'save') => {
    try {
      setLoading(true);

      // ✅ Validation based on quotation method
      if (isStandalone) {
        // Standalone quotation validation
        if (!selectedCustomer || !formData.b2b_customer_id) {
          toast({
            title: 'Error',
            description: 'Please select a customer for this quotation',
            variant: 'destructive',
          });
          return;
        }

        if (!formData.service_name?.trim()) {
          toast({
            title: 'Error',
            description: 'Service name is required for standalone quotations',
            variant: 'destructive',
          });
          return;
        }
      } else {
        // Booking-based quotation validation
        if (!formData.b2b_booking_id) {
          toast({
            title: 'Error',
            description: 'Booking ID is required',
            variant: 'destructive',
          });
          return;
        }
      }

      if (quotationItems.some(item => !item.service || item.rate <= 0)) {
        toast({
          title: 'Error',
          description: 'All quotation items must have service name and valid rate',
          variant: 'destructive',
        });
        return;
      }

      const quotationData = {
        ...formData,
        quotation_items: quotationItems,
        status: action === 'send' ? 'sent' : formData.status
      };

      let response;
      
      if (quotation?.id) {
        // Update existing quotation
        response = await updateB2BQuotation(quotation.id, quotationData);
      } else if (orderId) {
        // Create quotation for specific order
        response = await createB2BQuotationForOrder(orderId, quotationData);
      } else {
        // Create new quotation
        response = await createB2BQuotation(quotationData);
      }

      if (response.success) {
        toast({
          title: 'Success',
          description: `Quotation ${quotation?.id ? 'updated' : 'created'} successfully${action === 'send' ? ' and sent' : ''}`,
        });
        onSuccess?.(response.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save quotation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {quotation?.id ? 'Edit Quotation' : 'Create New Quotation'}
            {quotation?.quotation_number && (
              <span className="text-sm font-normal text-gray-500">
                ({quotation.quotation_number})
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quotation Mode Indicator */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900">
              {isBookingBased ? '📋 Booking-based Quotation' : '🆕 Standalone Quotation'}
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              {isBookingBased
                ? 'Creating quotation for existing booking/order'
                : 'Creating new quotation without existing booking'}
            </p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Selection - Only for standalone quotations */}
            {isStandalone && (
              <div className="md:col-span-2">
                <Label htmlFor="customer_id">Select Customer *</Label>
                <div className="relative customer-search-container">
                  <Input
                    type="text"
                    placeholder={
                      customersLoading
                        ? "Loading customers..."
                        : customers.length === 0
                          ? "No customers available"
                          : "Search customers by name, contact, email, or phone..."
                    }
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                      // Clear selection if user is typing
                      if (e.target.value !== selectedCustomerDetails?.company_name + ' - ' + selectedCustomerDetails?.contact_person) {
                        setSelectedCustomer('');
                        setFormData(prev => ({ ...prev, b2b_customer_id: '' }));
                      }
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    disabled={customersLoading}
                    className="pr-10"
                  />

                  {/* Search/Dropdown Icon */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {customersLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>

                  {/* Dropdown Results */}
                  {showCustomerDropdown && !customersLoading && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredCustomers.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          {customers.length === 0
                            ? "No customers found. Please add customers first."
                            : customerSearch.trim()
                              ? `No customers match "${customerSearch}"`
                              : "Start typing to search customers..."
                          }
                        </div>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => handleCustomerSelect(customer.id)}
                          >
                            <div className="font-medium text-gray-900">
                              {customer.company_name}
                            </div>
                            <div className="text-sm text-gray-600">
                              👤 {customer.contact_person} • 📧 {customer.email} • 📞 {customer.phone}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Customer Display */}
                {selectedCustomerDetails && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-green-900">
                          ✅ Selected: {selectedCustomerDetails.company_name}
                        </div>
                        <div className="text-sm text-green-700">
                          Contact: {selectedCustomerDetails.contact_person} • {selectedCustomerDetails.email}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer('');
                          setCustomerSearch('');
                          setFormData(prev => ({ ...prev, b2b_customer_id: '' }));
                        }}
                        className="text-green-700 hover:text-green-900"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  {customersLoading
                    ? "Loading available customers..."
                    : customers.length === 0
                      ? "No customers available. Please add customers in the B2B Customers section first."
                      : selectedCustomerDetails
                        ? "Customer selected. You can click 'Change' to select a different customer."
                        : "Type to search and select the customer who will receive this quotation"}
                </p>
              </div>
            )}

            {/* Booking ID - Only for booking-based quotations */}
            {isBookingBased && (
              <div>
                <Label htmlFor="booking_id">Booking ID</Label>
                <Input
                  id="booking_id"
                  value={formData.b2b_booking_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, b2b_booking_id: e.target.value }))}
                  placeholder="Enter booking ID"
                  disabled={!!orderId || !!quotation?.id}
                />
              </div>
            )}

            {/* Service Information - Only for standalone quotations */}
            {isStandalone && (
              <>
                <div>
                  <Label htmlFor="service_name">Service Name *</Label>
                  <Input
                    id="service_name"
                    value={formData.service_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
                    placeholder="e.g., Deep Cleaning Service, Pest Control, etc."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="service_description">Service Description</Label>
                  <Textarea
                    id="service_description"
                    value={formData.service_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_description: e.target.value }))}
                    placeholder="Brief description of the service to be provided..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Site Address - Available for all quotations */}
            <div className="md:col-span-2">
              <Label htmlFor="site_address">Site Address</Label>
              <Textarea
                id="site_address"
                value={formData.site_address}
                onChange={(e) => setFormData(prev => ({ ...prev, site_address: e.target.value }))}
                placeholder="Enter the complete site address where service will be performed..."
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                This address will appear on the quotation PDF
              </p>
            </div>

            <div>
              <Label htmlFor="validity_days">Validity (Days)</Label>
              <Input
                id="validity_days"
                type="number"
                value={formData.validity_days}
                onChange={(e) => setFormData(prev => ({ ...prev, validity_days: parseInt(e.target.value) || 30 }))}
                placeholder="30"
              />
            </div>
          </div>

          {/* Quotation Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-semibold">Quotation Items</Label>
              <Button onClick={addQuotationItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotationItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={item.service}
                        onChange={(e) => handleItemChange(index, 'service', e.target.value)}
                        placeholder="Service name"
                        className="min-w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Description (supports bullet points with - or numbered lists with 1. 2. etc.)"
                        className="min-w-40 min-h-20"
                        rows={3}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-20"
                        min="1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-24"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(item.amount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeQuotationItem(index)}
                        disabled={quotationItems.length === 1}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="mt-4 space-y-2 text-right">
              <div className="flex justify-end gap-4">
                <span>Subtotal:</span>
                <span className="font-medium w-24">
                  {formatCurrency(formData.initial_amount || 0)}
                </span>
              </div>
              <div className="flex justify-end gap-4">
                <span>GST (18%):</span>
                <span className="font-medium w-24">
                  {formatCurrency(formData.gst_amount || 0)}
                </span>
              </div>
              <div className="flex justify-end gap-4 text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="w-24">
                  {formatCurrency(formData.total_amount || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Terms and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={formData.terms_and_conditions}
                onChange={(e) => setFormData(prev => ({ ...prev, terms_and_conditions: e.target.value }))}
                placeholder="Enter terms and conditions"
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="sp_notes">Service Provider Notes</Label>
                <Textarea
                  id="sp_notes"
                  value={formData.sp_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, sp_notes: e.target.value }))}
                  placeholder="Notes for service provider"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="admin_notes">Admin Notes</Label>
                <Textarea
                  id="admin_notes"
                  value={formData.admin_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                  placeholder="Internal admin notes"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              onClick={() => handleSubmit('save')}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Draft'}
            </Button>

            <Button
              onClick={() => handleSubmit('send')}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Save & Send'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default B2BQuotationForm;
