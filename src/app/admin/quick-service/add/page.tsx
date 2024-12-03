"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Save, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchCategories, createQuickService } from "@/lib/api"; // Replace with actual API functions

const QuickSelectionPage: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]); // Categories fetched from API
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);

  const { toast } = useToast();

  // Fetch categories from API
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const fetchedCategories = await fetchCategories(); // Fetch categories from your API
        setCategories(fetchedCategories || []);
      } catch (error) {
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to fetch categories.",
        });
      }
    };

    fetchCategoryData();
  }, []);

  // Handle image upload
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle category selection
  const handleCategorySelection = (categoryId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCategories((prev) => [...prev, categoryId]);
    } else {
      setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
    }
  };

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!image || selectedCategories.length === 0) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Image and at least one category must be selected.",
      });
      setIsSubmitting(false);
      return;
    }

    // Construct the payload for submission
    const payload = {
      image, // Image file for upload
      category_ids: selectedCategories, // Selected category IDs
      is_active: isActive, // Active status
    };

    try {
      await createQuickService(payload); // Submit to your API
      toast({
        variant: "success",
        title: "Success",
        description: "Quick service saved successfully.",
      });

      // Reset form fields after success
      setImage(null);
      setImagePreview(null);
      setSelectedCategories([]);
      setIsActive(true);
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to save quick service.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Home Quick Services</h1>
          <p className="text-gray-500">Add or edit quick services with categories</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">New Quick Service</CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below to create or edit a quick service
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Image Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Image</label>
                <Input type="file" accept="image/*" onChange={handleImageUpload} required />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-md" />
                  </div>
                )}
              </div>

              {/* Categories Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Categories</label>
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center justify-between w-full p-2 bg-white border border-gray-200 rounded"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  >
                    {selectedCategories.length > 0
                      ? `Selected (${selectedCategories.length})`
                      : "Select categories"}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isCategoryDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-auto">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center p-2">
                          <Checkbox
                            checked={selectedCategories.includes(category.id.toString())}
                            onCheckedChange={(checked: any) =>
                              handleCategorySelection(category.id.toString(), checked)
                            }
                            id={`category-${category.id}`}
                          />
                          <label htmlFor={`category-${category.id}`} className="ml-2">
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-sm text-gray-700">Active</span>
              </div>
            </form>
          </CardContent>

          <CardFooter className="border-t border-gray-100 mt-6">
            <div className="flex space-x-3 pt-6">
              <Button className="w-full" disabled={isSubmitting} onClick={onSubmit}>
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Quick Service</span>
                  </div>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default QuickSelectionPage;
