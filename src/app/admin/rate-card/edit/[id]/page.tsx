"use client";
import React, { useState, useEffect, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, Type, Globe2 } from 'lucide-react';
import {
  fetchAllCategories,
  fetchSubCategoriesByCategoryId,
  fetchFilterAttributes,
  fetchRateCardById,
  updateRateCard,
  Category,
  Subcategory,
  Attribute,
  fetchProviders, Provider,
  fetchFilterOptionsByAttributeId,AttributeOption
} from '@/lib/api';
import { useToast } from "@/hooks/use-toast";

// Importing React-Quill dynamically
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Custom toolbar configuration for React-Quill
const quillModules = {
  toolbar: [
    [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
    [{ 'size': [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

const RateCardEditForm: React.FC = () => {
  const { id: rateCardId } = useParams(); // Get the rate card ID from the URL
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filterAttributes, setFilterAttributes] = useState<Attribute[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [selectedFilterAttributeId, setSelectedFilterAttributeId] = useState<string>('');
  const [rateCardName, setRateCardName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
const [selectedProviderId, setSelectedProviderId] = useState<string>('');
const [filterOptions, setFilterOptions] = useState<AttributeOption[]>([]);
const [selectedFilterOptionId, setSelectedFilterOptionId] = useState<string>('');
  // Fetch categories and rate card details once on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all categories
        const fetchedCategories = await fetchAllCategories();
        setCategories(fetchedCategories);
  
        // Fetch all providers
        const fetchedProviders = await fetchProviders();
        setProviders(fetchedProviders);
  
        // Fetch rate card details if the rateCardId exists
        if (rateCardId) {
          const rateCardData = await fetchRateCardById(rateCardId.toString());
  
          // Set initial values including category, subcategory, and provider
          setRateCardName(rateCardData.name);
          setDescription(rateCardData.description || '');
          setSelectedCategoryId(rateCardData.category_id?.toString() || '');
          setSelectedSubcategoryId(rateCardData.subcategory_id?.toString() || '');
          setSelectedFilterAttributeId(rateCardData.filter_attribute_id?.toString() || '');
          setSelectedFilterOptionId(rateCardData.filter_option_id?.toString() || '');
          setPrice(rateCardData.price?.toString() || '');
          setIsActive(rateCardData.active);
          setSelectedProviderId(rateCardData.provider_id?.toString() || ''); // Set initial provider
  
          // Fetch subcategories for the selected category
          if (rateCardData.category_id) {
            await fetchSubcategories(rateCardData.category_id.toString());
          }
  
          // Fetch filter attributes based on category or subcategory
          const subcategoryId = rateCardData.subcategory_id !== null ? rateCardData.subcategory_id : undefined;
          await fetchFilters(rateCardData.category_id, subcategoryId);
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
  }, [rateCardId]);
  
  useEffect(() => {
    if (selectedFilterAttributeId) {
      const loadFilterOptions = async () => {
        try {
          const options = await fetchFilterOptionsByAttributeId(parseInt(selectedFilterAttributeId));
          setFilterOptions(options);
        } catch (error) {
          setFilterOptions([]);
        }
      };
      loadFilterOptions();
    } else {
      setFilterOptions([]);
    }
  }, [selectedFilterAttributeId]);

  
  // Fetch subcategories when the selected category changes
  useEffect(() => {
    if (selectedCategoryId) {
      fetchSubcategories(selectedCategoryId);
      fetchFilters(parseInt(selectedCategoryId)); // Fetch filters based on category
      

    } else {
      setSubcategories([]); // Clear subcategories if no category selected
      setFilterAttributes([]); // Clear filters if no category selected
    }
  }, [selectedCategoryId]);

  // Fetch filter attributes when the subcategory changes
  useEffect(() => {
    if (selectedSubcategoryId) {
      fetchFilters(parseInt(selectedCategoryId), parseInt(selectedSubcategoryId)); // Fetch filters based on subcategory
    } else {
      fetchFilters(parseInt(selectedCategoryId)); // Fetch filters based on category only
    }
  }, [selectedSubcategoryId]);

  // Fetch subcategories based on selected category
  const fetchSubcategories = async (categoryId: string) => {
    try {
      const fetchedSubcategories = await fetchSubCategoriesByCategoryId(parseInt(categoryId));
      setSubcategories(fetchedSubcategories);
    } catch (error) {
      setSubcategories([]);
      setSelectedSubcategoryId('')
    }
  };

  // Fetch filters based on category or subcategory
  const fetchFilters = async (categoryId: number, subcategoryId?: number) => {
    try {
      const filters = await fetchFilterAttributes(categoryId, subcategoryId || null);
      setFilterAttributes(filters);
    } catch (error) {
      setFilterAttributes([]);
      setSelectedFilterAttributeId('')
    }
  };

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const rateCardData = {
      name: rateCardName,
      description,
      category_id: parseInt(selectedCategoryId),
      subcategory_id: selectedSubcategoryId ? parseInt(selectedSubcategoryId) : null,
      provider_id: selectedProviderId ? parseInt(selectedProviderId) : null,
      filter_attribute_id: selectedFilterAttributeId ? parseInt(selectedFilterAttributeId) : null,
      filter_option_id:selectedFilterOptionId ? parseInt(selectedFilterOptionId) : null, 
      price: parseFloat(price),
      active: isActive,
    };

    try {
      await updateRateCard(rateCardId.toString(), rateCardData);
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Rate Card updated successfully.',
      });
      setIsSubmitting(false);
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Error',
        description: 'Failed to update rate card.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Edit Rate Card</h1>
          <p className="text-gray-500">Modify the existing rate card details</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">Edit Rate Card</CardTitle>
                <CardDescription className="text-gray-500">
                  Update the fields below to modify the rate card
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
                  onValueChange={(value) => {
                    setSelectedCategoryId(value);
                    setSelectedSubcategoryId('')
                    setSelectedFilterAttributeId('');
                  }}                >
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
                    onValueChange={(value) => {
                      setSelectedSubcategoryId(value)
                      setSelectedFilterAttributeId('');
                    }}   
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

              {/* Filter Attribute Selector */}
              {filterAttributes.length > 0 && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Globe2 className="w-4 h-4 text-blue-500" />
                    <span>Select Filter Attributes</span>
                  </label>
                  <Select
                    value={selectedFilterAttributeId}
                    onValueChange={(value) => setSelectedFilterAttributeId(value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select filter attributes" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterAttributes.map((attribute) =>
                        attribute?.id && attribute?.name ? (
                          <SelectItem key={attribute.id} value={attribute.id.toString()}>
                            {attribute.name}
                          </SelectItem>
                        ) : null
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}



{filterOptions.length > 0 && (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700">Select Filter Option</label>
    <Select
      value={selectedFilterOptionId}
      onValueChange={(value) => setSelectedFilterOptionId(value)}
    >
      <SelectTrigger className="bg-white border-gray-200">
        <SelectValue placeholder="Select a filter option" />
      </SelectTrigger>
      <SelectContent>
        {filterOptions.map((option) => (
          <SelectItem key={option.id} value={option.id.toString()}>
            {option.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}
              {/* Description Field with React-Quill */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Description</span>
                </label>
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  theme="snow"
                  modules={quillModules}
                  style={{ height: '200px' }}
                />
              </div>

              {/* Price Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Price</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-11"
                  required
                />
              </div>


{/* Provider Selector */}
<div className="space-y-2">
  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
    <span>Select Provider</span>
  </label>
  <Select
    value={selectedProviderId}
    onValueChange={(value) => setSelectedProviderId(value)}
  >
    <SelectTrigger className="bg-white border-gray-200">
      <SelectValue placeholder="Select a provider" />
    </SelectTrigger>
    <SelectContent>
      {providers.map((provider) =>
        provider?.id ? (
          <SelectItem key={provider.id} value={provider.id.toString()}>
            {provider.first_name} {provider.last_name}
          </SelectItem>
        ) : null
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
                <Button className="w-100 flex-1 h-11 bg-primary" disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Update Rate Card</span>
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

export default RateCardEditForm;
