'use client';

import React, { useState, useEffect } from 'react';
import { fetchSPOCUsers, fetchB2BClientById } from '@/lib/api'; // ✅ Import SPOC API functions
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { B2BCustomerSelector } from './B2BCustomerSelector';
import usePermissions from '@/hooks/usePermissions'; // ✅ Add role detection
import {
  User,
  Mail,
  Phone,
  Building2,
  Crown,
  Shield,
  Bell,
  Target,
  AlertCircle,
  Save,
  X,
  Users
} from 'lucide-react';

interface SPOCAssignment {
  id?: string;
  b2b_customer_id: string;
  spoc_user_id: string;
  spoc_type: 'primary' | 'backup' | 'technical' | 'accounts' | 'sales' | 'manager';
  function_area: string[];
  notification_preferences: {
    new_orders: boolean;
    quotation_requests: boolean;
    payment_issues: boolean;
    service_escalations: boolean;
    client_communications: boolean;
  };
  contact_email: string;
  contact_phone: string;
  notes: string;
  special_instructions: string;
  // Optional customer data when editing
  customer?: {
    id: string;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
  };
  // Optional SPOC user data when editing
  spocUser?: {
    id: string;
    username: string;
    full_name: string;
    email: string;
  };
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
}

interface B2BCustomer {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status?: string;
}

interface B2BSPOCFormProps {
  assignment?: SPOCAssignment;
  onSubmit: (data: Partial<SPOCAssignment>) => Promise<void>;
  onCancel: () => void;
}

export const B2BSPOCForm: React.FC<B2BSPOCFormProps> = ({
  assignment,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<SPOCAssignment>({
    b2b_customer_id: '',
    spoc_user_id: '',
    spoc_type: 'primary',
    function_area: ['general'],
    notification_preferences: {
      new_orders: true,
      quotation_requests: true,
      payment_issues: true,
      service_escalations: true,
      client_communications: true
    },
    contact_email: '',
    contact_phone: '',
    notes: '',
    special_instructions: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<B2BCustomer | null>(null);
  const [selectedSpocUser, setSelectedSpocUser] = useState<AdminUser | null>(null); // ✅ Same as selectedCustomer

  // ✅ Add role detection for UI restrictions
  const { getRole, isSuperAdmin } = usePermissions();
  const userRole = getRole();
  const isSpocUser = userRole === 'spoc';
  const canManageSpocs = isSuperAdmin() || userRole === 'super_admin' || userRole === 'manager';

  // SPOC type options
  const spocTypes = [
    { value: 'primary', label: 'Primary SPOC', description: 'Main point of contact for all communications' },
    { value: 'backup', label: 'Backup SPOC', description: 'Secondary contact when primary is unavailable' },
    { value: 'technical', label: 'Technical SPOC', description: 'Handles technical issues and support' },
    { value: 'accounts', label: 'Accounts SPOC', description: 'Manages billing and payment matters' },
    { value: 'sales', label: 'Sales SPOC', description: 'Handles sales and business development' },
    { value: 'manager', label: 'Manager SPOC', description: 'Senior management contact for escalations' }
  ];

  // Function area options
  const functionAreas = [
    { value: 'general', label: 'General' },
    { value: 'sales', label: 'Sales' },
    { value: 'technical', label: 'Technical' },
    { value: 'accounts', label: 'Accounts' },
    { value: 'operations', label: 'Operations' },
    { value: 'escalation', label: 'Escalation' }
  ];

  // ✅ FIX: Notification type labels mapping
  const notificationTypeLabels = {
    new_orders: {
      label: 'New Orders',
      description: 'Get notified when new orders are placed by this client'
    },
    quotation_requests: {
      label: 'Quotation Requests',
      description: 'Get notified when client requests quotations'
    },
    payment_issues: {
      label: 'Payment Issues',
      description: 'Get notified about payment delays and billing issues'
    },
    service_escalations: {
      label: 'Service Escalations',
      description: 'Get notified when service issues are escalated'
    },
    client_communications: {
      label: 'Client Communications',
      description: 'Get notified about general client communications and updates'
    }
  };

  // Load admin users on component mount
  useEffect(() => {
    console.log('🚀 B2BSPOCForm mounted, loading admin users...'); // ✅ DEBUG
    loadAdminUsers();
  }, []);

  // Initialize form data when assignment prop changes
  useEffect(() => {
    if (assignment) {
      console.log('🔄 Initializing form with assignment data:', assignment); // ✅ DEBUG
      console.log('👤 Assignment SPOC User Data:', assignment.spocUser); // ✅ DEBUG
      // ✅ FIX: Parse notification_preferences if it's a JSON string
      let parsedNotificationPreferences;
      try {
        if (typeof assignment.notification_preferences === 'string') {
          parsedNotificationPreferences = JSON.parse(assignment.notification_preferences);
        } else {
          parsedNotificationPreferences = assignment.notification_preferences;
        }
      } catch (error) {
        console.error('Error parsing notification preferences:', error);
        parsedNotificationPreferences = {
          new_orders: true,
          quotation_requests: true,
          payment_issues: true,
          service_escalations: true,
          client_communications: true
        };
      }

      const newFormData = {
        ...assignment,
        // Ensure notification preferences are properly initialized and parsed
        notification_preferences: parsedNotificationPreferences || {
          new_orders: true,
          quotation_requests: true,
          payment_issues: true,
          service_escalations: true,
          client_communications: true
        },
        // Ensure no null values for form inputs
        contact_email: assignment.contact_email || '',
        contact_phone: assignment.contact_phone || '',
        notes: assignment.notes || '',
        special_instructions: assignment.special_instructions || ''
      };
      console.log('✅ Setting form data:', newFormData); // ✅ DEBUG
      console.log('🎯 Customer ID:', newFormData.b2b_customer_id); // ✅ DEBUG
      console.log('👤 SPOC User ID:', newFormData.spoc_user_id); // ✅ DEBUG

      // No need for complex matching - SPOC user ID will be set directly from assignment.spocUser

      setFormData(newFormData);

      // Set customer data directly from assignment if available
      if (assignment.customer) {
        console.log('✅ Using customer data from assignment:', assignment.customer); // ✅ DEBUG
        setSelectedCustomer(assignment.customer);
      } else if (assignment.b2b_customer_id) {
        // Fallback: Load customer data if not included in assignment
        console.log('🔄 Loading customer data separately for ID:', assignment.b2b_customer_id); // ✅ DEBUG
        loadCustomerData(assignment.b2b_customer_id);
      }

      // ✅ SIMPLE FIX: Set SPOC user directly from assignment data (exactly like customer)
      if (assignment.spocUser) {
        console.log('✅ Using SPOC user data from assignment:', assignment.spocUser); // ✅ DEBUG
        setSelectedSpocUser(assignment.spocUser); // ✅ Same as setSelectedCustomer
        // Also update form data for submission
        setFormData(prev => ({ ...prev, spoc_user_id: assignment.spocUser!.id }));
      }
    }
  }, [assignment]);

  // Re-validate SPOC user selection when adminUsers are loaded
  useEffect(() => {
    if (adminUsers.length > 0 && formData.spoc_user_id) {
      const matchingUser = findSpocUser(formData.spoc_user_id, assignment?.spocUser);

      if (matchingUser && matchingUser.id !== formData.spoc_user_id) {
        console.log('🔄 Updating form with correct encrypted SPOC user ID');
        setFormData(prev => ({ ...prev, spoc_user_id: matchingUser.id }));
      }

      console.log('🔄 Re-checking SPOC user after users loaded:', {
        originalSpocUserId: formData.spoc_user_id,
        availableUsers: adminUsers.map((u: AdminUser) => ({ name: u.full_name, id: u.id })),
        matchFound: matchingUser ? matchingUser.full_name : 'NOT FOUND',
        assignmentSpocUser: assignment?.spocUser
      });
    }
  }, [adminUsers, formData.spoc_user_id, assignment]);

  // Helper function to find SPOC user by raw ID or name
  const findSpocUser = (rawId: string, spocUserData?: any, usersList?: AdminUser[]): AdminUser | null => {
    const users = usersList || adminUsers;
    if (!users.length) return null;

    // Try direct encrypted ID match first
    let user = users.find(u => u.id === rawId);
    if (user) return user;

    // If raw ID (number), try to match by SPOC user data
    if (/^\d+$/.test(rawId) && spocUserData) {
      user = users.find(u =>
        u.username === spocUserData.username ||
        u.full_name === spocUserData.full_name ||
        u.email === spocUserData.email
      );
      if (user) {
        console.log(`🔄 Mapped raw ID ${rawId} to encrypted ID ${user.id} for ${user.full_name}`);
        return user;
      }
    }

    return null;
  };

  const loadAdminUsers = async () => {
    try {
      console.log('🔄 Loading SPOC users...'); // ✅ DEBUG

      const response = await fetchSPOCUsers();

      console.log('🔍 SPOC Users API Response:', response); // ✅ DEBUG: Log the response
      if (response.success) {
        const users = response.data || [];
        setAdminUsers(users); // ✅ FIXED: Backend returns data.data directly, not data.data.users
        console.log('✅ SPOC Users loaded:', users.length); // ✅ DEBUG: Log count
        console.log('👥 Available SPOC User IDs:', users.map((u: AdminUser) => `${u.full_name}: ${u.id}`)); // ✅ DEBUG: Show user IDs

        // ✅ SIMPLE: No complex matching needed - SPOC user ID is set directly from assignment.spocUser
        console.log('✅ SPOC users loaded, form should already have correct SPOC user ID from assignment data');
      }
    } catch (error: any) {
      console.error('Error loading admin users:', error);
    }
  };

  const loadCustomerData = async (customerId: string) => {
    try {
      console.log('🔄 Loading customer data for ID:', customerId); // ✅ DEBUG

      const response = await fetchB2BClientById(customerId);

      console.log('🔍 Customer data response:', response); // ✅ DEBUG
      if (response.success) {
        setSelectedCustomer(response.data);
        console.log('✅ Customer loaded:', response.data?.company_name); // ✅ DEBUG
      } else {
        console.error('❌ Failed to load customer:', response.message);
      }
    } catch (error: any) {
      console.error('Error loading customer data:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNotificationChange = (notificationType: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [notificationType]: value
      }
    }));
  };

  const handleFunctionAreaChange = (area: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      function_area: checked
        ? [...prev.function_area, area]
        : prev.function_area.filter(a => a !== area)
    }));
  };

  const handleCustomerSelect = (customer: B2BCustomer) => {
    setSelectedCustomer(customer);
    handleInputChange('b2b_customer_id', customer.id);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.b2b_customer_id) {
      newErrors.b2b_customer_id = 'Customer is required';
    }

    if (!formData.spoc_user_id) {
      newErrors.spoc_user_id = 'SPOC user is required';
    }

    if (!formData.spoc_type) {
      newErrors.spoc_type = 'SPOC type is required';
    }

    if (formData.function_area.length === 0) {
      newErrors.function_area = 'At least one function area is required';
    }

    // Email validation (if provided)
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    // Phone validation (if provided)
    if (formData.contact_phone && !/^[0-9+\-\s()]+$/.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Customer Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Select Customer *</Label>
              <B2BCustomerSelector
                onSelect={handleCustomerSelect}
                selectedCustomer={selectedCustomer as any}
                showChangeButton={canManageSpocs} // ✅ Hide change button for SPOC users
              />
              {errors.b2b_customer_id && (
                <p className="text-sm text-red-500 mt-1">{errors.b2b_customer_id}</p>
              )}
            </div>
            
            {selectedCustomer && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">{selectedCustomer.company_name}</h4>
                <p className="text-sm text-blue-700">
                  Contact: {selectedCustomer.contact_person} | {selectedCustomer.email}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SPOC Assignment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            SPOC Assignment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="spoc_user_id">SPOC User *</Label>
              {/* ✅ SIMPLE: Display selected SPOC user directly (same as customer) */}
              {selectedSpocUser ? (
                <div className="p-3 border rounded-lg bg-blue-50 border-blue-200 mt-2">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{selectedSpocUser.full_name}</h4>
                      <div className="grid grid-cols-1 gap-2 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{selectedSpocUser.username}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{selectedSpocUser.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* ✅ Hide "Change SPOC User" button for SPOC users */}
                  {canManageSpocs && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setSelectedSpocUser(null)}
                    >
                      Change SPOC User
                    </Button>
                  )}
                </div>
              ) : (
                <Select
                  value={formData.spoc_user_id}
                  onValueChange={(value) => {
                    const user = adminUsers.find(u => u.id === value);
                    if (user) {
                      setSelectedSpocUser(user);
                      handleInputChange('spoc_user_id', value);
                    }
                  }}
                >
                  <SelectTrigger className={errors.spoc_user_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select SPOC user" />
                  </SelectTrigger>
                  <SelectContent>
                    {adminUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{user.full_name || user.username}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.spoc_user_id && (
                <p className="text-sm text-red-500 mt-1">{errors.spoc_user_id}</p>
              )}
            </div>

            <div>
              <Label htmlFor="spoc_type">SPOC Type *</Label>
              <Select
                value={formData.spoc_type}
                onValueChange={(value) => handleInputChange('spoc_type', value)}
              >
                <SelectTrigger className={errors.spoc_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select SPOC type" />
                </SelectTrigger>
                <SelectContent>
                  {spocTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.spoc_type && (
                <p className="text-sm text-red-500 mt-1">{errors.spoc_type}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Function Areas *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {functionAreas.map((area) => (
                <div key={area.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={area.value}
                    checked={formData.function_area.includes(area.value)}
                    onChange={(e) => handleFunctionAreaChange(area.value, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={area.value} className="text-sm">
                    {area.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.function_area && (
              <p className="text-sm text-red-500 mt-1">{errors.function_area}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_email">Override Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="Optional: Different email for this client"
                className={errors.contact_email ? 'border-red-500' : ''}
              />
              {errors.contact_email && (
                <p className="text-sm text-red-500 mt-1">{errors.contact_email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contact_phone">Override Contact Phone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="Optional: Different phone for this client"
                className={errors.contact_phone ? 'border-red-500' : ''}
              />
              {errors.contact_phone && (
                <p className="text-sm text-red-500 mt-1">{errors.contact_phone}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(formData.notification_preferences).map(([key, value]) => {
            const notificationInfo = notificationTypeLabels[key as keyof typeof notificationTypeLabels];
            return (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{notificationInfo?.label || key.replace(/_/g, ' ')}</h4>
                  <p className="text-sm text-gray-600">
                    {notificationInfo?.description || `Receive notifications for ${key.replace(/_/g, ' ').toLowerCase()}`}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="General notes about this SPOC assignment"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => handleInputChange('special_instructions', e.target.value)}
              placeholder="Special instructions for handling this client"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : assignment ? 'Update Assignment' : 'Create Assignment'}
        </Button>
      </div>
    </form>
  );
};
