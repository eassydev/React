'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MessageSquare,
  Crown,
  Shield,
  User,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Building2
} from 'lucide-react';

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

interface B2BContactListProps {
  contacts: ContactsByDepartment;
  onEdit: (contact: ContactPerson) => void;
  onDelete: (contactId: string) => void;
  loading: boolean;
}

export const B2BContactList: React.FC<B2BContactListProps> = ({
  contacts,
  onEdit,
  onDelete,
  loading
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'primary':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'secondary':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'tertiary':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'primary':
        return <Crown className="w-3 h-3" />;
      case 'secondary':
        return <Shield className="w-3 h-3" />;
      case 'tertiary':
        return <User className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getCommunicationIcon = (method: string) => {
    switch (method) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />;
      case 'all':
        return <Building2 className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (Object.keys(contacts).length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
          <p className="text-gray-600">
            No contacts have been added for this department yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(contacts).map(([department, departmentContacts]) => (
        <div key={department}>
          {Object.keys(contacts).length > 1 && (
            <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {department.replace(/_/g, ' ')} Department
              <Badge variant="outline" className="ml-2">
                {departmentContacts.length} contact{departmentContacts.length !== 1 ? 's' : ''}
              </Badge>
            </h3>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {departmentContacts.map((contact) => (
              <Card key={contact.id} className={`transition-all hover:shadow-md ${!contact.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          {contact.name}
                          {!contact.is_active && (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">{contact.designation || 'No designation'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(contact.contact_priority)}>
                        {getPriorityIcon(contact.contact_priority)}
                        <span className="ml-1 capitalize">{contact.contact_priority}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${contact.email}`} className="hover:text-blue-600">
                        {contact.email}
                      </a>
                    </div>
                    
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                          {contact.phone}
                        </a>
                      </div>
                    )}

                    {contact.whatsapp && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MessageSquare className="w-4 h-4" />
                        <a 
                          href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-green-600"
                        >
                          {contact.whatsapp}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Permissions & Roles */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {contact.is_decision_maker && (
                      <Badge variant="outline" className="text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Decision Maker
                      </Badge>
                    )}
                    {contact.can_approve_orders && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Order Approval
                      </Badge>
                    )}
                    {contact.can_approve_payments && (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Payment Approval
                      </Badge>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-1 mb-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      {getCommunicationIcon(contact.preferred_communication)}
                      <span>Prefers {contact.preferred_communication}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{contact.working_hours}</span>
                    </div>
                    {contact.last_contacted && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        <span>Last contacted: {formatDate(contact.last_contacted)}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {contact.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded text-ellipsis overflow-hidden">
                        {contact.notes.length > 100 
                          ? `${contact.notes.substring(0, 100)}...` 
                          : contact.notes
                        }
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(contact)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(contact.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
