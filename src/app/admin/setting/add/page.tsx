"use client";

import React, { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { createSetting, Setting } from "@/lib/api"; // API function and Setting interface

const AddSettingForm: React.FC = () => {
  const [attributeName, setAttributeName] = useState<string>(""); // Attribute Name
  const [attributeValue, setAttributeValue] = useState<string>(""); // Attribute Value
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!attributeName || !attributeValue) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Both Attribute Name and Attribute Value are required.",
      });
      setIsSubmitting(false);
      return;
    }

    const newSetting: Setting = {
      attribute_name: attributeName,
      attribute_value: attributeValue,
    };

    try {
      await createSetting(newSetting); // Submit the new setting
      toast({
        variant: "success",
        title: "Success",
        description: "Attribute created successfully.",
      });

      setAttributeName("");
      setAttributeValue("");
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to create attribute.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Attributes Management</h1>
          <p className="text-gray-500">Create a new attribute</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">New Attribute</CardTitle>
            <CardDescription className="text-gray-500">
              Add an attribute name and its value
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
            </form>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full h-11 bg-primary"
              disabled={isSubmitting}
              onClick={onSubmit}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Save Attribute</span>
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AddSettingForm;
