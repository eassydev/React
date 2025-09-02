'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, FileText, ArrowLeft, Globe, Tag } from 'lucide-react';
import {
  updateSEOContent,
  fetchSEOContentById,
  SEOContent,
  FAQItem,
} from '@/lib/api';
import FAQEditor from '@/components/FAQEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

// Import React-Quill dynamically for client-side rendering
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Add custom styles for fonts
const customStyles = `
  .ql-editor {
    font-family: Arial, sans-serif;
  }
  .ql-font-arial {
    font-family: Arial, sans-serif !important;
  }
  .ql-font-georgia {
    font-family: Georgia, serif !important;
  }
  .ql-font-times {
    font-family: 'Times New Roman', serif !important;
  }
  .ql-font-courier {
    font-family: 'Courier New', monospace !important;
  }
  .ql-font-helvetica {
    font-family: Helvetica, sans-serif !important;
  }
  .ql-font-verdana {
    font-family: Verdana, sans-serif !important;
  }

  /* Dropdown labels */
  .ql-picker.ql-font .ql-picker-label[data-value="arial"]::before,
  .ql-picker.ql-font .ql-picker-item[data-value="arial"]::before {
    content: 'Arial';
  }
  .ql-picker.ql-font .ql-picker-label[data-value="georgia"]::before,
  .ql-picker.ql-font .ql-picker-item[data-value="georgia"]::before {
    content: 'Georgia';
  }
  .ql-picker.ql-font .ql-picker-label[data-value="times"]::before,
  .ql-picker.ql-font .ql-picker-item[data-value="times"]::before {
    content: 'Times New Roman';
  }
  .ql-picker.ql-font .ql-picker-label[data-value="courier"]::before,
  .ql-picker.ql-font .ql-picker-item[data-value="courier"]::before {
    content: 'Courier New';
  }
  .ql-picker.ql-font .ql-picker-label[data-value="helvetica"]::before,
  .ql-picker.ql-font .ql-picker-item[data-value="helvetica"]::before {
    content: 'Helvetica';
  }
  .ql-picker.ql-font .ql-picker-label[data-value="verdana"]::before,
  .ql-picker.ql-font .ql-picker-item[data-value="verdana"]::before {
    content: 'Verdana';
  }
`;

// Enhanced Quill modules configuration for SEO content
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: ['arial', 'georgia', 'times', 'courier', 'helvetica', 'verdana'] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

const quillFormats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'blockquote', 'code-block',
  'list', 'bullet', 'indent',
  'direction', 'align',
  'link', 'image', 'video'
];

const EditSEOContentPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [content, setContent] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [contentType, setContentType] = useState('');
  const [targetAudience, setTargetAudience] = useState('both');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Register custom fonts with Quill
  React.useEffect(() => {
    if (typeof window !== 'undefined' && ReactQuill) {
      const Quill = ReactQuill.Quill;
      if (Quill) {
        const Font = Quill.import('formats/font');
        Font.whitelist = ['arial', 'georgia', 'times', 'courier', 'helvetica', 'verdana'];
        Quill.register(Font, true);
      }
    }
  }, []);

  // Fetch SEO content data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const seoContent = await fetchSEOContentById(id);
        
        // Populate form fields
        setTitle(seoContent.title || '');
        setSlug(seoContent.slug || '');
        setMetaTitle(seoContent.meta_title || '');
        setMetaDescription(seoContent.meta_description || '');
        setMetaKeywords(seoContent.meta_keywords || '');
        setContent(seoContent.content || '');
        setServiceType(seoContent.service_type || '');
        setContentType(seoContent.content_type || '');
        setTargetAudience(seoContent.target_audience || 'both');
        setIsActive(seoContent.is_active ?? true);
        setIsFeatured(seoContent.is_featured ?? false);
        setSortOrder(seoContent.sort_order || 0);
        setFaqItems(seoContent.faq_items || []);
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

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!title.trim()) {
        throw new Error('Title is required.');
      }
      if (!slug.trim()) {
        throw new Error('Slug is required.');
      }
      if (!content.trim()) {
        throw new Error('Content is required.');
      }

      const seoContentData: SEOContent = {
        title: title.trim(),
        slug: slug.trim(),
        meta_title: metaTitle.trim() || undefined,
        meta_description: metaDescription.trim() || undefined,
        meta_keywords: metaKeywords.trim() || undefined,
        content: content.trim(),
        service_type: (serviceType as any) || undefined,
        content_type: (contentType as any) || undefined,
        target_audience: targetAudience as 'customer' | 'provider' | 'both',
        is_active: isActive,
        is_featured: isFeatured,
        sort_order: sortOrder || undefined,
        faq_items: contentType === 'faq' ? faqItems : undefined,
      };

      await updateSEOContent(id, seoContentData);

      toast({
        variant: 'success',
        title: 'Success',
        description: 'SEO content updated successfully!',
      });

      router.push('/admin/seo-content');
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to update SEO content.',
      });
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/seo-content">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to SEO Content
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit SEO Content</h1>
            <p className="text-gray-600 mt-1">Update your SEO-optimized content</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Update the basic details for your SEO content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter content title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    placeholder="url-friendly-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service-type">Service Type</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bathroom-cleaning">Bathroom Cleaning</SelectItem>
                      <SelectItem value="home-cleaning">Home Cleaning</SelectItem>
                      <SelectItem value="sofa-cleaning">Sofa Cleaning</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service-page">Service Page</SelectItem>
                      <SelectItem value="landing-page">Landing Page</SelectItem>
                      <SelectItem value="blog-post">Blog Post</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-audience">Target Audience</Label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="provider">Provider</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort-order">Sort Order</Label>
                  <Input
                    id="sort-order"
                    type="number"
                    placeholder="0"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-active"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <Label htmlFor="is-active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-featured"
                      checked={isFeatured}
                      onCheckedChange={setIsFeatured}
                    />
                    <Label htmlFor="is-featured">Featured</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Meta Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SEO Meta Information
              </CardTitle>
              <CardDescription>
                Optimize your content for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  placeholder="SEO optimized title (recommended: 50-60 characters)"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  maxLength={60}
                />
                <p className="text-xs text-gray-500">{metaTitle.length}/60 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  placeholder="Brief description for search results (recommended: 150-160 characters)"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-gray-500">{metaDescription.length}/160 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-keywords">Meta Keywords</Label>
                <Input
                  id="meta-keywords"
                  placeholder="keyword1, keyword2, keyword3"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                />
                <p className="text-xs text-gray-500">Separate keywords with commas</p>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Editor
              </CardTitle>
              <CardDescription>
                Update your SEO content using the rich text editor. You can format text, add images, links, and more.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <div className="border border-gray-300 rounded-md">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Update your SEO content here..."
                    style={{ minHeight: '400px' }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Use the toolbar above to format your content. You can add headings, bold text, lists, links, and more.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Editor - Only show for FAQ content type */}
          {contentType === 'faq' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  FAQ Questions & Answers
                </CardTitle>
                <CardDescription>
                  Update frequently asked questions and their answers for this content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FAQEditor
                  faqItems={faqItems}
                  onChange={setFaqItems}
                />
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/seo-content">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update SEO Content
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSEOContentPage;
