'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  FileText,
  Globe,
  Tag,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import {
  fetchSEOContent,
  deleteSEOContent,
  SEOContent as SEOContentType,
} from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SEOContentPage = (): JSX.Element => {
  const [seoContents, setSeoContents] = useState<SEOContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const pageSize = 100;

  // Fetch SEO content data
  const fetchData = async () => {
    try {
      setLoading(true);
      const isActiveFilter = statusFilter === 'all' ? undefined : statusFilter === 'active';

      console.log('Fetching SEO content with params:', {
        currentPage,
        pageSize,
        serviceTypeFilter,
        contentTypeFilter,
        isActiveFilter,
        searchTerm
      });

      const response = await fetchSEOContent(
        currentPage,
        pageSize,
        serviceTypeFilter,
        contentTypeFilter,
        isActiveFilter,
        searchTerm
      );

      

      // Handle both possible response structures
      if (response.message === "SEO content retrieved successfully" || response.status) {
        const data = response.data || [];
        setSeoContents(Array.isArray(data) ? data : []);

        // If no meta object, calculate from data length
        const dataLength = Array.isArray(data) ? data.length : 0;
        setTotalPages(response.meta?.total_pages || Math.ceil(dataLength / pageSize) || 1);
        setTotalItems(response.meta?.total || dataLength);
      } else {
        console.warn('Unexpected response structure:', response);
        setSeoContents([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error: any) {
      console.error('Error fetching SEO content:', error);
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to fetch SEO content.',
      });
      setSeoContents([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, serviceTypeFilter, contentTypeFilter, statusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await deleteSEOContent(deleteId);

      toast({
        variant: 'success',
        title: 'Success',
        description: 'SEO content deleted successfully.',
      });

      fetchData();
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to delete SEO content.',
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Format date
  const formatDate = (timestamp: string | number) => {
    // Handle both string and number timestamps
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get service type badge color
  const getServiceTypeBadgeColor = (serviceType: string) => {
    const colors: Record<string, string> = {
      'bathroom-cleaning': 'bg-blue-100 text-blue-800',
      'home-cleaning': 'bg-green-100 text-green-800',
      'sofa-cleaning': 'bg-purple-100 text-purple-800',
      'general': 'bg-gray-100 text-gray-800',
      'custom': 'bg-orange-100 text-orange-800',
    };
    return colors[serviceType] || 'bg-gray-100 text-gray-800';
  };

  // Get content type badge color
  const getContentTypeBadgeColor = (contentType: string) => {
    const colors: Record<string, string> = {
      'service-page': 'bg-indigo-100 text-indigo-800',
      'landing-page': 'bg-pink-100 text-pink-800',
      'blog-post': 'bg-yellow-100 text-yellow-800',
      'faq': 'bg-cyan-100 text-cyan-800',
      'general': 'bg-gray-100 text-gray-800',
    };
    return colors[contentType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SEO Content Management</h1>
            <p className="text-gray-600 mt-1">
              Manage SEO content for services, landing pages, and more
            </p>
          </div>
          <Link href="/admin/seo-content/add">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add SEO Content
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by title, slug, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Service Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Service Types</SelectItem>
                    <SelectItem value="bathroom-cleaning">Bathroom Cleaning</SelectItem>
                    <SelectItem value="home-cleaning">Home Cleaning</SelectItem>
                    <SelectItem value="sofa-cleaning">Sofa Cleaning</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Content Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Content Types</SelectItem>
                    <SelectItem value="service-page">Service Page</SelectItem>
                    <SelectItem value="landing-page">Landing Page</SelectItem>
                    <SelectItem value="blog-post">Blog Post</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Content</p>
                  <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Globe className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Content</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {seoContents.filter(content => content.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Tag className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Service Pages</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {seoContents.filter(content => content.content_type === 'service-page').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {seoContents.filter(content => {
                      const contentDate = new Date(content.created_at || '');
                      const currentDate = new Date();
                      return contentDate.getMonth() === currentDate.getMonth() &&
                             contentDate.getFullYear() === currentDate.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content List */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Content ({totalItems})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : seoContents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No SEO content found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first SEO content.
                </p>
                <div className="mt-6">
                  <Link href="/admin/seo-content/add">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add SEO Content
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {seoContents.map((content) => (
                  <div
                    key={content.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {content.title}
                          </h3>
                          <Badge
                            variant={content.is_active ? 'default' : 'secondary'}
                            className={content.is_active ? 'bg-green-100 text-green-800' : ''}
                          >
                            {content.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {content.is_featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Featured
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {content.service_type && content.service_type.trim() !== '' && (
                            <Badge
                              variant="outline"
                              className={getServiceTypeBadgeColor(content.service_type)}
                            >
                              {content.service_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          )}
                          {content.content_type && content.content_type.trim() !== '' && (
                            <Badge
                              variant="outline"
                              className={getContentTypeBadgeColor(content.content_type)}
                            >
                              {content.content_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          )}
                          {content.target_audience && content.target_audience.trim() !== '' && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">
                              {content.target_audience.charAt(0).toUpperCase() + content.target_audience.slice(1)}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Slug:</span> /{content.slug}
                        </p>

                        {(content.meta_description || content.description) && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            <span className="font-medium">Meta Description:</span> {content.meta_description || content.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Created: {formatDate(content.created_at || '')}</span>
                          {content.updated_at && content.updated_at !== content.created_at && (
                            <span>Updated: {formatDate(content.updated_at)}</span>
                          )}
                          {content.sort_order && (
                            <span>Order: {content.sort_order}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/seo-content/view/${content.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/seo-content/edit/${content.id}`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(content.id || '')}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the SEO content
                and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default SEOContentPage;