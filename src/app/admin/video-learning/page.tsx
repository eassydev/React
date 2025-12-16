'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from '@/components/ui/select';
import { Edit, Trash2, Plus, HelpCircle, Play, ChevronDown, ChevronUp, Video, Loader2 } from 'lucide-react';
import {
  fetchModuleVideos,
  deleteLearningVideo,
  fetchAllCategories,
  fetchSubCategoriesByCategoryId,
  Category,
  Subcategory,
} from '@/lib/api';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface ModuleVideo {
  id: string;
  category_id: string;
  subcategory_id: string;
  video_url: string;
  sequence_number: string;
  module: string;
  title: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

const VideoLearningList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [moduleVideos, setModuleVideos] = useState<ModuleVideo[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchAllCategories();
        setCategories(data);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load categories' });
      }
    };
    loadCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      const loadSubcategories = async () => {
        try {
          const data = await fetchSubCategoriesByCategoryId(selectedCategory);
          setSubcategories(data);
          setSelectedSubcategory('');
          setModuleVideos([]);
        } catch {
          setSubcategories([]);
        }
      };
      loadSubcategories();
    } else {
      setSubcategories([]);
      setSelectedSubcategory('');
      setModuleVideos([]);
    }
  }, [selectedCategory]);

  // Fetch module videos when category and subcategory are selected
  useEffect(() => {
    if (selectedCategory && selectedSubcategory) {
      fetchModuleVideosList();
    }
  }, [selectedCategory, selectedSubcategory]);

  const fetchModuleVideosList = async () => {
    setLoading(true);
    try {
      const response = await fetchModuleVideos(selectedCategory, selectedSubcategory);
      // Handle both success response with data and status: false response
      if (response.status === false || !response.data) {
        setModuleVideos([]);
      } else {
        setModuleVideos(response.data || []);
      }
    } catch (error) {
      // API returns 404 or error when no videos found - that's okay
      setModuleVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle module click to expand/collapse
  const handleModuleClick = (moduleId: string) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLearningVideo(id as any);
      toast({ variant: 'success', title: 'Success', description: 'Video deleted successfully' });
      fetchModuleVideosList();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete video' });
    }
  };

  // Group videos by module
  const groupedByModule = moduleVideos.reduce((acc, video) => {
    if (!acc[video.module]) {
      acc[video.module] = [];
    }
    acc[video.module].push(video);
    return acc;
  }, {} as Record<string, ModuleVideo[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Video Learning Management</h1>
          <Link href="/admin/video-learning/add">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          </Link>
        </div>

        {/* Category & Subcategory Selection */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Select Category & Subcategory</CardTitle>
            <CardDescription>Choose category and subcategory to view module videos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                <label className="text-sm font-medium">Subcategory</label>
                <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory} disabled={!selectedCategory}>
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
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Module Videos */}
        {!loading && selectedCategory && selectedSubcategory && (
          <div className="space-y-4">
            {Object.keys(groupedByModule).length === 0 ? (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="py-12 text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Videos Found</h3>
                  <p className="text-gray-500 mb-6">No videos found for this category and subcategory.</p>
                  <Link href={`/admin/video-learning/add?category_id=${selectedCategory}&subcategory_id=${selectedSubcategory}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Video
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedByModule).map(([moduleId, videos]) => (
                <Card key={moduleId} className="border-none shadow-lg overflow-hidden">
                  {/* Module Header (Clickable) */}
                  <div
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleModuleClick(moduleId)}
                  >
                    <div className="flex items-center gap-3">
                      <Video className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Module: {videos[0]?.title || moduleId}</h3>
                        <p className="text-sm text-gray-500">{videos.length} video(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {videos[0]?.is_active ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-600">Active</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-600">Inactive</span>
                      )}
                      {expandedModule === moduleId ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Module Videos */}
                  {expandedModule === moduleId && (
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {videos.map((video, index) => (
                          <Link
                            key={video.id}
                            href={`/admin/video-learning/module/${video.module}?category_id=${selectedCategory}&subcategory_id=${selectedSubcategory}`}
                            className="block"
                          >
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-200">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-500 w-8">{index + 1}.</span>
                                <div>
                                  <p className="font-medium text-gray-800">{video.title}</p>
                                  <p className="text-sm text-gray-500">Click to view all module videos</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <ChevronDown className="w-5 h-5 text-blue-600 rotate-[-90deg]" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {/* Initial State */}
        {!loading && (!selectedCategory || !selectedSubcategory) && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Select a category and subcategory to view module videos.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VideoLearningList;
