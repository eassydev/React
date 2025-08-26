'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileImage, 
  Search, 
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Building,
  Image as ImageIcon,
  Video,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { fetchAllServiceAttachments, ServiceAttachment } from '@/lib/api';

export default function ServiceAttachmentsPage() {
  const [attachments, setAttachments] = useState<ServiceAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  
  // Filters
  const [filters, setFilters] = useState({
    type: '',
    providerId: '',
    customerId: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    fetchAttachments();
  }, [currentPage, filters]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      };

      const result = await fetchAllServiceAttachments(params);
      if (result.success) {
        setAttachments(result.data.attachments || []);
        setTotalCount(result.data.total || 0);
      } else {
        throw new Error(result.message || 'Failed to fetch attachments');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load service attachments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      providerId: '',
      customerId: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      search: ''
    });
    setCurrentPage(1);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAttachmentIcon = (type: string, mimeType: string) => {
    if (type.includes('video') || mimeType.startsWith('video/')) {
      return <Video className="h-4 w-4" />;
    }
    return <ImageIcon className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'before_image':
        return 'bg-blue-100 text-blue-800';
      case 'after_image':
        return 'bg-green-100 text-green-800';
      case 'before_video':
        return 'bg-purple-100 text-purple-800';
      case 'after_video':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service Attachments</h1>
          <p className="text-gray-600">Manage all B2B service before/after images and videos</p>
        </div>
        <Button onClick={fetchAttachments} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by filename..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="type">Attachment Type</Label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="before_image">Before Images</SelectItem>
                  <SelectItem value="after_image">After Images</SelectItem>
                  <SelectItem value="before_video">Before Videos</SelectItem>
                  <SelectItem value="after_video">After Videos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={fetchAttachments} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Attachments ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : attachments.length === 0 ? (
            <Alert>
              <FileImage className="h-4 w-4" />
              <AlertDescription>
                No service attachments found matching your criteria.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {attachments.map((attachment) => (
                  <Card key={attachment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getAttachmentIcon(attachment.type, attachment.mimeType)}
                          <Badge className={getTypeColor(attachment.type)}>
                            {attachment.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        {attachment.isArchived && (
                          <Badge variant="secondary">Archived</Badge>
                        )}
                      </div>

                      <h4 className="font-medium text-sm mb-2 truncate" title={attachment.fileName}>
                        {attachment.fileName}
                      </h4>

                      <div className="text-xs text-gray-500 space-y-1 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(attachment.uploadedAt)}
                        </div>
                        <div>{formatFileSize(attachment.fileSize)}</div>
                        {attachment.uploadedBy && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            <span className="truncate">{attachment.uploadedBy.companyName}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(attachment.downloadUrl, '_blank')}
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => window.open(attachment.downloadUrl, '_blank')}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm">
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
    </div>
  );
}
