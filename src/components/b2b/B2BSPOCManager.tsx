'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck,
  Crown,
  Shield,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Building2,
  Star,
  Clock,
  Target,
  Award
} from 'lucide-react';
import { B2BSPOCForm } from './B2BSPOCForm';
import { B2BSPOCList } from './B2BSPOCList';
import { B2BSPOCWorkloadChart } from './B2BSPOCWorkloadChart';
import { B2BSPOCTableView } from './B2BSPOCTableView';
import { tokenUtils } from '@/lib/utils'; // ✅ FIXED: Import existing tokenUtils

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

interface SPOCWorkload {
  spoc_user: {
    id: string;
    username: string;
    full_name: string;
    email: string;
  };
  total_assignments: number;
  assignments_by_type: {
    [key: string]: number;
  };
}

interface B2BSPOCManagerProps {
  onClose?: () => void;
}

export const B2BSPOCManager: React.FC<B2BSPOCManagerProps> = ({ onClose }) => {
  const [assignments, setAssignments] = useState<SPOCAssignment[]>([]);
  const [workloadData, setWorkloadData] = useState<SPOCWorkload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('assignments');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<SPOCAssignment | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table'); // ✅ Default to table view for better scalability
  const [statistics, setStatistics] = useState<any>(null);

  // ✅ Add role detection for UI restrictions
  // ✅ FIXED: Use SPOC hardcoded system instead of database permissions
  const [userRole, setUserRole] = useState<string | null>(null);
  const [adminInfo, setAdminInfo] = useState<any>(null);

  // Get admin info from localStorage (set during login)
  useEffect(() => {
    const storedAdminInfo = localStorage.getItem('adminInfo');
    console.log('🔍 SPOC Manager - stored admin info:', storedAdminInfo);

    if (storedAdminInfo) {
      try {
        const parsed = JSON.parse(storedAdminInfo);
        console.log('🔍 SPOC Manager - parsed admin info:', parsed);
        setAdminInfo(parsed);
        setUserRole(parsed.role);
      } catch (error) {
        console.error('❌ Error parsing admin info:', error);
      }
    }
  }, []);

  // ✅ SPOC hardcoded permission logic (matches backend spocAuth.js)
  const canManageSpocs = userRole === 'super_admin' || userRole === 'manager';

  console.log('🔍 SPOC Manager Debug:', {
    userRole,
    canManageSpocs,
    adminInfo: adminInfo ? 'Present' : 'Missing'
  });

  // SPOC type configuration
  const spocTypes = [
    { key: 'primary', label: 'Primary', icon: Crown, color: 'bg-red-100 text-red-800' },
    { key: 'backup', label: 'Backup', icon: Shield, color: 'bg-blue-100 text-blue-800' },
    { key: 'technical', label: 'Technical', icon: Target, color: 'bg-green-100 text-green-800' },
    { key: 'accounts', label: 'Accounts', icon: BarChart3, color: 'bg-yellow-100 text-yellow-800' },
    { key: 'sales', label: 'Sales', icon: TrendingUp, color: 'bg-purple-100 text-purple-800' },
    { key: 'manager', label: 'Manager', icon: Award, color: 'bg-orange-100 text-orange-800' }
  ];

  // Load data on component mount
  useEffect(() => {
    loadAssignments();
    loadWorkloadData();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = tokenUtils.get(); // ✅ FIXED: Use existing tokenUtils
      console.log('🔍 Loading SPOC assignments with token:', token ? 'Present' : 'Missing');

      const response = await fetch('/admin-api/b2b/spoc/assignments', {
        headers: {
          'admin-auth-token': token || '',
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 SPOC assignments response:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔍 SPOC assignments error:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to load SPOC assignments`);
      }

      const data = await response.json();
      console.log('🔍 SPOC assignments data:', data);

      if (data.success) {
        setAssignments(data.data.assignments || []);
        setStatistics(data.data.summary || {});
      } else {
        throw new Error(data.message || 'Failed to load SPOC assignments');
      }
    } catch (err) {
      console.error('❌ Error loading assignments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkloadData = async () => {
    try {
      const token = tokenUtils.get(); // ✅ FIXED: Use existing tokenUtils
      console.log('🔍 Loading SPOC workload with token:', token ? 'Present' : 'Missing');

      const response = await fetch('/admin-api/b2b/spoc/workload', {
        headers: {
          'admin-auth-token': token || '',
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 SPOC workload response:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 SPOC workload data:', data);

        if (data.success) {
          setWorkloadData(data.data.spoc_workloads || []);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔍 SPOC workload error:', errorData);
      }
    } catch (err) {
      console.error('❌ Error loading workload data:', err);
    }
  };

  const handleAddAssignment = async (assignmentData: Partial<SPOCAssignment>) => {
    try {
      const token = tokenUtils.get(); // ✅ FIXED: Use existing tokenUtils
      const response = await fetch('/admin-api/b2b/spoc/assignments', {
        method: 'POST',
        headers: {
          'admin-auth-token': token || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create SPOC assignment');
      }

      const data = await response.json();
      if (data.success) {
        setShowAddForm(false);
        await loadAssignments();
        await loadWorkloadData();
      } else {
        throw new Error(data.message || 'Failed to create SPOC assignment');
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError(err instanceof Error ? err.message : 'Failed to create assignment');
    }
  };

  const handleEditAssignment = async (assignmentId: string, assignmentData: Partial<SPOCAssignment>) => {
    try {
      const token = tokenUtils.get(); // ✅ FIXED: Use existing tokenUtils
      const response = await fetch(`/admin-api/b2b/spoc/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'admin-auth-token': token || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update SPOC assignment');
      }

      const data = await response.json();
      if (data.success) {
        setEditingAssignment(null);
        await loadAssignments();
        await loadWorkloadData();
      } else {
        throw new Error(data.message || 'Failed to update SPOC assignment');
      }
    } catch (err) {
      console.error('Error updating assignment:', err);
      setError(err instanceof Error ? err.message : 'Failed to update assignment');
    }
  };

  const handleDeactivateAssignment = async (assignmentId: string, reason: string) => {
    try {
      const token = tokenUtils.get(); // ✅ FIXED: Use existing tokenUtils
      const response = await fetch(`/admin-api/b2b/spoc/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'admin-auth-token': token || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to deactivate SPOC assignment');
      }

      const data = await response.json();
      if (data.success) {
        await loadAssignments();
        await loadWorkloadData();
      } else {
        throw new Error(data.message || 'Failed to deactivate SPOC assignment');
      }
    } catch (err) {
      console.error('Error deactivating assignment:', err);
      setError(err instanceof Error ? err.message : 'Failed to deactivate assignment');
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload <= 5) return 'text-green-600';
    if (workload <= 10) return 'text-yellow-600';
    if (workload <= 15) return 'text-orange-600';
    return 'text-red-600';
  };

  const getWorkloadProgress = (workload: number) => {
    const maxWorkload = 20; // Assuming 20 is the maximum reasonable workload
    return Math.min((workload / maxWorkload) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SPOC Management</h2>
          <p className="text-gray-600 mt-1">
            Manage Single Point of Contact assignments and workload distribution
          </p>
          {/* ✅ DEBUG: Show current user info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <strong>Debug:</strong> Role: {userRole || 'Unknown'} |
              Can Manage SPOCs: {canManageSpocs ? 'Yes' : 'No'} |
              System: SPOC Hardcoded
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* ✅ Hide "Assign SPOC" button for SPOC users */}
          {canManageSpocs && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Assign SPOC
            </Button>
          )}
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
                  <p className="text-sm text-gray-600">Total Assignments</p>
                  <p className="text-2xl font-bold">{statistics.total_assignments}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Assignments</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.active_assignments}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active SPOCs</p>
                  <p className="text-2xl font-bold">{workloadData.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Workload</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {workloadData.length > 0 
                      ? Math.round(workloadData.reduce((sum, spoc) => sum + spoc.total_assignments, 0) / workloadData.length)
                      : 0
                    }
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assignments">
            <Users className="w-4 h-4 mr-2" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="workload">
            <BarChart3 className="w-4 h-4 mr-2" />
            Workload Analysis
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="mt-6">
          <div className="space-y-4">
            {/* View Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Table View
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Card View
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                {assignments.length} total assignments
              </p>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'table' ? (
              <B2BSPOCTableView
                assignments={assignments}
                loading={loading}
                onEdit={setEditingAssignment}
                onDelete={handleDeactivateAssignment}
                onAdd={() => setShowAddForm(true)}
              />
            ) : (
              <B2BSPOCList
                assignments={assignments}
                onEdit={setEditingAssignment}
                onDeactivate={handleDeactivateAssignment}
                loading={loading}
              />
            )}
          </div>
        </TabsContent>

        {/* Workload Analysis Tab - Show 403 for SPOC users */}
        <TabsContent value="workload" className="mt-6">
          {canManageSpocs ? (
            <div className="space-y-6">
            {/* Workload Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {workloadData.map((spoc) => (
                <Card key={spoc.spoc_user.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{spoc.spoc_user.full_name || spoc.spoc_user.username}</CardTitle>
                        <p className="text-sm text-gray-600">{spoc.spoc_user.email}</p>
                      </div>
                      <Badge className={getWorkloadColor(spoc.total_assignments)}>
                        {spoc.total_assignments} clients
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Workload</span>
                          <span className={getWorkloadColor(spoc.total_assignments)}>
                            {spoc.total_assignments}/20
                          </span>
                        </div>
                        <Progress 
                          value={getWorkloadProgress(spoc.total_assignments)} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Assignment Types:</h4>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(spoc.assignments_by_type).map(([type, count]) => {
                            const spocType = spocTypes.find(st => st.key === type);
                            return (
                              <Badge key={type} variant="outline" className="text-xs">
                                {spocType && <spocType.icon className="w-3 h-3 mr-1" />}
                                {type}: {count}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Workload Chart */}
            {workloadData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Workload Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <B2BSPOCWorkloadChart data={workloadData} />
                </CardContent>
              </Card>
            )}
          </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600 mb-4">
                You don't have permission to view workload analysis.
              </p>
              <p className="text-sm text-gray-500">
                This feature is only available to managers and administrators.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Performance Tab - Available to all users (SPOCs see their own performance) */}
        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments
                    .filter(a => a.client_satisfaction_score)
                    .slice(0, 5)
                    .map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{assignment.spocUser.full_name || assignment.spocUser.username}</p>
                          <p className="text-sm text-gray-600">{assignment.customer.company_name}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{assignment.client_satisfaction_score.toFixed(1)}</span>
                          </div>
                          <p className="text-xs text-gray-500">Client Rating</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments
                    .filter(a => a.last_interaction_date)
                    .sort((a, b) => new Date(b.last_interaction_date).getTime() - new Date(a.last_interaction_date).getTime())
                    .slice(0, 5)
                    .map((assignment) => (
                      <div key={assignment.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium">{assignment.spocUser.full_name || assignment.spocUser.username}</p>
                          <p className="text-sm text-gray-600">
                            Interacted with {assignment.customer.company_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(assignment.last_interaction_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Assignment Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create SPOC Assignment</DialogTitle>
          </DialogHeader>
          <B2BSPOCForm
            onSubmit={handleAddAssignment}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog open={!!editingAssignment} onOpenChange={() => setEditingAssignment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit SPOC Assignment</DialogTitle>
          </DialogHeader>
          {editingAssignment && (
            <B2BSPOCForm
              assignment={editingAssignment}
              onSubmit={(data) => handleEditAssignment(editingAssignment.id, data)}
              onCancel={() => setEditingAssignment(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
