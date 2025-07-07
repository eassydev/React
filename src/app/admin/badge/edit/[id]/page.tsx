'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getBadge, updateBadge, Badge } from '@/lib/api'; // You should define these

const EditBadgeForm: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [totalCourse, setTotalCourse] = useState<number>(0);
  const [nextBadgeTime, setNextBadgeTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBadge = async () => {
      try {
        const badgeData: Badge = await getBadge(id.toString());
        setName(badgeData.name);
        setTotalCourse(badgeData.total_course);
        setNextBadgeTime(badgeData.next_badge_time ?? null);
        setIsActive(badgeData.is_active ?? true);

        if (badgeData.image && typeof badgeData.image === 'string') {
          setExistingImageUrl(badgeData.image);
        }
      } catch (err) {
        toast({
          variant: 'error',
          title: 'Error loading badge',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) loadBadge();
  }, [id]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !totalCourse) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Name and total course are required.',
      });
      return;
    }

    const badgeData: Badge = {
      name,
      next_badge_time: nextBadgeTime,
      total_course: totalCourse,
      image: image,
      is_active: isActive,
    };

    try {
      setIsSubmitting(true);
      await updateBadge(id.toString(), badgeData); // Must be FormData-compatible endpoint
      toast({
        variant: 'success',
        title: 'Badge updated successfully',
      });
      router.push('/admin/badge');
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Update failed',
        description: 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin w-6 h-6 mx-auto text-gray-500" />
        <p className="mt-2 text-gray-500">Loading badge...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl border-none bg-white/80 backdrop-blur">
          <form onSubmit={onSubmit}>
            <CardHeader>
              <CardTitle>Edit Badge</CardTitle>
              <CardDescription>Update badge details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Badge Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter badge name"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Badge Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setImage(e.target.files[0]);
                    }
                  }}
                />
                {existingImageUrl && typeof existingImageUrl === 'string' && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Uploaded Image:</p>
                    <img
                      src={existingImageUrl}
                      alt="Badge"
                      className="w-20 h-20 object-cover mt-1 rounded border"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Number of Courses</label>
                <Input
                  type="number"
                  value={totalCourse}
                  onChange={(e) => setTotalCourse(parseInt(e.target.value))}
                  placeholder="e.g. 3"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Next Badge Time (days)</label>
                <Input
                  type="number"
                  value={nextBadgeTime ?? ''}
                  onChange={(e) => setNextBadgeTime(parseInt(e.target.value))}
                  placeholder="Optional"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span>Active</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditBadgeForm;
