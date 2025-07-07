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
  fetchHubPincodeById,
  updateHubPincode,
  fetchAllHubsWithoutPagination,
  HubPincode,
  Hub,
} from '@/lib/api';

const EditHubPincodeForm: React.FC = () => {
  const [hub_id, setHubId] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [is_active, setIsActive] = useState<boolean>(true); // Active switch state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hubs, setHubs] = useState<Hub[]>([]);

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Extract the HubPincode ID from the URL path
  const hubPincodeId = pathname?.split('/').pop();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hubsData = await fetchAllHubsWithoutPagination();
        setHubs(hubsData);

        if (hubPincodeId) {
          const hubPincode: HubPincode = await fetchHubPincodeById(hubPincodeId);
          setHubId(hubPincode.hub_id.toString());
          setPincode(hubPincode.pincode);
          setIsActive(hubPincode.is_active ?? true);
        }
      } catch (error: any) {
        toast({
          variant: 'error',
          title: 'Error',
          description: error.message || 'Failed to fetch hub pincode details.',
        });
      }
    };

    fetchData();
  }, [hubPincodeId, toast]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!hub_id || !pincode) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Hub and Pincode are required.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Construct the updated hub pincode object
      const updatedHubPincode: HubPincode = {
        hub_id: hub_id,
        pincode,
        is_active,
      };

      await updateHubPincode(hubPincodeId as string, updatedHubPincode);

      toast({
        variant: 'success',
        title: 'Success',
        description: 'Hub Pincode updated successfully!',
      });

      // Redirect to hub pincode list
      router.push('/admin/hub-pincode');
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to update hub pincode.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Hub Pincode Management</h1>
        <p className="text-gray-500">Edit hub pincode details</p>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Edit Hub Pincode</CardTitle>
            <CardDescription>
              Update the details below to edit the hub pincode entry.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Hub Selection Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">Hub</label>
                <select
                  value={hub_id}
                  onChange={(e) => setHubId(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring"
                  required
                >
                  <option value="" disabled>
                    Select a hub
                  </option>
                  {hubs.map((hub) => (
                    <option key={hub.id} value={hub.id}>
                      {hub.hub_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pincode Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">Pincode</label>
                <Input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter pincode"
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

export default EditHubPincodeForm;
