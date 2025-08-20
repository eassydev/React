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
  // ✅ ENHANCED: Complete form fields for SPOC users
  const [fullName, setFullName] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [roleId, setRoleId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [autoGenerateUsername, setAutoGenerateUsername] = useState<boolean>(true);
  const router = useRouter();

  const { toast } = useToast();

  // ✅ ENHANCED: Auto-generate username and full name
  useEffect(() => {
    if (autoGenerateUsername && firstName && lastName) {
      const generatedUsername = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`.replace(/\s+/g, '_');
      setUsername(generatedUsername);
    }
  }, [firstName, lastName, autoGenerateUsername]);

  useEffect(() => {
    if (firstName && lastName) {
      setFullName(`${firstName} ${lastName}`);
    }
  }, [firstName, lastName]);

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

  // ✅ ENHANCED: Form validation with all fields
  const validateForm = () => {
    if (!firstName || !lastName || !email || !password || !roleId) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'First name, last name, email, password, and role are required.',
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Passwords do not match.',
      });
      return false;
    }

    if (password.length < 8) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Password must be at least 8 characters long.',
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Please enter a valid email address.',
      });
      return false;
    }

    if (mobile && !/^[\+]?[1-9][\d]{0,15}$/.test(mobile.replace(/[\s\-\(\)]/g, ''))) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Please enter a valid mobile number.',
      });
      return false;
    }

    return true;
  };

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // ✅ ENHANCED: Include all form fields
      const adminData = {
        full_name: fullName,
        fname: firstName,
        lname: lastName,
        username: username || `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
        email,
        mobile: mobile || null,
        password,
        role_id: roleId,
        active: isActive ? 1 : 0,
      };

      console.log('Creating admin with data:', { ...adminData, password: '[HIDDEN]' });
      await createAdmin(adminData);

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
              {/* ✅ ENHANCED: Personal Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">First Name *</label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Last Name *</label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                {/* Full Name (Auto-generated) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name (Auto-generated)</label>
                  <Input
                    value={fullName}
                    readOnly
                    className="bg-gray-100"
                    placeholder="Will be auto-generated from first and last name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address *</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                  <Input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter mobile number (e.g., +91-9876543210)"
                  />
                </div>
              </div>

              {/* ✅ ENHANCED: Account Information Section */}
              <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>

                {/* Username Generation Toggle */}
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={autoGenerateUsername}
                    onCheckedChange={setAutoGenerateUsername}
                  />
                  <span className="text-sm text-gray-700">Auto-generate username from name</span>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username or auto-generate"
                    readOnly={autoGenerateUsername}
                    className={autoGenerateUsername ? 'bg-gray-100' : ''}
                    required
                  />
                  {autoGenerateUsername && (
                    <p className="text-xs text-gray-500">Username will be auto-generated from first and last name</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password *</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password (min 8 characters)"
                      required
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirm Password *</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ✅ ENHANCED: Role & Permissions Section */}
              <div className="bg-green-50 p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Role & Permissions</h3>

                {/* Role Dropdown */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Role *</label>
                  <select
                    className="w-full border-gray-300 rounded-md h-11 px-3"
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
                  <p className="text-xs text-gray-500">
                    Choose the appropriate role: Super Admin, Manager, SPOC, etc.
                  </p>
                </div>

                {/* Role Description */}
                {roleId && (
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">Role Information</h4>
                    {(() => {
                      const selectedRole = roles.find(r => r.id === roleId);
                      if (selectedRole?.role_name === 'spoc') {
                        return (
                          <div className="text-sm text-gray-600">
                            <p><strong>SPOC (Single Point of Contact)</strong></p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Manages specific B2B clients</li>
                              <li>Handles client communications and orders</li>
                              <li>Limited access to assigned clients only</li>
                              <li>Can create quotations and manage bookings</li>
                            </ul>
                          </div>
                        );
                      } else if (selectedRole?.role_name === 'manager') {
                        return (
                          <div className="text-sm text-gray-600">
                            <p><strong>Manager</strong></p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Oversees SPOC users and operations</li>
                              <li>Can assign SPOCs to clients</li>
                              <li>Access to all client data and reports</li>
                              <li>Can approve high-value transactions</li>
                            </ul>
                          </div>
                        );
                      } else if (selectedRole?.role_name === 'super_admin') {
                        return (
                          <div className="text-sm text-gray-600">
                            <p><strong>Super Admin</strong></p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Full system access and control</li>
                              <li>Can manage all users and roles</li>
                              <li>System configuration and settings</li>
                              <li>Complete administrative privileges</li>
                            </ul>
                          </div>
                        );
                      }
                      return (
                        <p className="text-sm text-gray-600">
                          {selectedRole?.role_name || 'Role information will appear here'}
                        </p>
                      );
                    })()}
                  </div>
                )}

                {/* Active Status */}
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Account Status</span>
                    <p className="text-xs text-gray-500">Enable or disable this user account</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                    <span className="text-sm text-gray-700">{isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
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
