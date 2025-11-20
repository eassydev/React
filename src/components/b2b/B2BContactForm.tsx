'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Crown, 
  Shield, 
  Bell,
  MessageSquare,
  Clock,
  MapPin,
  AlertCircle,
  Save,
  X
} from 'lucide-react';

interface ContactPerson {
  id?: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  mobile: string;
  whatsapp: string;
  contact_priority: 'primary' | 'secondary' | 'tertiary';
  is_decision_maker: boolean;
  can_approve_orders: boolean;
  can_approve_payments: boolean;
  email_notifications: {
    quotations: boolean;
    invoices: boolean;
    order_updates: boolean;
    payment_reminders: boolean;
    service_reports: boolean;
    escalations: boolean;
  };
  preferred_communication: 'email' | 'phone' | 'whatsapp' | 'all';
  notes: string;
  office_address: string;
  working_hours: string;
  time_zone: string;
  is_active?: boolean;
}

interface B2BContactFormProps {
  contact?: ContactPerson;
  onSubmit: (data: Partial<ContactPerson>) => Promise<void>;
  onCancel: () => void;
}

export const B2BContactForm: React.FC<B2BContactFormProps> = ({
  contact,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<ContactPerson>({
    name: '',
    designation: '',
    department: 'operations',
    email: '',
    phone: '',
    mobile: '',
    whatsapp: '',
    contact_priority: 'secondary',
    is_decision_maker: false,
    can_approve_orders: false,
    can_approve_payments: false,
    email_notifications: {
      quotations: true,
      invoices: true,
      order_updates: true,
      payment_reminders: true,
      service_reports: false,
      escalations: false
    },
    preferred_communication: 'email',
    notes: '',
    office_address: '',
    working_hours: '9:00 AM - 6:00 PM',
    time_zone: 'Asia/Kolkata'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Department options
  const departments = [
    { value: 'operations', label: 'Operations' },
    { value: 'accounts', label: 'Accounts' },
    { value: 'management', label: 'Management' },
    { value: 'procurement', label: 'Procurement' },
    { value: 'facilities', label: 'Facilities' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'it', label: 'IT' },
    { value: 'legal', label: 'Legal' },
    { value: 'finance', label: 'Finance' },
    { value: 'admin', label: 'Admin' },
    { value: 'other', label: 'Other' }
  ];

  // Priority options
  const priorities = [
    { value: 'primary', label: 'Primary', color: 'bg-red-100 text-red-800' },
    { value: 'secondary', label: 'Secondary', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'tertiary', label: 'Tertiary', color: 'bg-gray-100 text-gray-800' }
  ];

  // Communication options
  const communicationMethods = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'phone', label: 'Phone', icon: Phone },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { value: 'all', label: 'All Methods', icon: Bell }
  ];

  // Time zones
  const timeZones = [
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' }
  ];

  // ✅ FIX: Email notification type labels mapping
  const emailNotificationLabels = {
    quotations: {
      label: 'Quotations',
      description: 'Receive notifications about quotation requests and updates'
    },
    invoices: {
      label: 'Invoices',
      description: 'Receive notifications about invoice generation and updates'
    },
    order_updates: {
      label: 'Order Updates',
      description: 'Receive notifications about order status changes and updates'
    },
    payment_reminders: {
      label: 'Payment Reminders',
      description: 'Receive notifications about payment due dates and reminders'
    },
    service_reports: {
      label: 'Service Reports',
      description: 'Receive notifications about service completion reports'
    },
    escalations: {
      label: 'Escalations',
      description: 'Receive notifications about escalated issues and urgent matters'
    }
  };

  // Initialize form data when contact prop changes
  useEffect(() => {
    if (contact) {
      setFormData({ ...contact });
    }
  }, [contact]);

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
      email_notifications: {
        ...prev.email_notifications,
        [notificationType]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    // Phone validation (if provided)
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.mobile && !/^[0-9+\-\s()]+$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }

    if (formData.whatsapp && !/^[0-9+\-\s()]+$/.test(formData.whatsapp)) {
      newErrors.whatsapp = 'Please enter a valid WhatsApp number';
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
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    placeholder="e.g., Manager, Executive"
                  />
                </div>

                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleInputChange('department', value)}
                  >
                    <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-sm text-red-500 mt-1">{errors.department}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="priority">Contact Priority</Label>
                  <Select
                    value={formData.contact_priority}
                    onValueChange={(value) => handleInputChange('contact_priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={priority.color}>{priority.label}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91-XXXXXXXXXX"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    placeholder="+91-XXXXXXXXXX"
                    className={errors.mobile ? 'border-red-500' : ''}
                  />
                  {errors.mobile && (
                    <p className="text-sm text-red-500 mt-1">{errors.mobile}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="+91-XXXXXXXXXX"
                    className={errors.whatsapp ? 'border-red-500' : ''}
                  />
                  {errors.whatsapp && (
                    <p className="text-sm text-red-500 mt-1">{errors.whatsapp}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="preferred_communication">Preferred Communication</Label>
                <Select
                  value={formData.preferred_communication}
                  onValueChange={(value) => handleInputChange('preferred_communication', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select communication method" />
                  </SelectTrigger>
                  <SelectContent>
                    {communicationMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center gap-2">
                          <method.icon className="w-4 h-4" />
                          {method.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Permissions & Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Decision Maker</h4>
                    <p className="text-sm text-gray-600">Can make business decisions for the company</p>
                  </div>
                  <Switch
                    checked={formData.is_decision_maker}
                    onCheckedChange={(checked) => handleInputChange('is_decision_maker', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Order Approval</h4>
                    <p className="text-sm text-gray-600">Can approve service orders and bookings</p>
                  </div>
                  <Switch
                    checked={formData.can_approve_orders}
                    onCheckedChange={(checked) => handleInputChange('can_approve_orders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Payment Approval</h4>
                    <p className="text-sm text-gray-600">Can approve payments and financial transactions</p>
                  </div>
                  <Switch
                    checked={formData.can_approve_payments}
                    onCheckedChange={(checked) => handleInputChange('can_approve_payments', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(formData.email_notifications).map(([key, value]) => {
                const notificationInfo = emailNotificationLabels[key as keyof typeof emailNotificationLabels];
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
        </TabsContent>

        {/* Additional Information Tab */}
        <TabsContent value="additional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="office_address">Office Address</Label>
                <Textarea
                  id="office_address"
                  value={formData.office_address}
                  onChange={(e) => handleInputChange('office_address', e.target.value)}
                  placeholder="Enter office address"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="working_hours">Working Hours</Label>
                  <Input
                    id="working_hours"
                    value={formData.working_hours}
                    onChange={(e) => handleInputChange('working_hours', e.target.value)}
                    placeholder="9:00 AM - 6:00 PM"
                  />
                </div>

                <div>
                  <Label htmlFor="time_zone">Time Zone</Label>
                  <Select
                    value={formData.time_zone}
                    onValueChange={(value) => handleInputChange('time_zone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeZones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about this contact"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
          {loading ? 'Saving...' : contact ? 'Update Contact' : 'Add Contact'}
        </Button>
      </div>
    </form>
  );
};
