'use client';

import React, { useEffect, useState, FormEvent } from 'react';
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
import { createAdmin, fetchRolesAll, Role } from '@/lib/api'; // Admin creation and role APIs
import { useRouter } from 'next/navigation';

const AdminAddForm: React.FC = () => {
  const [fullName, setFullName] = useState<string>(''); // Updated to full_name
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [roleId, setRoleId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const { toast } = useToast();

  // Fetch all roles for the dropdown
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await fetchRolesAll();
        setRoles(response);
      } catch (error: any) {
        toast({
          variant: 'error',
          title: 'Error',
          description: error.message || 'Failed to fetch roles.',
        });
      }
    };
    loadRoles();
  }, []);

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!fullName || !email || !password || !roleId) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'All fields are required.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await createAdmin({
        full_name: fullName, // Updated to use full_name
        email,
        password,
        role_id: roleId,
        is_active: isActive,
      });

      toast({
        variant: 'success',
        title: 'Success',
        description: 'Admin created successfully.',
      });
      setIsSubmitting(false);
      router.push('/admin/admin'); // Redirect after successful update
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to create admin.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-500">Create a new admin</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <CardTitle className="text-xl text-gray-800">New Admin</CardTitle>
            <CardDescription className="text-gray-500">
              Fill in the details below to add a new admin user.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              {/* Email */}
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
              />

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              {/* Role Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select
                  className="w-full border-gray-300 rounded-md h-11"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  required
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-sm text-gray-700">Active</span>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button className="w-full h-11" disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Save Admin</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAddForm;
