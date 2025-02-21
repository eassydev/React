"use client";

import React, { useState, useEffect, FormEvent } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, FileText } from "lucide-react";
import { fetchPageById, updatePage, Page } from "@/lib/api"; // Import the API functions and Page interface

// Import React-Quill dynamically for client-side rendering
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

// Quill modules configuration
const quillModules = {
  toolbar: [
    [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
    [{ 'size': [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

const EditPageForm: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Extract the page ID from the URL path
  const pageId = pathname?.split('/').pop();

  useEffect(() => {
    if (pageId) {
      loadPageData(pageId);
    }
  }, [pageId]);

  // Fetch the existing page data
  const loadPageData = async (id: string) => {
    try {
      const pageData: Page = await fetchPageById(id);
      setTitle(pageData.title);
      setSlug(pageData.slug);
      setDescription(pageData.description || "");
      setIsActive(pageData.is_active);
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to load page details.",
      });
    }
  };

  // Slugify the title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title || !slug || !description) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "All fields are required.",
      });
      setIsSubmitting(false);
      return;
    }

    // Construct the updated Page object
    const updatedPage: Page = {
      title,
      slug,
      description,
      is_active: isActive,
    };

    try {
      await updatePage(pageId!, updatedPage); // Submit the updated Page object to the API
      toast({
        variant: "success",
        title: "Success",
        description: "Page updated successfully.",
      });
      router.push("/admin/pages"); // Redirect to the pages list after success
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to update page.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
    <div className="max-w-12xl mx-auto space-y-6">
      <div className="text-left space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
        <p className="text-gray-500">Update category details</p>
      </div>

      <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
        <CardHeader className="border-b border-gray-100 pb-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-1 bg-blue-600 rounded-full" />
            <div>
              <CardTitle className="text-xl text-gray-800">Edit Category</CardTitle>
              <CardDescription className="text-gray-500">
                Update the details below to modify the category
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setSlug(generateSlug(e.target.value));
                  }}
                  placeholder="Enter page title"
                  required
                />
              </div>

              {/* Slug Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Slug</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Enter page slug"
                  required
                />
              </div>

              {/* Description Field with React-Quill */}
              <div className="space-y-2" style={{ height: "270px" }}>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-5 text-blue-500" />
                  <span>Description</span>
                </label>
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  theme="snow"
                  modules={quillModules}
                  style={{ height: "200px" }}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  className="bg-primary"
                />
                <span className="text-sm text-gray-700">Active</span>
              </div>

              {/* Submit Button */}
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Update Page</span>
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

export default EditPageForm;
