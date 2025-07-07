'use client';
import React, { useState, useEffect, FormEvent } from 'react';
import dynamic from 'next/dynamic';
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
import { Switch } from '@/components/ui/switch';
import { Save, FileText, Loader2, Type, Globe2 } from 'lucide-react';
import {
  fetchAllCategories,
  fetchSubCategoriesByCategoryId,
  fetchProviders,
  fetchProviderById,
  fetchFilterOptionsByAttributeId,
  fetchFilterAttributes,
  createRateCard,
  Category,
  Subcategory,
  Attribute,
  ServiceSegment,
  Provider,
  ServiceDetail,
  fetchServiceSegments,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Virtuoso } from 'react-virtuoso';

interface FilterAttributeOption {
  attributeId: string;
  optionId: string;
  options?: { id: string; value: string }[];
}

const RateCardForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filterAttributes, setFilterAttributes] = useState<Attribute[]>([]);
  const [filterAttributeOptions, setFilterAttributeOptions] = useState<FilterAttributeOption[]>([]);
  const [rateCardName, setRateCardName] = useState('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [strikePrice, setStrikePrice] = useState('');
  const [strikePriceError, setStrikePriceError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [segments, setSegments] = useState<ServiceSegment[]>([]);
  const [segmentsId, setsegmentsId] = useState<string>('');
  const [selectedProviderName, setSelectedProviderName] = useState<string>('Select an option');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [weight, setWeight] = useState<number>(0);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await fetchAllCategories();
        setCategories(categoryData);
        await loadProviders();
      } catch {
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Failed to load categories.',
        });
      }
    };
    loadCategories();
  }, []);

  const loadProviders = async () => {
    try {
      const fetchedProviders = await fetchProviders();
      setProviders(fetchedProviders);
    } catch (error) {
      setProviders([]);
    }
  };

  // Fetch subcategories when a category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      const loadSubcategories = async () => {
        try {
          const subcategoryData = await fetchSubCategoriesByCategoryId(selectedCategoryId);
          setSubcategories(subcategoryData);
          setSelectedSubcategoryId('');
        } catch (error) {
          setSubcategories([]);
          setSelectedSubcategoryId('');
        }
      };
      loadSubcategories();
    } else {
      setSubcategories([]);
      setSelectedSubcategoryId('');
    }
  }, [selectedCategoryId]);

  // Fetch filter attributes when a category or subcategory is selected
  useEffect(() => {
    if (selectedCategoryId || selectedSubcategoryId) {
      const loadFilterAttributes = async () => {
        try {
          const attributeData = await fetchFilterAttributes(
            selectedCategoryId,
            selectedSubcategoryId ? selectedSubcategoryId : null
          );
          setFilterAttributes(attributeData);
        } catch (error) {
          setFilterAttributes([]);
        }
      };
      loadFilterAttributes();
      const loadServiceDetails = async () => {
        try {
          const segmentData = await fetchServiceSegments(
            selectedCategoryId,
            selectedSubcategoryId ? selectedSubcategoryId : null
          );
          setSegments(segmentData);
        } catch (error) {
          setSegments([]);
        }
      };
      loadServiceDetails();
    }
  }, [selectedCategoryId, selectedSubcategoryId]);

  const handleAddFilterAttributeOption = () => {
    setFilterAttributeOptions([...filterAttributeOptions, { attributeId: '', optionId: '' }]);
  };

  const handleRemoveFilterAttributeOption = (index: number) => {
    setFilterAttributeOptions((prev) => prev.filter((_, i) => i !== index));
  };
  const handleUpdateFilterAttributeOption = async (
    index: number,
    key: 'attributeId' | 'optionId',
    value: string
  ) => {
    console.log('Updating attribute option');

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
      segment_id: segmentsId,
      weight: weight,
      price: parseFloat(price),
      strike_price: parseFloat(strikePrice),
      active: isActive,
      provider_id: selectedProviderId,
    };

    try {
      const response = await createRateCard(rateCardData);
      toast({
        variant: 'success',
        title: 'Success',
        description: response.message,
      });
      //  router.push("/admin/rate-card");
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Rate Card Management</h1>
          <p className="text-gray-500">Create a new rate card</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">New Rate Card</CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below to create a new rate card
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Rate Card Name Field */}
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
                    {categories.map((category) =>
                      category?.id && category?.name ? (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ) : null
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
                    value={selectedSubcategoryId}
                    onValueChange={(value) => setSelectedSubcategoryId(value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcategory) =>
                        subcategory?.id && subcategory?.name ? (
                          <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                            {subcategory.name}
                          </SelectItem>
                        ) : null
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-sm font-medium">Ratecard Weightage</label>
                <Input
                  placeholder="Ratecard Weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="h-10"
                />
              </div>
              {/* Dynamic Filter Attribute Options */}
              {filterAttributes.length > 0 && (
                <div>
                  {filterAttributeOptions.map((pair, index) => (
                    <div key={index} className="flex items-center space-x-4">
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
                          {filterAttributes.map((attr) => (
                            <SelectItem key={attr.id} value={attr.id!.toString()}>
                              {attr.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Strike Price</span>
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
                {priceError && <p className="text-red-500 text-sm">{priceError}</p>}
              </div>

              {segments.length > 0 && (
                <div className="space-y-2">
                  <Select value={segmentsId} onValueChange={(value) => setsegmentsId(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments.map((attr) => (
                        <SelectItem key={attr.id} value={attr.id!.toString()}>
                          {attr.segment_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
