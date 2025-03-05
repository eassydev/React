"use client";
import React, { useState, useEffect, FormEvent } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from "next/navigation";
import {
  fetchAllHubs,
  fetchAllCities,
  fetchAllCategories,
  fetchSubCategoriesByCategoryId,
  fetchFilterAttributes,
  fetchFilterOptionsByAttributeId,
  fetchProviderById,
  fetchSpHubById,
  fetchProviders,
  Provider,
  updateSpHub,
  Category,
  Subcategory,
  Hub,
  City,
  Attribute,
  AttributeOption,
} from "@/lib/api";
import { Save, FileText, Loader2, Type, Globe2 } from 'lucide-react';
import { useDebounce } from "use-debounce";

const EditSpHubForm: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const spHubId = pathname?.split("/").pop();

  const [hubs, setHubs] = useState<Hub[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filterAttributes, setFilterAttributes] = useState<Attribute[]>([]);
  const [filterOptions, setFilterOptions] = useState<AttributeOption[]>([]);

  const [selectedHubId, setSelectedHubId] = useState<string>("");
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [selectedFilterAttributeId, setSelectedFilterAttributeId] = useState<string>("");
  const [selectedFilterOptionId, setSelectedFilterOptionId] = useState<string>("");
  const [staff, setStaff] = useState<string>("0");
  const [weightage, setWeightage] = useState<string>("0");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
// Provider-related state
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [hubData, cityData, categoryData] = await Promise.all([
          fetchAllHubs(),
          fetchAllCities(),
          fetchAllCategories(),
        ]);
        setHubs(hubData.data);
        setCities(cityData.data);
        setCategories(categoryData);

        if (spHubId) {
          const spHub = await fetchSpHubById(spHubId);
          setSelectedHubId(spHub.hub_id.toString());
          setSelectedCityId(spHub.city_id.toString());
          setSelectedCategoryId(spHub.category_id?.toString() || "");
          setSelectedSubcategoryId(spHub.subcategory_id?.toString() || "");
          setSelectedFilterAttributeId(spHub.filter_attribute_id?.toString() || "");
          setSelectedProviderId(spHub.provider_id?.toString() || "");

          setSelectedFilterOptionId(spHub.filter_option_id?.toString() || "");
          setStaff(spHub.staff.toString());
          setWeightage(spHub.weightage.toString());
          setIsActive(spHub.is_active);
        }
      } catch (error) {
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to load initial data.",
        });
      }
    };

    loadInitialData();
  }, [spHubId, toast]);

  useEffect(() => {
    if (selectedCategoryId) {
      const loadSubcategories = async () => {
        try {
          const subcategoryData = await fetchSubCategoriesByCategoryId(selectedCategoryId);
          setSubcategories(subcategoryData);
        } catch (error) {
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
    }
  }, [selectedCategoryId, selectedSubcategoryId]);


  
  
    useEffect(() => {
      const loadSelectedProvider = async () => {
        if (selectedProviderId) {
          try {
            const provider = await fetchProviderById(selectedProviderId);
            if (provider && provider.id) {
              // Convert provider.id to string
              setSelectedProvider({
                ...provider,
                id: provider.id.toString(),
              });
            } else {
              setSelectedProvider(null);
            }
          } catch (error) {
            console.error("Failed to load selected provider:", error);
          }
        } else {
          setSelectedProvider(null);
        }
      };
    
      loadSelectedProvider();
    }, [selectedProviderId]);

    
      // ------------------------------
      // 2. Fetch Providers (Search + Pagination)
      // ------------------------------
      useEffect(() => {
        const loadProviders = async () => {
          setIsLoadingProviders(true);
      
          try {
            // 1. Fetch providers from API
           // After fetching providers
    const fetchedProviders = await fetchProviders(debouncedSearch, page, 10);
    
    // Convert each provider's id to string
    const normalizedProviders = fetchedProviders.map((p) => ({
      ...p,
      id: p.id?.toString(),
    }));
    
    // Now merge with existing providers
    let combinedProviders =
      page === 1 ? normalizedProviders : [...providers, ...normalizedProviders];
    
    // If we have a selectedProvider, ensure it's included
    if (
      selectedProvider &&
      !combinedProviders.some((p) => p.id === selectedProvider.id)
    ) {
      combinedProviders.unshift(selectedProvider);
    }
    
    // Remove duplicates
    const uniqueProviders = combinedProviders.reduce<Provider[]>((acc, current) => {
      if (!acc.some((p) => p.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    setProviders(uniqueProviders);
            setHasMore(fetchedProviders.length === 10); // If we got 10, likely more pages exist
          } catch (error) {
            console.error("Failed to load providers:", error);
          } finally {
            setIsLoadingProviders(false);
          }
        };
      
        loadProviders();
      }, [debouncedSearch, page, selectedProvider]);
  useEffect(() => {
    if (selectedFilterAttributeId) {
      const loadFilterOptions = async () => {
        try {
          const optionData = await fetchFilterOptionsByAttributeId(selectedFilterAttributeId);
          setFilterOptions(optionData);
        } catch (error) {
          setFilterOptions([]);
        }
      };
      loadFilterOptions();
    } else {
      setFilterOptions([]);
    }
  }, [selectedFilterAttributeId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const spHubData = {
      hub_id: selectedHubId,
      city_id: selectedCityId,
      category_id: selectedCategoryId ? selectedCategoryId : undefined,
      subcategory_id: selectedSubcategoryId ? selectedSubcategoryId : undefined,
      filter_attribute_id: selectedFilterAttributeId ? selectedFilterAttributeId : undefined,
      filter_option_id: selectedFilterOptionId ? selectedFilterOptionId: undefined,
      staff: parseInt(staff),
      weightage: parseFloat(weightage),
      is_active: isActive,
      provider_id: selectedProviderId,
    };

    try {
      await updateSpHub(spHubId!, spHubData);
      toast({
        variant: "success",
        title: "Success",
        description: "SpHub updated successfully.",
      });
      router.push("/admin/sp-hubs");
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: `${error}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Edit SpHub</CardTitle>
          <CardDescription>Update the details of the selected SpHub.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Hub Selector */}
            <div>
              <label className="text-sm font-medium text-gray-700">Hub</label>
              <Select
                value={selectedHubId}
                onValueChange={(value) => setSelectedHubId(value)}
              >
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Select a hub" />
                </SelectTrigger>
                <SelectContent>
                  {hubs.map((hub) => (
                    <SelectItem key={hub.id} value={hub.id!.toString()}>
                      {hub.hub_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City Selector */}
            <div>
              <label className="text-sm font-medium text-gray-700">City</label>
              <Select
                value={selectedCityId}
                onValueChange={(value) => setSelectedCityId(value)}
              >
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id!.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Select
                value={selectedCategoryId}
                onValueChange={(value) => setSelectedCategoryId(value)}
              >
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id!.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory Selector */}
            {subcategories.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subcategory</label>
                <Select
                  value={selectedSubcategoryId}
                  onValueChange={(value) => setSelectedSubcategoryId(value)}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id!.toString()}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filter Attribute Selector */}
            {filterAttributes.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Filter Attribute</label>
                <Select
                  value={selectedFilterAttributeId}
                  onValueChange={(value) => setSelectedFilterAttributeId(value)}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select a filter attribute" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterAttributes.map((attribute) => (
                      <SelectItem key={attribute.id} value={attribute.id!.toString()}>
                        {attribute.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filter Option Selector */}
            {filterOptions.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Filter Option</label>
                <Select
                  value={selectedFilterOptionId}
                  onValueChange={(value) => setSelectedFilterOptionId(value)}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select a filter option" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id!.toString()}>
                        {option.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Staff Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Staff</label>
              <Input
                type="number"
                placeholder="Enter staff count"
                value={staff}
                onChange={(e) => setStaff(e.target.value)}
                className="h-11"
                required
              />
            </div>

            {/* Weightage Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Weightage</label>
              <Input
                type="number"
                placeholder="Enter weightage"
                value={weightage}
                onChange={(e) => setWeightage(e.target.value)}
                className="h-11"
                required
              />
            </div>

 {/* Provider (with Search & Pagination) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Provider</label>
                <Select value={selectedProviderId?.toString()} onValueChange={(value) => setSelectedProviderId(value)}>
                <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Search Input */}
                    <div className="p-2">
                      <Input
                        placeholder="Search provider..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPage(1);
                        }}
                        className="h-11"
                      />
                    </div>

                    {/* Provider List */}
                    {providers.length > 0 ? (
                      providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id ?? ''}>
                          {provider.first_name} {provider.last_name || ""}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center">No providers found</div>
                    )}

                    {/* Load More */}
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
              </div>
            {/* Active Status Switch */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
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

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </span>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditSpHubForm;

                 
