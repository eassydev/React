'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, Save, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { fetchAllCategories, createQuickService, fetchFirstQuickService } from '@/lib/api';

const QuickSelectionPage: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);

  const { toast } = useToast();

  // Fetch categories and initial Quick Service data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch categories
        const fetchedCategories = await fetchAllCategories();
        setCategories(fetchedCategories || []);

        // Fetch first Quick Service entry
        const quickService = await fetchFirstQuickService();
        if (quickService) {
          // Parse category_ids and populate state
          const parsedCategories =
            typeof quickService.category_ids === 'string'
              ? JSON.parse(quickService.category_ids)
              : Array.isArray(quickService.category_ids)
                ? quickService.category_ids
                : [];

          setSelectedCategories(parsedCategories);

          setIsActive(quickService.active || true);

          if (quickService.image) {
            setImagePreview(`${quickService.image}`);
          }
        }
      } catch (error) {}
    };

    fetchInitialData();
  }, []);

  // Handle image upload
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle category selection
  const handleCategorySelection = (categoryId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCategories((prev) => [...prev, categoryId]);
    } else {
      setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
    }
  };

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!image && !imagePreview) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'An image is required.',
      });
      setIsSubmitting(false);
      return;
    }

    if (selectedCategories.length === 0) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'At least one category must be selected.',
      });
      setIsSubmitting(false);
      return;
    }

    const payload = {
      image,
      category_ids: selectedCategories,
      active: isActive,
    };

    try {
      await createQuickService(payload);
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Quick service saved successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to save quick service.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Home Quick Services</h1>
          <p className="text-gray-500">Add or edit quick services with categories</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <CardTitle className="text-xl text-gray-800">New Quick Service</CardTitle>
            <CardDescription className="text-gray-500">
              Fill in the details below to create or edit a quick service
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Image Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Image</label>
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 h-32 w-32 object-cover rounded-md"
                  />
                )}
              </div>

              {/* Categories Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Categories</label>
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center justify-between w-full p-2 bg-white border border-gray-200 rounded"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  >
                    {selectedCategories.length > 0
                      ? `Selected (${selectedCategories.length})`
                      : 'Select categories'}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isCategoryDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-auto">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center p-2">
                          <Checkbox
                            checked={selectedCategories.includes(category.id.toString())}
                            onCheckedChange={(checked) =>
                              handleCategorySelection(category.id.toString(), checked as boolean)
                            }
                          />
                          <span className="ml-2">{category.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-sm text-gray-700">Active</span>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Quick Service'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuickSelectionPage;
