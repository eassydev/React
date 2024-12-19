"use client";
import React, { useState, useEffect, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, FileText, Loader2, Type, Globe2 } from 'lucide-react';
import { fetchAllCategories, fetchSubCategoriesByCategoryId, fetchProviders, Provider, fetchFilterOptionsByAttributeId, fetchFilterAttributes, AttributeOption, createRateCard, Category, Subcategory, Attribute } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from 'next/navigation';

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

const RateCardForm: React.FC = () => {
    const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filterAttributes, setFilterAttributes] = useState<Attribute[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [selectedFilterAttributes, setSelectedFilterAttributes] = useState<string[]>([]);
  const [selectedFilterAttributesId, setSelectedFilterAttributesId] = useState<string>('');
  const [rateCardName, setRateCardName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<AttributeOption[]>([]);
  const [selectedFilterOptionId, setSelectedFilterOptionId] = useState<string>('');
  const [priceError, setPriceError] = useState<string>('');

  // Fetch categories on load
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await fetchAllCategories();
        setCategories(categoryData);
      } catch (error) {
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Failed to load categories.',
        });
      }
    };
    loadCategories();
  }, []);

  // Fetch subcategories and filter attributes when a category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      const loadSubcategoriesAndFilters = async () => {
        try {
          const subcategoryData = await fetchSubCategoriesByCategoryId(parseInt(selectedCategoryId));
          setSubcategories(subcategoryData);
          try {
            const filterAttributeData = await fetchFilterAttributes(parseInt(selectedCategoryId), null);
            setFilterAttributes(filterAttributeData);
          } catch (error) {
            setFilterAttributes([]);
          }
        } catch (error) {
          setSubcategories([]);
        }
      };
      loadSubcategoriesAndFilters();
    } else {
      setSubcategories([]);
      setFilterAttributes([]);
    }
  }, [selectedCategoryId]);


  useEffect(() => {
    if (selectedFilterAttributesId) {
      const loadFilterOptions = async () => {
        try {
          const options = await fetchFilterOptionsByAttributeId(parseInt(selectedFilterAttributesId));
          setFilterOptions(options);
        } catch (error) {
          setFilterOptions([]);
        }
      };
      loadFilterOptions();
    } else {
      setFilterOptions([]);
    }
  }, [selectedFilterAttributesId]);


  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providerData = await fetchProviders();
        console.log(providerData)
        setProviders(providerData);
      } catch (error) {
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Failed to load providers.',
        });
      }
    };
    loadProviders();
  }, []);

  // Fetch filter attributes when a subcategory is selected
  useEffect(() => {
    if (selectedSubcategoryId) {
      const loadFilterAttributes = async () => {
        try {
          const filterAttributeData = await fetchFilterAttributes(parseInt(selectedCategoryId), parseInt(selectedSubcategoryId));
          setFilterAttributes(filterAttributeData);
        } catch (error) {
          setFilterAttributes([]);
        }
      };
      loadFilterAttributes();
    }
  }, [selectedSubcategoryId, selectedCategoryId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const rateCardData = {
      name: rateCardName,
      description,
      category_id: parseInt(selectedCategoryId),
      subcategory_id: selectedSubcategoryId ? parseInt(selectedSubcategoryId) : null,
      filter_attribute_id: selectedFilterAttributesId ? parseInt(selectedFilterAttributesId) : null,
      filter_option_id: selectedFilterOptionId ? parseInt(selectedFilterOptionId) : null,
      price: parseFloat(price),
      active: isActive,
      provider_id: parseInt(selectedProviderId), // Add provider ID
    };

    try {
      const response = await createRateCard(rateCardData);
      toast({
        variant: 'success',
        title: 'Success',
        description: response.message,
      });
      
      setIsSubmitting(false);
      router.push('/admin/rate-card'); // Redirect after successful update

      //  resetForm(); // Reset form after submission
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Error',
        description: `${error}`,
      });
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRateCardName('');
    setSelectedCategoryId('');
    setSelectedSubcategoryId('');
    setSelectedFilterAttributes([]);
    setPrice('');
    setDescription('');
    setIsActive(true);
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

              {/* Filter Attribute Selector */}
              {filterAttributes.length > 0 && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Globe2 className="w-4 h-4 text-blue-500" />
                    <span>Select Filter Attributes</span>
                  </label>
                  <Select
                    value={selectedFilterAttributesId}
                    onValueChange={(value) => setSelectedFilterAttributesId(value)}
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
                        <SelectItem key={option.id} value={option.id!.toString()}>
                          {option.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              {/* Description Field with React-Quill */}
              <div className="space-y-2" style={{ height: "270px" }}>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-5 text-blue-500" />
                  <span>Description</span>
                </label>
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  theme="snow"
                  modules={quillModules}
                  style={{ height: "200px" }}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Globe2 className="w-4 h-4 text-blue-500" />
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
                      provider?.id && provider?.first_name ? (
                        <SelectItem key={provider.id} value={provider.id.toString()}>
                          {provider.first_name}
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
