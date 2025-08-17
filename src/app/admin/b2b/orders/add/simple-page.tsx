'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import {
  fetchB2BCustomers,
  createB2BOrder,
  fetchAllCategories,
  fetchSubCategoriesByCategoryId,
  fetchFilterAttributes, // ✅ Use same as B2C
  fetchFilterOptionsByAttributeId,
  fetchServiceSegments, // ✅ Use same function as B2C
  fetchProvidersByFilters, // ✅ Use same function as B2C
  fetchB2BServiceAddresses,
  createB2BServiceAddress,
  calculateServicePriceForB2B,
  // ✅ NEW: Client Scenario Pricing APIs
  calculateB2BPricing,
  getB2BPricingRules,
  // ✅ Import types from API
  Category,
  Subcategory,
  Attribute,
  AttributeOption,
  ServiceSegment,
} from '@/lib/api';

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface B2BCustomer {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
}

// ✅ Use imported types from API, only define local interfaces
interface Provider {
  id: string;
  name: string;
  phone: string;
}

interface ServiceAddress {
  id: string;
  store_name: string;
  store_code: string;
  address_line_1: string;
  city: string;
}

// ✅ Use AttributeOption from API instead of custom interface

interface RateCard {
  id: string;
  service_name: string;
  base_price: number;
  final_price: number;
}

export default function SimpleB2BOrderPage() {
  const router = useRouter();

  // State - ✅ Use imported types
  const [customers, setCustomers] = useState<B2BCustomer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filterAttributes, setFilterAttributes] = useState<Attribute[]>([]);
  const [filterOptions, setFilterOptions] = useState<AttributeOption[]>([]);
  const [serviceSegments, setServiceSegments] = useState<ServiceSegment[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [serviceAddresses, setServiceAddresses] = useState<ServiceAddress[]>([]);

  // Selection state - Match B2C exactly
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [selectedFilterAttributesId, setSelectedFilterAttributesId] = useState<string>('');
  const [selectedFilterOptionId, setSelectedFilterOptionId] = useState<string>('');
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('');

  // Rate card and pricing
  const [selectedRateCard, setSelectedRateCard] = useState<RateCard | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  // ✅ NEW: Client Scenario Pricing
  const [availableScenarios, setAvailableScenarios] = useState<string[]>([]);
  const [pricingRules, setPricingRules] = useState<any>(null);
  const [scenarioPricing, setScenarioPricing] = useState<any>(null);
  const [isCalculatingScenarioPricing, setIsCalculatingScenarioPricing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Add address modal state
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    store_name: '',
    store_code: '',
    address_line_1: '',
    city: '',
    state: '',
    pincode: '',
    contact_person: '',
    contact_phone: ''
  });

  const [formData, setFormData] = useState({
    // Customer & Address
    b2b_customer_id: '',
    b2b_service_address_id: '',
    service_address: '', // ✅ Backend expects this field

    // ✅ NEW: Client Scenario for Pricing
    client_scenario: 'custom', // Default to custom pricing

    // Service Selection - Complete Flow
    category_id: '',
    subcategory_id: '',
    filter_attribute_id: '',
    filter_option_id: '',
    segment_id: '',
    rate_card_id: '',
    provider_id: '',

    // Service Details
    service_name: '',
    service_description: '',
    service_type: 'deep_cleaning', // ✅ NEW: For scenario-based pricing
    custom_price: '',
    quantity: '1',

    // Scheduling - Default to today
    service_date: new Date().toISOString().split('T')[0],
    service_time: '',
    booking_received_date: new Date().toISOString().split('T')[0], // Default to today
    payment_terms: 'Net 30 days',
    notes: '',

    // Store-specific fields
    service_rate: '',
    service_area_sqft: '',
    store_name: '',
    store_code: '',
    booking_poc_name: '',
    booking_poc_number: '',

    // ✅ NEW: Custom fields for scenario-specific data
    custom_fields: {
      total_stores: '',
      volume_discount_eligible: false,
    },
  });

  // Fetch initial data
  useEffect(() => {
    fetchCustomers();
    fetchCategoriesData();
  }, []);

  // ✅ Match B2C: Load subcategories and filter attributes when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      const loadSubcategoriesAndFilters = async () => {
        try {
          console.log('🔄 Loading subcategories and filters for category:', selectedCategoryId);

          // Load subcategories
          const subcategoryData = await fetchSubCategoriesByCategoryId(selectedCategoryId);
          console.log('📦 Subcategories loaded:', subcategoryData);
          setSubcategories(subcategoryData || []);

          // Load filter attributes (same as B2C)
          try {
            const filterAttributeData = await fetchFilterAttributes(selectedCategoryId, null);
            console.log('📦 Filter attributes loaded:', filterAttributeData);
            setFilterAttributes(filterAttributeData || []);
          } catch (error) {
            console.log('⚠️ No filter attributes found for category');
            setFilterAttributes([]);
          }
        } catch (error) {
          console.error('❌ Error loading subcategories:', error);
          setSubcategories([]);
          setFilterAttributes([]);
        }
      };

      loadSubcategoriesAndFilters();

      // Reset dependent selections when category changes
      setSelectedSubcategoryId('');
      setSelectedSegmentId('');
      setSelectedFilterAttributesId('');
      setSelectedFilterOptionId('');
      setFormData(prev => ({
        ...prev,
        category_id: selectedCategoryId,
        subcategory_id: '',
        filter_attribute_id: '',
        filter_option_id: '',
        segment_id: '',
        rate_card_id: ''
      }));
    } else {
      setSubcategories([]);
      setFilterAttributes([]);
      setServiceSegments([]);
      setSelectedSubcategoryId('');
      setSelectedSegmentId('');
      setSelectedFilterAttributesId('');
      setSelectedFilterOptionId('');
    }
  }, [selectedCategoryId]);

  // ✅ Match B2C: Load service segments when category and subcategory are selected
  useEffect(() => {
    if (selectedCategoryId && selectedSubcategoryId) {
      const loadServiceSegments = async () => {
        try {
          console.log('🔄 Loading service segments for:', { selectedCategoryId, selectedSubcategoryId });
          const response = await fetchServiceSegments(selectedCategoryId, selectedSubcategoryId);
          console.log('📦 Service segments loaded:', response);
          setServiceSegments(response || []);
        } catch (error) {
          console.error('❌ Error loading service segments:', error);
          setServiceSegments([]);
        }
      };
      loadServiceSegments();
    } else {
      // Clear segments if category or subcategory is not selected
      setServiceSegments([]);
      setSelectedSegmentId('');
    }
  }, [selectedCategoryId, selectedSubcategoryId]);

  // ✅ Match B2C: Fetch filter attributes when subcategory is selected
  useEffect(() => {
    if (selectedSubcategoryId) {
      const loadFilterAttributes = async () => {
        try {
          console.log('🔄 Loading filter attributes for subcategory:', selectedSubcategoryId);
          const filterAttributeData = await fetchFilterAttributes(
            selectedCategoryId,
            selectedSubcategoryId
          );
          console.log('📦 Filter attributes for subcategory loaded:', filterAttributeData);
          setFilterAttributes(filterAttributeData || []);
        } catch (error) {
          console.log('⚠️ No filter attributes found for subcategory');
          setFilterAttributes([]);
        }
      };
      loadFilterAttributes();

      // Update form data
      setFormData(prev => ({
        ...prev,
        subcategory_id: selectedSubcategoryId,
        filter_attribute_id: '',
        filter_option_id: '',
        segment_id: '',
        rate_card_id: ''
      }));
    }
  }, [selectedSubcategoryId, selectedCategoryId]);

  // ✅ Fetch filter options when filter attribute changes
  useEffect(() => {
    if (selectedFilterAttributesId) {
      const loadFilterOptions = async () => {
        try {
          console.log('🔄 Loading filter options for attribute:', selectedFilterAttributesId);
          setFilterOptions([]); // Clear existing options first
          const response = await fetchFilterOptionsByAttributeId(selectedFilterAttributesId);
          console.log('📦 Filter options loaded:', response);
          console.log('📦 Filter options count:', response?.length || 0);
          setFilterOptions(response || []);

          // If no options found, log it
          if (!response || response.length === 0) {
            console.log('⚠️ No filter options found for attribute:', selectedFilterAttributesId);
          }
        } catch (error) {
          console.error('❌ Error loading filter options:', error);
          setFilterOptions([]);
        }
      };
      loadFilterOptions();

      // Update form data
      setFormData(prev => ({
        ...prev,
        filter_attribute_id: selectedFilterAttributesId,
        filter_option_id: '',
        segment_id: '',
        rate_card_id: ''
      }));
      setSelectedFilterOptionId('');
    } else {
      setFilterOptions([]);
      setSelectedFilterOptionId('');
    }
  }, [selectedFilterAttributesId]);

  // ✅ Update form data when filter option changes
  useEffect(() => {
    if (selectedFilterOptionId) {
      setFormData(prev => ({
        ...prev,
        filter_option_id: selectedFilterOptionId,
        segment_id: '',
        rate_card_id: ''
      }));
      setSelectedSegmentId('');
    }
  }, [selectedFilterOptionId]);

  // ✅ Calculate price when segment changes
  useEffect(() => {
    if (selectedSegmentId && formData.quantity) {
      calculatePrice();
      setFormData(prev => ({
        ...prev,
        segment_id: selectedSegmentId
      }));
    }
  }, [selectedSegmentId, formData.quantity]);

  // ✅ Calculate price when provider changes (if all required fields are selected)
  useEffect(() => {
    if (formData.provider_id && selectedCategoryId && selectedSubcategoryId && selectedSegmentId && formData.quantity) {
      calculatePrice();
    }
  }, [formData.provider_id]);

  // ✅ Load providers when category and subcategory are selected
  useEffect(() => {
    if (selectedCategoryId && selectedSubcategoryId) {
      const loadProviders = async () => {
        try {
          console.log('🔄 Loading providers for:', { selectedCategoryId, selectedSubcategoryId });
          const response = await fetchProvidersByFilters(
            selectedCategoryId || '',
            selectedSubcategoryId || '',
            selectedFilterAttributesId || '',
            selectedFilterOptionId || '',
            1, // page
            50 // size
          );
          console.log('📦 Providers loaded:', response);

          // Transform the response to match our Provider interface (same as B2C)
          const providersData = response.data || [];
          const transformedProviders = providersData.map((provider: any) => ({
            id: provider.id, // Encrypted ID
            name: provider.company_name ||
                  provider.name ||
                  `${provider.first_name} ${provider.last_name || ''} - ${provider.phone || 'No Phone'}`,
            phone: provider.phone || ''
          }));

          setProviders(transformedProviders);
        } catch (error) {
          console.error('❌ Error loading providers:', error);
          setProviders([]);
        }
      };
      loadProviders();
    } else {
      setProviders([]);
      setFormData(prev => ({ ...prev, provider_id: '' }));
    }
  }, [selectedCategoryId, selectedSubcategoryId]);

  // Fetch service addresses when customer changes
  useEffect(() => {
    if (formData.b2b_customer_id) {
      fetchServiceAddresses();
    }
  }, [formData.b2b_customer_id]);

  // ✅ NEW: Auto-calculate scenario pricing when relevant fields change
  useEffect(() => {
    const shouldCalculateScenarioPricing =
      formData.client_scenario !== 'custom' &&
      formData.service_area_sqft &&
      formData.quantity;

    if (shouldCalculateScenarioPricing) {
      const timeoutId = setTimeout(() => {
        calculateScenarioPricing();
      }, 500); // Debounce to avoid too many API calls

      return () => clearTimeout(timeoutId);
    }
  }, [
    formData.client_scenario,
    formData.service_area_sqft,
    formData.service_type,
    formData.quantity,
    formData.custom_fields
  ]);

  // ✅ NEW: Load available scenarios on component mount
  useEffect(() => {
    const loadAvailableScenarios = async () => {
      try {
        const response = await getB2BPricingRules();
        if (response.success && response.data?.available_scenarios) {
          setAvailableScenarios(response.data.available_scenarios);
        }
      } catch (error) {
        console.error('❌ Error loading available scenarios:', error);
      }
    };

    loadAvailableScenarios();
  }, []);

  const fetchCustomers = async () => {
    try {
      console.log('🔄 Fetching customers...');
      const response = await fetchB2BCustomers(1, 100);
      console.log('📦 Customers response:', response);
      setCustomers(response.data?.customers || []);
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
    }
  };

  const fetchCategoriesData = async () => {
    try {
      console.log('🔄 Fetching categories...');
      const response = await fetchAllCategories();
      console.log('📦 Categories response:', response);
      setCategories(response || []); // fetchAllCategories returns the data directly, not wrapped in response.data
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
    }
  };

  const fetchSubcategoriesData = async (categoryId: string) => {
    try {
      console.log('🔄 Fetching subcategories for category:', categoryId);
      const response = await fetchSubCategoriesByCategoryId(categoryId);
      console.log('📦 Subcategories response:', response);
      setSubcategories(response || []); // fetchSubCategoriesByCategoryId returns the data directly
    } catch (error) {
      console.error('❌ Error fetching subcategories:', error);
    }
  };

  // ✅ These functions are now handled in useEffect hooks above

  const calculatePrice = async () => {
    try {
      setIsCalculatingPrice(true);
      console.log('💰 Calculating price for segment:', selectedSegmentId);

      const response = await calculateServicePriceForB2B({
        category_id: selectedCategoryId,
        subcategory_id: selectedSubcategoryId,
        provider_id: formData.provider_id || undefined,
        filter_attribute_id: selectedFilterAttributesId || undefined,
        filter_option_id: selectedFilterOptionId || undefined,
        segment_id: selectedSegmentId,
        quantity: parseInt(formData.quantity) || 1
      });

      console.log('💰 Price calculation response:', response);

      if (response.success && response.data) {
        setSelectedRateCard(response.data.rate_card);
        setCalculatedPrice(response.data.final_price || 0);

        // Update form with calculated price and rate card ID
        setFormData(prev => ({
          ...prev,
          custom_price: response.data.final_price?.toString() || '',
          rate_card_id: response.data.rate_card?.id || ''
        }));
      }
    } catch (error) {
      console.error('❌ Error calculating price:', error);
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  // ✅ NEW: Calculate pricing using client scenario
  const calculateScenarioPricing = async () => {
    try {
      setIsCalculatingScenarioPricing(true);
      console.log('💰 Calculating scenario-based pricing...');

      const pricingParams = {
        client_scenario: formData.client_scenario,
        service_area_sqft: parseFloat(formData.service_area_sqft) || 0,
        service_type: formData.service_type,
        store_name: formData.store_name,
        store_code: formData.store_code,
        quantity: parseInt(formData.quantity) || 1,
        custom_fields: formData.custom_fields,
        custom_price: parseFloat(formData.custom_price) || undefined
      };

      console.log('💰 Pricing params:', pricingParams);

      const response = await calculateB2BPricing(pricingParams);
      console.log('💰 Scenario pricing response:', response);

      if (response.success && response.data) {
        setScenarioPricing(response.data);
        setAvailableScenarios(response.available_scenarios || []);

        // Update form with calculated pricing
        if (response.data.pricing?.final_amounts) {
          const finalAmounts = response.data.pricing.final_amounts;
          setFormData(prev => ({
            ...prev,
            custom_price: finalAmounts.total_amount?.toString() || prev.custom_price
          }));
          setCalculatedPrice(finalAmounts.total_amount || 0);
        }
      }
    } catch (error) {
      console.error('❌ Error calculating scenario pricing:', error);
      alert('Failed to calculate pricing. Please try again.');
    } finally {
      setIsCalculatingScenarioPricing(false);
    }
  };

  // ✅ NEW: Load pricing rules for selected scenario
  const loadPricingRules = async (scenario: string) => {
    try {
      console.log('📋 Loading pricing rules for scenario:', scenario);
      const response = await getB2BPricingRules(scenario);

      if (response.success && response.data) {
        setPricingRules(response.data);
        console.log('📋 Pricing rules loaded:', response.data);
      }
    } catch (error) {
      console.error('❌ Error loading pricing rules:', error);
    }
  };

  // ✅ NEW: Handle client scenario change
  const handleScenarioChange = (scenario: string) => {
    setFormData(prev => ({
      ...prev,
      client_scenario: scenario
    }));

    // Load pricing rules for the new scenario
    if (scenario !== 'custom') {
      loadPricingRules(scenario);
    } else {
      setPricingRules(null);
    }

    // Clear previous scenario pricing
    setScenarioPricing(null);
  };

  const fetchServiceAddresses = async () => {
    try {
      console.log('🔄 Fetching service addresses for customer:', formData.b2b_customer_id);
      const response = await fetchB2BServiceAddresses(formData.b2b_customer_id);
      console.log('📦 Service addresses response:', response);
      setServiceAddresses(response.data || []);
    } catch (error) {
      console.error('❌ Error fetching service addresses:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNewAddressChange = (field: string, value: string) => {
    setNewAddress(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddAddress = async () => {
    if (!formData.b2b_customer_id || !newAddress.store_name || !newAddress.address_line_1) {
      alert('Please fill in required fields: Store Name and Address');
      return;
    }

    setAddingAddress(true);
    try {
      await createB2BServiceAddress(formData.b2b_customer_id, newAddress);

      // Refresh service addresses
      await fetchServiceAddresses();

      // Reset form and close modal
      setNewAddress({
        store_name: '',
        store_code: '',
        address_line_1: '',
        city: '',
        state: '',
        pincode: '',
        contact_person: '',
        contact_phone: ''
      });
      setShowAddAddressModal(false);
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address. Please try again.');
    } finally {
      setAddingAddress(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const customPrice = parseFloat(formData.custom_price) || 0;
      const quantity = parseInt(formData.quantity) || 1;
      const totalAmount = customPrice * quantity;
      const gstAmount = totalAmount * 0.18; // 18% GST
      const finalAmount = totalAmount + gstAmount;

      const submitData = {
        ...formData,
        custom_price: customPrice,
        quantity: quantity,
        total_amount: totalAmount,
        gst_amount: gstAmount,
        final_amount: finalAmount,
        service_rate: formData.service_rate ? parseFloat(formData.service_rate) : undefined,
        service_area_sqft: formData.service_area_sqft ? parseFloat(formData.service_area_sqft) : undefined,
      };

      console.log('📤 Submitting B2B order data:', submitData);
      console.log('📍 Service address field:', submitData.service_address);
      console.log('🏢 Service address ID:', submitData.b2b_service_address_id);
      console.log('💰 Client scenario:', submitData.client_scenario);
      console.log('🎯 Service type:', submitData.service_type);
      console.log('📊 Custom fields:', submitData.custom_fields);

      await createB2BOrder(submitData);
      router.push('/admin/b2b/orders');
    } catch (error: any) {
      console.error('Error creating order:', error);
      setError(error.message || 'Failed to create order. Please check your input and try again.');
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Create B2B Order</h1>
            <p className="text-gray-600 mt-1">Create a new B2B service order</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer">Customer *</Label>
                <Select value={formData.b2b_customer_id} onValueChange={(value) => handleInputChange('b2b_customer_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.company_name} - {customer.contact_person}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.b2b_customer_id && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="address">Service Address *</Label>
                    <Dialog open={showAddAddressModal} onOpenChange={setShowAddAddressModal}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Service Address</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="new_store_name">Store Name *</Label>
                              <Input
                                id="new_store_name"
                                value={newAddress.store_name}
                                onChange={(e) => handleNewAddressChange('store_name', e.target.value)}
                                placeholder="Enter store name"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="new_store_code">Store Code</Label>
                              <Input
                                id="new_store_code"
                                value={newAddress.store_code}
                                onChange={(e) => handleNewAddressChange('store_code', e.target.value)}
                                placeholder="Enter store code"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="new_address">Address *</Label>
                            <Textarea
                              id="new_address"
                              value={newAddress.address_line_1}
                              onChange={(e) => handleNewAddressChange('address_line_1', e.target.value)}
                              placeholder="Enter complete address"
                              rows={3}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="new_city">City</Label>
                              <Input
                                id="new_city"
                                value={newAddress.city}
                                onChange={(e) => handleNewAddressChange('city', e.target.value)}
                                placeholder="City"
                              />
                            </div>
                            <div>
                              <Label htmlFor="new_state">State</Label>
                              <Input
                                id="new_state"
                                value={newAddress.state}
                                onChange={(e) => handleNewAddressChange('state', e.target.value)}
                                placeholder="State"
                              />
                            </div>
                            <div>
                              <Label htmlFor="new_pincode">Pincode</Label>
                              <Input
                                id="new_pincode"
                                value={newAddress.pincode}
                                onChange={(e) => handleNewAddressChange('pincode', e.target.value)}
                                placeholder="Pincode"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="new_contact_person">Contact Person</Label>
                              <Input
                                id="new_contact_person"
                                value={newAddress.contact_person}
                                onChange={(e) => handleNewAddressChange('contact_person', e.target.value)}
                                placeholder="Contact person name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="new_contact_phone">Contact Phone</Label>
                              <Input
                                id="new_contact_phone"
                                value={newAddress.contact_phone}
                                onChange={(e) => handleNewAddressChange('contact_phone', e.target.value)}
                                placeholder="Contact phone number"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={() => setShowAddAddressModal(false)}>
                              Cancel
                            </Button>
                            <Button type="button" onClick={handleAddAddress} disabled={addingAddress}>
                              {addingAddress ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Address
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Select
                    value={formData.b2b_service_address_id}
                    onValueChange={(value) => {
                      // Find the selected address to get the full address text
                      const selectedAddress = serviceAddresses.find(addr => addr.id === value);
                      handleInputChange('b2b_service_address_id', value);
                      // Also set the service_address field that backend expects
                      if (selectedAddress) {
                        const fullAddress = `${selectedAddress.store_name}, ${selectedAddress.address_line_1}, ${selectedAddress.city}`;
                        handleInputChange('service_address', fullAddress);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service address" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceAddresses.map((address) => (
                        <SelectItem key={address.id} value={address.id}>
                          {address.store_name} - {address.store_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ✅ NEW: Client Scenario Selection */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Client Pricing Scenario</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_scenario">Pricing Scenario *</Label>
                    <Select
                      value={formData.client_scenario}
                      onValueChange={handleScenarioChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing scenario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile_furniture_store">Mobile/Furniture Store</SelectItem>
                        <SelectItem value="ac_manufacturer">AC Manufacturer</SelectItem>
                        <SelectItem value="home_rental_service">Home Rental Service</SelectItem>
                        <SelectItem value="ecommerce_giant">E-commerce Giant</SelectItem>
                        <SelectItem value="furniture_rental_service">Furniture Rental Service</SelectItem>
                        <SelectItem value="custom">Custom Pricing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Show pricing rules if available */}
                  {pricingRules && (
                    <div className="bg-white border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-gray-900 mb-2">Pricing Rules</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>{pricingRules.description}</div>
                        {pricingRules.rules?.base_price_range && (
                          <div>Range: {pricingRules.rules.base_price_range}</div>
                        )}
                        {pricingRules.rules?.per_sqft_rate && (
                          <div>Rate: {pricingRules.rules.per_sqft_rate}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) =>
                        category.id ? (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ) : null
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategory *</Label>
                  <Select
                    value={selectedSubcategoryId}
                    onValueChange={setSelectedSubcategoryId}
                    disabled={!selectedCategoryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcategory) =>
                        subcategory.id ? (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </SelectItem>
                        ) : null
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Attributes and Options - Match B2C */}
              {filterAttributes.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="filter_attribute">Filter Attribute</Label>
                    <Select
                      value={selectedFilterAttributesId}
                      onValueChange={setSelectedFilterAttributesId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select filter attribute" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterAttributes.map((attribute) =>
                          attribute.id ? (
                            <SelectItem key={attribute.id} value={attribute.id}>
                              {attribute.name}
                            </SelectItem>
                          ) : null
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Always show filter options when filter attribute is selected */}
                  {selectedFilterAttributesId && (
                    <div>
                      <Label htmlFor="filter_option">Filter Option</Label>
                      <Select
                        value={selectedFilterOptionId}
                        onValueChange={setSelectedFilterOptionId}
                        disabled={filterOptions.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            filterOptions.length === 0
                              ? "Loading options..."
                              : "Select filter option"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {filterOptions.map((option) =>
                            option.id ? (
                              <SelectItem key={option.id} value={option.id}>
                                {option.value}
                              </SelectItem>
                            ) : null
                          )}
                        </SelectContent>
                      </Select>
                      {filterOptions.length === 0 && selectedFilterAttributesId && (
                        <p className="text-sm text-gray-500 mt-1">Loading filter options...</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Service Segment - Always show when category and subcategory are selected */}
              {selectedCategoryId && selectedSubcategoryId && (
                <div>
                  <Label htmlFor="segment">Service Segment *</Label>
                  <Select
                    value={selectedSegmentId}
                    onValueChange={setSelectedSegmentId}
                    disabled={serviceSegments.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        serviceSegments.length === 0
                          ? "Loading segments..."
                          : "Select service segment"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceSegments.map((segment) =>
                        segment.id ? (
                          <SelectItem key={segment.id} value={segment.id}>
                            {segment.segment_name}
                          </SelectItem>
                        ) : null
                      )}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-gray-500 mt-1">
                    {serviceSegments.length === 0 ? (
                      <span>Loading service segments...</span>
                    ) : (
                      <span>✅ {serviceSegments.length} segments available</span>
                    )}
                  </div>
                </div>
              )}

              {/* Provider Selection - Always show when category and subcategory are selected */}
              {selectedCategoryId && selectedSubcategoryId && (
                <div>
                  <Label htmlFor="provider">Service Provider *</Label>
                  <Select
                    value={formData.provider_id}
                    onValueChange={(value) => handleInputChange('provider_id', value)}
                    disabled={providers.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        providers.length === 0
                          ? "Loading providers..."
                          : "Select service provider"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) =>
                        provider.id ? (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ) : null
                      )}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-gray-500 mt-1">
                    {providers.length === 0 ? (
                      <span>Loading service providers...</span>
                    ) : (
                      <span>✅ {providers.length} providers available</span>
                    )}
                  </div>
                </div>
              )}

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
                <Label htmlFor="service_description">Service Description</Label>
                <Textarea
                  id="service_description"
                  value={formData.service_description}
                  onChange={(e) => handleInputChange('service_description', e.target.value)}
                  placeholder="Enter service description"
                  rows={3}
                />
              </div>

              {/* ✅ NEW: Scenario-Specific Fields */}
              {formData.client_scenario !== 'custom' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Scenario-Specific Details</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Service Type for Mobile/Furniture Store */}
                    {formData.client_scenario === 'mobile_furniture_store' && (
                      <>
                        <div>
                          <Label htmlFor="service_type">Service Type *</Label>
                          <Select
                            value={formData.service_type}
                            onValueChange={(value) => handleInputChange('service_type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="deep_cleaning">Deep Cleaning (1.0x)</SelectItem>
                              <SelectItem value="sanitization">Sanitization (1.2x)</SelectItem>
                              <SelectItem value="pest_control">Pest Control (1.5x)</SelectItem>
                              <SelectItem value="maintenance">Maintenance (0.8x)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="total_stores">Total Stores (for volume discount)</Label>
                          <Input
                            type="number"
                            value={formData.custom_fields?.total_stores || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              custom_fields: {
                                ...prev.custom_fields,
                                total_stores: parseInt(e.target.value) || 0
                              }
                            }))}
                            placeholder="Number of stores"
                            min="1"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            10+ stores: 5% discount, 25+ stores: 10% discount, 50+ stores: 15% discount
                          </div>
                        </div>
                      </>
                    )}

                    {/* Service Area for area-based pricing */}
                    {(formData.client_scenario === 'mobile_furniture_store' ||
                      formData.client_scenario === 'home_rental_service') && (
                      <div>
                        <Label htmlFor="service_area_sqft">Service Area (sq ft) *</Label>
                        <Input
                          type="number"
                          id="service_area_sqft"
                          value={formData.service_area_sqft}
                          onChange={(e) => handleInputChange('service_area_sqft', e.target.value)}
                          placeholder="Enter area in square feet"
                          min="1"
                          step="0.1"
                        />
                        {formData.client_scenario === 'mobile_furniture_store' && (
                          <div className="text-xs text-gray-500 mt-1">
                            Rate: ₹25/sq ft (Min: ₹2500, Max: ₹3600)
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Auto-calculate pricing button */}
                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={calculateScenarioPricing}
                      disabled={isCalculatingScenarioPricing}
                      variant="outline"
                      size="sm"
                    >
                      {isCalculatingScenarioPricing ? (
                        <>Calculating...</>
                      ) : (
                        <>Calculate Scenario Pricing</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing & Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price Calculation Display */}
              {selectedRateCard && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Rate Card Selected</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Service:</span> {selectedRateCard.service_name}
                    </div>
                    <div>
                      <span className="text-blue-700">Base Price:</span> ₹{selectedRateCard.base_price}
                    </div>
                    <div>
                      <span className="text-blue-700">Final Price:</span> ₹{selectedRateCard.final_price}
                    </div>
                    <div>
                      <span className="text-blue-700">Total:</span> ₹{calculatedPrice}
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ NEW: Scenario Pricing Display */}
              {scenarioPricing && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3">Scenario Pricing Calculation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {scenarioPricing.pricing?.base_calculation && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-green-800">Base Calculation</h5>
                        {scenarioPricing.pricing.base_calculation.service_area_sqft > 0 && (
                          <div>
                            <span className="text-green-700">Area:</span> {scenarioPricing.pricing.base_calculation.service_area_sqft} sq ft
                          </div>
                        )}
                        {scenarioPricing.pricing.base_calculation.per_sqft_rate && (
                          <div>
                            <span className="text-green-700">Rate:</span> ₹{scenarioPricing.pricing.base_calculation.per_sqft_rate}/sq ft
                          </div>
                        )}
                        <div>
                          <span className="text-green-700">Base Price:</span> ₹{scenarioPricing.pricing.base_calculation.base_price}
                        </div>
                        <div>
                          <span className="text-green-700">Quantity:</span> {scenarioPricing.pricing.base_calculation.quantity}
                        </div>
                      </div>
                    )}

                    {scenarioPricing.pricing?.final_amounts && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-green-800">Final Amounts</h5>
                        <div>
                          <span className="text-green-700">Subtotal:</span> ₹{scenarioPricing.pricing.final_amounts.subtotal}
                        </div>
                        <div>
                          <span className="text-green-700">GST (18%):</span> ₹{scenarioPricing.pricing.final_amounts.gst_amount}
                        </div>
                        <div className="font-semibold">
                          <span className="text-green-700">Total:</span> ₹{scenarioPricing.pricing.final_amounts.total_amount}
                        </div>
                      </div>
                    )}

                    {scenarioPricing.pricing?.discount_details?.discount_amount > 0 && (
                      <div className="col-span-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                        <span className="text-yellow-700 font-medium">Volume Discount Applied:</span>
                        ₹{scenarioPricing.pricing.discount_details.discount_amount}
                        ({scenarioPricing.pricing.discount_details.discount_type})
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="custom_price">Service Price (₹) *</Label>
                  <div className="relative">
                    <Input
                      id="custom_price"
                      type="number"
                      step="0.01"
                      value={formData.custom_price}
                      onChange={(e) => handleInputChange('custom_price', e.target.value)}
                      placeholder="0.00"
                      required
                      className={calculatedPrice > 0 ? 'bg-green-50 border-green-300' : ''}
                    />
                    {isCalculatingPrice && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  {calculatedPrice > 0 && (
                    <p className="text-xs text-green-600 mt-1">Auto-calculated from rate card</p>
                  )}
                  {/* Manual Calculate Price Button */}
                  {selectedCategoryId && selectedSubcategoryId && selectedSegmentId && formData.provider_id && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={calculatePrice}
                      disabled={isCalculatingPrice}
                      className="mt-2 w-full"
                    >
                      {isCalculatingPrice ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Calculating...
                        </>
                      ) : (
                        'Calculate Price from Rate Card'
                      )}
                    </Button>
                  )}
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="service_date">Service Date *</Label>
                  <Input
                    id="service_date"
                    type="date"
                    value={formData.service_date}
                    onChange={(e) => handleInputChange('service_date', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="booking_received_date">Booking Received Date *</Label>
                  <Input
                    id="booking_received_date"
                    type="date"
                    value={formData.booking_received_date}
                    onChange={(e) => handleInputChange('booking_received_date', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {/* GST Calculation Display */}
              {formData.custom_price && parseFloat(formData.custom_price) > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Pricing Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price (₹{parseFloat(formData.custom_price).toFixed(2)} × {formData.quantity}):</span>
                      <span className="font-medium">₹{(parseFloat(formData.custom_price) * parseInt(formData.quantity || '1')).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST (18%):</span>
                      <span className="font-medium">₹{((parseFloat(formData.custom_price) * parseInt(formData.quantity || '1')) * 0.18).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span className="text-gray-900">Final Amount:</span>
                        <span className="text-green-600">₹{((parseFloat(formData.custom_price) * parseInt(formData.quantity || '1')) * 1.18).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Order
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
