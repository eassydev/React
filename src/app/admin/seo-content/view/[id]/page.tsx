'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Edit, 
  Globe, 
  FileText, 
  Tag, 
  Calendar,
  Eye,
  ExternalLink
} from 'lucide-react';
import {
  fetchSEOContentById,
  SEOContent,
  FAQItem,
} from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const ViewSEOContentPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [seoContent, setSeoContent] = useState<SEOContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch SEO content data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const content = await fetchSEOContentById(id);
        setSeoContent(content);
      } catch (error: any) {
        toast({
          variant: 'error',
          title: 'Error',
          description: error.message || 'Failed to fetch SEO content.',
        });
        router.push('/admin/seo-content');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, router, toast]);

  // Format date
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!seoContent) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Content Not Found</h2>
            <p className="text-gray-600 mt-2">The requested SEO content could not be found.</p>
            <Link href="/admin/seo-content">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to SEO Content
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/seo-content">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to SEO Content
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{seoContent.title}</h1>
              <p className="text-gray-600 mt-1">View SEO content details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/admin/seo-content/edit/${id}`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Content
              </Button>
            </Link>
          </div>
        </div>

        {/* Status and Meta Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Content Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <Badge
                  variant={seoContent.is_active ? 'default' : 'secondary'}
                  className={seoContent.is_active ? 'bg-green-100 text-green-800' : ''}
                >
                  {seoContent.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              {seoContent.service_type && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Service Type</p>
                  <Badge 
                    variant="outline" 
                    className={getServiceTypeBadgeColor(seoContent.service_type)}
                  >
                    {seoContent.service_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
              )}
              
              {seoContent.content_type && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Content Type</p>
                  <Badge 
                    variant="outline" 
                    className={getContentTypeBadgeColor(seoContent.content_type)}
                  >
                    {seoContent.content_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-600">Target Audience</p>
                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                  {seoContent.target_audience?.charAt(0).toUpperCase() + seoContent.target_audience?.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-600">URL Slug</p>
                <p className="text-sm text-gray-900 font-mono">/{seoContent.slug}</p>
              </div>
              
              {seoContent.sort_order !== undefined && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Sort Order</p>
                  <p className="text-sm text-gray-900">{seoContent.sort_order}</p>
                </div>
              )}
              
              {seoContent.is_featured && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Featured</p>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Featured Content
                  </Badge>
                </div>
              )}
            </div>

            {(seoContent.created_at || seoContent.updated_at) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {seoContent.created_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created</p>
                    <p className="text-sm text-gray-900">{formatDate(seoContent.created_at)}</p>
                  </div>
                )}
                
                {seoContent.updated_at && seoContent.updated_at !== seoContent.created_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Updated</p>
                    <p className="text-sm text-gray-900">{formatDate(seoContent.updated_at)}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEO Meta Information */}
        {(seoContent.meta_title || seoContent.meta_description || seoContent.meta_keywords) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SEO Meta Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {seoContent.meta_title && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Meta Title</p>
                  <p className="text-sm text-gray-900">{seoContent.meta_title}</p>
                  <p className="text-xs text-gray-500">{seoContent.meta_title.length} characters</p>
                </div>
              )}
              
              {seoContent.meta_description && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Meta Description</p>
                  <p className="text-sm text-gray-900">{seoContent.meta_description}</p>
                  <p className="text-xs text-gray-500">{seoContent.meta_description.length} characters</p>
                </div>
              )}
              
              {seoContent.meta_keywords && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Meta Keywords</p>
                  <p className="text-sm text-gray-900">{seoContent.meta_keywords}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Content Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: seoContent.content }}
            />
          </CardContent>
        </Card>

        {/* FAQ Display - Only show for FAQ content type with FAQ items */}
        {seoContent.content_type === 'faq' && seoContent.faq_items && seoContent.faq_items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                FAQ Questions & Answers ({seoContent.faq_items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {seoContent.faq_items.map((faq, index) => (
                  <div key={index} className="border-l-4 border-l-blue-500 pl-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Q{index + 1}: {faq.question}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={faq.is_active ? 'default' : 'secondary'}
                          className={faq.is_active ? 'bg-green-100 text-green-800' : ''}
                        >
                          {faq.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {faq.sort_order !== undefined && (
                          <span className="text-xs text-gray-500">
                            Order: {faq.sort_order}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ViewSEOContentPage;
