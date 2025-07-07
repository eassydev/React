'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { getBlogById, updateBlog, Blog } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

// Import React-Quill dynamically for client-side rendering
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

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

const EditBlogForm: React.FC = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { id } = useParams(); // Get the blog ID from route parameters

  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [is_active, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch existing blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const blog = await getBlogById(Number(id));
        setTitle(blog.title);
        setSlug(blog.slug);
        setDescription(blog.description);
        setIsActive(blog.is_active);
        setImage(blog.image); // Existing image path
      } catch (error) {
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Failed to fetch blog data.',
        });
      }
    };

    fetchBlog();
  }, [id, toast]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedBlog: Blog = {
        title,
        slug,
        description,
        is_active,
        image,
      };

      await updateBlog(Number(id), updatedBlog);

      toast({
        variant: 'success',
        title: 'Success',
        description: 'Blog updated successfully!',
      });

      router.push('/admin/blog'); // Redirect to blog list page
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to update blog.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Edit Blog</CardTitle>
            <CardDescription>Update the details of the blog post.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '')
                    );
                  }}
                  placeholder="Enter blog title"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Slug</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Generated slug"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Content</label>
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  theme="snow"
                  modules={quillModules}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
                {typeof image === 'string' && (
                  <div className="mt-2">
                    <img
                      src={image}
                      alt="Current Image"
                      className="w-32 h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch checked={is_active} onCheckedChange={setIsActive} />
                <span className="text-sm text-gray-700">Active</span>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Update Blog</span>
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

export default EditBlogForm;
