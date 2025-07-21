'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Search } from 'lucide-react';
import {
  fetchB2BCustomers,
  createB2BOrder,
  fetchAllCategories, // ✅ Use the same function as normal booking
  fetchSubCategoriesByCategoryId,
  fetchFilterAttributes, // ✅ Add filter attributes
  fetchFilterOptionsByAttributeId, // ✅ Add filter options (MISSING!)
  fetchServiceSegments, // ✅ Add service segments
  fetchRateCardsForB2B, // ✅ Use B2B rate cards function
  fetchProvidersForB2B,
  fetchProvidersByFilters, // ✅ Use same provider fetching as normal booking
  fetchB2BServiceAddresses,
  createB2BServiceAddress
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface B2BCustomer {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
}

interface Category {
  id?: string; // ✅ Match API response type
  name: string;
  description?: string;
}

interface Subcategory {
  id?: string; // ✅ Match API response type
  name: string;
  category_id?: string;
}

interface RateCard {
  id: string;
  name: string;
  price: number;
  category_id: string;
  subcategory_id: string;
  segment_id?: string;
}

interface FilterAttribute {
  id?: string;
  name: string;
  options?: any[];
}

interface ServiceSegment {
  id?: string;
  segment_name: string;
}

interface Provider {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface ServiceAddress {
  id: string;
  store_name: string;
  store_code: string;
  address_line_1: string;
  city: string;
  state: string;
  pincode: string;
  contact_person?: string;
  contact_phone?: string;
}

export default function AddB2BOrderPage() {
  const router = useRouter();

  // Customer state
  const [customers, setCustomers] = useState<B2BCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<B2BCustomer | null>(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);

  // Service selection state
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filterAttributes, setFilterAttributes] = useState<FilterAttribute[]>([]); // ✅ Add filter attributes
  const [filterOptions, setFilterOptions] = useState<any[]>([]); // ✅ Add filter options
  const [serviceSegments, setServiceSegments] = useState<ServiceSegment[]>([]); // ✅ Add service segments
  const [providers, setProviders] = useState<Provider[]>([]);
  const [serviceAddresses, setServiceAddresses] = useState<ServiceAddress[]>([]);

  // ✅ Price calculation state (SAME AS NORMAL BOOKING)
  const [autoCalculatedPrice, setAutoCalculatedPrice] = useState<number>(0);
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null);
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
  const [selectedRateCardId, setSelectedRateCardId] = useState<string>('');
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [selectedFilterAttributesId, setSelectedFilterAttributesId] = useState<string>(''); // ✅ Single filter attribute selection (same as normal booking)
  const [selectedFilterOptionId, setSelectedFilterOptionId] = useState<string>(''); // ✅ Filter option selection (MISSING!)
  const [selectedSegment, setSelectedSegment] = useState<ServiceSegment | null>(null); // ✅ Add segment selection
  const [selectedRateCard, setSelectedRateCard] = useState<RateCard | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedServiceAddress, setSelectedServiceAddress] = useState<ServiceAddress | null>(null);

  // ✅ Add new address modal state
  const [showAddAddressModal, setShowAddAddressModal] = useState<boolean>(false);
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
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Customer & Address
    b2b_customer_id: '',
    b2b_service_address_id: '',

    // ✅ Service Selection (INTEGRATED WITH EXISTING SYSTEM)
    rate_card_id: '',
    category_id: '',
    subcategory_id: '',
    segment_id: '',
    package_id: '',
    filter_attribute_id: '', // ✅ Single filter attribute (same as normal booking)
    filter_option_id: '', // ✅ Filter option (same as normal booking)
    selection_type: 'rate_card',

    // ✅ Provider Selection
    provider_id: '',
    staff_id: '',

    // Service Details
    service_name: '',
    service_description: '',
    service_type: 'service',

    // ✅ Pricing (RATE CARD + CUSTOM OVERRIDE)
    base_price: '',
    custom_price_override: '',
    final_price: '',
    quantity: '1',
    discount_amount: '0',

    // Scheduling
    service_date: '',
    service_time: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    payment_terms: 'Net 30 days',
    notes: '',
    
    // Editable fields
    service_rate: '',
    service_area_sqft: '',
    store_name: '',
    store_code: '',
    booking_poc_name: '',
    booking_poc_number: '',
  });

  // Fetch initial data on component mount (SAME AS NORMAL BOOKING)
  useEffect(() => {
    fetchCustomers();
    fetchCategoriesData(); // ✅ Load categories immediately like normal booking
  }, []);

  // ✅ Fetch filter options when filter attribute is selected (SAME AS NORMAL BOOKING)
  useEffect(() => {
    if (selectedFilterAttributesId) {
      const loadFilterOptions = async () => {
        try {
          const options = await fetchFilterOptionsByAttributeId(selectedFilterAttributesId);
          console.log('📦 Filter options response:', options);
          setFilterOptions(options || []);
        } catch (error) {
          console.error('Error fetching filter options:', error);
          setFilterOptions([]);
        }
      };
      loadFilterOptions();
    } else {
      setFilterOptions([]);
      setSelectedFilterOptionId('');
    }
  }, [selectedFilterAttributesId]);

  // ✅ Auto-calculate price when service selection changes (SAME AS NORMAL BOOKING)
  useEffect(() => {
    console.log('🔄 Price calculation trigger - checking selections:', {
      selectedCategory: selectedCategory?.name,
      selectedSubcategory: selectedSubcategory?.name,
      selectedProvider: selectedProvider?.name,
      selectedSegment: selectedSegment?.segment_name,
      selectedFilterAttributesId,
      selectedFilterOptionId,
      quantity: formData.quantity,
    });

    calculateServicePrice();
  }, [
    selectedCategory?.id,
    selectedSubcategory?.id,
    selectedProvider?.id,
    selectedSegment?.id,
    selectedFilterAttributesId,
    selectedFilterOptionId,
    formData.quantity,
  ]);

  // Validate customer data to prevent CMDK errors
  const validateCustomerData = (customers: any[]): B2BCustomer[] => {
    if (!Array.isArray(customers)) return [];

    return customers.filter(customer =>
      customer &&
      typeof customer === 'object' &&
      customer.id &&
      customer.company_name &&
      customer.contact_person
    );
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await fetchB2BCustomers(1, 100, 'all', '');

      // Ensure we have valid data structure
      if (data && data.data && data.data.customers) {
        const validatedCustomers = validateCustomerData(data.data.customers);
        setCustomers(validatedCustomers);
      } else {
        // Fallback to empty array if data structure is unexpected
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Set empty array on error
      setCustomers([]);
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

  const handleCustomerSelect = (customer: B2BCustomer) => {
    console.log('👤 Customer selected:', customer);
    console.log('👤 Customer ID:', customer.id);
    console.log('👤 Customer ID type:', typeof customer.id);
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      b2b_customer_id: customer.id,
      booking_poc_name: customer.contact_person,
      booking_poc_number: customer.phone,
    }));
    setCustomerSearchOpen(false);

    // Categories are already loaded on mount, no need to fetch again
    console.log('✅ Customer selected, categories already available:', categories.length);
  };

  // ✅ Fetch categories for service selection (SAME AS NORMAL BOOKING)
  const fetchCategoriesData = async () => {
    try {
      console.log('🔍 Fetching categories...');
      const categoryData = await fetchAllCategories(); // ✅ Use same function as normal booking
      console.log('📦 Categories response:', categoryData);

      if (categoryData && Array.isArray(categoryData)) {
        console.log('✅ Setting categories:', categoryData.length, 'items');
        setCategories(categoryData);
      } else {
        console.log('❌ No categories found in response');
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories([]);
    }
  };

  // ✅ Handle category selection
  const handleCategorySelect = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setSelectedSubcategory(null);
      setSelectedRateCard(null);
      setSelectedProvider(null);

      setFormData(prev => ({
        ...prev,
        category_id: categoryId,
        subcategory_id: '',
        rate_card_id: '',
        provider_id: '',
        service_name: '',
        base_price: '',
        final_price: ''
      }));

      // Fetch subcategories for selected category
      try {
        const subcategoriesData = await fetchSubCategoriesByCategoryId(categoryId);
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }

      // ✅ Reset dependent selections
      setSelectedFilterAttributesId('');
      setSelectedFilterOptionId('');
      setSelectedSegment(null);
      setFilterAttributes([]);
      setFilterOptions([]);
      setServiceSegments([]);
      // Reset price calculation
      setPriceBreakdown(null);
      setAutoCalculatedPrice(0);
      setCalculatedTotal(0);
      setSelectedRateCardId('');
    }
  };

  // ✅ Handle subcategory selection
  const handleSubcategorySelect = async (subcategoryId: string) => {
    const subcategory = subcategories.find(s => s.id === subcategoryId);
    if (subcategory) {
      setSelectedSubcategory(subcategory);
      setSelectedRateCard(null);
      setSelectedProvider(null);
      setSelectedFilterAttributesId('');
      setSelectedFilterOptionId('');
      setSelectedSegment(null);
      setFilterOptions([]);

      setFormData(prev => ({
        ...prev,
        subcategory_id: subcategoryId,
        rate_card_id: '',
        provider_id: '',
        service_name: '',
        base_price: '',
        final_price: ''
      }));

      // ✅ Fetch filter attributes for category + subcategory
      try {
        const attributesData = await fetchFilterAttributes(selectedCategory?.id || null, subcategoryId);
        console.log('📦 Filter attributes response:', attributesData);
        setFilterAttributes(attributesData || []);
      } catch (error) {
        console.error('Error fetching filter attributes:', error);
        setFilterAttributes([]);
      }

      // ✅ Fetch service segments for category + subcategory
      try {
        const segmentsData = await fetchServiceSegments(selectedCategory?.id || null, subcategoryId);
        console.log('📦 Service segments response:', segmentsData);
        setServiceSegments(segmentsData || []);
      } catch (error) {
        console.error('Error fetching service segments:', error);
        setServiceSegments([]);
      }

      // ✅ Providers will be fetched when filter option is selected (SAME AS NORMAL BOOKING)
      console.log('📦 Subcategory selected, providers will be fetched after filter option selection');
    }
  };

  // ✅ Handle filter attributes selection (SAME AS NORMAL BOOKING)
  const handleFilterAttributeSelect = (attributeId: string) => {
    setSelectedFilterAttributesId(attributeId);

    setFormData(prev => ({
      ...prev,
      filter_attribute_id: attributeId
    }));

    // Price will be calculated automatically by useEffect
  };

  // ✅ Handle segment selection
  const handleSegmentSelect = (segmentId: string) => {
    const segment = serviceSegments.find(s => s.id === segmentId);
    if (segment) {
      setSelectedSegment(segment);

      setFormData(prev => ({
        ...prev,
        segment_id: segmentId
      }));

      // Price will be calculated automatically by useEffect
    }
  };

  // ✅ Calculate price using same API as B2C booking (with custom price override)
  const calculateServicePrice = async () => {
    // Only calculate if we have required selections (same as B2C)
    if (!selectedCategory?.id || !selectedSubcategory?.id || !selectedProvider?.id) {
      console.log('Missing required fields for price calculation:', {
        hasCategory: !!selectedCategory?.id,
        hasSubcategory: !!selectedSubcategory?.id,
        hasProvider: !!selectedProvider?.id,
        hasSegment: !!selectedSegment?.id,
      });
      setPriceBreakdown(null);
      setAutoCalculatedPrice(0);
      setCalculatedTotal(0);
      setSelectedRateCardId('');
      return;
    }

    setIsLoadingPrice(true);

    try {
      // ✅ Use same price calculation API as B2C booking
      const priceRequest = {
        category_id: selectedCategory.id,
        subcategory_id: selectedSubcategory.id,
        provider_id: selectedProvider.id,
        segment_id: selectedSegment?.id || null,
        filter_attribute_id: selectedFilterAttributesId || null,
        filter_option_id: selectedFilterOptionId || null,
        quantity: parseInt(formData.quantity) || 1,
      };

      console.log('🔍 Calculating price for B2B (same as B2C):', priceRequest);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/admin-api';
      const fullUrl = `${apiUrl}/booking/calculate-price`;

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': localStorage.getItem('token') || '',
        },
        body: JSON.stringify(priceRequest),
      });

      if (response.ok) {
        const priceData = await response.json();
        console.log('💰 Price calculation response (B2C API):', priceData);

        if (priceData.status && priceData.basePrice !== undefined) {
          setAutoCalculatedPrice(priceData.basePrice);
          setPriceBreakdown({
            basePrice: priceData.itemTotal || priceData.basePrice * parseInt(formData.quantity),
            gst: priceData.gstAmount || 0,
            convenienceCharge: priceData.convenienceCharge || 0,
            total: priceData.finalAmount || 0,
          });
          setCalculatedTotal(priceData.finalAmount || 0);

          // ✅ Capture rate card ID from price calculation (same as B2C)
          if (priceData.rateCardId) {
            setSelectedRateCardId(priceData.rateCardId);
            console.log('✅ Rate card ID captured:', priceData.rateCardId);

            // Update form data with calculated values + custom price override capability
            setFormData(prev => ({
              ...prev,
              rate_card_id: priceData.rateCardId,
              base_price: priceData.basePrice.toString(),
              final_price: prev.custom_price_override || priceData.basePrice.toString(),
              service_name: `${selectedCategory.name} - ${selectedSubcategory.name}`
            }));
          }
        } else {
          console.error('❌ Invalid price response:', priceData);
          setPriceBreakdown(null);
          setAutoCalculatedPrice(0);
          setCalculatedTotal(0);
        }
      } else {
        console.error('❌ Price calculation failed:', response.status);
        setPriceBreakdown(null);
        setAutoCalculatedPrice(0);
        setCalculatedTotal(0);
      }
    } catch (error) {
      console.error('❌ Error calculating price:', error);
      setPriceBreakdown(null);
      setAutoCalculatedPrice(0);
      setCalculatedTotal(0);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  // ✅ Rate cards are now automatically selected through price calculation (SAME AS NORMAL BOOKING)

  // ✅ Fetch providers
  const fetchProvidersData = async () => {
    try {
      const data = await fetchProvidersForB2B(selectedCategory?.id, selectedSubcategory?.id);
      if (data && data.data && data.data.providers) {
        setProviders(data.data.providers);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  // ✅ Handle provider selection
  const handleProviderSelect = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      setSelectedProvider(provider);
      setFormData(prev => ({
        ...prev,
        provider_id: providerId
      }));

      // Fetch service addresses for selected customer
      if (selectedCustomer) {
        fetchServiceAddressesData(selectedCustomer.id);
      }
      // Calculate price when provider is selected (same as B2C)
      calculateServicePrice();
    }
  };

  // ✅ Fetch service addresses
  const fetchServiceAddressesData = async (customerId: string) => {
    try {
      const data = await fetchB2BServiceAddresses(customerId);
      if (data && data.data) {
        setServiceAddresses(data.data);
      }
    } catch (error) {
      console.error('Error fetching service addresses:', error);
    }
  };

  // ✅ Handle adding new service address
  const handleAddNewAddress = async () => {
    if (!selectedCustomer) return;

    setIsAddingAddress(true);
    try {
      console.log('🔍 Debug selectedCustomer:', selectedCustomer);
      console.log('🔍 Debug selectedCustomer.id:', selectedCustomer.id);
      console.log('🔍 Debug selectedCustomer.id type:', typeof selectedCustomer.id);

      // ✅ Ensure customer ID is a string
      const customerId = String(selectedCustomer.id);
      console.log('🔍 Debug customerId (string):', customerId);

      // ✅ Don't include b2b_customer_id in body, it's derived from URL param
      const addressData = {
        ...newAddress
        // b2b_customer_id will be set by backend from URL parameter
      };

      console.log('🔍 Debug addressData:', addressData);
      console.log('🔍 Debug API call params:', customerId, addressData);

      const response = await createB2BServiceAddress(customerId, addressData);
      console.log('✅ New address created:', response);

      // Refresh the addresses list
      await fetchServiceAddressesData(customerId);

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

      // Auto-select the new address if it's the only one
      if (serviceAddresses.length === 0) {
        // The new address will be selected automatically after refresh
      }
    } catch (error) {
      console.error('Error creating new address:', error);
      alert('Failed to create new address');
    } finally {
      setIsAddingAddress(false);
    }
  };

  // ✅ Handle service address selection
  const handleServiceAddressSelect = (addressId: string) => {
    const address = serviceAddresses.find(a => a.id === addressId);
    if (address) {
      setSelectedServiceAddress(address);
      setFormData(prev => ({
        ...prev,
        b2b_service_address_id: addressId,
        store_name: address.store_name,
        store_code: address.store_code,
        store_address: `${address.address_line_1}, ${address.city}, ${address.state} ${address.pincode}`,
        booking_poc_name: address.contact_person || prev.booking_poc_name,
        booking_poc_number: address.contact_phone || prev.booking_poc_number
      }));
    }
  };

  // ✅ Handle custom price override
  const handleCustomPriceOverride = (value: string) => {
    const override = parseFloat(value) || 0;

    setFormData(prev => ({
      ...prev,
      custom_price_override: value,
      final_price: override > 0 ? value : prev.base_price
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // ✅ Validate that price has been calculated (same as B2C)
    if (!priceBreakdown || !selectedRateCardId || !formData.final_price || parseFloat(formData.final_price) <= 0) {
      setError('Please select all required fields to calculate the price before submitting.');
      setSaving(false);
      return;
    }

    try {
      // ✅ Calculate final amounts with custom price override and 18% GST
      const customPrice = parseFloat(formData.custom_price_override) || autoCalculatedPrice;
      const quantity = parseInt(formData.quantity) || 1;
      const totalAmount = customPrice * quantity;
      const gstAmount = totalAmount * 0.18; // 18% GST
      const finalAmount = totalAmount + gstAmount;

      const submitData = {
        ...formData,
        // ✅ Map frontend fields to backend expected fields
        rate_card_id: selectedRateCardId,
        base_price: autoCalculatedPrice, // Original rate card price
        custom_price: customPrice, // Backend expects 'custom_price', not 'custom_price_override'
        custom_price_override: formData.custom_price_override ? parseFloat(formData.custom_price_override) : null,
        final_price: customPrice, // Custom price or rate card price
        quantity: quantity,
        discount_amount: parseFloat(formData.discount_amount) || 0,
        service_rate: formData.service_rate ? parseFloat(formData.service_rate) : undefined,
        service_area_sqft: formData.service_area_sqft ? parseFloat(formData.service_area_sqft) : undefined,
        // ✅ Add service_address field (required by backend)
        service_address: formData.store_address || `${formData.store_name}, ${formData.store_code}`,
        // ✅ Calculate totals with 18% GST
        total_amount: totalAmount,
        gst_amount: gstAmount,
        final_amount: finalAmount,
        // ✅ Add B2C price breakdown for reference
        b2c_calculated_price: priceBreakdown.total,
        b2c_base_price: priceBreakdown.basePrice,
        b2c_gst_amount: priceBreakdown.gst,
      };

      console.log('📤 Submitting B2B order with calculated price:', submitData);
      console.log('🔍 Required fields check:', {
        b2b_customer_id: submitData.b2b_customer_id,
        service_name: submitData.service_name,
        custom_price: submitData.custom_price,
        service_address: submitData.service_address
      });

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
            <p className="text-gray-600 mt-1">Create a new B2B service order with editable fields</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
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

          {/* 🔍 DEBUG SECTION - Remove this after testing */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Debug Info</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <div>Selected Customer: {selectedCustomer ? selectedCustomer.company_name : 'None'}</div>
              <div>Categories Loaded: {categories.length}</div>
              <div>Subcategories Loaded: {subcategories.length}</div>
              <div>Filter Attributes Loaded: {filterAttributes.length}</div>
              <div>Filter Options Loaded: {filterOptions.length}</div>
              <div>Service Segments Loaded: {serviceSegments.length}</div>
              <div>Rate Card Price: ₹{autoCalculatedPrice}</div>
              <div>Custom Price: ₹{formData.custom_price_override || 'None'}</div>
              <div>Final Price: ₹{formData.final_price}</div>
              <div>Rate Card ID: {selectedRateCardId || 'None'}</div>
              <div>Providers Loaded: {providers.length}</div>
              <div>Service Addresses Loaded: {serviceAddresses.length}</div>
              <div>Form Category ID: {formData.category_id}</div>
              <div>Form Subcategory ID: {formData.subcategory_id}</div>
              <div>Selected Filter Attribute: {selectedFilterAttributesId || 'None'}</div>
              <div>Selected Filter Option: {selectedFilterOptionId || 'None'}</div>
              <div>Selected Segment: {selectedSegment?.segment_name || 'None'}</div>
            </div>
            <div className="mt-3 space-x-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  console.log('🧪 Manual categories test...');
                  fetchCategoriesData();
                }}
              >
                Test Load Categories
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  console.log('🧪 Current state:', {
                    categories: categories.length,
                    selectedCustomer: selectedCustomer?.company_name,
                    formData: formData
                  });
                }}
              >
                Log State
              </Button>
            </div>
          </div>

          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer">Select B2B Customer *</Label>
                <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={customerSearchOpen}
                      className="w-full justify-between"
                    >
                      {selectedCustomer ? selectedCustomer.company_name : "Select customer..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <div className="max-h-60 overflow-auto">
                      {loading ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          Loading customers...
                        </div>
                      ) : Array.isArray(customers) && customers.length > 0 ? (
                        <div className="p-1">
                          {customers.map((customer) => {
                            // Additional safety check for each customer
                            if (!customer || !customer.id || !customer.company_name) {
                              return null;
                            }

                            return (
                              <div
                                key={customer.id}
                                className="flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => {
                                  handleCustomerSelect(customer);
                                  setCustomerSearchOpen(false);
                                }}
                              >
                                <div className="flex-1">
                                  <div className="font-medium">{customer.company_name}</div>
                                  <div className="text-xs text-gray-500">
                                    {customer.contact_person} - {customer.phone}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No customers found
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedCustomer && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Selected Customer</h4>
                  <div className="text-sm text-green-800">
                    <div><strong>{selectedCustomer.company_name}</strong></div>
                    <div>{selectedCustomer.contact_person} - {selectedCustomer.phone}</div>
                    <div>{selectedCustomer.email}</div>
                  </div>
                </div>
              )}

              {/* ✅ SERVICE SELECTION - INTEGRATED WITH EXISTING SYSTEM */}
              {selectedCustomer && (
                <Card>
                  <CardHeader>
                    <CardTitle>Service Selection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Category Selection */}
                    <div>
                      <Label htmlFor="category">Category * ({categories.length} available)</Label>
                      <Select value={formData.category_id} onValueChange={handleCategorySelect}>
                        <SelectTrigger>
                          <SelectValue placeholder={categories.length > 0 ? "Select category" : "Loading categories..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.length > 0 ? (
                            categories.map((category) =>
                              category?.id && category?.name ? (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ) : null
                            )
                          ) : (
                            <SelectItem value="no-categories" disabled>
                              No categories available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {categories.length === 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Categories will load after selecting a customer
                        </p>
                      )}
                    </div>

                    {/* Subcategory Selection */}
                    {selectedCategory && (
                      <div>
                        <Label htmlFor="subcategory">Subcategory *</Label>
                        <Select value={formData.subcategory_id} onValueChange={handleSubcategorySelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {subcategories.map((subcategory) =>
                              subcategory?.id && subcategory?.name ? (
                                <SelectItem key={subcategory.id} value={subcategory.id}>
                                  {subcategory.name}
                                </SelectItem>
                              ) : null
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* ✅ Filter Attributes Selection (SAME AS NORMAL BOOKING) */}
                    {selectedSubcategory && filterAttributes.length > 0 && (
                      <div>
                        <Label htmlFor="filter_attributes">Filter Attributes</Label>
                        <Select
                          value={selectedFilterAttributesId}
                          onValueChange={handleFilterAttributeSelect}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select filter attributes" />
                          </SelectTrigger>
                          <SelectContent>
                            {filterAttributes.map((attribute) =>
                              attribute?.id && attribute?.name ? (
                                <SelectItem key={attribute.id} value={attribute.id}>
                                  {attribute.name}
                                </SelectItem>
                              ) : null
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* ✅ Filter Options Selection (SAME AS NORMAL BOOKING) */}
                    {selectedFilterAttributesId && filterOptions.length > 0 && (
                      <div>
                        <Label htmlFor="filter_options">Filter Options</Label>
                        <Select
                          value={selectedFilterOptionId}
                          onValueChange={async (value) => {
                            setSelectedFilterOptionId(value);
                            setFormData(prev => ({
                              ...prev,
                              filter_option_id: value
                            }));

                            // ✅ Fetch providers when filter option is selected (SAME AS NORMAL BOOKING)
                            if (selectedCategory?.id && selectedSubcategory?.id && selectedFilterAttributesId) {
                              try {
                                console.log('📦 Fetching providers after filter option selection');

                                const providersData = await fetchProvidersByFilters(
                                  selectedCategory.id,
                                  selectedSubcategory.id,
                                  selectedFilterAttributesId,
                                  value,
                                  1, // page
                                  50, // size
                                  '' // search
                                );

                                console.log('📦 Providers response:', providersData);

                                if (providersData && providersData.data) {
                                  const formattedProviders = providersData.data.map((provider: any) => ({
                                    id: provider.id, // Encrypted ID
                                    sampleid: provider.sampleid, // Decrypted ID for display
                                    name: provider.company_name || provider.name || `${provider.first_name} ${provider.last_name || ''} - ${provider.phone || 'No Phone'}`,
                                    phone: provider.phone,
                                    first_name: provider.first_name,
                                    last_name: provider.last_name
                                  }));
                                  setProviders(formattedProviders);
                                  console.log('📦 Formatted providers:', formattedProviders.length);
                                } else {
                                  setProviders([]);
                                }
                              } catch (error) {
                                console.error('Error fetching providers:', error);
                                setProviders([]);
                              }
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select filter option" />
                          </SelectTrigger>
                          <SelectContent>
                            {filterOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* ✅ Service Segments Selection */}
                    {selectedSubcategory && serviceSegments.length > 0 && (
                      <div>
                        <Label htmlFor="segment">Service Segment</Label>
                        <Select value={formData.segment_id} onValueChange={handleSegmentSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service segment" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceSegments.map((segment) =>
                              segment?.id && segment?.segment_name ? (
                                <SelectItem key={segment.id} value={segment.id}>
                                  {segment.segment_name}
                                </SelectItem>
                              ) : null
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* ✅ Provider Selection (SAME AS NORMAL BOOKING - AFTER FILTER OPTION SELECTED) */}
                    {selectedFilterOptionId && providers.length > 0 && (
                      <div>
                        <Label htmlFor="provider">Service Provider *</Label>
                        <Select value={formData.provider_id} onValueChange={handleProviderSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {providers.map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {provider.name} - {provider.phone}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* ✅ Price Calculation & Custom Override (SAME AS B2C + EDITABLE) */}
                    {selectedProvider && (
                      <div className="space-y-3">
                        <Label>Service Price</Label>
                        {isLoadingPrice ? (
                          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-blue-600">Calculating price...</span>
                          </div>
                        ) : priceBreakdown ? (
                          <div className="space-y-3">
                            {/* Rate Card Price Breakdown (Same as B2C) */}
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="text-sm text-green-700">
                                <div className="flex justify-between items-center">
                                  <span>Rate Card Price:</span>
                                  <span className="font-semibold">₹{autoCalculatedPrice}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <span>Item Total:</span>
                                  <span>₹{priceBreakdown.basePrice}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>GST (18%):</span>
                                  <span>₹{priceBreakdown.gst}</span>
                                </div>
                                {priceBreakdown.convenienceCharge > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span>Convenience Charge:</span>
                                    <span>₹{priceBreakdown.convenienceCharge}</span>
                                  </div>
                                )}
                                <div className="flex justify-between items-center font-semibold border-t pt-1 mt-1">
                                  <span>Total (B2C Price):</span>
                                  <span>₹{priceBreakdown.total}</span>
                                </div>
                                <div className="text-xs text-green-600 mt-1">
                                  Rate Card ID: {selectedRateCardId}
                                </div>
                              </div>
                            </div>

                            {/* B2B Custom Price Override */}
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <Label htmlFor="custom_price" className="text-blue-800 font-medium">B2B Custom Price (Editable) *</Label>
                              <Input
                                id="custom_price"
                                type="number"
                                step="0.01"
                                value={formData.custom_price_override || autoCalculatedPrice}
                                onChange={(e) => {
                                  const customPrice = parseFloat(e.target.value) || 0;
                                  const gstAmount = customPrice * 0.18; // 18% GST
                                  const finalTotal = customPrice + gstAmount;

                                  setFormData(prev => ({
                                    ...prev,
                                    custom_price_override: e.target.value,
                                    final_price: e.target.value,
                                    gst_amount: gstAmount.toFixed(2),
                                    final_amount: finalTotal.toFixed(2)
                                  }));
                                }}
                                placeholder="Enter custom B2B price"
                                className="text-lg font-semibold mt-2"
                              />
                              <div className="mt-2 text-sm text-blue-700">
                                <div className="flex justify-between">
                                  <span>Custom Price:</span>
                                  <span>₹{formData.custom_price_override || autoCalculatedPrice}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>GST (18%):</span>
                                  <span>₹{((parseFloat(formData.custom_price_override) || autoCalculatedPrice) * 0.18).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold border-t pt-1">
                                  <span>Final Total:</span>
                                  <span>₹{((parseFloat(formData.custom_price_override) || autoCalculatedPrice) * 1.18).toFixed(2)}</span>
                                </div>
                              </div>
                              <p className="text-xs text-blue-600 mt-2">
                                You can modify the price from the rate card price of ₹{autoCalculatedPrice}. GST will be calculated automatically at 18%.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-yellow-50 rounded-lg text-yellow-700 border border-yellow-200">
                            Select provider to calculate price
                          </div>
                        )}
                      </div>
                    )}

                    {/* Service Name (Auto-filled from rate card) */}
                    {selectedRateCard && (
                      <div>
                        <Label htmlFor="service_name">Service Name</Label>
                        <Input
                          id="service_name"
                          value={formData.service_name}
                          onChange={(e) => handleInputChange('service_name', e.target.value)}
                          placeholder="Service name"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ✅ PROVIDER SELECTION (FIXED CONDITION) */}
              {selectedSubcategory && providers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Service Provider</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="provider">Provider *</Label>
                      <Select value={formData.provider_id} onValueChange={handleProviderSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name} - {provider.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ✅ SERVICE ADDRESS SELECTION WITH ADD MODAL */}
              {selectedProvider && (
                <Card>
                  <CardHeader>
                    <CardTitle>Service Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="service_address">Service Address *</Label>
                      <Select value={formData.b2b_service_address_id} onValueChange={handleServiceAddressSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service address" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceAddresses.map((address) => (
                            <SelectItem key={address.id} value={address.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{address.store_name}</span>
                                <span className="text-sm text-gray-500">
                                  {address.address_line_1}, {address.city}, {address.state} {address.pincode}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Add New Address Button */}
                    <Dialog open={showAddAddressModal} onOpenChange={setShowAddAddressModal}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" className="w-full">
                          Add New Service Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Add New Service Address</DialogTitle>
                          <DialogDescription>
                            Add a new service address for this B2B customer.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="modal_store_name">Store Name *</Label>
                              <Input
                                id="modal_store_name"
                                value={newAddress.store_name}
                                onChange={(e) => setNewAddress(prev => ({
                                  ...prev,
                                  store_name: e.target.value
                                }))}
                                placeholder="e.g., Main Branch Store"
                              />
                            </div>
                            <div>
                              <Label htmlFor="modal_store_code">Store Code *</Label>
                              <Input
                                id="modal_store_code"
                                value={newAddress.store_code}
                                onChange={(e) => setNewAddress(prev => ({
                                  ...prev,
                                  store_code: e.target.value
                                }))}
                                placeholder="e.g., MB-001"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="modal_address">Address Line 1 *</Label>
                            <Input
                              id="modal_address"
                              value={newAddress.address_line_1}
                              onChange={(e) => setNewAddress(prev => ({
                                ...prev,
                                address_line_1: e.target.value
                              }))}
                              placeholder="Street address, building name, etc."
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="modal_city">City *</Label>
                              <Input
                                id="modal_city"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress(prev => ({
                                  ...prev,
                                  city: e.target.value
                                }))}
                                placeholder="City"
                              />
                            </div>
                            <div>
                              <Label htmlFor="modal_state">State *</Label>
                              <Input
                                id="modal_state"
                                value={newAddress.state}
                                onChange={(e) => setNewAddress(prev => ({
                                  ...prev,
                                  state: e.target.value
                                }))}
                                placeholder="State"
                              />
                            </div>
                            <div>
                              <Label htmlFor="modal_pincode">Pincode *</Label>
                              <Input
                                id="modal_pincode"
                                value={newAddress.pincode}
                                onChange={(e) => setNewAddress(prev => ({
                                  ...prev,
                                  pincode: e.target.value
                                }))}
                                placeholder="Pincode"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="modal_contact_person">Contact Person</Label>
                              <Input
                                id="modal_contact_person"
                                value={newAddress.contact_person}
                                onChange={(e) => setNewAddress(prev => ({
                                  ...prev,
                                  contact_person: e.target.value
                                }))}
                                placeholder="Contact person name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="modal_contact_phone">Contact Phone</Label>
                              <Input
                                id="modal_contact_phone"
                                value={newAddress.contact_phone}
                                onChange={(e) => setNewAddress(prev => ({
                                  ...prev,
                                  contact_phone: e.target.value
                                }))}
                                placeholder="Contact phone number"
                              />
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddAddressModal(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={handleAddNewAddress}
                            disabled={isAddingAddress || !newAddress.store_name || !newAddress.store_code || !newAddress.address_line_1 || !newAddress.city || !newAddress.state || !newAddress.pincode}
                          >
                            {isAddingAddress ? 'Adding...' : 'Add Address'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )}

              {/* ✅ PRICING SECTION - REMOVED DUPLICATE */}
            </CardContent>
          </Card>

          {/* ✅ Service Details - CLEANED UP */}
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
                    placeholder="Auto-filled from service selection"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="1"
                    min="1"
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
                  placeholder="Describe the service to be provided"
                  rows={3}
                />
              </div>



              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    value={formData.service_time}
                    onChange={(e) => handleInputChange('service_time', e.target.value)}
                    placeholder="e.g., 10:00-12:00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editable Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Store & Service Details (Editable Fields)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_rate">Service Rate (Override)</Label>
                  <Input
                    id="service_rate"
                    type="number"
                    step="0.01"
                    value={formData.service_rate}
                    onChange={(e) => handleInputChange('service_rate', e.target.value)}
                    placeholder="Custom service rate"
                  />
                </div>
                <div>
                  <Label htmlFor="service_area_sqft">Service Area (Sq Ft)</Label>
                  <Input
                    id="service_area_sqft"
                    type="number"
                    step="0.01"
                    value={formData.service_area_sqft}
                    onChange={(e) => handleInputChange('service_area_sqft', e.target.value)}
                    placeholder="Area in square feet"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store_name">Store Name</Label>
                  <Input
                    id="store_name"
                    value={formData.store_name}
                    onChange={(e) => handleInputChange('store_name', e.target.value)}
                    placeholder="e.g., Mobile Store - Andheri"
                  />
                </div>
                <div>
                  <Label htmlFor="store_code">Store Code</Label>
                  <Input
                    id="store_code"
                    value={formData.store_code}
                    onChange={(e) => handleInputChange('store_code', e.target.value)}
                    placeholder="e.g., MS-AND-01"
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
                    placeholder="Service-specific contact person"
                  />
                </div>
                <div>
                  <Label htmlFor="booking_poc_number">Booking POC Number</Label>
                  <Input
                    id="booking_poc_number"
                    value={formData.booking_poc_number}
                    onChange={(e) => handleInputChange('booking_poc_number', e.target.value)}
                    placeholder="Service-specific contact number"
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
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Select value={formData.payment_terms} onValueChange={(value) => handleInputChange('payment_terms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15 days">Net 15 days</SelectItem>
                    <SelectItem value="Net 30 days">Net 30 days</SelectItem>
                    <SelectItem value="Net 45 days">Net 45 days</SelectItem>
                    <SelectItem value="Net 60 days">Net 60 days</SelectItem>
                    <SelectItem value="Immediate">Immediate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes or special requirements"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !formData.b2b_customer_id || !formData.service_name || !formData.final_price || !formData.provider_id}>
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
