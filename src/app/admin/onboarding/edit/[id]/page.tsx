"use client";

import React, { useState, useEffect, FormEvent } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, FileImage, FileText } from "lucide-react";
import { fetchOnboardingById, updateOnboarding, Onboarding } from "@/lib/api"; // Import the API functions and Onboarding interface

// Import React-Quill dynamically for client-side rendering
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

// Quill modules configuration
const quillModules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const EditOnboardingForm: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Extract the onboarding ID from the URL path
  const onboardingId = pathname?.split("/").pop();

  useEffect(() => {
    if (onboardingId) {
      loadOnboardingData(onboardingId);
    }
  }, [onboardingId]);

  // Fetch the existing onboarding data
  const loadOnboardingData = async (id: string) => {
    try {
      const onboarding: Onboarding = await fetchOnboardingById(id);
      setTitle(onboarding.title);
      setDescription(onboarding.description || "");
      setIsActive(onboarding.is_active);
      if (typeof onboarding.image === "string") {
        setExistingImage(onboarding.image); // Set existing image URL
      } else {
        setExistingImage(""); // Handle unexpected values gracefully
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to load onboarding details.",
      });
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title || !description) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Title and description are required.",
      });
      setIsSubmitting(false);
      return;
    }

    // Construct the updated Onboarding object
    const updatedOnboarding: Onboarding = {
      title,
      description,
      image: image || null, // Send a new image if uploaded
      is_active: isActive,
    };

    try {
      await updateOnboarding(onboardingId!, updatedOnboarding); // Submit the updated onboarding object to the API
      toast({
        variant: "success",
        title: "Success",
        description: "Onboarding updated successfully.",
      });
      router.push("/admin/onboarding"); // Redirect to the onboarding list after success
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to update onboarding.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Edit Onboarding</h1>
          <p className="text-gray-500">Update onboarding details</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">Edit Onboarding</CardTitle>
                <CardDescription className="text-gray-500">
                  Update the details below to modify the onboarding page
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
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter onboarding title"
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

              {/* Image Upload Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FileImage className="w-4 h-5 text-blue-500" />
                  <span>Image</span>
                </label>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {existingImage && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">Current Image:</span>
                    <img
                      src={existingImage}
                      alt="Existing Onboarding"
                      className="mt-2 max-h-32 rounded-md"
                    />
                  </div>
                )}
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
                    <span>Update Onboarding</span>
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

export default EditOnboardingForm;
