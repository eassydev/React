'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';
import { createCountry, Country } from '@/lib/api';

const AddCountryForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [is_active, setIsActive] = useState<boolean>(true); // Active switch state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Country name is required.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Construct the country object
      const newCountry: Country = {
        name,
        is_active, // Set the is_active status
      };

      await createCountry(newCountry);

      toast({
        variant: 'success',
        title: 'Success',
        description: 'Country created successfully!',
      });

      // Redirect to country list
      router.push('/admin/country');
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to create country.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Country Management</h1>
        <p className="text-gray-500">Create a new country</p>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>New Country</CardTitle>
            <CardDescription>
              Fill in the details below to create a new country entry.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">Country Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter country name"
                  required
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch checked={is_active} onCheckedChange={setIsActive} />
                <span className="text-sm text-gray-700">Active</span>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Country</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddCountryForm;
