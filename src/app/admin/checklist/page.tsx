'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Eye,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  FileText,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import {
  fetchChecklists,
  fetchChecklistAnalytics,
  ChecklistItem,
  ChecklistAnalytics
} from '@/lib/api';

// Interfaces are now imported from api.tsx

export default function ChecklistManagement() {
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [analytics, setAnalytics] = useState<ChecklistAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAnalyticsData();
    fetchChecklistsData();
  }, [currentPage, searchTerm, filterType]);

  const fetchAnalyticsData = async () => {
    try {
      const analyticsData = await fetchChecklistAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchChecklistsData = async () => {
    try {
      setLoading(true);
      const checklistsData = await fetchChecklists(
        currentPage,
        10,
        filterType || undefined,
        undefined,
        undefined
      );

      console.log('🔍 Checklist data received:', checklistsData);
      console.log('🔍 First checklist:', checklistsData.checklists?.[0]);
      console.log('🔍 First checklist provider:', checklistsData.checklists?.[0]?.provider);

      setChecklists(checklistsData.checklists);
      setTotalPages(checklistsData.totalPages);
    } catch (error) {
      console.error('Error fetching checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (stats: ChecklistStats) => {
    if (stats.isCompleted) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
    } else if (stats.answeredQuestions > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checklist Management</h1>
            <p className="text-gray-600 mt-1">Manage provider checklists and monitor completion status</p>
          </div>
          <div className="flex space-x-2">
            <Link href="/admin/checklist/questions">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Manage Questions
              </Button>
            </Link>
            <Link href="/admin/checklist/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Checklist
              </Button>
            </Link>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Checklists</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalChecklists}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.completedChecklists}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{analytics.pendingChecklists}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.averageCompletionRate}%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by provider name or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="pre">Pre-Service</option>
                  <option value="post">Post-Service</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklists Table */}
        <Card>
          <CardHeader>
            <CardTitle>Checklists</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : checklists.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No checklists found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Provider</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Progress</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checklists.map((checklist) => (
                      <tr key={checklist.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                             <p className="text-sm text-gray-500">
                              {`${checklist.provider?.first_name || ''} ${checklist.provider?.last_name || ''}`.trim() || checklist.provider?.phone || 'N/A'}
                            </p>
                            <p className="font-medium text-gray-900">
                              {checklist.provider?.phone || 'N/A'}
                            </p>
                           
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{checklist.checklist_type}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${checklist.stats.completionPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {checklist.stats.answeredQuestions}/{checklist.stats.totalQuestions}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(checklist.stats)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(checklist.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/admin/checklist/${checklist.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
