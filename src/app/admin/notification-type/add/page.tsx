'use client';

import React, { useState, FormEvent } from 'react';
import dynamic from 'next/dynamic';
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
import { Save, Loader2 } from 'lucide-react';
import { createNotificationType, NotificationType } from '@/lib/api'; // Import API and NotificationType
import { useRouter, usePathname } from 'next/navigation';

// Import React-Quill dynamically for client-side rendering
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Quill modules configuration
const quillModules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

const AddNotificationTypeForm: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [type, setType] = useState<'timer' | 'image' | 'carousel' | 'normal' | 'sound'>('normal');
  const [image_url, setImageUrl] = useState<File | string | null>(null);
  const [sound_url, setSoundUrl] = useState<File | string | null>(null);
  const [carousel_images, setCarouselImages] = useState<(File | { image_url: string })[]>([]);
  const [timer_duration, setTimerDuration] = useState<number | null>(null);
  const [action_type, setActionType] = useState<
    'internal_link' | 'external_link' | 'order_related' | 'promo'
  >('internal_link');
  const [action_data, setActionData] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const { toast } = useToast();

  // Handle image uploads
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageUrl(e.target.files[0]);
    }
  };

  const handleSoundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSoundUrl(e.target.files[0]);
    }
  };

  const handleCarouselImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCarouselImages(Array.from(e.target.files));
    }
  };

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title || !message || !type) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Title, message, and type are required.',
      });
      setIsSubmitting(false);
      return;
    }

    const newNotification: NotificationType = {
      title,
      message,
      type,
      image_url,
      sound_url,
      carousel_data: carousel_images,
      timer_duration: timer_duration || null,
      action_type,
      action_data,
      isActive,
    };

    try {
      await createNotificationType(newNotification); // Submit the NotificationType object to the API
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Notification created successfully.',
      });

      router.push('/admin/notification-type');
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to create notification.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Notification Management</h1>
          <p className="text-gray-500">Create a notification</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">New Notification</CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below to create a new notification
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notification title"
                  required
                />
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Message</label>
                <ReactQuill
                  value={message}
                  onChange={setMessage}
                  theme="snow"
                  modules={quillModules}
                  style={{ height: '200px' }}
                />
              </div>

              {/* Type Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as NotificationType['type'])}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="timer">Timer</option>
                  <option value="image">Image</option>
                  <option value="carousel">Carousel</option>
                  <option value="normal">Normal</option>
                  <option value="sound">Sound</option>
                </select>
              </div>

              {/* Timer Duration */}
              {type === 'timer' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Timer Duration (in seconds)
                  </label>
                  <Input
                    type="number"
                    value={timer_duration || ''}
                    onChange={(e) => setTimerDuration(Number(e.target.value))}
                    placeholder="Enter timer duration"
                  />
                </div>
              )}

              {/* Image Upload */}
              {type === 'image' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Image</label>
                  <Input type="file" accept="image/*" onChange={handleImageChange} />
                </div>
              )}

              {/* Sound Upload */}
              {type === 'sound' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sound</label>
                  <Input type="file" accept="audio/*" onChange={handleSoundChange} />
                </div>
              )}

              {/* Carousel Images */}
              {type === 'carousel' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Carousel Images</label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCarouselImagesChange}
                  />
                </div>
              )}

              {/* Action Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Action Type</label>
                <select
                  value={action_type}
                  onChange={(e) => setActionType(e.target.value as NotificationType['action_type'])}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="internal_link">Internal Link</option>
                  <option value="external_link">External Link</option>
                  <option value="order_related">Order Related</option>
                  <option value="promo">Promotions</option>
                </select>
              </div>

              {/* Action Data */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Action Data</label>
                <Input
                  value={action_data || ''}
                  onChange={(e) => setActionData(e.target.value || null)}
                  placeholder="Enter URL or action"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} className="bg-primary" />
                <span className="text-sm text-gray-700">Active</span>
              </div>
            </form>
          </CardContent>

          <CardFooter className="border-t border-gray-100 mt-6">
            <div className="flex space-x-3 pt-6">
              <Button className="w-full" type="submit" disabled={isSubmitting} onClick={onSubmit}>
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Notification</span>
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

export default AddNotificationTypeForm;
