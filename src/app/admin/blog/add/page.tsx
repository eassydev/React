'use client';

import React, { useState, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { createBlog, Blog } from '@/lib/api';

// Import React-Quill dynamically for client-side rendering
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Quill modules configuration
const quillModules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

const AddBlogForm: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [is_active, setIsActive] = useState<boolean>(true); // is_active switch state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Convert file to Base64

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title || !slug || !description || !image) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'All fields, including an image, are required.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Convert the image to Base64

      // Construct the blog object
      const newBlog: Blog = {
        title,
        slug,
        description,
        image,
        is_active, // Set the is_active status
      };

      await createBlog(newBlog);

      toast({
        variant: 'success',
        title: 'Success',
        description: 'Blog created successfully!',
      });

      // Reset form fields
      setTitle('');
      setSlug('');
      setDescription('');
      setImage(null);
      setIsActive(true);
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to create blog.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
        <p className="text-gray-500">Create a new blog</p>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>New Blog</CardTitle>
            <CardDescription>Fill in the details below to create a new blog post.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Title Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setSlug(generateSlug(e.target.value));
                  }}
                  placeholder="Enter blog title"
                  required
                />
              </div>

              {/* Slug Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">Slug</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Generated slug"
                  required
                />
              </div>

              {/* Content Field */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Content</span>
                </label>
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  theme="snow"
                  modules={quillModules}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <span>Image</span>
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  required
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch checked={is_active} onCheckedChange={setIsActive} />
                <span className="text-sm text-gray-700">Active</span>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Blog</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddBlogForm;
