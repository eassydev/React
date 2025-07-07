'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';
import { createCity, City, fetchAllStatesWithoutPagination, State } from '@/lib/api';

const AddCityForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [state_id, setStateId] = useState<string>('');
  const [states, setStates] = useState<State[]>([]);
  const [is_active, setIsActive] = useState<boolean>(true); // Active switch state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const data = await fetchAllStatesWithoutPagination();
        setStates(data);
      } catch (error: any) {
        toast({
          variant: 'error',
          title: 'Error',
          description: error.message || 'Failed to fetch states.',
        });
      }
    };

    fetchStates();
  }, [toast]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name || !state_id) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'City name and state ID are required.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Construct the city object
      const newCity: City = {
        name,
        state_id,
        is_active, // Set the is_active status
      };

      await createCity(newCity);

      toast({
        variant: 'success',
        title: 'Success',
        description: 'City created successfully!',
      });

      // Redirect to city list
      router.push('/admin/city');
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to create city.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">City Management</h1>
        <p className="text-gray-500">Create a new city</p>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>New City</CardTitle>
            <CardDescription>Fill in the details below to create a new city entry.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">City Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter city name"
                  required
                />
              </div>

              {/* State ID Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">State</label>
                <select
                  value={state_id}
                  onChange={(e) => setStateId(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring"
                  required
                >
                  <option value="" disabled>
                    Select a state
                  </option>
                  {states.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
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
                    <span>Save City</span>
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

export default AddCityForm;
