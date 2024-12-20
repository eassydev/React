"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Save, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createBanner, Banner, fetchAllCategories, fetchAllSubCategories, fetchAllRatecard, fetchAllpackages } from "@/lib/api";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

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

const AddBannerForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectionType, setSelectionType] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [options, setOptions] = useState<{ id: number; name: string }[]>([]);
  const [mediaType, setMediaType] = useState<"image" | "video">("image"); // Updated type
  const [displayOrder, setDisplayOrder] = useState<number>(1); // Set type to number
  const [deepLink, setDeepLink] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [radius, setRadius] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const loadOptions = async () => {
      try {
        let data: { id: number; name: string }[] = [];
        switch (selectionType) {
          case "Category":
            const categories = await fetchAllCategories();
            data = categories.map((category) => ({
              id: Number(category.id) || 0,
              name: category.name || "Unnamed Category",
            }));
            break;
          case "Subcategory":
            const subcategories = await fetchAllSubCategories();
            data = subcategories.map((subcategory) => ({
              id: Number(subcategory.id) || 0,
              name: subcategory.name || "Unnamed Subcategory",
            }));
            break;
          case "Ratecard":
            const ratecards = await fetchAllRatecard();
            data = ratecards.map((ratecard) => ({
              id: Number(ratecard.id) || 0,
              name: ratecard.name || "Unnamed Ratecard",
            }));
            break;
          case "Package":
            const packages = await fetchAllpackages();
            data = packages.map((pkg) => ({
              id: Number(pkg.id) || 0,
              name: pkg.name || "Unnamed Package",
            }));
            break;
          default:
            setOptions([]);
            return;
        }
        setOptions(data);
        setSelectedItemId(null);
      } catch (error) {
        toast({ variant: "error", title: "Error", description: `Failed to load ${selectionType} options.` });
      }
    };

    if (selectionType) loadOptions();
  }, [selectionType, toast]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title || !description || !selectedItemId || !selectionType) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const bannerData: Banner = {
        title,
        description,
        selection_type: selectionType,
        selection_id: selectedItemId,
        media_type: mediaType,
        display_order: displayOrder,
        deep_link: deepLink,
        latitude: Number(latitude),
        longitude: Number(longitude),
        radius,
        start_date: startDate,
        end_date: endDate,
        is_active: isActive,
        image,
      };

      await createBanner(bannerData);

      toast({
        variant: "success",
        title: "Success",
        description: "Banner created successfully.",
      });

    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: ` ${error}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <form onSubmit={onSubmit} className="space-y-6">
            <CardHeader>
              <CardTitle>Create New Banner</CardTitle>
              <CardDescription>Fill in the details below to create a new banner</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Banner Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter banner title"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  theme="snow"
                  modules={quillModules}
                  style={{ height: "200px" }}
                  placeholder="Enter banner description"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Selection Type</label>
                <Select value={selectionType} onValueChange={(value) => setSelectionType(value)}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Category">Category</SelectItem>
                    <SelectItem value="Subcategory">Subcategory</SelectItem>
                    <SelectItem value="Ratecard">Ratecard</SelectItem>
                    <SelectItem value="Package">Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectionType && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Select {selectionType}</label>
                  <Select value={String(selectedItemId)} onValueChange={(value) => setSelectedItemId(Number(value))}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder={`Select ${selectionType}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Media Type</label>
                <Select value={mediaType} onValueChange={(value) => setMediaType(value as "image" | "video")}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Media Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Display Order</label>
                <Input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  placeholder="Enter display order"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Deep Link URL</label>
                <Input
                  value={deepLink}
                  onChange={(e) => setDeepLink(e.target.value)}
                  placeholder="Enter deep link URL"
                />
              </div>

              <div>
                <label>Latitude</label>
                <Input type="number" value={latitude} onChange={(e) => setLatitude(e.target.value)} />

              </div>
              <div>
                <label>Longitude</label>
                <Input type="number" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
              </div>
              <div>
                <label>Radius (in km)</label>
                <Input type="number" value={radius || ""} onChange={(e) => setRadius(Number(e.target.value))} />
              </div>
              <div>
                <label>Start Date</label>
                <Input type="date" value={startDate} min={today} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label>End Date</label>
                <Input type="date" value={endDate} min={startDate || today} onChange={(e) => setEndDate(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Upload Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>

              <div className="flex items-center space-x-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} className="bg-primary" />
                <span>Active</span>
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Banner
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddBannerForm;
