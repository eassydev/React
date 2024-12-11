"use client";

import React, { useState, FormEvent } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, FileText } from "lucide-react";
import { createPermission, Permission } from "@/lib/api"; // Import API and interface

const AddPermissionForm: React.FC = () => {
  const [permission_name, setPermissionanme] = useState<string>("");
  const [route, setRoute] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!permission_name || !route) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "All fields are required.",
      });
      setIsSubmitting(false);
      return;
    }

    // Construct the Permission object
    const newPermission: Permission = {
      permission_name,
      route,
    };

    try {
      await createPermission(newPermission); // Submit to the API
      toast({
        variant: "success",
        title: "Success",
        description: "Permission created successfully.",
      });

      // Reset form fields after submission
      setPermissionanme("");
      setRoute("");
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to create permission.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Permissions Management</h1>
          <p className="text-gray-500">Create a new permission</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">New Permission</CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below to create a new permission.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input
                  value={permission_name}
                  onChange={(e) => setPermissionanme(e.target.value)}
                  placeholder="Enter permission name"
                  required
                />
              </div>

              {/* Route Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Route</label>
                <Input
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  placeholder="Enter route (e.g., /api/permissions)"
                  required
                />
              </div>

              
            </form>
          </CardContent>

          <CardFooter className="border-t border-gray-100 mt-6">
            <div className="flex space-x-3 pt-6">
              <Button className="w-100 flex-1 h-11 bg-primary" disabled={isSubmitting} onClick={onSubmit}>
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Permission</span>
                  </div>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AddPermissionForm;
