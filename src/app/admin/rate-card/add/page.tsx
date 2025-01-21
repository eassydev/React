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
  fetchProviders,
  fetchFilterOptionsByAttributeId,
  fetchFilterAttributes,
  createRateCard,
  Category,
  Subcategory,
  Attribute,
  ServiceSegment,
  Provider,
  ServiceDetail,
  fetchServiceSegments
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Import React-Quill dynamically
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

const RateCardForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filterAttributes, setFilterAttributes] = useState<Attribute[]>([]);
  const [filterAttributeOptions, setFilterAttributeOptions] = useState<
    FilterAttributeOption[]
  >([]);
  const [rateCardName, setRateCardName] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [strikePrice, setStrikePrice] = useState("");
  const [strikePriceError, setStrikePriceError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [isRecommended, setIsRecommended] = useState(false);
  const [isBestDeal, setIsBestDeal] = useState(false);
  const [serviceDescriptions, setServiceDescriptions] = useState<ServiceDetail[]>([]);
  const [segments, setSegments] = useState<ServiceSegment[]>([]);
  const [segmentsId, setsegmentsId] = useState<string>("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await fetchAllCategories();
        setCategories(categoryData);
         const fetchedProviders = await fetchProviders();
              setProviders(fetchedProviders);
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

  // Fetch subcategories when a category is selected
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
      const loadServiceDetails = async () => {
        try {
          const segmentData = await fetchServiceSegments(selectedCategoryId,
            selectedSubcategoryId ? selectedSubcategoryId : null);
          setSegments(segmentData);
        } catch (error) {
          setSegments([]);
        }
      };
      loadServiceDetails();
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
      } catch (error) {
        console.error("Error fetching filter options:", error);
        updated[index].options = [];
      }
    }

    setFilterAttributeOptions(updated);
  };
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const rateCardData = {
      name: rateCardName,
      category_id: selectedCategoryId,
      subcategory_id: selectedSubcategoryId ? selectedSubcategoryId : null,
      attributes: filterAttributeOptions.map((pair) => ({
        attribute_id: pair.attributeId,
        option_id: pair.optionId,
      })),
      segment_id: segmentsId,
      price: parseFloat(price),
      strike_price:parseFloat(strikePrice),
      active: isActive,
      recommended: isRecommended,
      best_deal: isBestDeal,
      provider_id: selectedProviderId,
      serviceDescriptions: serviceDescriptions.map((desc) => ({
        title: desc.title,
        description: desc.description,
      })),
    };


    try {
      const response = await createRateCard(rateCardData);
      toast({
        variant: "success",
        title: "Success",
        description: response.message,
      });
    //  router.push("/admin/rate-card");
    } catch (error) {
      console.log("rateCardData",error)

      toast({
        variant: "error",
        title: "Error",
        description: `${error}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleAddServiceDescription = () => {
    setServiceDescriptions((prev) => [
      ...prev,
      { title: "", description: "" },
    ]);
  };

  const handleUpdateServiceDescription = (
    index: number,
    key: "title" | "description",
    value: string
  ) => {
    const updated = [...serviceDescriptions];
    updated[index][key] = value;
    setServiceDescriptions(updated);
  };

  
  const handleRemoveServiceDescription = (index: number) => {
    setServiceDescriptions((prev) => prev.filter((_, i) => i !== index));
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

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Discount Price</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter discount price"
                  value={strikePrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (parseFloat(value) < 0) {
                      setStrikePriceError('Price cannot be negative.');
                      setStrikePrice(value);
                    } else {
                      setStrikePriceError('');
                      setStrikePrice(value);
                    }
                  }}
                  className="h-11"
                  required
                />
                {priceError && <p className="text-red-500 text-sm">{priceError}</p>}
              </div>


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

{segments.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Service Descriptions</h3>
                {serviceDescriptions.map((service, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Segment Selector */}
                  

                    {/* Title Input */}
                    <Input
                      placeholder="Enter Title"
                      value={service.title}
                      onChange={(e) =>
                        handleUpdateServiceDescription(index, "title", e.target.value)
                      }
                      className="h-11"
                    />

                    {/* Description Input */}


                    <ReactQuill
                      value={service.description}
                      onChange={(value) =>
                        handleUpdateServiceDescription(index, "description", value)
                      }
                      theme="snow"
                      style={{ height: "200px" }}
                    />

                    {/* Remove Button */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveServiceDescription(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                {/* Add Service Description Button */}
                <Button type="button" onClick={handleAddServiceDescription}>
                  Add Service Description
                </Button>
              </div>
  )}


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

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Recommended</span>
                </label>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">No</span>
                  <Switch
                    checked={isRecommended}
                    onCheckedChange={setIsRecommended}
                    className="data-[state=checked]:bg-blue-500"
                  />
                  <span className="text-sm text-gray-600">Yes</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Best Deal</span>
                </label>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">No</span>
                  <Switch
                    checked={isBestDeal}
                    onCheckedChange={setIsBestDeal}
                    className="data-[state=checked]:bg-blue-500"
                  />
                  <span className="text-sm text-gray-600">Yes</span>
                </div>
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
