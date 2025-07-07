'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Save, Loader2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { createBadge, Badge } from '@/lib/api';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const AddBadgeForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [totalCourse, setTotalCourse] = useState<number | null>(null);
  const [nextBadgeTime, setNextBadgeTime] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !totalCourse || !imageFile) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Name, Image, and Number of Courses are required.',
      });
      return;
    }

    const badgeData: Badge = {
      name,
      next_badge_time: nextBadgeTime,
      total_course: totalCourse,
      image: imageFile,
      is_active: isActive,
    };

    try {
      setIsSubmitting(true);
      await createBadge(badgeData);
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Badge created successfully.',
      });
      router.push('/admin/badge');
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Error',
        description: `${error}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <form onSubmit={onSubmit} className="space-y-6">
            <CardHeader>
              <CardTitle>Create New Badge</CardTitle>
              <CardDescription>Fill in the details to add a new badge</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">Badge Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter badge name"
                  required
                />
              </div>

              {/* Total Course */}
              <div>
                <label className="text-sm font-medium text-gray-700">Number of Courses</label>
                <Input
                  type="number"
                  value={totalCourse ?? ''}
                  onChange={(e) => setTotalCourse(parseInt(e.target.value))}
                  placeholder="Enter course count"
                  required
                />
              </div>

              {/* Next Badge Time (optional) */}
              <div>
                <label className="text-sm font-medium text-gray-700">Next Badge Time (days)</label>
                <Input
                  type="number"
                  value={nextBadgeTime ?? ''}
                  onChange={(e) => setNextBadgeTime(parseInt(e.target.value))}
                  placeholder="Optional"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <ImagePlus className="w-4 h-4 text-blue-500" />
                  <span>Badge Image</span>
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  required
                />
              </div>

              {/* Is Active */}
              <div className="flex items-center space-x-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-sm text-gray-700">Active</span>
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Badge
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddBadgeForm;
