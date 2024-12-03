"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchPromocodeById,
  updatePromocode,
  fetchAllCategories,
  fetchAllSubCategories,
  fetchAllRatecard,
  fetchAllpackages,
  fetchAllProvidersWithoupagination,
  Promocode,
} from "@/lib/api";
import { useRouter, useParams } from "next/navigation";

const EditPromocodeForm: React.FC = () => {
 
  const [code, setCode] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [discountType, setDiscountType] = useState<"flat" | "percentage">("flat");
  const [discountValue, setDiscountValue] = useState<number | null>(null);
  const [minOrderValue, setMinOrderValue] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [status, setStatus] = useState<"active" | "inactive" | "expired">("active");
  const [selectionType, setSelectionType] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [options, setOptions] = useState<{ id: number; name: string }[]>([]);
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);
  const [isGlobal, setIsGlobal] = useState<boolean>(false);
  const [displayToCustomer, setDisplayToCustomer] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providersData = await fetchAllProvidersWithoupagination();
        setProviders(providersData.map((provider: any) => ({ id: provider.id, name: provider.first_name || "Unnamed Provider" })));
      } catch (error) {
        toast({ variant: "error", title: "Error", description: "Failed to load providers." });
      }
    };

    loadProviders();
  }, []);
  useEffect(() => {
    // Fetch promocode details
    const loadPromocode = async () => {
      try {
        const promocode = await fetchPromocodeById(id.toString());
        setCode(promocode.code);
        setDescription(promocode.description || "");
        setDiscountType(promocode.discount_type);
        setDiscountValue(promocode.discount_value);
        setMinOrderValue(promocode.min_order_value || null);
        setStartDate(promocode.start_date);
        setEndDate(promocode.end_date);
        setStatus(promocode.status);
        setSelectionType(promocode.selection_type);
        setSelectedItemId(promocode.selection_id || null);
        setProviderId(promocode.provider_id || null);
        setIsGlobal(promocode.is_global);
        setDisplayToCustomer(promocode.display_to_customer);
        setIsActive(promocode.is_active);
      } catch (error) {
        toast({ variant: "error", title: "Error", description: "Failed to load promocode details." });
      }
    };

    loadPromocode();
  }, [id.toString(), toast]);

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
      } catch (error) {
        toast({ variant: "error", title: "Error", description: `Failed to load ${selectionType} options.` });
      }
    };

    if (selectionType) loadOptions();
  }, [selectionType, toast]);

 

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!code || !discountValue || !startDate || !endDate || !selectionType || !selectedItemId || !providerId) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const promocodeData: Promocode = {
        code,
        description,
        discount_type: discountType,
        discount_value: discountValue,
        min_order_value: minOrderValue,
        start_date: startDate,
        end_date: endDate,
        status,
        is_active: isActive,
        selection_type: selectionType,
        selection_id: selectedItemId,
        is_global: isGlobal,
        display_to_customer: displayToCustomer,
        provider_id: providerId,
      };

      if (image) {
        promocodeData.image = image;
      }

      await updatePromocode(id.toString(), promocodeData);

      toast({
        variant: "success",
        title: "Success",
        description: "Promocode updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to update promocode.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
        <form onSubmit={onSubmit} className="space-y-6">
            <CardHeader>
              <CardTitle>Create New Promocode</CardTitle>
              <CardDescription>Fill in the details below to create a new promocode</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Code</label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter promocode"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Provider</label>
                <Select value={providerId || ""} onValueChange={setProviderId}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Image</label>
                <Input type="file" accept="image/*" onChange={handleImageChange} required />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Active</label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description (optional)"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Discount Type</label>
                <Select value={discountType} onValueChange={(value) => setDiscountType(value as "flat" | "percentage")}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Discount Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Discount Value</label>
                <Input
                  type="number"
                  value={discountValue ?? ""}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  placeholder="Enter discount value"
                  required
                />
              </div>

              

              <div>
                <label className="text-sm font-medium text-gray-700">Min Order Value</label>
                <Input
                  type="number"
                  value={minOrderValue ?? ""}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  placeholder="Enter min order value (optional)"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
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
                <label className="text-sm font-medium text-gray-700">Global Promocode</label>
                <Switch checked={isGlobal} onCheckedChange={setIsGlobal} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Display to Customer</label>
                <Switch checked={displayToCustomer} onCheckedChange={setDisplayToCustomer} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Active/Inactive</label>
                <Switch
                  checked={status === "active"}
                  onCheckedChange={(checked) => setStatus(checked ? "active" : "inactive")}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Promocode
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditPromocodeForm;
