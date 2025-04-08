"use client";
import React, { useState, useEffect, FormEvent } from "react";
import dynamic from "next/dynamic";
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
import { Switch } from "@/components/ui/switch";
import { Save, FileText, Loader2, Type, Globe2 } from "lucide-react";
import {
  fetchAllCategories,
  fetchSubCategoriesByCategoryId,
  fetchProviders, fetchProviderById,
  fetchFilterOptionsByAttributeId,
  fetchFilterAttributes,
  createRateCard,
  Category,
  Subcategory,
  Attribute,
  ServiceSegment,
  Provider,
  ServiceDetail,
    createServiceDetail,
  fetchServiceSegments
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Virtuoso } from "react-virtuoso";
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

interface FilterAttributeOption {
  attributeId: string;
  optionId: string;
  options?: { id: string; value: string }[];
}

const ServiceAddForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filterAttributes, setFilterAttributes] = useState<Attribute[]>([]);
  const [filterAttributeOptions, setFilterAttributeOptions] = useState<
    FilterAttributeOption[]
  >([]);
   const [serviceDescriptions, setServiceDescriptions] = useState<
      { name: string; description: string }[]
    >([]);
  const [isActive, setIsActive] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [segments, setSegments] = useState<ServiceSegment[]>([]);
  const [segmentsId, setsegmentsId] = useState<string>("");

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
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      const loadSubcategories = async () => {
        try {
          const subcategoryData = await fetchSubCategoriesByCategoryId(selectedCategoryId);
          setSubcategories(subcategoryData);
          setSelectedSubcategoryId("");
        } catch (error) {
          setSubcategories([]);
          setSelectedSubcategoryId("");
        }
      };
      loadSubcategories();
    } else {
      setSubcategories([]);
      setSelectedSubcategoryId("");
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
    
    }
  }, [selectedCategoryId, selectedSubcategoryId]);


  const handleAddFilterAttributeOption = () => {
    setFilterAttributeOptions([
      ...filterAttributeOptions,
      { attributeId: "", optionId: "" },
    ]);
  };

  const handleRemoveFilterAttributeOption = (index: number) => {
    setFilterAttributeOptions((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };
  const handleUpdateFilterAttributeOption = async (
    index: number,
    key: "attributeId" | "optionId",
    value: string
  ) => {
    console.log("Updating attribute option");

    const updated = [...filterAttributeOptions];
    updated[index][key] = value;

    if (key === "attributeId") {
      try {
        const options = await fetchFilterOptionsByAttributeId(value);
        updated[index].options = options.map((option) => ({
          id: option.id!.toString(),
          value: option.value,
        }));
        const loadServiceDetails = async () => {
          try {
            const segmentData = await fetchServiceSegments(selectedCategoryId,
              selectedSubcategoryId ? selectedSubcategoryId : null,value);
            setSegments(segmentData);
          } catch (error) {
            setSegments([]);
          }
        };
        loadServiceDetails();
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
      const response = await createServiceDetail(serviceDetailsData);
      toast({
        variant: "success",
        title: "Success",
        description: response.message,
      });
     // router.push("/admin/description");
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Service detail Management</h1>
          <p className="text-gray-500">Create a new Service detail</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">New Service detail</CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below to create a new Service detail
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
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
              {/* Dynamic Filter Attribute Options */}
              {filterAttributes.length > 0 && (
                <div>
                  {filterAttributeOptions.map((pair, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <Select
                        value={pair.attributeId}
                        onValueChange={(value) =>
                          handleUpdateFilterAttributeOption(index, "attributeId", value)
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
                          handleUpdateFilterAttributeOption(index, "optionId", value)
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
              {segments.length > 0 && (
              <div className="space-y-2">
              <Select
                      value={segmentsId}
                      onValueChange={(value) =>
                        setsegmentsId(value)
                      }
                    >
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
                                    onChange={(value) =>
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

export default ServiceAddForm;
