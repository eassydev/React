'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  Calendar,
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
  Star,
  Plus,
  Eye,
  Send,
  Edit
} from 'lucide-react';

interface SPOCDashboardData {
  spoc_info: {
    id: string;
    name: string;
    email: string;
    total_clients: number;
    total_revenue: number;
    average_health_score: number;
    pending_payments: number;
  };
  clients: ClientData[];
  summary: {
    total_clients: number;
    active_clients: number;
    at_risk_clients: number;
    total_revenue: number;
    pending_payments_count: number;
  };
}

interface ClientData {
  assignment: any;
  customer: {
    id: string;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
  };
  statistics: {
    health_score: number;
    total_orders: number;
    total_revenue: number;
    pending_payments: number;
    overdue_payments: number;
  };
  recent_activity: any[];
}

export const SPOCDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<SPOCDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('admin-auth-token');
      const response = await fetch('/api/admin/b2b/spoc/dashboard', {
        headers: {
          'admin-auth-token': token || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error(data.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>No dashboard data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SPOC Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, <span className="font-semibold">{dashboardData.spoc_info.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadDashboardData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Clients</p>
                <p className="text-2xl font-bold">{dashboardData.spoc_info.total_clients}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(dashboardData.spoc_info.total_revenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Health Score</p>
                <p className={`text-2xl font-bold ${getHealthScoreColor(dashboardData.spoc_info.average_health_score)}`}>
                  {dashboardData.spoc_info.average_health_score}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardData.spoc_info.pending_payments}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Portfolio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            My Client Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {dashboardData.clients.map((client) => (
              <Card key={client.customer.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {client.customer.company_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {client.customer.contact_person}
                      </p>
                    </div>
                    <Badge className={getHealthScoreBadge(client.statistics.health_score)}>
                      {client.statistics.health_score}%
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {client.customer.email}
                    </div>
                    {client.customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {client.customer.phone}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="font-medium text-blue-900">{client.statistics.total_orders}</p>
                      <p className="text-xs text-blue-600">Orders</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="font-medium text-green-900">
                        {formatCurrency(client.statistics.total_revenue)}
                      </p>
                      <p className="text-xs text-green-600">Revenue</p>
                    </div>
                  </div>

                  {(client.statistics.pending_payments > 0 || client.statistics.overdue_payments > 0) && (
                    <div className="mb-4">
                      <Alert variant="destructive" className="py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {client.statistics.pending_payments} pending, {client.statistics.overdue_payments} overdue payments
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedClient(client)}>
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Plus className="w-6 h-6" />
              <span className="text-sm">Create Order</span>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <FileText className="w-6 h-6" />
              <span className="text-sm">Send Quotation</span>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <CreditCard className="w-6 h-6" />
              <span className="text-sm">Payment Reminder</span>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Send className="w-6 h-6" />
              <span className="text-sm">Send Communication</span>
            </Button>
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
            {dashboardData.clients
              .flatMap(client => 
                client.recent_activity.map(activity => ({
                  ...activity,
                  client_name: client.customer.company_name
                }))
              )
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 5)
              .map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.service_name}</p>
                    <p className="text-sm text-gray-600">
                      {activity.client_name} • {formatCurrency(activity.total_amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {activity.status}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
