"use client";
import React, { useState, useEffect, FormEvent } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectItem,
    SelectTrigger,
    SelectContent,
    SelectValue,
} from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import {
    fetchAllCategories,
    fetchSubCategoriesByCategoryId,
    createServiceVideo, // Import createServiceVideo
    Category,
    Subcategory,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const ServiceVideoForm: React.FC = () => {
    const router = useRouter();
    const { toast } = useToast();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
    const [videoUrl, setVideoUrl] = useState<File | null>(null); // Store the selected video file
    const [isActive, setIsActive] = useState<boolean>(true);
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoryData = await fetchAllCategories();
                setCategories(categoryData);
            } catch {
                toast({
                    variant: "error",
                    title: "Error",
                    description: "Failed to load categories.",
                });
            }
        };
        loadCategories();
    }, [toast]);

    useEffect(() => {
        if (selectedCategoryId) {
            const loadSubcategories = async () => {
                try {
                    const subcategoryData = await fetchSubCategoriesByCategoryId(selectedCategoryId);
                    setSubcategories(subcategoryData);
                } catch {
                    setSubcategories([]);
                }
            };
            loadSubcategories();
        } else {
            setSubcategories([]);
        }
    }, [selectedCategoryId]);


    useEffect(() => {
        validateForm();
    }, [videoUrl, selectedCategoryId, selectedSubcategoryId]);

    const validateForm = () => {
        const isValid =
            videoUrl !== null;

        setIsFormValid(isValid);
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!isFormValid) {
            toast({
                variant: "error",
                title: "Error",
                description: "Please select a video file.",
            });
            return;
        }

        setIsSubmitting(true);

        const serviceVideoData = {
            category_id: selectedCategoryId || null,
            subcategory_id: selectedSubcategoryId || null,
            is_active: isActive,
        };

        try {
            const response = await createServiceVideo(serviceVideoData, videoUrl); // Pass the video file
            toast({
                variant: "success",
                title: "Success",
                description: response.message || "Service video created successfully.",
            });
            router.push("/admin/video"); // Redirect to the video list page
        } catch (error: any) {
            console.error("Error creating service video:", error);
            toast({
                variant: "error",
                title: "Error",
                description: error.response?.data?.message || "Failed to create service video.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVideoUrl(e.target.files?.[0] || null); // Store the selected File object
    };

    return (
        <div className="min-h-screen p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Service Video Management</CardTitle>
                    <CardDescription>Create a new service video</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <div className="space-y-4">
                            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id!.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {subcategories.length > 0 && (
                                <Select value={selectedSubcategoryId} onValueChange={setSelectedSubcategoryId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Subcategory" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subcategories.map((subcategory) => (
                                            <SelectItem key={subcategory.id} value={subcategory.id!.toString()}>
                                                {subcategory.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            <Input
                                type="file"
                                onChange={handleVideoChange} // Call the change handler
                                required
                            />

                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                    <span>Status</span>
                                </label>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-600">Inactive</span>
                                    <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-blue-500" />
                                    <span className="text-sm text-gray-600">Active</span>
                                </div>
                            </div>

                            <Button type="submit" disabled={isSubmitting || !isFormValid}>
                                {isSubmitting ? (
                                    <div className="flex items-center">
                                        <Loader2 className="animate-spin mr-2" />
                                        Saving...
                                    </div>
                                ) : (
                                    "Save"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ServiceVideoForm;