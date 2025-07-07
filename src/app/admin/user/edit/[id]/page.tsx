'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { fetchUserById, updateUser, User } from '@/lib/api'; // Import the API functions and User interface

const EditUserForm: React.FC = () => {
  const { id } = useParams(); // Get the user ID from the URL
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch user data by ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const fetchedUser = await fetchUserById(id.toString());
        setUser(fetchedUser);
      } catch (error) {
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Failed to load user data.',
        });
      }
    };

    if (id) fetchUser();
  }, [id, toast]);

  // Handle form submission for updating the user
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      await updateUser(id.toString(), user); // Update user data through the API
      toast({
        variant: 'success',
        title: 'Success',
        description: 'User updated successfully.',
      });
      router.push('/admin/user'); // Redirect after successful update
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to update user.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <Loader2 className="animate-spin mx-auto mt-4" />; // Loading indicator if data is not loaded

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Edit user details</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">Edit User</CardTitle>
                <CardDescription className="text-gray-500">
                  Update the fields below to edit user details
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* First Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <Input
                  value={user.first_name}
                  onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                  placeholder="Enter first name"
                  required
                />
              </div>

              {/* Last Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <Input
                  value={user.last_name}
                  onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                  placeholder="Enter last name"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  placeholder="Enter email"
                  required
                />
              </div>

              {/* Mobile Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mobile</label>
                <Input
                  type="tel"
                  value={user.mobile}
                  onChange={(e) => setUser({ ...user, mobile: e.target.value })}
                  placeholder="Enter mobile number"
                  required
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={user.is_active}
                  onCheckedChange={(checked) => setUser({ ...user, is_active: checked })}
                  className="bg-primary"
                />
                <span className="text-sm text-gray-700">Active</span>
              </div>
            </form>
          </CardContent>

          <CardFooter className="border-t border-gray-100 mt-6">
            <div className="flex space-x-3 pt-6">
              <Button
                className="w-100 flex-1 h-11 bg-primary"
                disabled={isSubmitting}
                onClick={onSubmit}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save User</span>
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

export default EditUserForm;
