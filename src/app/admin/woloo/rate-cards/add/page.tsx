'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { fetchWolooCategories, fetchWolooSubcategories, createWolooRateCard, WolooCategory, WolooSubcategory } from '@/lib/api';



interface RateCardFormData {
  name: string;
  category_id: string;
  subcategory_id: string;
  segment_id: string;
  user_id: string;
  price: string;
  strike_price: string;
  weight: string;
  recommended: boolean;
  best_deal: boolean;
  active: boolean;
}

const AddWolooRateCard: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<WolooCategory[]>([]);
  const [subcategories, setSubcategories] = useState<WolooSubcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<WolooSubcategory[]>([]);

  const [formData, setFormData] = useState<RateCardFormData>({
    name: '',
    category_id: '',
    subcategory_id: 'none',
    segment_id: '',
    user_id: '',
    price: '',
    strike_price: '',
    weight: '0',
    recommended: false,
    best_deal: false,
    active: true,
  });

  // Fetch categories and subcategories
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting to fetch data...');

        // Use the existing API functions from lib/api.tsx
        const [categoriesData, subcategoriesData] = await Promise.all([
          fetchWolooCategories(1, 1000, '1', ''),
          fetchWolooSubcategories(1, 1000, '1', '', '')
        ]);

        console.log('API responses received:', {
          categoriesData,
          subcategoriesData
        });

        // Extract data arrays from responses
        const categories = categoriesData?.data || [];
        const subcategories = subcategoriesData?.data || [];

        console.log('Extracted data:', {
          categories: categories.length,
          subcategories: subcategories.length
        });

        setCategories(categories);
        setSubcategories(subcategories);

        console.log('Categories structure:', categories.map((c: WolooCategory) => ({
          id: c.id,
          name: c.name
        })));
        console.log('Subcategories structure:', subcategories.map((s: WolooSubcategory) => ({
          id: s.id,
          name: s.name,
          category_id: s.category_id
        })));

        if (categories.length === 0) {
          console.warn('No categories loaded');
        }
        if (subcategories.length === 0) {
          console.warn('No subcategories loaded');
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load categories, subcategories, or providers. Please check if the backend server is running.',
          variant: 'destructive',
        });
      }
    };

    fetchData();
  }, [toast]);

  // Filter subcategories based on selected category (exact same logic as attributes page)
  useEffect(() => {
    if (formData.category_id) {
      // Try both encrypted and decrypted ID matching
      const filtered = subcategories.filter(sub => {
        // Check if subcategory's category_id matches the selected category's encrypted ID
        if (sub.category_id === formData.category_id) {
          return true;
        }

        // Also check if subcategory's category_id matches the selected category's decrypted ID
        const selectedCategory = categories.find(cat => cat.id === formData.category_id);
        if (selectedCategory && sub.category_id == (selectedCategory as any).sampleid) {
          return true;
        }

        return false;
      });

      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.category_id, subcategories, categories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleCategoryChange = (value: string) => {
    console.log('Category changed to:', value);
    setFormData(prev => ({
      ...prev,
      category_id: value,
      subcategory_id: 'none', // Reset subcategory when category changes
    }));
  };

  const handleSubcategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      subcategory_id: value === 'none' ? '' : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Rate card name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.category_id || formData.category_id === '0') {
      toast({
        title: 'Validation Error',
        description: 'Please select a valid category',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Valid price is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Convert encrypted IDs back to raw database IDs for backend
      const selectedCategory = categories.find(cat => cat.id === formData.category_id);
      const selectedSubcategory = formData.subcategory_id && formData.subcategory_id !== 'none'
        ? subcategories.find(sub => sub.id === formData.subcategory_id)
        : null;

      const submitData = {
        name: formData.name.trim(),
        category_id: parseInt((selectedCategory as any)?.sampleid || formData.category_id),
        subcategory_id: selectedSubcategory ? parseInt((selectedSubcategory as any)?.sampleid) : null,
        segment_id: formData.segment_id ? parseInt(formData.segment_id) : null,
        user_id: formData.user_id ? parseInt(formData.user_id) : null,
        price: parseFloat(formData.price),
        strike_price: formData.strike_price ? parseFloat(formData.strike_price) : null,
        weight: parseInt(formData.weight) || 0,
        recommended: formData.recommended,
        best_deal: formData.best_deal,
        active: formData.active,
        // provider_id will default to 5032 at model level
      };

      // Additional validation to prevent sending invalid category_id
      if (!submitData.category_id || submitData.category_id === 0) {
        toast({
          title: 'Validation Error',
          description: 'Invalid category selected. Please select a valid category.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Submitting rate card data:', submitData);

      const response = await createWolooRateCard(submitData);

      if (response.status) {
        toast({
          title: 'Success',
          description: 'Rate card created successfully',
        });
        router.push('/admin/woloo/rate-cards');
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to create rate card',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating rate card:', error);
      toast({
        title: 'Error',
        description: 'Failed to create rate card. Please check if the backend server is running.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Link href="/admin/woloo/rate-cards">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add Woloo Rate Card</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rate Card Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter rate card name"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category_id">Category *</Label>
                <Select value={formData.category_id} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory */}
              <div className="space-y-2">
                <Label htmlFor="subcategory_id">Subcategory (Optional)</Label>
                <Select value={formData.subcategory_id} onValueChange={handleSubcategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Subcategory</SelectItem>
                    {filteredSubcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Segment ID */}
              <div className="space-y-2">
                <Label htmlFor="segment_id">Segment ID</Label>
                <Input
                  id="segment_id"
                  name="segment_id"
                  type="number"
                  value={formData.segment_id}
                  onChange={handleInputChange}
                  placeholder="Enter segment ID"
                />
              </div>

              {/* User ID field removed - provider_id defaults to 5032 in model */}

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  required
                />
              </div>

              {/* Strike Price */}
              <div className="space-y-2">
                <Label htmlFor="strike_price">Strike Price</Label>
                <Input
                  id="strike_price"
                  name="strike_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.strike_price}
                  onChange={handleInputChange}
                  placeholder="Enter strike price"
                />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  min="0"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="Enter weight"
                />
              </div>
            </div>

            {/* Switches */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="recommended"
                  checked={formData.recommended}
                  onCheckedChange={(checked) => handleSwitchChange('recommended', checked)}
                />
                <Label htmlFor="recommended">Recommended</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="best_deal"
                  checked={formData.best_deal}
                  onCheckedChange={(checked) => handleSwitchChange('best_deal', checked)}
                />
                <Label htmlFor="best_deal">Best Deal</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleSwitchChange('active', checked)}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
              <Link href="/admin/woloo/rate-cards">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create Rate Card'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddWolooRateCard;
