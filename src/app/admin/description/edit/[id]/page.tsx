"use client";
import React, { useState, useEffect, FormEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";

import { Switch } from "@/components/ui/switch";
import { Save, Loader2, Type, Globe2 } from "lucide-react";
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
  updateServiceDetail,
  fetchServiceDetailById,
  Provider,
  fetchServiceSegments,
  ServiceSegment,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from "next/navigation";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const quillModules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

// For dynamic attributes
interface FilterAttributeOption {
  attributeId: string;
  optionId: string;
  options?: { id: string; value: string }[];
}

const EditServiceDescriptionForm: React.FC = () => {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const seriviceid = pathname?.split("/").pop();

  // ------------------------------
  // Form State
  // ------------------------------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filterAttributes, setFilterAttributes] = useState<Attribute[]>([]);
  const [filterAttributeOptions, setFilterAttributeOptions] = useState<FilterAttributeOption[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [segments, setSegments] = useState<ServiceSegment[]>([]);
  const [segmentsId, setsegmentsId] = useState<string>("");
  const [serviceDescriptions, setServiceDescriptions] = useState<
      { name: string; description: string }[]
    >([]);
  // Provider-related state
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
 
  // ------------------------------
  // 1. Fetch Categories & RateCard for Edit
  // ------------------------------


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
        if (seriviceid) {
          const serviceDetail = await fetchServiceDetailById(seriviceid.toString());
          setSelectedCategoryId(serviceDetail.category_id?.toString() || "");
          setSelectedSubcategoryId(serviceDetail.subcategory_id?.toString() || "");
          setIsActive(serviceDetail.active);
          setsegmentsId(serviceDetail.segment_id?.toString() || "");
          setServiceDescriptions(serviceDetail.serviceDescriptions || []);

          // Fetch dynamic attributes if any
          if (serviceDetail.serviceAttributes && Array.isArray(serviceDetail.serviceAttributes)) {
            const dynamicAttributes = await Promise.all(
              serviceDetail.serviceAttributes.map(async (attr: any) => {
                try {
                  const options = await fetchFilterOptionsByAttributeId(attr.filter_attribute_id);
                  return {
                    attributeId: attr.filter_attribute_id.toString(),
                    optionId: attr.filter_option_id?.toString() || "",
                    options: options.map((o: any) => ({
                      id: o.id.toString(),
                      value: o.value,
                    })),
                  };
                } catch (error) {
                  console.error(`Error fetching options for attribute ${attr.filter_attribute_id}:`, error);
                  return {
                    attributeId: attr.filter_attribute_id.toString(),
                    optionId: attr.filter_option_id?.toString() || "",
                    options: [],
                  };
                }
              })
            );
            setFilterAttributeOptions(dynamicAttributes);
          }

          // Fetch subcategories
          if (serviceDetail.category_id) {
            await fetchSubcategories(serviceDetail.category_id.toString());
          }

          // Fetch filter attributes
          const subcategoryId = serviceDetail.subcategory_id !== null ? serviceDetail.subcategory_id : undefined;
          await fetchFilters(serviceDetail.category_id, subcategoryId);

          // Fetch segments if any
          if (serviceDetail.segment_id) {
            const segmentData = await fetchServiceSegments(
              serviceDetail.category_id,
              subcategoryId || null
            );
            setSegments(segmentData);
          }
        }
      } catch (error) {
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to load data.",
        });
      }
    };

    fetchData();
  }, [seriviceid, toast]);

  
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
            setSelectedSubcategoryId("");
          }
        } catch (error) {
          setSubcategories([]);
          // Only reset selectedSubcategoryId if there's an error and no subcategories are fetched
          setSelectedSubcategoryId("");
        }
      })();
    } else {
      setSubcategories([]);
      setSelectedSubcategoryId("");
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
    setFilterAttributeOptions((prev) => [
      ...prev,
      { attributeId: "", optionId: "" },
    ]);
  };

  const handleRemoveFilterAttributeOption = (index: number) => {
    setFilterAttributeOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateFilterAttributeOption = async (
    index: number,
    key: "attributeId" | "optionId",
    value: string
  ) => {
    const updated = [...filterAttributeOptions];
    updated[index][key] = value;

    if (key === "attributeId") {
      try {
        const options = await fetchFilterOptionsByAttributeId(value);
        updated[index].options = options.map((option) => ({
          id: option.id!.toString(),
          value: option.value,
        }));
      } catch (error) {
        console.error("Error fetching filter options:", error);
        updated[index].options = [];
      }
    }

    setFilterAttributeOptions(updated);
  };



  const handleAddServiceDescription = () => {
    setServiceDescriptions((prev) => [...prev, { name: "", description: "" }]);
  };

  const handleUpdateServiceDescription = (
    index: number,
    key: "name" | "description",
    value: string
  ) => {
    const updated = [...serviceDescriptions];
    updated[index][key] = value;
    setServiceDescriptions(updated);
  };

  const handleRemoveServiceDescription = (index: number) => {
    setServiceDescriptions((prev) => prev.filter((_, i) => i !== index));
  };
  // ------------------------------
  // Form Submit
  // ------------------------------
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const serviceDetailsData = {
      category_id: selectedCategoryId,
      subcategory_id: selectedSubcategoryId ? selectedSubcategoryId : '',
      serviceAttributes: filterAttributeOptions.map((pair) => ({
        attribute_id: pair.attributeId,
        option_id: pair.optionId,
      })),
      segment_id: segmentsId,
      active: isActive,
      serviceDescriptions: serviceDescriptions.map((desc) => ({
        name: desc.name.toString(),
        description: desc.description.toString(),
      })),
    };

    try {
      
      const response = await updateServiceDetail(seriviceid!.toString(), serviceDetailsData);
      toast({
        variant: "success",
        title: "Success",
        description: response.message,
      });

      // router.push("/admin/rate-card");
    } catch (error) {
      console.log("rateCardData", error);
      toast({
        variant: "error",
        title: "Error",
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
          <h1 className="text-3xl font-bold text-gray-900">Service detail Management</h1>
          <p className="text-gray-500">Create or Edit a Service detail</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">
                  {seriviceid ? "Edit Rate Card" : "New Rate Card"}
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below {seriviceid ? "to update" : "to create"} a Service detail
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Rate Card Name */}
             

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
                        category?.id && category?.name && (
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
            subcategory?.id && subcategory?.name && (
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
                        onValueChange={(value) => handleUpdateFilterAttributeOption(index, "attributeId", value)}
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
                        onValueChange={(value) => handleUpdateFilterAttributeOption(index, "optionId", value)}
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


<div className="flex items-center space-x-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-sm text-gray-700">Active</span>
              </div>
              <div>
                <Button type="button" onClick={handleAddServiceDescription}>
                  Add Service Description
                </Button>
                {serviceDescriptions.map((desc, index) => (
                  <div key={index} className="space-y-2">
                    <Input
                      value={desc.name}
                      placeholder="Title"
                      onChange={(e) =>
                        handleUpdateServiceDescription(index, "name", e.target.value)
                      }
                    />
                    <ReactQuill
                      value={desc.description}
                      onChange={(value:any) =>
                        handleUpdateServiceDescription(index, "description", value)
                      }
                      modules={quillModules}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleRemoveServiceDescription(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              {/* Active/Inactive Switch */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Service Detail Status</span>
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
                <Button className="w-100 flex-1 h-11 bg-primary" disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Save Service Details</span>
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

export default EditServiceDescriptionForm;
