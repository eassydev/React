"use client";
import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, ImageIcon, Globe2, Type, FileInput, MapPin, Download, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import { createCategory,fetchAllGstRates, Category, Location, Attribute } from '@/lib/api'; // Import the API function
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

// Function to dynamically load Google Maps script
const loadGoogleMapsScript = (apiKey: string) => {
  return new Promise((resolve) => {
    const existingScript = document.getElementById('google-maps-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.id = 'google-maps-script';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      document.body.appendChild(script);
    } else {
      resolve(null);
    }
  });
};

const CategoryForm: React.FC = () => {
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
  const [igst, setIgst] = useState<number | null>(null);
  const [sgst, setSgst] = useState<number | null>(null);
  const [cgst, setCgst] = useState<number | null>(null);
  const [hstRates, setHstRates] = useState<any[]>([]);
  const [sacCode, setSacCode] = useState<string>('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { toast } = useToast();

  const GOOGLE_API_KEY = 'AIzaSyBF5yQZqdjWa3PKx7RO3cOZeoQLeTB0rDk';

  useEffect(() => {
    if (locationMethod === 'google') {
      loadGoogleMapsScript(GOOGLE_API_KEY).then(initializeAutocomplete);
    }
  }, [locationMethod]);


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
  const initializeAutocomplete = () => {
    if (typeof window !== 'undefined' && window.google) {
      const inputElement = document.getElementById('location-input') as HTMLInputElement;
      if (inputElement) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputElement, {
          types: ['geocode'],
        });
        autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
      }
    }
  };

  const handleDropdownChange = (value: string, setter: (value: number) => void) => {
    setter(parseFloat(value));
  };
  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place) {
      console.log(place,"place")
      const locationData: Location = {
        country: getAddressComponent(place, 'country'),
        state: getAddressComponent(place, 'administrative_area_level_1'),
        city: getAddressComponent(place, 'locality'),
        postal_code: getAddressComponent(place, 'postal_code'),
        latitude: place.geometry?.location?.lat() || null,
        longitude: place.geometry?.location?.lng() || null,
        source_type: 'api',
      };
      setLocations((prev) => [...prev, locationData]);
      setLocationInput('');
    }
  };

  const getAddressComponent = (place: google.maps.places.PlaceResult, type: string) => {
    const component = place.address_components?.find((comp) => comp.types.includes(type));
    return component ? component.long_name : '';
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
        source_type: 'sheet',
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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const categoryData = {
      name: categoryName,
      description,
      image: categoryImage,
      locations,
      location_type: locationType,
      active: isActive,
      filterattributes: attributes,
      location_method: locationMethod,
      igst_tax: igst,
      sgst_tax: sgst,
      cgst_tax: cgst,
      sac_code: sacCode, // Holds SAC code as before
    };

    try {
      const catdata = await createCategory(categoryData);
      toast({
        variant: 'success',
        title: 'Success.',
        description: catdata.message,
      });
      setIsSubmitting(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-500">Create categories</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">New Category</CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below to create a new category
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

              {/* Location Type Selector */}
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

              {/* Location Method Selector */}
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

              {/* Conditional Location Input */}
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

              {/* Excel Upload for Locations */}
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
                    <span>Save Category</span>
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

export default CategoryForm;
