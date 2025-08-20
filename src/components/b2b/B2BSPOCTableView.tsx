'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import usePermissions from '@/hooks/usePermissions'; // ✅ Add role detection
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Plus, 
  Users, 
  Building2,
  Crown,
  Shield,
  Wrench,
  Calculator,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { tokenUtils } from '@/lib/utils';

interface SPOCAssignment {
  id: string;
  b2b_customer_id: string;
  spoc_user_id: string;
  spoc_type: 'primary' | 'backup' | 'technical' | 'accounts' | 'sales' | 'manager';
  function_area: string[];
  assigned_date: string;
  assigned_by: string;
  is_active: boolean;
  priority_order: number;
  notification_preferences: {
    new_orders: boolean;
    quotation_requests: boolean;
    payment_issues: boolean;
    service_escalations: boolean;
    client_communications: boolean;
  };
  contact_email: string;
  contact_phone: string;
  client_satisfaction_score: number;
  last_interaction_date: string;
  notes: string;
  special_instructions: string;
  created_at: string;
  updated_at: string;
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

interface B2BSPOCTableViewProps {
  assignments: SPOCAssignment[];
  loading?: boolean;
  onEdit: (assignment: SPOCAssignment) => void;
  onDelete: (assignmentId: string) => void;
  onAdd: () => void;
}

export const B2BSPOCTableView: React.FC<B2BSPOCTableViewProps> = ({
  assignments = [],
  loading = false,
  onEdit,
  onDelete,
  onAdd
}) => {
  const [error, setError] = useState<string | null>(null);

  // ✅ Add role detection for UI restrictions
  const { getRole, isSuperAdmin } = usePermissions();
  const userRole = getRole();
  const canManageSpocs = isSuperAdmin() || userRole === 'super_admin' || userRole === 'manager';
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [spocFilter, setSpocFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Data is now received as props, no need to fetch

  // Get unique SPOC users for filter dropdown (with safety check)
  const uniqueSpocs = Array.isArray(assignments) ? Array.from(
    new Set(assignments.map(a => a.spocUser?.username).filter(Boolean))
  ).map(username => {
    const spoc = assignments.find(a => a.spocUser?.username === username)?.spocUser;
    return { username, full_name: spoc?.full_name || username };
  }) : [];

  // Filter assignments (with safety check)
  const filteredAssignments = Array.isArray(assignments) ? assignments.filter(assignment => {
    const matchesSearch =
      assignment.customer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.spocUser?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.customer?.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpoc = spocFilter === 'all' || assignment.spocUser?.username === spocFilter;
    const matchesType = typeFilter === 'all' || assignment.spoc_type === typeFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && assignment.is_active) ||
      (statusFilter === 'inactive' && !assignment.is_active);

    return matchesSearch && matchesSpoc && matchesType && matchesStatus;
  }) : [];

  // Pagination
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssignments = filteredAssignments.slice(startIndex, startIndex + itemsPerPage);

  const getSPOCTypeIcon = (type: string) => {
    switch (type) {
      case 'primary': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'backup': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'technical': return <Wrench className="w-4 h-4 text-green-600" />;
      case 'accounts': return <Calculator className="w-4 h-4 text-purple-600" />;
      case 'sales': return <TrendingUp className="w-4 h-4 text-orange-600" />;
      case 'manager': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSPOCTypeBadge = (type: string) => {
    const colors = {
      primary: 'bg-yellow-100 text-yellow-800',
      backup: 'bg-blue-100 text-blue-800',
      technical: 'bg-green-100 text-green-800',
      accounts: 'bg-purple-100 text-purple-800',
      sales: 'bg-orange-100 text-orange-800',
      manager: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={`${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'} capitalize`}>
        {getSPOCTypeIcon(type)}
        <span className="ml-1">{type}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading SPOC assignments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-red-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            SPOC Assignments ({filteredAssignments.length})
          </CardTitle>
          {/* ✅ Hide "Add Assignment" button for SPOC users */}
          {canManageSpocs && (
            <Button onClick={onAdd} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Assignment
            </Button>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search customers, SPOCs, contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={spocFilter} onValueChange={setSpocFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by SPOC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All SPOCs</SelectItem>
              {uniqueSpocs.map(spoc => (
                <SelectItem key={spoc.username} value={spoc.username}>
                  {spoc.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="backup">Backup</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="accounts">Accounts</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {paginatedAssignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No SPOC assignments found</p>
            {searchTerm && (
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            )}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>SPOC User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Function Areas</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{assignment.customer.company_name}</p>
                          <p className="text-sm text-gray-500">{assignment.customer.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{assignment.customer.contact_person}</p>
                        <p className="text-sm text-gray-500">{assignment.customer.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{assignment.spocUser.full_name}</p>
                          <p className="text-sm text-gray-500">{assignment.spocUser.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSPOCTypeBadge(assignment.spoc_type)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {assignment.function_area.map((area) => (
                          <Badge key={area} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(assignment.assigned_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={assignment.is_active ? "default" : "secondary"}>
                        {assignment.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(assignment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {/* ✅ Hide delete button for SPOC users */}
                        {canManageSpocs && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(assignment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAssignments.length)} of {filteredAssignments.length} assignments
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};


