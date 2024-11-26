"use client";

import React, { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { createGstRate, GstRate } from "@/lib/api"; // Import the API function and GST Rate interface

const AddGSTForm: React.FC = () => {
  const [cgst, setCgst] = useState<number | string>("");
  const [sgst, setSgst] = useState<number | string>("");
  const [igst, setIgst] = useState<number | string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!cgst || !sgst || !igst) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "All fields are required.",
      });
      setIsSubmitting(false);
      return;
    }

    if (isNaN(Number(cgst)) || isNaN(Number(sgst)) || isNaN(Number(igst))) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "CGST, SGST, and IGST must be valid numbers.",
      });
      setIsSubmitting(false);
      return;
    }

    // Construct the GST Rate object
    const newGstRate: GstRate = {
      CGST: Number(cgst),
      SGST: Number(sgst),
      IGST: Number(igst),
      is_active: isActive,
    };

    try {
      await createGstRate(newGstRate); // Submit the GST Rate object to the API
      toast({
        variant: "success",
        title: "Success",
        description: "GST Rate created successfully.",
      });

      // Reset form fields after successful submission
      setCgst("");
      setSgst("");
      setIgst("");
      setIsActive(true);
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to create GST Rate.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">GST Rate Management</h1>
          <p className="text-gray-500">Create a new GST Rate</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">New GST Rate</CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below to create a new GST Rate
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* CGST Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">CGST (%)</label>
                <Input
                  type="number"
                  value={cgst}
                  onChange={(e) => setCgst(e.target.value)}
                  placeholder="Enter CGST percentage"
                  required
                />
              </div>

              {/* SGST Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">SGST (%)</label>
                <Input
                  type="number"
                  value={sgst}
                  onChange={(e) => setSgst(e.target.value)}
                  placeholder="Enter SGST percentage"
                  required
                />
              </div>

              {/* IGST Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">IGST (%)</label>
                <Input
                  type="number"
                  value={igst}
                  onChange={(e) => setIgst(e.target.value)}
                  placeholder="Enter IGST percentage"
                  required
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  className="bg-primary"
                />
                <span className="text-sm text-gray-700">Active</span>
              </div>
            </form>
          </CardContent>

          <CardFooter className="border-t border-gray-100 mt-6">
            <div className="flex space-x-3 pt-6">
              <Button
                className="w-100 flex-1 h-11 bg-primary"
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
                    <span>Save GST Rate</span>
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

export default AddGSTForm;
