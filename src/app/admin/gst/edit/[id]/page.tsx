"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { fetchGstRateById, updateGstRate, GstRate } from "@/lib/api"; // Import the API functions and GST Rate interface

const EditGSTForm: React.FC = () => {
  const [cgst, setCgst] = useState<number | string>("");
  const [sgst, setSgst] = useState<number | string>("");
  const [igst, setIgst] = useState<number | string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Extract the GST rate ID from the URL path
  const gstRateId = pathname?.split("/").pop();

  useEffect(() => {
    if (gstRateId) {
      loadGstRateData(gstRateId);
    }
  }, [gstRateId]);

  // Fetch the existing GST rate data
  const loadGstRateData = async (id: string) => {
    try {
      const gstRate: GstRate = await fetchGstRateById(id);
      setCgst(gstRate.CGST);
      setSgst(gstRate.SGST);
      setIgst(gstRate.IGST);
      setIsActive(gstRate.is_active);
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to load GST rate details.",
      });
    }
  };

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

    // Construct the updated GST Rate object
    const updatedGstRate: GstRate = {
      CGST: Number(cgst),
      SGST: Number(sgst),
      IGST: Number(igst),
      is_active: isActive,
    };

    try {
      await updateGstRate(gstRateId!, updatedGstRate); // Submit the updated GST Rate object to the API
      toast({
        variant: "success",
        title: "Success",
        description: "GST Rate updated successfully.",
      });
      router.push("/gst"); // Redirect to the GST rates list after success
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to update GST Rate.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Edit GST Rate</h1>
          <p className="text-gray-500">Update GST rate details</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">Edit GST Rate</CardTitle>
                <CardDescription className="text-gray-500">
                  Update the details below to modify the GST rate
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

              {/* Submit Button */}
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Update GST Rate</span>
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

export default EditGSTForm;
