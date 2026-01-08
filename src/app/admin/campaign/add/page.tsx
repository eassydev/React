'use client';
import React, { useState, useEffect, FormEvent, useMemo } from 'react';
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
import { Save, Loader2, ChevronDown } from 'lucide-react';
import {
  fetchAllCategories,
  fetchSubCategoriesByCategoryId,
  fetchFilterAttributes,
  fetchFilterOptionsByAttributeId,
  fetchServiceSegments,
  createCampaign,
  fetchAllRatecard,
  Provider,
  fetchProviders,
  Category,
  Subcategory,
  Attribute,
  AttributeOption,
  fetchRateCardsByProvider,
  ServiceSegment,
} from '@/lib/api';
import { Virtuoso } from 'react-virtuoso';
import { Switch } from '@/components/ui/switch'; // Import Switch component
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const CampaignForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filterAttributes, setFilterAttributes] = useState<Attribute[]>([]);
  const [filterAttributeOptions, setFilterAttributeOptions] = useState<AttributeOption[]>([]);
  const [segments, setSegments] = useState<ServiceSegment[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [rateCards, setRateCards] = useState<any[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [utmSource, setUtmSource] = useState<string>('whatsapp'); // Default to "whatsapp"
  const [utmMedium, setUtmMedium] = useState<string>(''); // UTM Medium Field

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [selectedAttributeId, setSelectedAttributeId] = useState<string>('');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('');
  const [campaignName, setCampaignName] = useState<string>('');
  const [utmUrl, setUtmUrl] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [screenRedirect, setScreenRedirect] = useState<string>('');
  const [addToCart, setAddToCart] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [selectedProviderName, setSelectedProviderName] = useState<string>('Select an option');
  const [selectedRatecardName, setSelectedRatecardName] = useState<string>('Select an option');
  const [selectedRatecardId, setSelectedRatecardId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRateCardDropdownOpen, setIsRateCardDropdownOpen] = useState<boolean>(false);

  // Optional: Filtered list based on search
  const filteredRateCards = useMemo(() => {
    return rateCards.filter((rc: any) =>
      `${rc.category?.name} ${rc.subcategory?.name} ${rc.price} ${rc.provider?.first_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [rateCards, searchQuery]);
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await fetchAllCategories();
        setCategories(categoryData);
        // const [rateCardResponse] = await Promise.all([
        //   fetchAllRatecard(),
        // ]);
        //  setRateCards(rateCardResponse || []);
        const fetchedProviders = await fetchProviders();
        setProviders(fetchedProviders);
      } catch {
        toast({ variant: 'error', title: 'Error', description: 'Failed to load categories.' });
      }
    };
    loadCategories();
  }, [toast]);

  const utmSources = [
    { id: 'web', name: 'Web' },
    { id: 'playstore', name: 'Play Store' },
    { id: 'GoogleAds', name: 'Google Ads' },
    { id: 'whatsapp', name: 'Whatsapp' },
    { id: 'LinkedIN', name: 'LinkedIN' },
    { id: 'Meta', name: 'Meta' },
  ];

  useEffect(() => {
    if (selectedCategoryId) {
      const loadSubcategories = async () => {
        try {
          const subcategoryData = await fetchSubCategoriesByCategoryId(selectedCategoryId);
          setSubcategories(subcategoryData);
        } catch {
          setSubcategories([]);
        }
      };
      loadSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    if (selectedCategoryId || selectedSubcategoryId) {
      const loadAttributes = async () => {
        try {
          const attributeData = await fetchFilterAttributes(
            selectedCategoryId,
            selectedSubcategoryId || null
          );
          setFilterAttributes(attributeData);
        } catch {
          setFilterAttributes([]);
        }
      };
      loadAttributes();
    }
  }, [selectedCategoryId, selectedSubcategoryId]);

  useEffect(() => {
    if (selectedAttributeId) {
      const loadOptions = async () => {
        try {
          const optionData = await fetchFilterOptionsByAttributeId(selectedAttributeId);
          setFilterAttributeOptions(optionData);
        } catch {
          setFilterAttributeOptions([]);
        }
      };
      loadOptions();
    }
  }, [selectedAttributeId]);

  useEffect(() => {
    if (selectedCategoryId || selectedSubcategoryId) {
      const loadSegments = async () => {
        try {
          const segmentData = await fetchServiceSegments(
            selectedCategoryId,
            selectedSubcategoryId ? selectedSubcategoryId : null,
            selectedAttributeId ? selectedAttributeId : null
          );
          // const segmentData = await fetchServiceSegments(selectedCategoryId, selectedSubcategoryId || null);
          setSegments(segmentData);
        } catch {
          setSegments([]);
        }
      };
      loadSegments();
    }
  }, [selectedCategoryId, selectedSubcategoryId, selectedAttributeId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const campaignData = {
      campaign_name: campaignName,
      category_id: selectedCategoryId || '',
      subcategory_id: selectedSubcategoryId || '',
      filter_attribute_id: selectedAttributeId || '',
      filter_option_id: selectedOptionId || '',
      rate_card_id: selectedRatecardId || '',
      segment_id: selectedSegmentId || '',
      provider_id: selectedProviderId,
      utm_url: utmUrl || '',
      pincode,
      latitude,
      longitude,
      utm_source: utmSource,
      utm_medium: utmMedium,
      screen_redirect: screenRedirect,
      add_to_cart: addToCart,
      is_active: isActive,
    };

    try {
      const response = await createCampaign(campaignData);
      console.log('Campaign created response:', response);

      toast({
        variant: 'success',
        title: 'Success',
        description: response.message || 'Campaign created successfully'
      });

      // Redirect to campaign list after successful creation
      setTimeout(() => {
        router.push("/admin/campaign");
      }, 1500);
    } catch (e: any) {
      console.error('Campaign creation error:', e);
      toast({
        variant: 'error',
        title: 'Error',
        description: e.message || 'Failed to create campaign'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleProviderChange = (value: string) => {
    const selectedProvider = providers.find((provider) => provider.id?.toString() === value);
    console.log(selectedProvider, 'selectedProvider');
    if (selectedProvider) {
      setSelectedProviderId(value);
      setSelectedProviderName(`${selectedProvider.first_name} ${selectedProvider.last_name}`);
      setPincode(selectedProvider.postal_code || '');
      setLatitude(selectedProvider.latitude?.toString() || '');
      setLongitude(selectedProvider.longitude?.toString() || '');
    } else {
      setSelectedProviderName('Select a provider');
    }
  };

  const handleRatecardChange = (value: string) => {
    const selectedRatecard = rateCards.find((ratecard) => ratecard.id?.toString() === value);
    if (selectedRatecard) {
      setSelectedRatecardId(value);
      setSelectedRatecardName(selectedRatecard.name);
    } else {
      setSelectedRatecardName('Select a ratecard');
    }
  };

  const handleValueChange = async (value: string) => {
    const selectedProvider = providers.find((provider) => provider.id?.toString() === value);
    if (selectedProvider) {
      setSelectedProviderId(value);
      setSelectedProviderName(`${selectedProvider.first_name} ${selectedProvider.last_name}`);
      const rateCardResponse = await fetchRateCardsByProvider(value); // Pass provider ID
      setRateCards(rateCardResponse || []);
    } else {
      setSelectedProviderName('Select an option');
    }
  };

  return (
    <div className="min-h-screen p-4">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Management</CardTitle>
          <CardDescription>Create a new campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              <Select value={utmSource} onValueChange={setUtmSource}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select UTM Source" />
                </SelectTrigger>
                <SelectContent>
                  {utmSources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                value={campaignName}
                placeholder="Campaign Name"
                onChange={(e) => setCampaignName(e.target.value)}
                required
              />
              {/* <Input value={utmUrl} placeholder="UTM URL (Optional)" onChange={(e) => setUtmUrl(e.target.value)} /> */}

              <Input
                value={utmMedium}
                placeholder="Enter UTM Medium"
                onChange={(e) => setUtmMedium(e.target.value)}
              />
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id!.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {subcategories.length > 0 && (
                <Select value={selectedSubcategoryId} onValueChange={setSelectedSubcategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((s) => (
                      <SelectItem key={s.id} value={s.id!.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {filterAttributes.length > 0 && (
                <Select value={selectedAttributeId} onValueChange={setSelectedAttributeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Filter Attribute" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterAttributes.map((a) => (
                      <SelectItem key={a.id} value={a.id!.toString()}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {filterAttributeOptions.length > 0 && (
                <Select value={selectedOptionId} onValueChange={setSelectedOptionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Filter Option" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterAttributeOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id!.toString()}>
                        {o.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {segments.length > 0 && (
                <Select value={selectedSegmentId} onValueChange={setSelectedSegmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map((s) => (
                      <SelectItem key={s.id} value={s.id!.toString()}>
                        {s.segment_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-4">
              {/* Provider Selection */}
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
                        placeholder="Search providers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                        autoFocus
                      />
                    </div>

                    {/* Filtered provider list */}
                    {providers.filter((provider) =>
                      `${provider.first_name} ${provider.last_name || ''}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    ).length > 0 ? (
                      <Virtuoso
                        style={{ height: '200px', width: '100%' }}
                        totalCount={
                          providers.filter((provider) =>
                            `${provider.first_name} ${provider.last_name || ''}`
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          ).length
                        }
                        itemContent={(index) => {
                          const filteredProviders = providers.filter((provider) =>
                            `${provider.first_name} ${provider.last_name || ''}`
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          );
                          const provider = filteredProviders[index];
                          return (
                            <SelectItem key={provider.id} value={provider.id?.toString() ?? ''}>
                              {provider.first_name} {provider.last_name || ''}
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

              {/* Ratecard Selection */}
              <div className="space-y-2 w-full">
                <label className="text-sm font-medium text-gray-700">Select Ratecard</label>

                {/* Custom Dropdown Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsRateCardDropdownOpen(!isRateCardDropdownOpen)}
                    className="flex items-center justify-between w-full p-2 bg-white border border-gray-300 rounded"
                  >
                    {selectedRatecardName || 'Select Ratecard'}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isRateCardDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-hidden">
                      {/* Search Input */}
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 border-b border-gray-300 focus:outline-none"
                      />

                      {/* Virtualized Rate Cards List */}
                      <Virtuoso
                        style={{ height: '240px', width: '100%' }}
                        totalCount={filteredRateCards.length}
                        itemContent={(index) => {
                          const rateCard = filteredRateCards[index];
                          return (
                            <div
                              key={rateCard.id}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setSelectedRatecardId(rateCard.id.toString());
                                setSelectedRatecardName(
                                  `${rateCard.category?.name || ''} | ${rateCard.subcategory?.name || ''} | ${rateCard.price}`
                                );
                                setIsRateCardDropdownOpen(false);
                              }}
                            >
                              <div className="text-sm font-medium">
                                {rateCard.category?.name} | {rateCard.subcategory?.name} |{' '}
                                {rateCard.price}
                              </div>
                              <div className="text-xs text-gray-500">
                                {rateCard.attributes
                                  ?.map(
                                    (attr: any) =>
                                      `${attr.filterAttribute?.name}: ${attr.filterOption?.value || ''}`
                                  )
                                  .join(', ') || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-400 italic">
                                {rateCard.provider?.first_name}
                              </div>
                            </div>
                          );
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Input
                value={pincode}
                placeholder="Pincode"
                onChange={(e) => setPincode(e.target.value)}
              />
              <Input
                value={latitude}
                placeholder="Latitude"
                onChange={(e) => setLatitude(e.target.value)}
              />
              <Input
                value={longitude}
                placeholder="Longitude"
                onChange={(e) => setLongitude(e.target.value)}
              />
              <Input
                value={screenRedirect}
                placeholder="Screen Redirect"
                onChange={(e) => setScreenRedirect(e.target.value)}
              />

              <div className="flex items-center justify-between">
                <label className="text-sm">Add to Cart</label>
                <Switch checked={addToCart} onCheckedChange={setAddToCart} />
              </div>

              {/* Status Switch */}
              <div className="flex items-center justify-between">
                <label className="text-sm">Active</label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'Save Campaign'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignForm;
