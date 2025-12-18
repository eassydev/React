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
  fetchLearningVideoById,
  updateLearningVideo,
  Category,
  Subcategory,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';

const EditLearningVideo: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const videoId = pathname.split('/').pop() || '';

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');

  const [formData, setFormData] = useState<{
    category_id: string;
    subcategory_id: string;
    title: string;
    sequence_number: string | number;
    module:  string | number;
    is_active: boolean;
  }>({
    category_id: '',
    subcategory_id: '',
    title: '',
    sequence_number: 1,
    module: 1,
    is_active: true,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, videoData] = await Promise.all([
          fetchAllCategories(),
          fetchLearningVideoById(videoId),
        ]);
        setCategories(categoriesData);
        
        const video = videoData.data;
        setFormData({
          category_id: video.category_id?.toString() || '',
          subcategory_id: video.subcategory_id?.toString() || '',
          title: video.title || '',
          sequence_number: video.sequence_number || 1,
          module: video.module || 1,
          is_active: video.is_active ?? true,
        });
        setCurrentVideoUrl(video.video_url || '');

        if (video.category_id) {
          const subData = await fetchSubCategoriesByCategoryId(video.category_id.toString());
          setSubcategories(subData);
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load video data.' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [videoId, toast]);

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
    }
  }, [formData.category_id]);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Title is required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateLearningVideo(
        videoId,
        {
          category_id: formData.category_id,
          subcategory_id: formData.subcategory_id,
          title: formData.title,
          sequence_number: formData.sequence_number,
          module: formData.module,
          is_active: formData.is_active,
        },
        videoFile || undefined
      );
      toast({ variant: 'success', title: 'Success', description: 'Video updated successfully.' });
      router.push('/admin/video-learning');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-6 h-6" />
              Edit Learning Video
            </CardTitle>
            <CardDescription>Update video details</CardDescription>
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
                  <Select value={formData.subcategory_id} onValueChange={(val) => setFormData({ ...formData, subcategory_id: val })}>
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
                    readOnly
                    value={formData.module}
                    onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                    placeholder="Enter module ID"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sequence Number *</label>
                  <Input
                    type="text"
                    readOnly
                    value={formData.sequence_number}
                    onChange={(e) => setFormData({ ...formData, sequence_number: e.target.value })}
                    placeholder="Enter sequence number"
                  />
                </div>
              </div>

              {/* Current Video */}
              {currentVideoUrl && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Current Video</label>
                  <video src={currentVideoUrl} controls className="max-h-48 rounded" />
                </div>
              )}

              {/* Video Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Replace Video (optional)</label>
                <Input type="file" accept="video/*" onChange={handleVideoChange} />
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Video
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

export default EditLearningVideo;

