'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  HardDrive, 
  Archive, 
  Trash2, 
  Settings, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  FileImage,
  Play,
  Pause
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileLifecycleStatus {
  service: {
    isRunning: boolean;
    lastRunTime: string | null;
    stats: {
      totalProcessed: number;
      archived: number;
      deleted: number;
      errors: number;
    };
  };
  database: {
    totalFiles: number;
    archivedFiles: number;
    totalSizeBytes: number;
    avgFileSizeBytes: number;
  };
  ageDistribution: {
    recent: number;
    eligible: number;
    archived: number;
    deletion: number;
  };
  recommendations: Array<{
    type: string;
    priority: string;
    message: string;
  }>;
}

export default function FileLifecyclePage() {
  const [status, setStatus] = useState<FileLifecycleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [config, setConfig] = useState({
    archiveAfterMonths: 6,
    deleteAfterMonths: 24,
    deepArchiveAfterMonths: 12,
    enableAutoCleanup: true
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/admin-api/b2b/file-lifecycle/status', {
        headers: {
          'admin-auth-token': localStorage.getItem('token') || '',
        },
      });

      const result = await response.json();
      if (result.success) {
        setStatus(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch status');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load file lifecycle status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerCleanup = async (type: string, dryRun: boolean = false) => {
    try {
      setOperationLoading(true);
      const response = await fetch('/admin-api/b2b/file-lifecycle/cleanup', {
        method: 'POST',
        headers: {
          'admin-auth-token': localStorage.getItem('token') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, dryRun }),
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        await fetchStatus(); // Refresh status
      } else {
        throw new Error(result.message || 'Cleanup operation failed');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to trigger cleanup',
        variant: 'destructive',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const updateConfiguration = async () => {
    try {
      const response = await fetch('/admin-api/b2b/file-lifecycle/configuration', {
        method: 'PUT',
        headers: {
          'admin-auth-token': localStorage.getItem('token') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Configuration updated successfully',
        });
      } else {
        throw new Error(result.message || 'Failed to update configuration');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update configuration',
        variant: 'destructive',
      });
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load file lifecycle status. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">File Lifecycle Management</h1>
          <p className="text-gray-600">Automated cleanup and archiving of service attachments</p>
        </div>
        <Button onClick={fetchStatus} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {status.service.isRunning ? (
                <Play className="h-5 w-5 text-green-500" />
              ) : (
                <Pause className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium">Service Status</p>
                <p className="text-xs text-gray-500">
                  {status.service.isRunning ? 'Running' : 'Idle'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Last Run</p>
                <p className="text-xs text-gray-500">
                  {formatDate(status.service.lastRunTime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileImage className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Total Files</p>
                <p className="text-xs text-gray-500">
                  {status.database.totalFiles.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Total Size</p>
                <p className="text-xs text-gray-500">
                  {formatBytes(status.database.totalSizeBytes)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              File Age Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Recent (&lt; 6 months)</span>
                  <span>{status.ageDistribution.recent}</span>
                </div>
                <Progress 
                  value={(status.ageDistribution.recent / status.database.totalFiles) * 100} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Eligible for Archive</span>
                  <span>{status.ageDistribution.eligible}</span>
                </div>
                <Progress 
                  value={(status.ageDistribution.eligible / status.database.totalFiles) * 100} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Archived</span>
                  <span>{status.ageDistribution.archived}</span>
                </div>
                <Progress 
                  value={(status.ageDistribution.archived / status.database.totalFiles) * 100} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Eligible for Deletion</span>
                  <span>{status.ageDistribution.deletion}</span>
                </div>
                <Progress 
                  value={(status.ageDistribution.deletion / status.database.totalFiles) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status.recommendations.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">No immediate actions required</span>
              </div>
            ) : (
              <div className="space-y-3">
                {status.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority.toUpperCase()}
                    </Badge>
                    <p className="text-sm flex-1">{rec.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manual Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => triggerCleanup('archive', true)}
              disabled={operationLoading}
              variant="outline"
            >
              <Archive className="h-4 w-4 mr-2" />
              Preview Archive
            </Button>
            
            <Button
              onClick={() => triggerCleanup('archive')}
              disabled={operationLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Archive className="h-4 w-4 mr-2" />
              Run Archive
            </Button>
            
            <Button
              onClick={() => triggerCleanup('delete')}
              disabled={operationLoading}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Run Deletion
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>• Preview operations show what would be affected without making changes</p>
            <p>• Archive moves old files to cheaper storage tiers</p>
            <p>• Deletion permanently removes very old files (configurable age)</p>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="archiveAfter">Archive After (months)</Label>
              <Input
                id="archiveAfter"
                type="number"
                value={config.archiveAfterMonths}
                onChange={(e) => setConfig(prev => ({ ...prev, archiveAfterMonths: parseInt(e.target.value) }))}
                min="1"
                max="12"
              />
            </div>
            
            <div>
              <Label htmlFor="deleteAfter">Delete After (months)</Label>
              <Input
                id="deleteAfter"
                type="number"
                value={config.deleteAfterMonths}
                onChange={(e) => setConfig(prev => ({ ...prev, deleteAfterMonths: parseInt(e.target.value) }))}
                min="12"
                max="60"
              />
            </div>
            
            <div>
              <Label htmlFor="deepArchive">Deep Archive After (months)</Label>
              <Input
                id="deepArchive"
                type="number"
                value={config.deepArchiveAfterMonths}
                onChange={(e) => setConfig(prev => ({ ...prev, deepArchiveAfterMonths: parseInt(e.target.value) }))}
                min="6"
                max="24"
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={updateConfiguration} className="w-full">
                Update Config
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
