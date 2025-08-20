'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Crown,
  Shield,
  Target,
  BarChart3,
  TrendingUp,
  Award,
  Building2,
  Star,
  Clock,
  User
} from 'lucide-react';

interface SPOCAssignment {
  id: string;
  spoc_type: 'primary' | 'backup' | 'technical' | 'accounts' | 'sales' | 'manager';
  function_area: string[];
  is_active: boolean;
  priority_order: number;
  client_satisfaction_score: number;
  last_interaction_date: string;
  notes: string;
  customer: {
    id: string;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
  };
  spocUser: {
    id: string;
    username: string;
    email: string;
    full_name: string;
  };
}

interface B2BSPOCListProps {
  assignments: SPOCAssignment[];
  onEdit: (assignment: SPOCAssignment) => void;
  onDeactivate: (assignmentId: string, reason: string) => void;
  loading: boolean;
}

export const B2BSPOCList: React.FC<B2BSPOCListProps> = ({
  assignments,
  onEdit,
  onDeactivate,
  loading
}) => {
  const getSpocTypeIcon = (type: string) => {
    switch (type) {
      case 'primary': return Crown;
      case 'backup': return Shield;
      case 'technical': return Target;
      case 'accounts': return BarChart3;
      case 'sales': return TrendingUp;
      case 'manager': return Award;
      default: return User;
    }
  };

  const getSpocTypeColor = (type: string) => {
    switch (type) {
      case 'primary': return 'bg-red-100 text-red-800';
      case 'backup': return 'bg-blue-100 text-blue-800';
      case 'technical': return 'bg-green-100 text-green-800';
      case 'accounts': return 'bg-yellow-100 text-yellow-800';
      case 'sales': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDeactivate = (assignmentId: string) => {
    const reason = prompt('Please provide a reason for deactivating this SPOC assignment:');
    if (reason) {
      onDeactivate(assignmentId, reason);
    }
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

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No SPOC assignments found</h3>
          <p className="text-gray-600">
            No SPOC assignments have been created yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {assignments.map((assignment) => {
        const SpocIcon = getSpocTypeIcon(assignment.spoc_type);
        
        return (
          <Card key={assignment.id} className={`transition-all hover:shadow-md ${!assignment.is_active ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {getInitials(assignment.spocUser.full_name || assignment.spocUser.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {assignment.spocUser.full_name || assignment.spocUser.username}
                    </h4>
                    <p className="text-sm text-gray-600">{assignment.spocUser.email}</p>
                  </div>
                </div>
                
                <Badge className={getSpocTypeColor(assignment.spoc_type)}>
                  <SpocIcon className="w-3 h-3 mr-1" />
                  <span className="capitalize">{assignment.spoc_type}</span>
                </Badge>
              </div>

              {/* Client Information */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <h5 className="font-medium text-gray-900">{assignment.customer.company_name}</h5>
                </div>
                <p className="text-sm text-gray-600">
                  Contact: {assignment.customer.contact_person}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {assignment.customer.email}
                  </div>
                  {assignment.customer.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {assignment.customer.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Function Areas */}
              <div className="mb-4">
                <h6 className="text-sm font-medium text-gray-700 mb-2">Function Areas:</h6>
                <div className="flex flex-wrap gap-1">
                  {assignment.function_area.map((area) => (
                    <Badge key={area} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="flex items-center justify-center gap-1 text-blue-600">
                    <Star className="w-4 h-4" />
                    <span className="font-medium">
                      {assignment.client_satisfaction_score ? assignment.client_satisfaction_score.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Satisfaction</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="flex items-center justify-center gap-1 text-green-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">#{assignment.priority_order}</span>
                  </div>
                  <p className="text-xs text-gray-600">Priority</p>
                </div>
              </div>

              {/* Last Interaction */}
              {assignment.last_interaction_date && (
                <div className="mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Last interaction: {formatDate(assignment.last_interaction_date)}</span>
                  </div>
                </div>
              )}

              {/* Notes */}
              {assignment.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {assignment.notes.length > 100 
                      ? `${assignment.notes.substring(0, 100)}...` 
                      : assignment.notes
                    }
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(assignment)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeactivate(assignment.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Deactivate
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
