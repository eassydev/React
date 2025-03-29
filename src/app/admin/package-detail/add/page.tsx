"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPackageDetail, PackageDetail, fetchAllpackages } from "@/lib/api";

const AddPackageDetailsForm: React.FC = () => {
  const [packages, setPackages] = useState<{ id: string; name: string }[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [details, setDetails] = useState<PackageDetail["details"]>([
    { position: "Top", title: "", image: null }
  ]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch Packages on Mount
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetchAllpackages();
        const data = response.map((pkg: any) => ({
          id: pkg.id || "",
          name: pkg.name || "Unnamed Package",
        }));
        setPackages(data);
      } catch (error: any) {
        toast({
          variant: "error",
          title: "Error",
          description: error.message || "Failed to load packages.",
        });
      }
    };
    fetchPackages();
  }, []);

  // Add a new detail row
  const addDetail = () => {
    setDetails([...details, { position: "Top", title: "", image: null }]);
  };

  // Remove a detail row
  const removeDetail = (index: number) => {
    if (details.length <= 1) return;
    setDetails(details.filter((_, i) => i !== index));
  };

  // Update details state
  const updateDetail = (index: number, field: keyof PackageDetail["details"][0], value: any) => {
    const newDetails = [...details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setDetails(newDetails);
  };

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedPackage || details.some(detail => !detail.title)) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Please select a package and fill in all detail titles.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await createPackageDetail({ package_id: selectedPackage, details });

      toast({
        variant: "success",
        title: "Success",
        description: "Package details added successfully!",
      });

      // Reset form
      setSelectedPackage("");
      setDetails([{ position: "Top", title: "", image: null }]);
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to add package details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Package Details Management</h1>
        <p className="text-gray-500">Add details to a package</p>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Add Package Details</CardTitle>
            <CardDescription>Select a package and add details below.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Package Selection Dropdown */}
              <div>
                <label className="text-sm font-medium text-gray-700">Select Package</label>
                <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Package Details List */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">Package Details</label>

                {details.map((detail, index) => (
                  <div key={index} className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      {/* Position Dropdown */}
                      <Select
                        value={detail.position}
                        onValueChange={(value) => updateDetail(index, "position", value)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue placeholder="Position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Top">Top</SelectItem>
                          <SelectItem value="Bottom">Bottom</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Title Input */}
                      <Input
                        value={detail.title}
                        onChange={(e) => updateDetail(index, "title", e.target.value)}
                        placeholder="Enter detail title"
                        required
                        className="flex-1"
                      />

                      {/* Remove Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDetail(index)}
                        disabled={details.length <= 1}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Image Upload */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center space-x-2 cursor-pointer">
                        <ImageIcon className="w-4 h-4 text-gray-500" />
                        <span>Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            updateDetail(index, "image", e.target.files ? e.target.files[0] : null)
                          }
                        />
                      </label>
                      {detail.image && <span className="text-xs text-gray-500">{detail.image.name}</span>}
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addDetail} className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Detail
                </Button>
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
                    <span>Save Package Details</span>
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

export default AddPackageDetailsForm;
