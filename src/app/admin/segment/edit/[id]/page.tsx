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
    fetchAllCategories, fetchSubCategoriesByCategoryId, fetchFilterAttributes,
    fetchServiceSegmentById, updateServiceSegment,
    Category, Subcategory, Attribute,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from "next/navigation";

const ServiceSegmentEditForm: React.FC = () => {
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const serviceSegmentId = pathname?.split("/").pop();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [filterAttributes, setFilterAttributes] = useState<Attribute[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
    const [filterAttributeId, setFilterAttributeId] = useState<string>("");
    const [segmentName, setSegmentName] = useState<string>("");
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

        const loadServiceSegment = async () => {
            if (serviceSegmentId) {
                try {
                    const segmentData = await fetchServiceSegmentById(serviceSegmentId);
                    if (segmentData) {
                        setSelectedCategoryId(segmentData.category_id?.toString() || "");
                        setSelectedSubcategoryId(segmentData.subcategory_id?.toString() || "");
                        setFilterAttributeId(segmentData.filter_attribute_id?.toString() || "");
                        setSegmentName(segmentData.segment_name || "");
                        setIsActive(segmentData.is_active?true:false);
                    } else {
                        toast({
                            variant: "error",
                            title: "Error",
                            description: "Service segment not found.",
                        });
                        router.push("/admin/segment");
                    }
                } catch (error) {
                    console.error("Error fetching service segment:", error);
                    toast({
                        variant: "error",
                        title: "Error",
                        description: "Failed to load service segment.",
                    });
                    router.push("/admin/segment");
                } finally {
                    setInitialLoad(false);
                }
            }
        };

        loadCategories();
        loadServiceSegment();
    }, [serviceSegmentId, toast, router]);

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
        const loadAttributes = async () => {
            if ((selectedCategoryId || selectedSubcategoryId) && !initialLoad) {
                try {
                    const attributeData = await fetchFilterAttributes(
                        selectedCategoryId,
                        selectedSubcategoryId || null
                    );
                    setFilterAttributes(attributeData);
                } catch (error) {
                    console.error("Error loading attributes:", error);
                    setFilterAttributes([]);
                }
            } else {
                setFilterAttributes([]);
            }
        };
        loadAttributes();
    }, [selectedCategoryId, selectedSubcategoryId, initialLoad]);

    useEffect(() => {
        validateForm();
    }, [filterAttributeId, segmentName, selectedCategoryId, selectedSubcategoryId]);

    const validateForm = () => {
        const isValid =
            filterAttributeId !== "" &&
            segmentName.trim() !== "";

        setIsFormValid(isValid);
    };


    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!isFormValid) {
            toast({
                variant: "error",
                title: "Error",
                description: "Please fill in all required fields.",
            });
            return;
        }

        setIsSubmitting(true);

        const serviceSegmentData = {
            category_id: selectedCategoryId || null,
            subcategory_id: selectedSubcategoryId || null,
            filter_attribute_id: filterAttributeId || null,
            segment_name: segmentName,
            is_active: isActive,
        };

        try {
            const response = await updateServiceSegment(serviceSegmentId as string, serviceSegmentData);
            toast({
                variant: "success",
                title: "Success",
                description: response.message || "Service segment updated successfully.",
            });
            router.push("/admin/segment");
        } catch (error: any) {
            console.error("Error updating service segment:", error);
            toast({
                variant: "error",
                title: "Error",
                description: error.response?.data?.message || "Failed to update service segment.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (initialLoad) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Service Segment Management</CardTitle>
                    <CardDescription>Edit service segment</CardDescription>
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

                            {filterAttributes.length > 0 && (
                                <Select value={filterAttributeId} onValueChange={setFilterAttributeId}>
                                    <SelectTrigger><SelectValue placeholder="Select Filter Attribute" /></SelectTrigger>
                                    <SelectContent>
                                        {filterAttributes.map((attr) => (
                                            <SelectItem key={attr.id} value={attr.id!.toString()}>
                                                {attr.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {filterAttributes.length > 0 && (
                                <Input
                                    type="text"
                                    placeholder="Segment Name"
                                    value={segmentName}
                                    onChange={(e) => setSegmentName(e.target.value)}
                                    required
                                />
                            )}

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

export default ServiceSegmentEditForm;