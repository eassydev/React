"use client";
import React, { useState, useEffect, FormEvent } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { fetchAllHubs,Category,Subcategory,Hub,City,Attribute,AttributeOption, fetchAllCities, fetchAllCategories, fetchSubCategoriesByCategoryId, fetchFilterAttributes, fetchFilterOptionsByAttributeId, createSpHub } from "@/lib/api";
import { Save, FileText, Loader2, Type, Globe2 } from 'lucide-react';

const AddSpHubForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [hubs, setHubs] =useState<Hub[]>([]);
  const [cities, setCities] = useState<City[]>([]);;
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
  const [selectedFilterAttributesId, setSelectedFilterAttributesId] = useState<string>('');

  const [staff, setStaff] = useState<string>("0");
  const [weightage, setWeightage] = useState<string>("0");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch data for hubs, cities, and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [hubData, cityData, categoryData] = await Promise.all([
          fetchAllHubs(),
          fetchAllCities(),
          fetchAllCategories(),
        ]);
        setHubs(hubData.data);
        setCities(cityData.data);
        setCategories(categoryData);
      } catch (error) {
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to load initial data.",
        });
      }
    };
    loadData();
  }, []);

  // Fetch subcategories when a category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      const loadSubcategories = async () => {
        try {
          const subcategoryData = await fetchSubCategoriesByCategoryId(parseInt(selectedCategoryId));
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

  // Fetch filter attributes when a category or subcategory is selected
  useEffect(() => {
    if (selectedCategoryId || selectedSubcategoryId) {
      const loadFilterAttributes = async () => {
        try {
          const attributeData = await fetchFilterAttributes(
            parseInt(selectedCategoryId),
            selectedSubcategoryId ? parseInt(selectedSubcategoryId) : null
          );
          setFilterAttributes(attributeData);
        } catch (error) {
          setFilterAttributes([]);
        }
      };
      loadFilterAttributes();
    }
  }, [selectedCategoryId, selectedSubcategoryId]);

  // Fetch filter options when a filter attribute is selected
  useEffect(() => {
    if (selectedFilterAttributeId) {
      const loadFilterOptions = async () => {
        try {
          const optionData = await fetchFilterOptionsByAttributeId(parseInt(selectedFilterAttributeId));
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
      hub_id: parseInt(selectedHubId),
      city_id: parseInt(selectedCityId),
      category_id: selectedCategoryId ? parseInt(selectedCategoryId) : undefined,
      subcategory_id: selectedSubcategoryId ? parseInt(selectedSubcategoryId) : undefined,
      filter_attribute_id: selectedFilterAttributeId ? parseInt(selectedFilterAttributeId) : undefined,
      filter_option_id: selectedFilterOptionId ? parseInt(selectedFilterOptionId) : undefined,
      staff: parseInt(staff),
      weightage: parseFloat(weightage),
      is_active: isActive,
    };

    try {
      await createSpHub(spHubData);
      toast({
        variant: "success",
        title: "Success",
        description: "SpHub created successfully.",
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
          <CardTitle>Add New SpHub</CardTitle>
          <CardDescription>Fill in the details to add a new SpHub.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
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


<div>
  <label className="text-sm font-medium text-gray-700">Hub</label>
  <Select
    value={selectedCityId}
    onValueChange={(value) => setSelectedCityId(value)}
  >
    <SelectTrigger className="bg-white border-gray-200">
      <SelectValue placeholder="Select a hub" />
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
                          {/* Staff Field */}
<div className="space-y-2">
  <label className="text-sm font-medium text-gray-700">Staff</label>
  <Input
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
    placeholder="Enter weightage"
    value={weightage}
    onChange={(e) => setWeightage(e.target.value)}
    className="h-11"
    required
  />
</div>

{/* Active Status Field */}
<div className="space-y-2">
  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
    <span>Status</span>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddSpHubForm;
