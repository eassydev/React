'use client';
import React, { useState, useEffect, FormEvent } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from '@/components/ui/select';
import { Virtuoso } from 'react-virtuoso';

import { Switch } from '@/components/ui/switch';
import { Save, Loader2, Type, Globe2 } from 'lucide-react';
import {
  fetchAllCategories,
  fetchSubCategoriesByCategoryId,
  fetchProviders,
  fetchFilterOptionsByAttributeId,
  fetchFilterAttributes,
  updateRateCard,
  Category,
  Subcategory,
  Attribute,
  fetchRateCardById,
  Provider,
  fetchProviderById,
  fetchServiceSegments,
  ServiceSegment,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';

// For dynamic attributes
interface FilterAttributeOption {
  attributeId: string;
  optionId: string;
  options?: { id: string; value: string }[];
}

const RateCardForm: React.FC = () => {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const rateCardId = pathname?.split('/').pop();

  // ------------------------------
  // Form State
  // ------------------------------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filterAttributes, setFilterAttributes] = useState<Attribute[]>([]);
  const [filterAttributeOptions, setFilterAttributeOptions] = useState<FilterAttributeOption[]>([]);

  const [rateCardName, setRateCardName] = useState('');
  const [price, setPrice] = useState('');
  const [strikePrice, setStrikePrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [segments, setSegments] = useState<ServiceSegment[]>([]);
  const [segmentsId, setsegmentsId] = useState<string>('');
  const [weight, setWeight] = useState<number>(0);
  const [serviceType, setServiceType] = useState<string>('both'); // ✅ NEW: Service type state

  // Provider-related state
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedProviderName, setSelectedProviderName] = useState<string>('Select an option');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priceError, setPriceError] = useState('');
  const [strikePriceError, setStrikePriceError] = useState('');

  // ------------------------------
  // 1. Fetch Categories & RateCard for Edit
  // ------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const fetchedCategories = await fetchAllCategories();
        setCategories(fetchedCategories);

        // If editing, fetch rate card data
        if (rateCardId) {
          const rateCardData = await fetchRateCardById(rateCardId.toString());
          setRateCardName(rateCardData.name);
          setSelectedCategoryId(rateCardData.category_id?.toString() || '');
          setSelectedSubcategoryId(rateCardData.subcategory_id?.toString() || '');
          setPrice(rateCardData.price?.toString() || '');
          setStrikePrice(rateCardData.strike_price?.toString() || '');
          setIsActive(rateCardData.active);
          setServiceType(rateCardData.service_type || 'both'); // ✅ NEW: Set service_type from API
          setSelectedProviderId(rateCardData.provider_id?.toString() || '');

          if (rateCardData.provider_id) {
            await loadProviders(rateCardData.provider_id);
          }

          setsegmentsId(rateCardData.segment_id?.toString() || '');

          // Fetch dynamic attributes if any
          if (rateCardData.attributes && Array.isArray(rateCardData.attributes)) {
            const dynamicAttributes = await Promise.all(
              rateCardData.attributes.map(async (attr: any) => {
                try {
                  const options = await fetchFilterOptionsByAttributeId(attr.filter_attribute_id);
                  return {
                    attributeId: attr.filter_attribute_id.toString(),
                    optionId: attr.filter_option_id?.toString() || '',
                    options: options.map((o: any) => ({
                      id: o.id.toString(),
                      value: o.value,
                    })),
                  };
                } catch (error) {
                  console.error(
                    `Error fetching options for attribute ${attr.filter_attribute_id}:`,
                    error
                  );
                  return {
                    attributeId: attr.filter_attribute_id.toString(),
                    optionId: attr.filter_option_id?.toString() || '',
                    options: [],
                  };
                }
              })
            );
            setFilterAttributeOptions(dynamicAttributes);
          }

          // Fetch subcategories
          if (rateCardData.category_id) {
            await fetchSubcategories(rateCardData.category_id.toString());
          }

          // Fetch filter attributes
          const subcategoryId =
            rateCardData.subcategory_id !== null ? rateCardData.subcategory_id : undefined;
          await fetchFilters(rateCardData.category_id, subcategoryId);

          // Fetch segments if any
          if (rateCardData.segment_id) {
            const segmentData = await fetchServiceSegments(
              rateCardData.category_id,
              subcategoryId || null
            );
            setSegments(segmentData);
          }
        }
      } catch (error) {
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Failed to load data.',
        });
      }
    };

    fetchData();
  }, [rateCardId, toast]);

  const loadProviders = async (providerid: string) => {
    try {
      const fetchedProviders = await fetchProviders();
      setProviders(fetchedProviders);
      const selectedProvider = fetchedProviders.find(
        (provider) => provider.id?.toString() === providerid
      );

      setSelectedProviderName(`${selectedProvider?.first_name} ${selectedProvider?.last_name}`);
      console.log('tSelectedProviderName', selectedProviderId);
    } catch (error) {
      setSubcategories([]);
    }
  };
  // ------------------------------
  // 3. Load the Selected Provider (for Edit Preselect)
  // ------------------------------

  // ------------------------------
  // Helpers for Subcategory & Filter Attributes
  // ------------------------------
  const fetchSubcategories = async (categoryId: string) => {
    try {
      const fetchedSubcategories = await fetchSubCategoriesByCategoryId(categoryId);
      setSubcategories(fetchedSubcategories);
    } catch (error) {
      setSubcategories([]);
    }
  };

  const fetchFilters = async (categoryId: string, subcategoryId?: string) => {
    try {
      const filters = await fetchFilterAttributes(categoryId, subcategoryId || null);
      setFilterAttributes(filters);
    } catch (error) {
      setFilterAttributes([]);
    }
  };

  // Fetch subcategories on category select
  useEffect(() => {
    if (selectedCategoryId) {
      (async () => {
        try {
          const subcategoryData = await fetchSubCategoriesByCategoryId(selectedCategoryId);
          setSubcategories(subcategoryData);
          // Only reset selectedSubcategoryId if it doesn't match any subcategory in the new list
          if (!subcategoryData.some((sub) => sub.id?.toString() === selectedSubcategoryId)) {
            setSelectedSubcategoryId('');
          }
        } catch (error) {
          setSubcategories([]);
          // Only reset selectedSubcategoryId if there's an error and no subcategories are fetched
          setSelectedSubcategoryId('');
        }
      })();
    } else {
      setSubcategories([]);
      setSelectedSubcategoryId('');
    }
  }, [selectedCategoryId]);

  // Fetch attributes & segments when category/subcategory changes
  useEffect(() => {
    if (selectedCategoryId || selectedSubcategoryId) {
      (async () => {
        try {
          const attributeData = await fetchFilterAttributes(
            selectedCategoryId,
            selectedSubcategoryId ? selectedSubcategoryId : null
          );
          setFilterAttributes(attributeData);
        } catch {
          setFilterAttributes([]);
        }
      })();

      (async () => {
        try {
          const segmentData = await fetchServiceSegments(
            selectedCategoryId,
            selectedSubcategoryId ? selectedSubcategoryId : null
          );
          setSegments(segmentData);
        } catch {
          setSegments([]);
        }
      })();
    }
  }, [selectedCategoryId, selectedSubcategoryId]);

  // ------------------------------
  // Handlers for Dynamic Filters
  // ------------------------------
  const handleAddFilterAttributeOption = () => {
    setFilterAttributeOptions((prev) => [...prev, { attributeId: '', optionId: '' }]);
  };

  const handleRemoveFilterAttributeOption = (index: number) => {
    setFilterAttributeOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateFilterAttributeOption = async (
    index: number,
    key: 'attributeId' | 'optionId',
    value: string
  ) => {
    const updated = [...filterAttributeOptions];
    updated[index][key] = value;

    if (key === 'attributeId') {
      try {
        const options = await fetchFilterOptionsByAttributeId(value);
        updated[index].options = options.map((option) => ({
          id: option.id!.toString(),
          value: option.value,
        }));
      } catch (error) {
        console.error('Error fetching filter options:', error);
        updated[index].options = [];
      }
    }

    setFilterAttributeOptions(updated);
  };

  const handleValueChange = (value: string) => {
    const selectedProvider = providers.find((provider) => provider.id?.toString() === value);
    if (selectedProvider) {
      setSelectedProviderId(value);
      setSelectedProviderName(`${selectedProvider.first_name} ${selectedProvider.last_name}`);
    } else {
      setSelectedProviderName('Select an option');
    }
  };
  // ------------------------------
  // Form Submit
  // ------------------------------
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const rateCardData = {
      name: rateCardName,
      category_id: selectedCategoryId,
      subcategory_id: selectedSubcategoryId ? selectedSubcategoryId : null,
      attributes: filterAttributeOptions.map((pair) => ({
        attribute_id: pair.attributeId,
        option_id: pair.optionId,
      })),
      price: parseFloat(price),
      strike_price: parseFloat(strikePrice),
      segment_id: segmentsId,
      active: isActive,
      provider_id: selectedProviderId,
      service_type: serviceType, // ✅ NEW: Include service_type in update data
      // add weight if needed in the payload
    };

    try {
      if (!rateCardId) {
        // If there's no rateCardId, presumably you're creating a new one (not updating).
        // But since the code references `updateRateCard`, I'm leaving this as is.
      }

      const response = await updateRateCard(rateCardId!.toString(), rateCardData);
      toast({
        variant: 'success',
        title: 'Success',
        description: response.message,
      });

      router.push('/admin/rate-card');
    } catch (error) {
      console.log('rateCardData', error);
      toast({
        variant: 'error',
        title: 'Error',
        description: `${error}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Rate Card Management</h1>
          <p className="text-gray-500">Create or Edit a rate card</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">
                  {rateCardId ? 'Edit Rate Card' : 'New Rate Card'}
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below {rateCardId ? 'to update' : 'to create'} a rate card
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Rate Card Name */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Type className="w-4 h-4 text-blue-500" />
                  <span>Rate Card Name</span>
                </label>
                <Input
                  placeholder="Enter rate card name"
                  value={rateCardName}
                  onChange={(e) => setRateCardName(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              {/* Category Selector */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Globe2 className="w-4 h-4 text-blue-500" />
                  <span>Select Category</span>
                </label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={(value) => setSelectedCategoryId(value)}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(
                      (category) =>
                        category?.id &&
                        category?.name && (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        )
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/* Subcategory Selector */}
              {subcategories.length > 0 && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Globe2 className="w-4 h-4 text-blue-500" />
                    <span>Select Subcategory</span>
                  </label>
                  <Select
                    value={selectedSubcategoryId} // Ensure this is a string
                    onValueChange={(value) => setSelectedSubcategoryId(value)} // value is already a string
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map(
                        (subcategory) =>
                          subcategory?.id &&
                          subcategory?.name && (
                            <SelectItem
                              key={subcategory.id.toString()} // Ensure key is a string
                              value={subcategory.id.toString()} // Ensure value is a string
                            >
                              {subcategory.name}
                            </SelectItem>
                          )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* Dynamic Filter Attribute Options */}
              {filterAttributes.length > 0 && (
                <div className="space-y-2">
                  {filterAttributeOptions.map((pair, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      {/* Attribute Selector */}
                      <Select
                        value={pair.attributeId}
                        onValueChange={(value) =>
                          handleUpdateFilterAttributeOption(index, 'attributeId', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Attribute" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterAttributes.map((attr) =>
                            attr?.id && attr?.name ? (
                              <SelectItem key={attr.id} value={attr.id.toString()}>
                                {attr.name}
                              </SelectItem>
                            ) : null
                          )}
                        </SelectContent>
                      </Select>
                      {/* Option Selector */}
                      <Select
                        value={pair.optionId}
                        onValueChange={(value) =>
                          handleUpdateFilterAttributeOption(index, 'optionId', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Option" />
                        </SelectTrigger>
                        <SelectContent>
                          {pair.options?.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>
                              {opt.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {/* Remove Button */}
                      <Button
                        type="button"
                        onClick={() => handleRemoveFilterAttributeOption(index)}
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" onClick={handleAddFilterAttributeOption}>
                    Add Attribute
                  </Button>
                </div>
              )}

              {/* Price */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Price</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (parseFloat(value) < 0) {
                      setPriceError('Price cannot be negative.');
                      setPrice(value);
                    } else {
                      setPriceError('');
                      setPrice(value);
                    }
                  }}
                  className="h-11"
                  required
                />
                {priceError && <p className="text-red-500 text-sm">{priceError}</p>}
              </div>

              {/* Discount Price */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Discount Price</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter discount price"
                  value={strikePrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (parseFloat(value) < 0) {
                      setStrikePriceError('Price cannot be negative.');
                      setStrikePrice(value);
                    } else {
                      setStrikePriceError('');
                      setStrikePrice(value);
                    }
                  }}
                  className="h-11"
                  required
                />
                {strikePriceError && <p className="text-red-500 text-sm">{strikePriceError}</p>}
              </div>

              {/* Segment Selector */}
              {segments.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select Segment</label>
                  <Select value={segmentsId} onValueChange={(value) => setsegmentsId(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments.map((seg) =>
                        seg?.id && seg?.segment_name ? (
                          <SelectItem key={seg.id} value={seg.id.toString()}>
                            {seg.segment_name}
                          </SelectItem>
                        ) : null
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* 
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Provider {selectedProviderId}</label>
                <Select value={selectedProviderId} onValueChange={(value) => setSelectedProviderId(value)}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                   

                    {providers.length > 0 ? (
                      providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id?.toString() ?? ''}>
                          {provider.first_name} {provider.last_name || ""}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center">No providers found</div>
                    )}

                    {hasMore && !isLoadingProviders && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((prev) => prev + 1);
                        }}
                        className="w-full text-center py-2 text-blue-600 hover:underline"
                      >
                        Load More
                      </button>
                    )}
                  </SelectContent>
                </Select>
              </div> */}
              <div className="space-y-2 w-full">
                <label className="text-sm font-medium text-gray-700">Select Provider</label>
                <Select value={selectedProviderId || ''} onValueChange={handleValueChange}>
                  <SelectTrigger className="w-full">
                    {selectedProviderName || 'Select an option'}
                  </SelectTrigger>
                  <SelectContent className="w-full p-0">
                    {/* Search input */}
                    <div className="sticky top-0 z-10 bg-background p-2 border-b">
                      <Input
                        placeholder="Search by name, company, phone, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                        autoFocus
                      />
                    </div>

                    {/* Filtered provider list */}
                    {providers.filter((provider) =>
                      `${provider.first_name} ${provider.last_name || ''} ${provider.company_name || ''} ${provider.phone || ''}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    ).length > 0 ? (
                      <Virtuoso
                        style={{ height: '200px', width: '100%' }}
                        totalCount={
                          providers.filter((provider) =>
                            `${provider.first_name} ${provider.last_name || ''} ${provider.company_name || ''} ${provider.phone || ''}`
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          ).length
                        }
                        itemContent={(index) => {
                          const filteredProviders = providers.filter((provider) =>
                            `${provider.first_name} ${provider.last_name || ''} ${provider.company_name || ''} ${provider.phone || ''}`
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          );
                          const provider = filteredProviders[index];
                          return (
                            <SelectItem key={provider.id} value={provider.id?.toString() ?? ''}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {provider.first_name} {provider.last_name || ''}
                                </span>
                                {provider.company_name && (
                                  <span className="text-sm text-gray-600">
                                    {provider.company_name}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  📞 {provider.phone || 'No Phone'} • ID:{' '}
                                  {(provider as any).sampleid || provider.id}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        }}
                      />
                    ) : (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No providers found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/* Weight (optional) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Ratecard Weightage</label>
                <Input
                  placeholder="Ratecard Weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="h-10"
                />
              </div>

              {/* Service Type Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Globe2 className="w-4 h-4 text-blue-500" />
                  <span>Service Type</span>
                </label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both (B2B & B2C)</SelectItem>
                    <SelectItem value="b2c">B2C Only</SelectItem>
                    <SelectItem value="b2b">B2B Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active/Inactive Switch */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Rate Card Status</span>
                </label>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Inactive</span>
                  <Switch
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    className="data-[state=checked]:bg-blue-500"
                  />
                  <span className="text-sm text-gray-600">Active</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-3 pt-6">
                <Button
                  className="w-100 flex-1 h-11 bg-primary"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Save Rate Card</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RateCardForm;
