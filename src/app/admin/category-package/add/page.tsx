'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCategoryPackage } from '@/lib/api';

const CategoryPackageAdd: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [categoryName, setCategoryName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [packageType, setPackageType] = useState<string>('regular');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [weight, setWeight] = useState<number>(0);
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Handle image upload
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCategoryImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!categoryName) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Please enter a category name.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // TODO: Replace with actual API call
      const formData = new FormData();
      formData.append('name', categoryName);
      formData.append('description', description);
      formData.append('package_type', packageType);
      formData.append('is_active', isActive ? '1' : '0');
      formData.append('weight', weight.toString());
      if (categoryImage) formData.append('image', categoryImage);
      await createCategoryPackage(formData);

      toast({
        variant: 'success',
        title: 'Success',
        description: 'Category package created successfully.',
      });

      // Redirect to list page
      router.push('/admin/category-package');
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to create category package.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Category Package Management</h1>
          <p className="text-gray-500">Create a new category package</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">New Category Package</CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below to create a new category package
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Category Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  placeholder="Enter category description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                  rows={4}
                />
              </div>

              {/* Weight Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Weight</label>
                <Input
                  type="number"
                  placeholder="Enter weight (default 0)"
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                  className="h-11"
                  min={0}
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
                    <img
                      src={imagePreview}
                      alt="Category Preview"
                      className="h-32 w-32 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>

              {/* Package Type Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Package Type <span className="text-red-500">*</span>
                </label>
                <Select value={packageType} onValueChange={setPackageType}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select package type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="amc">AMC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-gray-700">Active Status</label>
                  <p className="text-xs text-gray-500">
                    Enable or disable this category package
                  </p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/category-package')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Category Package
                    </>
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

export default CategoryPackageAdd;


