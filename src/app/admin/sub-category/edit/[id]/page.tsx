"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, ImageIcon, Type, FileText, Loader2, Plus, Trash2, Globe2 } from 'lucide-react';
import { fetchSubcategoryById, fetchAllGstRates,updateSubcategory, Subcategory, Attribute, Category, fetchAllCategories } from '@/lib/api';
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

const SubcategoryEdit: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const subcategoryId = pathname?.split('/').pop();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [subcategoryImage, setSubcategoryImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [subcategoryName, setSubcategoryName] = useState<string>('');
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [sgst, setSgst] = useState<number | null>(null);
const [cgst, setCgst] = useState<number | null>(null);
  const [igstTax, setIgstTax] = useState<number | null>(null);
  const [sacCode, setSacCode] = useState<string>('');
  const [hstRates, setHstRates] = useState<any[]>([]);
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [metaKeyword, setMetaKeyword] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCategoriesList();
    if (subcategoryId) {
      fetchSubcategoryDetails(subcategoryId);
    }
  }, [subcategoryId, selectedCategoryId]);


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
  const fetchCategoriesList = async () => {
    try {
      const fetchedCategories = await fetchAllCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Error',
        description: 'Failed to load categories.',
      });
    }
  };
  const fetchSubcategoryDetails = async (id: string) => {
    try {
      const subcategoryData: Subcategory = await fetchSubcategoryById(id);
  
      // Ensure category_id is valid before converting to string
      if (subcategoryData.category_id !== undefined && subcategoryData.category_id !== null) {
        setSelectedCategoryId(subcategoryData.category_id.toString());
      }
  
      // Set all fields from API response
      setSubcategoryName(subcategoryData.name || '');
      setDescription(subcategoryData.description || '');
      setIsActive(subcategoryData.active || true);
      setAttributes(subcategoryData.filterattributes || []);
      setSgst(subcategoryData.sgst_tax || null);
      setCgst(subcategoryData.cgst_tax || null);
      setIgstTax(subcategoryData.igst_tax ?? null); // Set IGST tax field
      setSacCode(subcategoryData.sac_code || '');
      setMetaDescription(subcategoryData.meta_description || '');
      setMetaKeyword(subcategoryData.meta_keyword || '');
  
      // Handle image preview
      if (typeof subcategoryData.image === 'string' && subcategoryData.image) {
        setImagePreview(`/images/${subcategoryData.image}`);
      } else {
        setImagePreview(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to fetch subcategory: ${error}`,
        variant: "destructive",
      });
    }
  };
  
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubcategoryImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addAttribute = () => {
    setAttributes((prev) => [
      ...prev,
      { attribute_name: '', attribute_value: '', attribute_type: 'list' },
    ]);
  };

  const updateAttribute = (index: number, field: string, value: string) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index] = { ...updatedAttributes[index], [field]: value };
    setAttributes(updatedAttributes);
  };

  const removeAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const subcategoryData: Subcategory = {
      name: subcategoryName,
      description,
      image: subcategoryImage,
      category_id: parseInt(selectedCategoryId),
      active: isActive,
      filterattributes: attributes,
      cgst_tax:cgst,       // Add tax field
      sgst_tax:sgst, 
      igst_tax: igstTax, 
      sac_code: sacCode,
      meta_description: metaDescription,
      meta_keyword: metaKeyword,
    };

    try {
      await updateSubcategory(subcategoryId as string, subcategoryData);
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Subcategory updated successfully',
      });
      router.push('/admin/subcategory'); // Redirect after successful update
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Error',
        description: `${error}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Edit Subcategory</h1>
          <p className="text-gray-500">Update subcategory details</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">Edit Subcategory</CardTitle>
                <CardDescription className="text-gray-500">
                  Update the details below to modify the subcategory
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
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id?.toString() || ''}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              <div className="grid grid-cols-3 gap-4">
  {/* IGST Dropdown */}
  <div className="space-y-2">
    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
      <span>IGST (%)</span>
    </label>
    <Select
      value={igstTax?.toString() || ""}
      onValueChange={(value) => setIgstTax(parseInt(value))}
    >
      <SelectTrigger className="bg-white border-gray-200">
        <SelectValue placeholder="Select IGST" />
      </SelectTrigger>
      <SelectContent>
        {hstRates.map((rate) => (
          <SelectItem key={`igst-${rate.id}`} value={rate.IGST.toString()}>
            {rate.IGST}%
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  {/* SGST Dropdown */}
  <div className="space-y-2">
    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
      <span>SGST (%)</span>
    </label>
    <Select
      value={sgst?.toString() || ""}
      onValueChange={(value) => setSgst(parseInt(value))}
    >
      <SelectTrigger className="bg-white border-gray-200">
        <SelectValue placeholder="Select SGST" />
      </SelectTrigger>
      <SelectContent>
        {hstRates.map((rate) => (
          <SelectItem key={`sgst-${rate.id}`} value={rate.SGST.toString()}>
            {rate.SGST}%
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
 {/* CGST Dropdown */}
 <div className="space-y-2">
    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
      <span>CGST (%)</span>
    </label>
    <Select
      value={cgst?.toString() || ""}
      onValueChange={(value) => setCgst(parseInt(value))}
    >
      <SelectTrigger className="bg-white border-gray-200">
        <SelectValue placeholder="Select CGST" />
      </SelectTrigger>
      <SelectContent>
        {hstRates.map((rate) => (
          <SelectItem key={`cgst-${rate.id}`} value={rate.CGST.toString()}>
            {rate.CGST}%
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
</div>              {/* SAC Code Field */}
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
                  type="text"
                  placeholder="Enter meta description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Meta Keyword Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Meta Keyword</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter meta keyword"
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
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Service Attributes</span>
                </label>

                {attributes.map((attribute, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Select
                      value={attribute.attribute_type}
                      onValueChange={(value) => updateAttribute(index, 'attribute_type', value)}
                    >
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="list">List</SelectItem>
                        <SelectItem value="search">Search</SelectItem>
                        <SelectItem value="dropdown">Dropdown</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Attribute Name"
                      value={attribute.attribute_name}
                      onChange={(e) => updateAttribute(index, 'attribute_name', e.target.value)}
                    />
                    <Input
                      placeholder="Attribute Value"
                      value={attribute.attribute_value}
                      onChange={(e) => updateAttribute(index, 'attribute_value', e.target.value)}
                    />
                    <Button type="button" variant="ghost" onClick={() => removeAttribute(index)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addAttribute} className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Attribute
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="border-t border-gray-100 mt-6">
            <div className="flex space-x-3 pt-6">
              <Button className="w-100 flex-1 h-11 bg-primary" disabled={isSubmitting} onClick={onSubmit}>
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Update Subcategory</span>
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

export default SubcategoryEdit;
