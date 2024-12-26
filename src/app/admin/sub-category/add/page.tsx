"use client";
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, ImageIcon, Type, FileText, Loader2, Plus, Trash2, Globe2 } from 'lucide-react';
import { createSubcategory, fetchAllGstRates, fetchAllCategories, Subcategory, Attribute, ServiceDetail, ExcludeImage, IncludeItem, Category } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

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

const SubcategoryForm: React.FC = () => {
    const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [subcategoryImage, setSubcategoryImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [subcategoryName, setSubcategoryName] = useState<string>('');
  const [igst, setIgst] = useState<number | null>(null);
  const [sgst, setSgst] = useState<number | null>(null);
  const [cgst, setCgst] = useState<number | null>(null);
  const [hstRates, setHstRates] = useState<any[]>([]);
  const [sacCode, setSacCode] = useState<string>('');
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [metaKeyword, setMetaKeyword] = useState<string>('');
  const { toast } = useToast();
  const [optionalHeading, setOptionalHeading] = useState<string>('');
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [serviceDetails, setServiceDetails] = useState<ServiceDetail[]>([]);
  const [showExcludeSection, setShowExcludeSection] = useState<boolean>(false);
  const [excludeHeading, setExcludeHeading] = useState<string>("");
  const [excludeDescription, setExcludeDescription] = useState<string>("");
  const [excludeItems, setExcludeItems] = useState<string[]>([]);
  const [excludeImages, setExcludeImages] = useState<File[]>([]);
  const [includeItems, setIncludeItems] = useState<IncludeItem[]>([]);
  const [showIncludeSection, setShowIncludeSection] = useState(false);
  const [serviceTime, setServiceTime] = useState<string>('');

  // Fetch categories for selection
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


  useEffect(() => {
    const fetchTaxRates = async () => {
      try {
        const rates = await fetchAllGstRates();
        setHstRates(rates);
      } catch (error) {
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to load tax rates.",
        });
      }
    };

    fetchTaxRates();
  }, []);
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubcategoryImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };


  // Add a new exclude item
  const addExcludeItem = () => {
    setExcludeItems((prev) => [...prev, ""]);
  };

  // Update an exclude item
  const updateExcludeItem = (index: number, value: string) => {
    const updatedItems = [...excludeItems];
    updatedItems[index] = value;
    setExcludeItems(updatedItems);
  };

  // Remove an exclude item
  const removeExcludeItem = (index: number) => {
    setExcludeItems((prev) => prev.filter((_, i) => i !== index));
  };



  const addIncludeItem = () => {
    setIncludeItems((prev) => [...prev, { title: "", description: "" }]);
  };

  // Update an include item
  const updateIncludeItem = (index: number, field: keyof IncludeItem, value: string) => {
    const updatedItems = [...includeItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setIncludeItems(updatedItems);
  };

  // Remove an include item
  const removeIncludeItem = (index: number) => {
    setIncludeItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExcludeImageUpload = (files: FileList | null) => {
    console.log("files", files); // Log incoming FileList
    if (files) {
      const uploadedImages = Array.from(files); // Convert FileList to an array of File objects
      setExcludeImages((prev) => [...prev, ...uploadedImages]); // Store raw File objects
    }
  };

  // Remove an image
  const removeImage = (index: number) => {
    setExcludeImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addAttribute = () => {
    setAttributes((prev) => [
      ...prev,
      {
        name: "",
        type: "list",
        options: [{ value: "" }], // Initialize options with a valid object
      },
    ]);
  };

  // Update attribute fields
  const updateAttribute = (index: number, field: string, value: string) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index] = { ...updatedAttributes[index], [field]: value };
    setAttributes(updatedAttributes);
  };

  const addOption = (attrIndex: number) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[attrIndex].options.push({
      value: "", // Initialize an empty value
    });
    setAttributes(updatedAttributes);
  };


  // Update an option for a specific attribute
  const updateOption = (attrIndex: number, optIndex: number, value: string) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[attrIndex].options[optIndex] = {
      ...updatedAttributes[attrIndex].options[optIndex], // Retain the existing `id`
      value, // Update only the value
    };
    setAttributes(updatedAttributes);
  };

  // Remove an option from a specific attribute
  const removeOption = (attrIndex: number, optIndex: number) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[attrIndex].options = updatedAttributes[attrIndex].options.filter(
      (_, i) => i !== optIndex
    );
    setAttributes(updatedAttributes);
  };

  // Remove an entire attribute
  const removeAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  // Add a new service detail
  const addServiceDetail = () => {
    setServiceDetails((prev) => [...prev, { title: "", description: "" }]);
  };

  // Update a service detail field
  const updateServiceDetail = (index: number, field: string, value: string) => {
    const updatedServiceDetails = [...serviceDetails];
    updatedServiceDetails[index] = { ...updatedServiceDetails[index], [field]: value };
    setServiceDetails(updatedServiceDetails);
  };

  // Remove a service detail
  const removeServiceDetail = (index: number) => {
    setServiceDetails((prev) => prev.filter((_, i) => i !== index));
  };
  const handleDropdownChange = (value: string, setter: (value: number) => void) => {
    setter(parseFloat(value));
  };
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Prepare exclude items
    const formattedExcludeItems = excludeItems.map((item) => ({
      item, // Wrap each item in an object with the `item` field
    }));

    // Prepare exclude images
    const formattedExcludeImages: ExcludeImage[] = excludeImages.map((file) => ({
      image_path: file, // Wrap each file in an object with the `image` property
    }));

    const subcategoryData: Subcategory = {
      name: subcategoryName,
      image: subcategoryImage,
      category_id: parseInt(selectedCategoryId),
      optional_heading: optionalHeading,
      exclude_heading: excludeHeading,
      exclude_description: excludeDescription,
      service_time: serviceTime,
      active: isActive,
      attributes: attributes,
      serviceDetails: serviceDetails,
      excludeItems: formattedExcludeItems, // Add exclude items
      includeItems: includeItems,
      excludedImages: formattedExcludeImages,
      igst_tax: igst,
      sgst_tax: sgst,
      cgst_tax: cgst,
      sac_code: sacCode,
      meta_description: metaDescription,
      meta_keyword: metaKeyword,
    };

    try {
      const response = await createSubcategory(subcategoryData);
      toast({
        variant: 'success',
        title: 'Success.',
        description: response.message,
      });
      setIsSubmitting(false);
      router.push('/admin/sub-category'); // Redirect after successful update

    } catch (error) {
      toast({
        variant: 'error',
        title: 'Error.',
        description: ` ${error}`,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Subcategory Management</h1>
          <p className="text-gray-500">Create subcategories</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">New Subcategory</CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below to create a new subcategory
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Subcategory Name Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Type className="w-4 h-4 text-blue-500" />
                  <span>Subcategory Name</span>
                </label>
                <Input
                  placeholder="Enter subcategory name"
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              {/* OPTIONAL Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Type className="w-4 h-4 text-blue-500" />
                  <span>Optional heading</span>
                </label>
                <Input
                  placeholder="Eg:- No of AC. service"
                  value={optionalHeading}
                  onChange={(e) => setOptionalHeading(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Type className="w-4 h-4 text-blue-500" />
                  <span>Service time</span>
                </label>
                <Input
                  placeholder="Eg:- 30 mint"
                  value={serviceTime}
                  onChange={(e) => setServiceTime(e.target.value)}
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


              {/* Subcategory Image Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <span>Subcategory Image</span>
                </label>
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="h-11" />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Subcategory Preview" className="h-32 w-32 object-cover rounded-md" />
                  </div>
                )}
              </div>

              {/* GST Dropdowns */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <span>IGST (%)</span>
                  </label>
                  <Select
                    value={igst?.toString() || ""}
                    onValueChange={(value) => handleDropdownChange(value, setIgst)}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select IGST" />
                    </SelectTrigger>
                    <SelectContent>
                      {hstRates.map((rate) =>
                        <SelectItem key={rate.id} value={rate.IGST.toString()}>
                          {rate.IGST}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>


                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <span>SGST (%)</span>
                  </label>
                  <Select
                    value={sgst?.toString() || ""}
                    onValueChange={(value) => handleDropdownChange(value, setSgst)}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select IGST" />
                    </SelectTrigger>
                    <SelectContent>
                      {hstRates.map((rate) =>
                        <SelectItem key={rate.id} value={rate.SGST.toString()}>
                          {rate.SGST}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>


                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <span>CGST (%)</span>
                  </label>
                  <Select
                    value={cgst?.toString() || ""}
                    onValueChange={(value) => handleDropdownChange(value, setCgst)}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select IGST" />
                    </SelectTrigger>
                    <SelectContent>
                      {hstRates.map((rate) =>
                        <SelectItem key={rate.id} value={rate.CGST.toString()}>
                          {rate.CGST}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {/* SAC Code Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>SAC Code</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter SAC code"
                  value={sacCode}
                  onChange={(e) => setSacCode(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Meta Description Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Meta Description</span>
                </label>
                <Input
                  placeholder="Enter meta description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Meta Keyword Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Meta Keywords</span>
                </label>
                <Input
                  placeholder="Enter meta keywords (comma-separated)"
                  value={metaKeyword}
                  onChange={(e) => setMetaKeyword(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Active/Inactive Switch */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Subcategory Status</span>
                </label>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Inactive</span>
                  <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-blue-500" />
                  <span className="text-sm text-gray-600">Active</span>
                </div>
              </div>

              {/* Attributes Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Attributes</h3>
                {attributes.map((attribute, attrIndex) => (
                  <div key={attrIndex} className="space-y-2 border p-4 rounded-md bg-gray-50">
                    {/* Attribute Name */}
                    <Input
                      placeholder="Attribute Name"
                      value={attribute.name}
                      onChange={(e) => updateAttribute(attrIndex, "name", e.target.value)}
                      className="h-10"
                    />

                    {/* Attribute Type */}
                    <Select
                      value={attribute.type}
                      onValueChange={(value) => updateAttribute(attrIndex, "type", value)}
                    >
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="list">List</SelectItem>
                        <SelectItem value="dropdown">Dropdown</SelectItem>
                        <SelectItem value="search">Search</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Options Management */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Options</h4>
                      {attribute.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2">
                          <Input
                            placeholder={`Option ${optIndex + 1}`}
                            value={option.value}
                            onChange={(e) => updateOption(attrIndex, optIndex, e.target.value)}
                            className="h-10 flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            className="p-2 text-red-500"
                            onClick={() => removeOption(attrIndex, optIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 flex items-center"
                        onClick={() => addOption(attrIndex)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    </div>

                    {/* Remove Attribute */}
                    <Button
                      type="button"
                      variant="ghost"
                      className="mt-4 flex items-center text-red-500"
                      onClick={() => removeAttribute(attrIndex)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Attribute
                    </Button>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addAttribute}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Attribute
                </Button>
              </div>

              {/* Service Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Service Details</h3>
                {serviceDetails.map((service, serviceIndex) => (
                  <div key={serviceIndex} className="space-y-2 border p-4 rounded-md bg-gray-50">
                    {/* Service Title */}
                    <Input
                      placeholder="Service Title"
                      value={service.title}
                      onChange={(e) => updateServiceDetail(serviceIndex, "title", e.target.value)}
                      className="h-10"
                    />

<div className="space-y-2" style={{ height: "250px" }}>
                    <ReactQuill
                   value={service.description}
                   onChange={(value) => updateServiceDetail(serviceIndex, "description", value)}
                  theme="snow"
                  style={{ height: "200px" }}
                />
                </div>
                    {/* Remove Service Detail */}
                    <Button
                      type="button"
                      variant="ghost"
                      className="mt-4 flex items-center text-red-500"
                      onClick={() => removeServiceDetail(serviceIndex)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Service Detail
                    </Button>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addServiceDetail}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service Detail
                </Button>
              </div>
              <div className="space-y-4">

                <Button type="button" onClick={() => setShowExcludeSection(!showExcludeSection)} className="mb-4">
                  {showExcludeSection ? "Hide Exclude Section" : "Show Exclude Section"}
                </Button>

                {showExcludeSection && (
                  <div className="space-y-6 border p-4 rounded-md bg-gray-50">
                    {/* Exclude Heading */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Exclude Heading</label>
                      <Input
                        placeholder="Enter heading"
                        value={excludeHeading}
                        onChange={(e) => setExcludeHeading(e.target.value)}
                      />
                    </div>

                    {/* Exclude Description */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Exclude Description</label>
                      <Input
                        placeholder="Enter description"
                        value={excludeDescription}
                        onChange={(e) => setExcludeDescription(e.target.value)}
                      />
                    </div>

                    {/* Multiple Image Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Upload Images</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleExcludeImageUpload(e.target.files)}
                      />
                      <div className="flex flex-wrap gap-4 mt-4">
                        {excludeImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Exclude Image ${index + 1}`}
                              className="w-24 h-24 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500"
                              onClick={() => removeImage(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Exclude Items */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Exclude Items</h3>
                      {excludeItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 bg-gray-100 p-2 rounded-md"
                        >
                          <Input
                            placeholder={`Item ${index + 1}`}
                            value={item}
                            onChange={(e) => updateExcludeItem(index, e.target.value)}
                            className="h-10 flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            className="p-2 text-red-500"
                            onClick={() => removeExcludeItem(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}

                      {/* Add Exclude Item Button */}
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center"
                        onClick={addExcludeItem}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Exclude Item
                      </Button>
                    </div>
                  </div>
                )}
              </div>



              <div className="space-y-4">

                <Button type="button" onClick={() => setShowIncludeSection((prev) => !prev)} className="mb-4">
                  {showExcludeSection ? "Hide Include Section" : "Show Include Section"}
                </Button>


                {/* Include Section */}
                {showIncludeSection && (
                  <div className="space-y-4 border p-4 rounded-md bg-gray-50">
                    <h3 className="text-lg font-semibold">Include Items</h3>

                    {includeItems.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <Input
                          placeholder="Title"
                          value={item.title}
                          onChange={(e) => updateIncludeItem(index, "title", e.target.value)}
                          className="h-10"
                        />
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateIncludeItem(index, "description", e.target.value)}
                          className="h-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="p-2 text-red-500"
                          onClick={() => removeIncludeItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    <Button type="button" onClick={addIncludeItem} variant="outline" className="mt-2 flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Add More
                    </Button>
                  </div>

                )}
              </div>

            </form>
          </CardContent>

          <CardFooter className="border-t border-gray-100 mt-6">
            <div className="flex space-x-3 pt-6">
              <Button className="w-100 flex-1 h-11 bg-primary" disabled={isSubmitting} onClick={onSubmit}>
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Subcategory</span>
                  </div>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SubcategoryForm;
