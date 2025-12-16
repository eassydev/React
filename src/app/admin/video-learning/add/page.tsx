'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from '@/components/ui/select';
import { Save, Loader2, Video } from 'lucide-react';
import {
  fetchAllCategories,
  fetchSubCategoriesByCategoryId,
  createLearningVideo,
  Category,
  Subcategory,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

const AddLearningVideo: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Get category_id and subcategory_id from URL params if present
  const urlCategoryId = searchParams.get('category_id') || '';
  const urlSubcategoryId = searchParams.get('subcategory_id') || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    category_id: urlCategoryId,
    subcategory_id: urlSubcategoryId,
    title: '',
    sequence_number: '1',
    module: '',
    is_active: true,
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchAllCategories();
        setCategories(data);

        // If URL has category_id, load subcategories for it
        if (urlCategoryId) {
          const subData = await fetchSubCategoriesByCategoryId(urlCategoryId);
          setSubcategories(subData);
        }
      } catch {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load categories.' });
      }
    };
    loadCategories();
  }, [toast]);

  useEffect(() => {
    if (formData.category_id) {
      const loadSubcategories = async () => {
        try {
          const data = await fetchSubCategoriesByCategoryId(formData.category_id);
          setSubcategories(data);
        } catch {
          setSubcategories([]);
        }
      };
      loadSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [formData.category_id]);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Title is required.' });
      return;
    }
    if (!formData.category_id) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a category.' });
      return;
    }
    if (!formData.subcategory_id) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a subcategory.' });
      return;
    }
    if (!videoFile) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a video file.' });
      return;
    }

    setIsSubmitting(true);

    try {
      await createLearningVideo(
        {
          category_id: formData.category_id,
          subcategory_id: formData.subcategory_id,
          title: formData.title,
          sequence_number: formData.sequence_number,
          module: formData.module,
          is_active: formData.is_active,
        },
        videoFile
      );
      toast({ variant: 'success', title: 'Success', description: 'Learning video created successfully.' });
      router.push('/admin/video-learning');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to create video.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-6 h-6" />
              Add Learning Video
            </CardTitle>
            <CardDescription>Create a new learning video with quiz questions</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter video title"
                />
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category *</label>
                  <Select value={formData.category_id} onValueChange={(val) => setFormData({ ...formData, category_id: val, subcategory_id: '' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id!.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subcategory *</label>
                  <Select value={formData.subcategory_id} onValueChange={(val) => setFormData({ ...formData, subcategory_id: val })} disabled={!formData.category_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id!.toString()}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Module & Sequence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Module *</label>
                  <Input
                    type="text"
                    value={formData.module}
                    onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                    placeholder="Enter module ID"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sequence Number *</label>
                  <Input
                    type="text"
                    value={formData.sequence_number}
                    onChange={(e) => setFormData({ ...formData, sequence_number: e.target.value })}
                    placeholder="Enter sequence number"
                  />
                </div>
              </div>

              {/* Video Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Video File *</label>
                <Input type="file" accept="video/*" onChange={handleVideoChange} />
                {videoPreview && (
                  <video src={videoPreview} controls className="mt-2 max-h-48 rounded" />
                )}
              </div>

              {/* Status */}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Active</label>
                <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
              </div>

              {/* Submit */}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Video
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddLearningVideo;

