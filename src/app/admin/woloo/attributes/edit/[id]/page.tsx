"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  fetchWolooAttributeById, 
  updateWolooAttribute, 
  fetchWolooCategories, 
  fetchWolooSubcategories,
  WolooAttribute, 
  WolooCategory, 
  WolooSubcategory 
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const EditWolooAttribute = () => {
  const router = useRouter();
  const params = useParams();
  const attributeId = params.id as string;
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<WolooCategory[]>([]);
  const [subcategories, setSubcategories] = useState<WolooSubcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<WolooSubcategory[]>([]);
  const [formData, setFormData] = useState<WolooAttribute>({
    name: "",
    category_id: "",
    subcategory_id: "none",
    type: "single",
    required: false,
    weight: 0,
    active: true,
    provider_id: "5032",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch attribute, categories, and subcategories
        const [attributeResponse, categoriesResponse, subcategoriesResponse] = await Promise.all([
          fetchWolooAttributeById(attributeId),
          fetchWolooCategories(1, 1000, 'all', ''),
          fetchWolooSubcategories(1, 1000, 'all', '')
        ]);
        
        const attribute = attributeResponse.data;
        setCategories(categoriesResponse.data);
        setSubcategories(subcategoriesResponse.data);
        
        if (attribute) {
          // Find the encrypted category ID that matches the attribute's category_id
          let selectedCategoryId = "";
          const matchingCategory = categoriesResponse.data.find((cat: WolooCategory) => cat.sampleid == attribute.category_id);
          selectedCategoryId = matchingCategory?.id || "";

          // Find the encrypted subcategory ID that matches the attribute's subcategory_id
          let selectedSubcategoryId = "none";
          if (attribute.subcategory_id) {
            const matchingSubcategory = subcategoriesResponse.data.find((sub: WolooSubcategory) => sub.sampleid == attribute.subcategory_id);
            selectedSubcategoryId = matchingSubcategory?.id || "none";
          }
          
          setFormData({
            name: attribute.name || "",
            category_id: selectedCategoryId,
            subcategory_id: selectedSubcategoryId,
            type: attribute.type || "single",
            required: Boolean(attribute.required),
            weight: attribute.weight || 0,
            active: Boolean(attribute.active),
            provider_id: attribute.provider_id?.toString() || "5032",
          });
        } else {
          toast({
            title: "Error",
            description: "Attribute not found.",
            variant: "destructive",
          });
          router.push("/admin/woloo/attributes");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch attribute data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [attributeId, toast, router]);

  // Filter subcategories based on selected category
  useEffect(() => {
    if (formData.category_id) {
      // Try both encrypted and decrypted ID matching
      const filtered = subcategories.filter(sub => {
        // Check if subcategory's category_id matches the selected category's encrypted ID
        if (sub.category_id === formData.category_id) {
          return true;
        }
        
        // Also check if subcategory's category_id matches the selected category's decrypted ID
        const selectedCategory = categories.find(cat => cat.id === formData.category_id);
        if (selectedCategory && sub.category_id == selectedCategory.sampleid) {
          return true;
        }
        
        return false;
      });
      
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.category_id, subcategories, categories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weight' ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category_id: value,
      subcategory_id: "none", // Reset subcategory when category changes
    }));
  };

  const handleSubcategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      subcategory_id: value === "none" ? "" : value
    }));
  };

  const handleSwitchChange = (field: 'required' | 'active') => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Attribute name is required.",
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
      await updateWolooAttribute(attributeId, formData);
      toast({
        title: "Success",
        description: "Woloo attribute updated successfully.",
      });
      router.push("/admin/woloo/attributes");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update attribute.",
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
          <Link href="/admin/woloo/attributes">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Woloo Attribute</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading attribute data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Link href="/admin/woloo/attributes">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Woloo Attribute</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attribute Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Attribute Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter attribute name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">Category *</Label>
                <Select value={formData.category_id} onValueChange={handleCategoryChange}>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="subcategory_id">Subcategory (Optional)</Label>
                <Select value={formData.subcategory_id} onValueChange={handleSubcategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Subcategory</SelectItem>
                    {filteredSubcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id || "none"}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Attribute Type *</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select attribute type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Selection (Choose One Option)</SelectItem>
                    <SelectItem value="multiple">Multiple Selection (Choose Multiple Options)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="Enter weight (for ordering)"
                min="0"
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={formData.required}
                  onCheckedChange={handleSwitchChange('required')}
                />
                <Label htmlFor="required">Required</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={handleSwitchChange('active')}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Link href="/admin/woloo/attributes">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Updating..." : "Update Attribute"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditWolooAttribute;
