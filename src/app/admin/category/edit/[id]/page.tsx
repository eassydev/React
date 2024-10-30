"use client";
import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, ImageIcon, Globe2, Type, FileInput, MapPin, Download, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import {
  fetchCategoryById, updateCategory, Category, Location, Attribute
} from '@/lib/api'; // Import interfaces and API functions
import * as XLSX from 'xlsx';
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

const CategoryEdit: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Extract the ID from the URL path
  const categoryId = pathname?.split('/').pop();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationInput, setLocationInput] = useState<string>('');
  const [locationType, setLocationType] = useState<string>('specific');
  const [locationMethod, setLocationMethod] = useState<string>('google');
  const [description, setDescription] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [categoryName, setCategoryName] = useState<string>('');
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [tax, setTax] = useState<number | null>(null);
  const [igstTax, setIgstTax] = useState<number | null>(null);
  const [sacCode, setSacCode] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (categoryId) {
      fetchCategoryDetails(categoryId);
    }
  }, [categoryId]);

  const fetchCategoryDetails = async (id: string) => {
    try {
      const categoryData: Category = await fetchCategoryById(id);

      // Set all fields from API response
      setCategoryName(categoryData.name || '');
      setDescription(categoryData.description || '');
      setIsActive(categoryData.active || true);
      setLocations(categoryData.locations || []);
      setAttributes(categoryData.filterattributes || []);
      setTax(categoryData.tax ?? null); // Set tax field
      setIgstTax(categoryData.igst_tax ?? null); // Set IGST tax field
      setSacCode(categoryData.sac_code || ''); // Set SAC code field

      // Handle image preview
      if (typeof categoryData.image === 'string' && categoryData.image) {
        setImagePreview(`/images/${categoryData.image}`);
      } else {
        setImagePreview(null);
      }
      setLocationMethod(categoryData.location_method || 'excel');
      setLocationType(categoryData.location_type || 'specific');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to fetch category: ${error}`,
        variant: "destructive",
      });
    }
  };
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCategoryImage(file);
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

  const handleLocationAdd = (e: FormEvent) => {
    e.preventDefault();
    if (locationInput) {
      const locationData: Location = {
        country: 'Unknown',
        state: 'Unknown',
        city: locationInput,
        postal_code: null,
        latitude: null,
        longitude: null,
        source_type: 'manual',
      };
      setLocations((prev) => [...prev, locationData]);
      setLocationInput('');
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const locationData = parsedData.slice(1).map((row: any) => ({
          country: row[0] || 'Unknown',
          state: row[1] || 'Unknown',
          city: row[2] || 'Unknown',
          postal_code: row[3] || null,
          latitude: row[4] || null,
          longitude: row[5] || null,
          source_type: 'sheet',
        }));
        setLocations((prev) => [...prev, ...locationData]);
      };
      reader.readAsBinaryString(file);
    }
  };

  const downloadSampleExcel = () => {
    const sampleData = `Country,State,City,Postal Code,Latitude,Longitude\n"USA","California","Los Angeles","90001",34.052235,-118.243683`;
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Sample_Locations.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const categoryData: Category = {
      name: categoryName,
      description,
      image: categoryImage,
      locations,
      location_type: locationType,
      active: isActive,
      filterattributes: attributes,
      location_method: locationMethod,
      tax,       // Add tax field
      igst_tax: igstTax, // Add IGST tax field
      sac_code: sacCode,
    };

    try {
      const catdata = await updateCategory(categoryId as string, categoryData);
      toast({
        variant: 'success',
        title: 'Success.',
        description: 'Category updated successfully',
      });
      router.push('/admin/category'); // Redirect after successful update
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Error.',
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
          <p className="text-gray-500">Update category details</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">Edit Category</CardTitle>
                <CardDescription className="text-gray-500">
                  Update the details below to modify the category
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Type className="w-4 h-4 text-blue-500" />
                  <span>Category Name</span>
                </label>
                <Input
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="h-11"
                  required
                />
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

              {/* Category Image Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <span>Category Image</span>
                </label>
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="h-11" />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Category Preview" className="h-32 w-32 object-cover rounded-md" />
                  </div>
                )}
              </div>

              {/* Tax Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Tax (%)</span>
                </label>
                <Select value={tax?.toString() || ''} onValueChange={(value) => setTax(parseInt(value))}>
                  <SelectTrigger className="bg-white border-gray-200 h-11">
                    <SelectValue placeholder="Select Tax %" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="18">18%</SelectItem>
                    <SelectItem value="24">24%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* IGST Tax Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>IGST Tax (%)</span>
                </label>
                <Select value={igstTax?.toString() || ''} onValueChange={(value) => setIgstTax(parseInt(value))}>
                  <SelectTrigger className="bg-white border-gray-200 h-11">
                    <SelectValue placeholder="Select IGST Tax %" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="18">18%</SelectItem>
                    <SelectItem value="24">24%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* SAC Code Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>SAC Code</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter SAC Code"
                  value={sacCode}
                  onChange={(e) => setSacCode(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Active/Inactive Switch */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Category Status</span>
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
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Globe2 className="w-4 h-4 text-blue-500" />
                  <span>Location Type</span>
                </label>
                <Select value={locationType} onValueChange={(value) => setLocationType(value)}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="penindia">Penindia</SelectItem>
                    <SelectItem value="specific">Specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {locationType === 'specific' && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>Location Method</span>
                  </label>
                  <Select value={locationMethod} onValueChange={(value) => setLocationMethod(value)}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google Places</SelectItem>
                      <SelectItem value="excel">Excel Import</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {locationType === 'specific' && locationMethod === 'google' && (
                <div className="space-y-4">
                  {/* Google Places Autocomplete */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span>Google Places Search</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="location-input"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        placeholder="Search for a location"
                        className="h-11"
                      />
                      <Button type="button" onClick={handleLocationAdd}>Add</Button>
                    </div>
                  </div>

                  {/* Display added locations */}
                  <div className="space-y-1">
                    {locations.map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                        <span className="text-sm text-gray-700">{`${location.city}, ${location.state}, ${location.country}`}</span>
                        <Button type="button" variant="ghost" onClick={() => setLocations(locations.filter((_, i) => i !== index))}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {locationType === 'specific' && locationMethod === 'excel' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <FileInput className="w-4 h-4 text-blue-500" />
                      <span>Import from Excel</span>
                    </label>
                    <Input type="file" accept=".xls, .xlsx, .csv" onChange={handleFileUpload} className="h-11" />
                  </div>

                  {/* Download Sample Excel */}
                  <Button type="button" variant="outline" onClick={downloadSampleExcel}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Sample Excel
                  </Button>
                </div>
              )}

              <Button className="w-100 flex-1 h-11 bg-primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Update Category</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryEdit;
