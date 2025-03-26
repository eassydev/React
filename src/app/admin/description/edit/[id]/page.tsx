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
  fetchServiceDetailById,
  fetchAllCategories,
  fetchSubCategoriesByCategoryId,
  fetchFilterAttributes,
  fetchFilterOptionsByAttributeId,
  fetchServiceSegments,
  updateServiceDetail,
  Category,
  Subcategory,
  Attribute,
  ServiceSegment,
  AttributeOption,
  ServiceDetail,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";

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

const EditServiceDescriptionForm: React.FC = () => {
  const { id } = useParams(); // Assuming FAQ ID is passed via route params
  const { toast } = useToast();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filterAttributes, setFilterAttributes] = useState<Attribute[]>([]);
  const [filterAttributeOptions, setFilterAttributeOptions] = useState<AttributeOption[]>([]);
  const [segments, setSegments] = useState<ServiceSegment[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [filterAttributesId, setFilterAttributesId] = useState<string>("");
  const [filterAttributeOptionsId, setFilterAttributeOptionsId] = useState<string>("");
  const [segmentsId, setSegmentsId] = useState<string>("");
  const [serviceDescriptions, setServiceDescriptions] = useState<
    { id?: string; name: string; description: string }[]
  >([]);
    const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    const loadServiceDetail = async () => {
      try {
        const serviceDetail = await fetchServiceDetailById(id.toString());
        setSelectedSubcategoryId(serviceDetail.subcategory_id ?? "");
        setFilterAttributesId(serviceDetail.filter_attribute_id ?? "");
        setFilterAttributeOptionsId(serviceDetail.filter_option_id?.toString() ?? "");
        setSegmentsId(serviceDetail.segment_id ?? "");
        setServiceDescriptions(serviceDetail.serviceDescriptions || []);
        setIsActive(serviceDetail.active || false);

        if (serviceDetail.category_id) {
          const categoryData = await fetchAllCategories();
                 setCategories(categoryData);
                 setSelectedCategoryId(serviceDetail.category_id);

          const subcategories = await fetchSubCategoriesByCategoryId(serviceDetail.category_id);
          setSubcategories(subcategories);
        }

        if (serviceDetail.subcategory_id || serviceDetail.category_id) {
          const attributes = await fetchFilterAttributes(
            serviceDetail.category_id,
            serviceDetail.subcategory_id ?? null
          );
          setFilterAttributes(attributes);
        }

        if (serviceDetail.filter_attribute_id) {
          const options = await fetchFilterOptionsByAttributeId(serviceDetail.filter_attribute_id);
          setFilterAttributeOptions(options);
        }

        if (serviceDetail.category_id || serviceDetail.subcategory_id) {
          const segments = await fetchServiceSegments(
            serviceDetail.category_id,
            serviceDetail.subcategory_id ?? null
          );
          setSegments(segments);
        }
      } catch(e:any) {
        console.log("e",e)
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to load service detail.",
        });
      }
    };

    loadServiceDetail();
  }, [id, toast]);

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
    const loadSubcategories = async () => {
      if (selectedCategoryId) {
        try {
          const subcategories = await fetchSubCategoriesByCategoryId(selectedCategoryId);
          setSubcategories(subcategories);
        } catch {
          setSubcategories([]);
        }
      }
    };
    loadSubcategories();
  }, [selectedCategoryId]);

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
    setIsSubmitting(true);

    const serviceDetailsData = {
      category_id: selectedCategoryId,
      subcategory_id: selectedSubcategoryId || "",
      filter_attribute_id: filterAttributesId || "",
      filter_option_id: filterAttributeOptionsId || "",
      segment_id: segmentsId || "",
      serviceDescriptions: serviceDescriptions.map((desc) => ({
        name: desc.name.toString(),
        description: desc.description.toString(),
      })),
      active:isActive
    };

    try {
      const response = await updateServiceDetail(id.toString(), serviceDetailsData);
      toast({
        variant: "success",
        title: "Success",
        description: response.message,
      });
     // router.push("/admin/service-details");
    } catch(e) {
      console.log("e",e)
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to update service detail.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Service Description</CardTitle>
          <CardDescription>Update the service description details below.</CardDescription>
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
                    Updating...
                  </div>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditServiceDescriptionForm;
