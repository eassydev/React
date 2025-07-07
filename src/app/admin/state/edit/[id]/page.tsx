'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';
import {
  fetchStateById,
  updateState,
  fetchAllCountriesWithoutPagination,
  State,
  Country,
} from '@/lib/api';

const EditStateForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [country_id, setCountryId] = useState<string>('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [is_active, setIsActive] = useState<boolean>(true); // Active switch state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Extract the state ID from the URL path
  const stateId = pathname?.split('/').pop();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const countriesData = await fetchAllCountriesWithoutPagination();
        setCountries(countriesData);

        if (stateId) {
          const state: State = await fetchStateById(stateId);
          setName(state.name);
          setCountryId(state.country_id);
          setIsActive(state.is_active ?? true);
        }
      } catch (error: any) {
        toast({
          variant: 'error',
          title: 'Error',
          description: error.message || 'Failed to fetch state details.',
        });
      }
    };

    fetchData();
  }, [stateId, toast]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name || !country_id) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'State name and country ID are required.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Construct the updated state object
      const updatedState: State = {
        name,
        country_id,
        is_active, // Set the is_active status
      };

      await updateState(stateId as string, updatedState);

      toast({
        variant: 'success',
        title: 'Success',
        description: 'State updated successfully!',
      });

      // Redirect to state list
      router.push('/admin/state');
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to update state.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">State Management</h1>
        <p className="text-gray-500">Edit state details</p>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Edit State</CardTitle>
            <CardDescription>Update the details below to edit the state entry.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">State Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter state name"
                  required
                />
              </div>

              {/* Country ID Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">Country</label>
                <select
                  value={country_id}
                  onChange={(e) => setCountryId(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring"
                  required
                >
                  <option value="" disabled>
                    Select a country
                  </option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
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
                    <span>Save Changes</span>
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

export default EditStateForm;
