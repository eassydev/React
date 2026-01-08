'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2, ImageIcon } from 'lucide-react';
import { getCategoryPackageById, updateCategoryPackage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CategoryPackage {
  id: string;
  name: string;
  description?: string;
  image?: string;
  package_type: 'regular' | 'amc';
  is_active: number;
}

const EditCategoryPackage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [packageType, setPackageType] = useState<'regular' | 'amc'>('regular');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [existingImage, setExistingImage] = useState<string>('');

  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      fetchCategoryPackage();
    }
  }, [id]);

  const fetchCategoryPackage = async () => {
    setLoading(true);
    try {
      const data = await getCategoryPackageById(id);
      setName(data.name);
      setDescription(data.description || '');
      setPackageType(data.package_type);
      setIsActive(data.is_active === 1);
      setExistingImage(data.image || '');
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to fetch category package',
      });
      router.push('/admin/category-package');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!name || !packageType) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Please fill all required fields',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: any = {
        name,
        description,
        package_type: packageType,
        is_active: isActive,
      };

      if (imageFile) {
        updateData.image = imageFile;
      }

      await updateCategoryPackage(id, updateData);

      toast({
        variant: 'success',
        title: 'Success',
        description: 'Category package updated successfully',
      });

      router.push('/admin/category-package');
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to update category package',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Category Package</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-xl text-gray-800">Category Package Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter category package name"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  rows={4}
                />
              </div>

              {/* Package Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Package Type <span className="text-red-500">*</span>
                </label>
                <Select value={packageType} onValueChange={(value: 'regular' | 'amc') => setPackageType(value)}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select package type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="amc">AMC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Image</label>
                <div className="space-y-4">
                  {/* Current Image */}
                  {existingImage && !imagePreview && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Current Image:</p>
                      <img
                        src={existingImage}
                        alt="Current"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}

                  {/* New Image Preview */}
                  {imagePreview && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">New Image Preview:</p>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}

                  {/* File Input */}
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {imagePreview || existingImage ? 'Change Image' : 'Upload Image'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">Active Status</label>
                  <p className="text-xs text-gray-500">Enable or disable this category package</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </CardContent>

            <div className="flex justify-end space-x-4 p-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Category Package
                  </>
                )}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryPackage;

