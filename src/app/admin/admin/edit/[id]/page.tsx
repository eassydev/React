'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';
import { fetchAdminById, updateAdmin, fetchRolesAll, Role } from '@/lib/api';

// AdminEditForm Component
const AdminEditForm: React.FC = () => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [roleId, setRoleId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Extract the admin ID from the URL path
  const adminId = pathname?.split('/').pop();

  useEffect(() => {
    if (adminId) {
      loadAdminData(adminId);
      loadRoles();
    }
  }, [adminId]);

  // Fetch admin data
  const loadAdminData = async (id: string) => {
    try {
      const adminData = await fetchAdminById(id);
      setFullName(adminData.full_name);
      setEmail(adminData.email);
      setRoleId(adminData.role_id);
      setIsActive(adminData.active);
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Error',
        description: 'Failed to load admin details.',
      });
    }
  };

  // Fetch all roles for the dropdown
  const loadRoles = async () => {
    try {
      const response = await fetchRolesAll();
      setRoles(response);
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Error',
        description: 'Failed to load roles.',
      });
    }
  };

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!fullName || !email || !roleId) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'All fields are required.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await updateAdmin(adminId!, {
        full_name: fullName,
        email,
        role_id: roleId,
        active: isActive,
      });
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Admin updated successfully.',
      });
      router.push('/admin/admin'); // Redirect to the admin list
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to update admin.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Edit Admin</h1>
          <p className="text-gray-500">Update admin details</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">Edit Admin</CardTitle>
                <CardDescription className="text-gray-500">
                  Modify the details below to update an admin user
                </CardDescription>
              </div>
            </div>
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
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
                <Switch checked={isActive} onCheckedChange={setIsActive} className="bg-primary" />
                <span className="text-sm text-gray-700">Active</span>
              </div>

              {/* Submit Button */}
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Update Admin</span>
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

export default AdminEditForm;
