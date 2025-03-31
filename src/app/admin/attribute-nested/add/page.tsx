"use client";
import React, { useState, useEffect, FormEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  fetchAllCategories,
  fetchSubCategoriesByCategoryId,
  fetchFilterAttributes,
  fetchFilterOptionsByAttributeId,
  createNestedFilter,
  Category,
  Subcategory,
  Attribute,
  createServiceDetail,
  AttributeOption,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const AttributeNestedForm: React.FC = () => {
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  
  // For first level attribute (Brand)
  const [firstLevelAttributeId, setFirstLevelAttributeId] = useState<string>("");
  const [firstLevelOptions, setFirstLevelOptions] = useState<AttributeOption[]>([]);
  const [selectedFirstLevelOption, setSelectedFirstLevelOption] = useState<string>("");
  
  // For second level attribute (Model)
  const [secondLevelAttributeId, setSecondLevelAttributeId] = useState<string>("");
  const [secondLevelOptions, setSecondLevelOptions] = useState<AttributeOption[]>([]);
  const [selectedSecondLevelOptions, setSelectedSecondLevelOptions] = useState<string[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await fetchAllCategories();
        setCategories(categoryData);
      } catch {
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to load categories.",
        });
      }
    };
    loadCategories();
  }, [toast]);

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
    const loadAttributes = async () => {
      if (selectedCategoryId || selectedSubcategoryId) {
        try {
          const attributeData = await fetchFilterAttributes(
            selectedCategoryId,
            selectedSubcategoryId || null
          );
          setAttributes(attributeData);
        } catch {
          setAttributes([]);
        }
      }
    };
    loadAttributes();
  }, [selectedCategoryId, selectedSubcategoryId]);

  useEffect(() => {
    const loadFirstLevelOptions = async () => {
      if (firstLevelAttributeId) {
        try {
          const options = await fetchFilterOptionsByAttributeId(firstLevelAttributeId);
          setFirstLevelOptions(options);
          setSelectedFirstLevelOption(""); // Reset selection when attribute changes
        } catch {
          toast({
            variant: "error",
            title: "Error",
            description: "Failed to load options.",
          });
        }
      }
    };
    loadFirstLevelOptions();
  }, [firstLevelAttributeId, toast]);

 

  useEffect(() => {
    const loadSecondLevelOptions = async () => {
      if (secondLevelAttributeId) {
        try {
          const options = await fetchFilterOptionsByAttributeId(secondLevelAttributeId);
          setSecondLevelOptions(options);
          setSelectedSecondLevelOptions([]); // Reset selection when attribute changes
        } catch {
          toast({
            variant: "error",
            title: "Error",
            description: "Failed to load options.",
          });
        }
      }
    };
    loadSecondLevelOptions();
  }, [secondLevelAttributeId, toast]);

  const handleSecondLevelOptionChange = (optionId: string) => {
    setSelectedSecondLevelOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId) 
        : [...prev, optionId]
    );
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const serviceDetailsData = {
      category_id: selectedCategoryId,
      subcategory_id: selectedSubcategoryId || "",
      first_level_attribute_id: firstLevelAttributeId,
      first_level_option_id: selectedFirstLevelOption,
      second_level_attribute_id: secondLevelAttributeId,
      second_level_option_ids: selectedSecondLevelOptions,
    };

    console.log("serviceDetailsData",serviceDetailsData)

    try {
      const response = await createNestedFilter(serviceDetailsData);
      toast({
        variant: "success",
        title: "Success",
        description: response.message,
      });
    } catch {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to save service details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <Card>
        <CardHeader>
          <CardTitle>Attribute Relationship Management</CardTitle>
          <CardDescription>Create relationships between attributes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id!.toString()}>
                      {category.name}
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
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id!.toString()}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {attributes.length > 0 && (
                <Select value={firstLevelAttributeId} onValueChange={setFirstLevelAttributeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select First Level Attribute (e.g., Brand)" />
                  </SelectTrigger>
                  <SelectContent>
                    {attributes.map((attr) => (
                      <SelectItem key={attr.id} value={attr.id!.toString()}>
                        {attr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {firstLevelOptions.length > 0 && (
                <Select 
                  value={selectedFirstLevelOption} 
                  onValueChange={setSelectedFirstLevelOption}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {firstLevelOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id!.toString()}>
                        {option.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}


{attributes.length > 0 && (
                <Select value={secondLevelAttributeId} onValueChange={setSecondLevelAttributeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Second Level Attribute (e.g., Model)" />
                  </SelectTrigger>
                  <SelectContent>
                    {attributes.map((attr) => (
                      <SelectItem key={attr.id} value={attr.id!.toString()}>
                        {attr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {secondLevelAttributeId && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Select Models (Multiple)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {secondLevelOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`option-${option.id}`}
                          checked={selectedSecondLevelOptions.includes(option.id?.toString() || '')}
                          onChange={() => handleSecondLevelOptionChange(option.id?.toString() || '')}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor={`option-${option.id}`} className="text-sm">
                          {option.value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" disabled={isSubmitting || !selectedSecondLevelOptions.length}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin mr-2" />
                    Saving...
                  </div>
                ) : (
                  "Save Relationship"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttributeNestedForm;