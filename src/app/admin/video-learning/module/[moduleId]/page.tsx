'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Edit, Trash2, Plus, HelpCircle, Play, ArrowLeft, Video, Loader2 } from 'lucide-react';
import { fetchModuleVideosById, deleteLearningVideo } from '@/lib/api';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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

const ModuleVideosPage = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const moduleId = pathname.split('/').pop() || '';
  const categoryId = searchParams.get('category_id') || '';
  const subcategoryId = searchParams.get('subcategory_id') || '';

  const [videos, setVideos] = useState<ModuleVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    if (!categoryId || !subcategoryId || !moduleId) return;
    
    setLoading(true);
    try {
      const response = await fetchModuleVideosById(categoryId, subcategoryId, moduleId);
      setVideos(response.data || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch videos' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [categoryId, subcategoryId, moduleId]);

  const handleDelete = async (id: string) => {
    try {
      await deleteLearningVideo(id);
      toast({ variant: 'success', title: 'Success', description: 'Video deleted successfully' });
      fetchVideos();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete video' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/video-learning">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Module Videos</h1>
              <p className="text-sm text-gray-500">Viewing all videos in this module</p>
            </div>
          </div>
          <Link href={`/admin/video-learning/add?category_id=${categoryId}&subcategory_id=${subcategoryId}`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Videos List */}
        {!loading && videos.length === 0 && (
          <Card className="border-dashed border-2">
            <CardContent className="py-12 text-center">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Videos Found</h3>
              <p className="text-gray-500">No videos found in this module.</p>
            </CardContent>
          </Card>
        )}

        {!loading && videos.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Videos ({videos.length})
              </CardTitle>
              <CardDescription>All videos in this module sorted by sequence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {videos.map((video, index) => (
                  <div key={video.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-blue-600 w-8">{index + 1}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{video.title}</p>
                        <a
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" /> Watch Video
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {video.is_active ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-600">Active</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-600">Inactive</span>
                      )}
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/video-learning/${video.id}/questions`}>
                          <HelpCircle className="w-4 h-4 text-purple-600" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/video-learning/edit/${video.id}`}>
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <h2 className="text-xl font-bold">Delete Video?</h2>
                            <p>Are you sure you want to delete: {video.title}?</p>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <Button variant="destructive" onClick={() => handleDelete(video.id)}>
                              Yes, Delete
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ModuleVideosPage;

