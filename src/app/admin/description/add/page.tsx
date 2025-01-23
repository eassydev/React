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
import { Save, Loader2 } from "lucide-react";
import {
  fetchAllCategories,
  fetchSubCategoriesByCategoryId,
  fetchFilterAttributes,
  fetchFilterOptionsByAttributeId,
  fetchServiceSegments,
  Category,
  Subcategory,
  Attribute,
  ServiceSegment,
  createServiceDetail,
  AttributeOption,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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

const ServiceDescriptionForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filterAttributes, setFilterAttributes] = useState<Attribute[]>([]);
  const [filterAttributeOptions, setFilterAttributeOptions] = useState<AttributeOption[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [filterAttributesId, setFilterAttributesId] = useState<string>("");
  const [filterAttributeOptionsId, setFilterAttributeOptionsId] = useState<string>("");
  const [segments, setSegments] = useState<ServiceSegment[]>([]);
  const [segmentsId, setSegmentsId] = useState<string>("");
  const [serviceDescriptions, setServiceDescriptions] = useState<
    { name: string; description: string }[]
  >([]);

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
    const loadAttributesAndSegments = async () => {
      try {
        const attributeData = await fetchFilterAttributes(
          selectedCategoryId,
          selectedSubcategoryId || null
        );
        setFilterAttributes(attributeData);

        const segmentData = await fetchServiceSegments(
          selectedCategoryId,
          selectedSubcategoryId || null
        );
        setSegments(segmentData);
      } catch {
        setFilterAttributes([]);
        setSegments([]);
      }
    };
    if (selectedCategoryId || selectedSubcategoryId) loadAttributesAndSegments();
  }, [selectedCategoryId, selectedSubcategoryId]);

  const handleFilterAttributeChange = async (attributeId: string) => {
    try {
      setFilterAttributesId(attributeId);
      const options = await fetchFilterOptionsByAttributeId(attributeId);
      setFilterAttributeOptions(options);
    } catch {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to load filter options.",
      });
    }
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
    //setIsSubmitting(true);

    const serviceDetailsData = {
      category_id: selectedCategoryId,
      subcategory_id: selectedSubcategoryId || '',
      filter_attribute_id: filterAttributesId || '',
      filter_option_id: filterAttributeOptionsId || '',
      segment_id: segmentsId || '',
      serviceDescriptions: serviceDescriptions.map((desc) => ({
        name: desc.name.toString(),
        description: desc.description.toString(),
      })),
    };
      const response = await createServiceDetail(serviceDetailsData);

    
    try {
      console.log("Submitted Data:", serviceDetailsData); // Replace with actual API call
      toast({
        variant: "success",
        title: "Success",
        description: response.message,
      });
      //router.push("/admin/service-details"); // Navigate to the desired page
    } catch (error) {
      setIsSubmitting(false);

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
          <CardTitle>Service Description Management</CardTitle>
          <CardDescription>Create a new service description</CardDescription>
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

              {filterAttributes.length > 0 && (
                <Select value={filterAttributesId} onValueChange={handleFilterAttributeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Filter Attribute" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterAttributes.map((attr) => (
                      <SelectItem key={attr.id} value={attr.id!.toString()}>
                        {attr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {filterAttributeOptions.length > 0 && (
                <Select
                  value={filterAttributeOptionsId}
                  onValueChange={(value) => setFilterAttributeOptionsId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Filter Attribute Option" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterAttributeOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id!.toString()}>
                        {opt.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {segments.length > 0 && (
                <Select value={segmentsId} onValueChange={setSegmentsId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id!.toString()}>
                        {segment.segment_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

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

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin mr-2" />
                    Saving...
                  </div>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceDescriptionForm;
