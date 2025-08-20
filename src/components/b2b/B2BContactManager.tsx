'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MessageSquare,
  Building2,
  UserCheck,
  Crown,
  Shield,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { B2BContactForm } from './B2BContactForm';
import { B2BContactList } from './B2BContactList';
import { tokenUtils } from '@/lib/utils'; // ✅ FIXED: Import existing tokenUtils

interface B2BCustomer {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
}

interface ContactPerson {
  id: string;
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
  is_active: boolean;
  last_contacted: string;
  created_at: string;
  updated_at: string;
}

interface ContactsByDepartment {
  [department: string]: ContactPerson[];
}

interface B2BContactManagerProps {
  customer: B2BCustomer;
  onClose?: () => void;
}

export const B2BContactManager: React.FC<B2BContactManagerProps> = ({
  customer,
  onClose
}) => {
  const [contacts, setContacts] = useState<ContactsByDepartment>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactPerson | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  // Department configuration
  const departments = [
    { key: 'all', label: 'All Departments', icon: Users },
    { key: 'operations', label: 'Operations', icon: Building2 },
    { key: 'accounts', label: 'Accounts', icon: BarChart3 },
    { key: 'management', label: 'Management', icon: Crown },
    { key: 'procurement', label: 'Procurement', icon: Shield },
    { key: 'facilities', label: 'Facilities', icon: Building2 },
    { key: 'hr', label: 'Human Resources', icon: Users },
    { key: 'it', label: 'IT', icon: Shield },
    { key: 'legal', label: 'Legal', icon: Shield },
    { key: 'finance', label: 'Finance', icon: BarChart3 },
    { key: 'admin', label: 'Admin', icon: UserCheck },
    { key: 'other', label: 'Other', icon: Users }
  ];

  // Load contacts on component mount
  useEffect(() => {
    if (customer?.id) {
      loadContacts();
      loadStatistics();
    }
  }, [customer?.id]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = tokenUtils.get(); // ✅ FIXED: Use existing tokenUtils
      const response = await fetch(`/admin-api/b2b/clients/${customer.id}/contacts`, {
        headers: {
          'admin-auth-token': token || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load contacts');
      }

      const data = await response.json();
      if (data.success) {
        setContacts(data.data.contacts_by_department || {});
      } else {
        throw new Error(data.message || 'Failed to load contacts');
      }
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const token = tokenUtils.get(); // ✅ FIXED: Use existing tokenUtils
      const response = await fetch(`/admin-api/b2b/clients/${customer.id}/contacts/statistics`, {
        headers: {
          'admin-auth-token': token || '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStatistics(data.data);
        }
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  const handleAddContact = async (contactData: Partial<ContactPerson>) => {
    try {
      const token = tokenUtils.get(); // ✅ FIXED: Use existing tokenUtils
      const response = await fetch(`/admin-api/b2b/clients/${customer.id}/contacts`, {
        method: 'POST',
        headers: {
          'admin-auth-token': token || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add contact');
      }

      const data = await response.json();
      if (data.success) {
        setShowAddForm(false);
        await loadContacts();
        await loadStatistics();
      } else {
        throw new Error(data.message || 'Failed to add contact');
      }
    } catch (err) {
      console.error('Error adding contact:', err);
      setError(err instanceof Error ? err.message : 'Failed to add contact');
    }
  };

  const handleEditContact = async (contactId: string, contactData: Partial<ContactPerson>) => {
    try {
      const token = tokenUtils.get(); // ✅ FIXED: Use existing tokenUtils
      const response = await fetch(`/admin-api/b2b/clients/${customer.id}/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'admin-auth-token': token || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update contact');
      }

      const data = await response.json();
      if (data.success) {
        setEditingContact(null);
        await loadContacts();
        await loadStatistics();
      } else {
        throw new Error(data.message || 'Failed to update contact');
      }
    } catch (err) {
      console.error('Error updating contact:', err);
      setError(err instanceof Error ? err.message : 'Failed to update contact');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      const token = tokenUtils.get(); // ✅ FIXED: Use existing tokenUtils
      const response = await fetch(`/admin-api/b2b/clients/${customer.id}/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'admin-auth-token': token || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete contact');
      }

      const data = await response.json();
      if (data.success) {
        await loadContacts();
        await loadStatistics();
      } else {
        throw new Error(data.message || 'Failed to delete contact');
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  const getFilteredContacts = () => {
    if (selectedDepartment === 'all') {
      return contacts;
    }
    return {
      [selectedDepartment]: contacts[selectedDepartment] || []
    };
  };

  const getTotalContacts = () => {
    return Object.values(contacts).reduce((total, deptContacts) => total + deptContacts.length, 0);
  };

  const getActiveContacts = () => {
    return Object.values(contacts).reduce((total, deptContacts) => 
      total + deptContacts.filter(c => c.is_active).length, 0
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Management</h2>
          <p className="text-gray-600 mt-1">
            Manage contacts for <span className="font-semibold">{customer.company_name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Contacts</p>
                  <p className="text-2xl font-bold">{statistics.total_contacts}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Contacts</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.active_contacts}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Departments</p>
                  <p className="text-2xl font-bold">{Object.keys(statistics.department_breakdown || {}).length}</p>
                </div>
                <Building2 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Primary Contacts</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Object.values(statistics.department_breakdown || {}).reduce((sum: number, dept: any) => sum + (dept.primary || 0), 0)}
                  </p>
                </div>
                <Crown className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment} className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
          {departments.map((dept) => (
            <TabsTrigger key={dept.key} value={dept.key} className="text-xs">
              <dept.icon className="w-3 h-3 mr-1" />
              {dept.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {departments.map((dept) => (
          <TabsContent key={dept.key} value={dept.key} className="mt-6">
            <B2BContactList
              contacts={dept.key === 'all' ? contacts : { [dept.key]: contacts[dept.key] || [] }}
              onEdit={setEditingContact}
              onDelete={handleDeleteContact}
              loading={loading}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Add Contact Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Contact Person</DialogTitle>
          </DialogHeader>
          <B2BContactForm
            onSubmit={handleAddContact}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={!!editingContact} onOpenChange={() => setEditingContact(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact Person</DialogTitle>
          </DialogHeader>
          {editingContact && (
            <B2BContactForm
              contact={editingContact}
              onSubmit={(data) => handleEditContact(editingContact.id, data)}
              onCancel={() => setEditingContact(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
