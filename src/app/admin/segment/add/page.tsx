// frontend/components/ServiceSegmentForm.js
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
    fetchFilterAttributes,
    createServiceSegment,
    Category,
    Subcategory,
    Attribute,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const ServiceSegmentForm: React.FC = () => {
    const router = useRouter();
    const { toast } = useToast();

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
        const loadAttributes = async () => {
            if (selectedCategoryId || selectedSubcategoryId) {
                try {
                    const attributeData = await fetchFilterAttributes(
                        selectedCategoryId,
                        selectedSubcategoryId || null
                    );
                    setFilterAttributes(attributeData);
                } catch {
                    setFilterAttributes([]);
                }
            }
        };
        loadAttributes();
    }, [selectedCategoryId, selectedSubcategoryId]);

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
            filter_attribute_id: filterAttributeId,
            segment_name: segmentName,
            is_active: isActive,
        };

        try {
            const response = await createServiceSegment(serviceSegmentData);
            toast({
                variant: "success",
                title: "Success",
                description: response.message || "Service segment created successfully.",
            });
            router.push("/admin/segment");
        } catch (error: any) {
            console.error("Error creating service segment:", error);
            toast({
                variant: "error",
                title: "Error",
                description: error.response?.data?.message || "Failed to create service segment.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Service Segment Management</CardTitle>
                    <CardDescription>Create a new service segment</CardDescription>
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

                            {filterAttributes.length > 0 && (
                                <Select value={filterAttributeId} onValueChange={setFilterAttributeId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Filter Attribute" />
                                    </SelectTrigger>
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

export default ServiceSegmentForm;

