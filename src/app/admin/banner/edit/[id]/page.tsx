"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Save, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getBanner, updateBanner, Banner, fetchAllCategories, fetchAllSubCategories, fetchAllRatecard, fetchAllpackages } from "@/lib/api";

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

const EditBannerForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectionType, setSelectionType] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [options, setOptions] = useState<{ id: number; name: string }[]>([]);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [deepLink, setDeepLink] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { id } = useParams();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Load existing banner data
    const fetchBanner = async () => {
      try {
        const existingBanner = await getBanner(id.toString());
        setTitle(existingBanner.title);
        setDescription(existingBanner.description);
        setSelectionType(existingBanner.selection_type || "");
        setSelectedItemId(existingBanner.selection_id || null);
        setMediaType(existingBanner.media_type);
        setDisplayOrder(existingBanner.display_order || 0);
        setDeepLink(existingBanner.deep_link || "");
        setIsActive(existingBanner.is_active);

        // Trigger options loading for selectionType
        if (existingBanner.selection_type) {
          setSelectionType(existingBanner.selection_type);
        }
      } catch (error) {
        toast({ variant: "error", title: "Error", description: "Failed to load banner." });
      }
    };
    fetchBanner();
  }, [id, toast]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        let data: { id: number; name: string }[] = [];
        switch (selectionType) {
          case "Category":
            data = (await fetchAllCategories()).map((item) => ({ id: parseInt(item.id || ''), name: item.name.toString() }));
            break;
          case "Subcategory":
            data = (await fetchAllSubCategories()).map((item) => ({ id: parseInt(item.id || ''), name: item.name.toString() }));
            break;
          case "Ratecard":
            data = (await fetchAllRatecard()).map((item) => ({ id: parseInt(item.id || ''), name: item.name.toString() }));
            break;
          case "Package":
            data = (await fetchAllpackages()).map((item) => ({ id: parseInt(item.id || ''), name: item.name.toString() }));
            break;
          default:
            setOptions([]);
            return;
        }
        setOptions(data);
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
    setIsSubmitting(true);
    try {
      const updatedBanner: Banner = {
        id: id ? id.toString() : '',
        title,
        description,
        selection_type:selectionType,
        selection_id: selectedItemId,
        is_active: isActive,
        media_type: mediaType,
        display_order: displayOrder,
        deep_link: deepLink,
        image: image || undefined,
      };
      await updateBanner(id.toString(), updatedBanner);

      toast({ variant: "success", title: "Success", description: "Banner updated successfully." });
      router.push("/admin/banner");
    } catch (error) {
      toast({ variant: "error", title: "Error", description: "Failed to update banner." });
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
              <CardTitle>Edit Banner</CardTitle>
              <CardDescription>Modify the details of this banner</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Banner Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <ReactQuill value={description} onChange={setDescription} theme="snow" modules={quillModules} style={{ height: "200px" }} />
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
                <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Deep Link URL</label>
                <Input value={deepLink} onChange={(e) => setDeepLink(e.target.value)} />
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
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditBannerForm;
