"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateWolooSubcategory,
  fetchWolooCategories,
  fetchWolooSubcategories,
  WolooSubcategory,
  WolooCategory,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface EditWolooSubcategoryProps {
  params: {
    id: string;
  };
}

const EditWolooSubcategory = ({ params }: EditWolooSubcategoryProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<WolooCategory[]>([]);
  const [formData, setFormData] = useState<WolooSubcategory>({
    name: "",
    category_id: "",
    service_time: "",
    description: "",
    active: true,
    image: null,
  });

  const subcategoryId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch categories
        const { data: categoriesData } = await fetchWolooCategories(
          1,
          1000,
          "all",
          "",
        );
        setCategories(categoriesData);

        // Fetch subcategories and find the one we're editing
        const { data: subcategoriesData } = await fetchWolooSubcategories(
          1,
          1000,
          "all",
          "",
        );
        const subcategory = subcategoriesData.find(
          (sub: WolooSubcategory) => sub.id === subcategoryId,
        );

        if (subcategory) {
          // Find the encrypted category ID that matches the subcategory's category_id
          let selectedCategoryId = "";
          if (subcategory.category && subcategory.category.id) {
            // Use the included category data if available
            selectedCategoryId = subcategory.category.id;
          } else {
            // Fallback: find category by matching sampleid with category_id
            const matchingCategory = categoriesData.find(
              (cat) => cat.sampleid == subcategory.category_id,
            );
            selectedCategoryId = matchingCategory?.id || "";
          }

          setFormData({
            name: subcategory.name || "",
            category_id: selectedCategoryId,
            service_time: subcategory.service_time || "",
            description: subcategory.description || "",
            active: Boolean(subcategory.active), // Convert 1/0 to true/false
            image: null, // Don't pre-populate file input
          });
        } else {
          toast({
            title: "Error",
            description: "Subcategory not found.",
            variant: "destructive",
          });
          router.push("/admin/woloo/subcategories");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch subcategory data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [subcategoryId, toast, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category_id: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      active: checked,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Subcategory name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category_id) {
      toast({
        title: "Validation Error",
        description: "Please select a category.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await updateWolooSubcategory(subcategoryId, formData);
      toast({
        title: "Success",
        description: "Woloo subcategory updated successfully.",
      });
      router.push("/admin/woloo/subcategories");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update subcategory.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Link href="/admin/woloo/subcategories">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Woloo Subcategory</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading subcategory data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Link href="/admin/woloo/subcategories">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Woloo Subcategory</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subcategory Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Subcategory Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter subcategory name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id || ""}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_time">Service Time</Label>
              <Input
                id="service_time"
                name="service_time"
                value={formData.service_time}
                onChange={handleInputChange}
                placeholder="e.g., 2-3 hours"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter subcategory description"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Subcategory Image</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <p className="text-sm text-gray-500">
                Upload a new image to replace the current one (optional)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="active">Active</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Link href="/admin/woloo/subcategories">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Updating..." : "Update Subcategory"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditWolooSubcategory;
