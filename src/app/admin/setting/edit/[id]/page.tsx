"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { fetchSettingById, updateSetting, Setting } from "@/lib/api"; // API functions and Setting interface

const SettingEditForm: React.FC = () => {
  const [attributeName, setAttributeName] = useState<string>("");
  const [attributeValue, setAttributeValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Extract the setting ID from the URL path
  const settingId = pathname?.split('/').pop();

  useEffect(() => {
    if (settingId) {
      loadSettingData(settingId);
    }
  }, [settingId]);

  // Fetch existing setting data
  const loadSettingData = async (id: string) => {
    try {
      const settingData: Setting = await fetchSettingById(id);
      setAttributeName(settingData.attribute_name);
      setAttributeValue(settingData.attribute_value);
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to load setting details.",
      });
    }
  };

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!attributeName || !attributeValue) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Both fields are required.",
      });
      setIsSubmitting(false);
      return;
    }

    const updatedSetting: Setting = {
      attribute_name: attributeName,
      attribute_value: attributeValue,
    };

    try {
      await updateSetting(settingId!, updatedSetting); // Submit the updated setting to the API
      toast({
        variant: "success",
        title: "Success",
        description: "Setting updated successfully.",
      });
      router.push("/admin/setting"); // Redirect to settings list after success
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to update setting.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Edit Setting</h1>
          <p className="text-gray-500">Update the attribute details</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Edit Attribute</CardTitle>
            <CardDescription className="text-gray-500">
              Modify the details below to update the attribute
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Attribute Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Attribute Name</label>
                <Input
                  value={attributeName}
                  onChange={(e) => setAttributeName(e.target.value)}
                  placeholder="Enter attribute name"
                  required
                />
              </div>

              {/* Attribute Value */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Attribute Value</label>
                <Input
                  value={attributeValue}
                  onChange={(e) => setAttributeValue(e.target.value)}
                  placeholder="Enter attribute value"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Update Attribute</span>
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

export default SettingEditForm;
