"use client";
import React, { useState, useEffect, FormEvent } from "react";
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from '@/components/ui/switch';
import {
    Select, SelectItem, SelectTrigger, SelectContent, SelectValue,
} from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import {
    fetchAllCategories, fetchSubCategoriesByCategoryId,
    fetchServiceVideoById, updateServiceVideo,
    Category, Subcategory,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from "next/navigation";

const ServiceVideoEditForm: React.FC = () => {
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const serviceVideoId = pathname?.split("/").pop();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
    const [videoUrl, setVideoUrl] = useState<File | null>(null); // Store the selected video file
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [isActive, setIsActive] = useState<boolean>(true);
    const [isFormValid, setIsFormValid] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoryData = await fetchAllCategories();
                setCategories(categoryData);
            } catch (error) {
                console.error("Error loading categories:", error);
                toast({
                    variant: "error",
                    title: "Error",
                    description: "Failed to load categories.",
                });
            }
        };

        const loadServiceVideo = async () => {
            if (serviceVideoId) {
                try {
                    const videoData = await fetchServiceVideoById(serviceVideoId);
                    if (videoData) {
                        setSelectedCategoryId(videoData.category_id?.toString() || "");
                        setSelectedSubcategoryId(videoData.subcategory_id?.toString() || "");
                        setCurrentVideoUrl(videoData.video_url as string | null || null);     
                       setIsActive(videoData.is_active ? true : false);
                    } else {
                        toast({
                            variant: "error",
                            title: "Error",
                            description: "Service video not found.",
                        });
                        router.push("/admin/video");
                    }
                } catch (error) {
                    console.error("Error fetching service video:", error);
                    toast({
                        variant: "error",
                        title: "Error",
                        description: "Failed to load service video.",
                    });
                    router.push("/admin/video");
                } finally {
                    setInitialLoad(false);
                }
            }
        };

        loadCategories();
        loadServiceVideo();
    }, [serviceVideoId, toast, router]);

    useEffect(() => {
        const loadSubcategories = async () => {
            if (selectedCategoryId && !initialLoad) {
                try {
                    const subcategoryData = await fetchSubCategoriesByCategoryId(selectedCategoryId);
                    setSubcategories(subcategoryData);
                } catch (error) {
                    console.error("Error loading subcategories:", error);
                    setSubcategories([]);
                }
            } else {
                setSubcategories([]);
            }
        };
        loadSubcategories();
    }, [selectedCategoryId, initialLoad]);

    useEffect(() => {
        validateForm();
    }, [videoUrl, selectedCategoryId, selectedSubcategoryId]);

    const validateForm = () => {
        const isValid = true;
        setIsFormValid(isValid);
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);

        const serviceVideoData = {
            category_id: selectedCategoryId || null,
            subcategory_id: selectedSubcategoryId || null,
            is_active: isActive,
        };

        try {
            const response = await updateServiceVideo(serviceVideoId as string, serviceVideoData, videoUrl);
            toast({
                variant: "success",
                title: "Success",
                description: response.message || "Service video updated successfully.",
            });
            router.push("/admin/video");
        } catch (error: any) {
            console.error("Error updating service video:", error);
            toast({
                variant: "error",
                title: "Error",
                description: error.response?.data?.message || "Failed to update service video.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setVideoUrl(file);

        if (file) {
            const previewURL = URL.createObjectURL(file);
            setVideoPreviewUrl(previewURL);

            if (videoPreviewUrl) {
                URL.revokeObjectURL(videoPreviewUrl);
            }
        } else {
            setVideoPreviewUrl(null);
        }
    };

    useEffect(() => {
        return () => {
            if (videoPreviewUrl) {
                URL.revokeObjectURL(videoPreviewUrl);
            }
        };
    }, [videoPreviewUrl]);

    if (initialLoad) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Service Video Management</CardTitle>
                    <CardDescription>Edit service video</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <div className="space-y-4">
                            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
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
                                    <SelectTrigger><SelectValue placeholder="Select Subcategory" /></SelectTrigger>
                                    <SelectContent>
                                        {subcategories.map((subcategory) => (
                                            <SelectItem key={subcategory.id} value={subcategory.id!.toString()}>
                                                {subcategory.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {currentVideoUrl && !videoPreviewUrl && (
                                <div className="mb-4">
                                    <video src={currentVideoUrl} controls className="w-full max-w-md"></video>
                                    <p>Current Video: {currentVideoUrl}</p>
                                </div>
                            )}

                            {videoPreviewUrl && (
                                <div className="mb-4">
                                    <video src={videoPreviewUrl} controls className="w-full max-w-md"></video>
                                    <p>Video Preview</p>
                                </div>
                            )}

                            <Input type="file" onChange={handleVideoChange} />

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

                            <Button type="submit" disabled={isSubmitting}>
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

export default ServiceVideoEditForm;