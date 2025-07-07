'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createWolooAttribute,
  WolooAttribute,
  fetchWolooCategories,
  fetchWolooSubcategories,
  WolooCategory,
  WolooSubcategory,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface AttributeOption {
  name: string;
  price_modifier: number;
  weight: number;
  active: boolean;
}

const AddWolooAttribute = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<WolooCategory[]>([]);
  const [subcategories, setSubcategories] = useState<WolooSubcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<WolooSubcategory[]>([]);
  const [formData, setFormData] = useState<WolooAttribute>({
    name: '',
    category_id: '',
    subcategory_id: 'none',
    type: 'single',
    required: false,
    weight: 0,
    active: true,
    provider_id: '5032', // Default provider
  });
  const [options, setOptions] = useState<AttributeOption[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch categories and subcategories
        const [categoriesResponse, subcategoriesResponse] = await Promise.all([
          fetchWolooCategories(1, 1000, 'all', ''),
          fetchWolooSubcategories(1, 1000, 'all', ''),
        ]);

        setCategories(categoriesResponse.data);
        setSubcategories(subcategoriesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch categories and subcategories.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filter subcategories based on selected category
  useEffect(() => {
    if (formData.category_id) {
      // Try both encrypted and decrypted ID matching
      const filtered = subcategories.filter((sub: WolooSubcategory) => {
        // Check if subcategory's category_id matches the selected category's encrypted ID
        if (sub.category_id === formData.category_id) {
          return true;
        }

        // Also check if subcategory's category_id matches the selected category's decrypted ID
        const selectedCategory = categories.find(
          (cat: WolooCategory) => cat.id === formData.category_id
        );
        if (selectedCategory && sub.category_id == selectedCategory.sampleid) {
          return true;
        }

        return false;
      });

      console.log('Filtering subcategories:', {
        selectedCategoryId: formData.category_id,
        allSubcategories: subcategories.map((s) => ({
          id: s.id,
          name: s.name,
          category_id: s.category_id,
        })),
        filteredSubcategories: filtered.map((s) => ({
          id: s.id,
          name: s.name,
          category_id: s.category_id,
        })),
      });

      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.category_id, subcategories, categories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'weight' ? parseInt(value) || 0 : value,
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
    }));

    // Don't clear options when changing type - both types can have options
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category_id: value,
      subcategory_id: 'none', // Reset subcategory when category changes
    }));
  };

  const handleSubcategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      subcategory_id: value === 'none' ? '' : value,
    }));
  };

  const handleSwitchChange = (field: string) => (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const addOption = () => {
    setOptions((prev) => [...prev, { name: '', price_modifier: 0, weight: 0, active: true }]);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, field: string, value: string | boolean | number) => {
    setOptions((prev) =>
      prev.map((option, i) => (i === index ? { ...option, [field]: value } : option))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Attribute name is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.category_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select a category.',
        variant: 'destructive',
      });
      return;
    }

    // Validate option names if options are provided
    if (options.length > 0 && options.some((option) => !option.name.trim())) {
      toast({
        title: 'Validation Error',
        description: 'All option names are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare data with options (both single and multiple types can have options)
      const attributeData = {
        ...formData,
        options: options.length > 0 ? options : undefined,
      };

      await createWolooAttribute(attributeData);
      toast({
        title: 'Success',
        description: 'Woloo attribute created successfully.',
      });
      router.push('/admin/woloo/attributes');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create attribute.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showOptions = true; // Both single and multiple types can have options

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Link href="/admin/woloo/attributes">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Add Woloo Attribute</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading categories and subcategories...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Link href="/admin/woloo/attributes">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add Woloo Attribute</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attribute Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Attribute Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter attribute name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">Category *</Label>
                <Select value={formData.category_id} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id || ''}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="subcategory_id">Subcategory (Optional)</Label>
                <Select value={formData.subcategory_id} onValueChange={handleSubcategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Subcategory</SelectItem>
                    {filteredSubcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id || 'none'}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Attribute Type *</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select attribute type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Selection (Choose One Option)</SelectItem>
                    <SelectItem value="multiple">
                      Multiple Selection (Choose Multiple Options)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (Display Order)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="Enter weight (0 = first)"
                min="0"
              />
              <p className="text-sm text-gray-500">
                Lower numbers appear first. Use 0 for highest priority.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={formData.required}
                  onCheckedChange={handleSwitchChange('required')}
                />
                <Label htmlFor="required">Required Field</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={handleSwitchChange('active')}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>

            {showOptions && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Attribute Options</Label>
                    <Button type="button" onClick={addOption} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>
                        Type:{' '}
                        {formData.type === 'single' ? 'Single Selection' : 'Multiple Selection'}
                      </strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {formData.type === 'single'
                        ? 'Users can select only ONE option from the list (like radio buttons or dropdown)'
                        : 'Users can select MULTIPLE options from the list (like checkboxes)'}
                    </p>
                  </div>
                </div>

                {options.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No options added yet. Click "Add Option" to create options for this attribute.
                  </p>
                )}

                {options.map((option, index) => (
                  <div key={index} className="p-4 border rounded-md space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-sm">Option Name *</Label>
                        <Input
                          value={option.name}
                          onChange={(e) => updateOption(index, 'name', e.target.value)}
                          placeholder="Enter option name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Price Modifier</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={option.price_modifier}
                          onChange={(e) =>
                            updateOption(index, 'price_modifier', parseFloat(e.target.value) || 0)
                          }
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div className="space-y-1">
                        <Label className="text-sm">Weight</Label>
                        <Input
                          type="number"
                          value={option.weight}
                          onChange={(e) =>
                            updateOption(index, 'weight', parseInt(e.target.value) || 0)
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={option.active}
                          onCheckedChange={(checked) => updateOption(index, 'active', checked)}
                        />
                        <Label className="text-sm">Active</Label>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Link href="/admin/woloo/attributes">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Creating...' : 'Create Attribute'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddWolooAttribute;
