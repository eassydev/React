"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { fetchHubById, updateHub, Hub } from "@/lib/api";

const EditHubForm: React.FC = () => {
  const [hub_name, setHubName] = useState<string>("");
  const [hub_priority, setHubPriority] = useState<string>("");
  const [is_active, setIsActive] = useState<boolean>(true); // Active switch state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Extract the Hub ID from the URL path
  const hubId = pathname?.split("/").pop();

  useEffect(() => {
    if (hubId) {
      // Fetch hub details by ID
      const fetchHub = async () => {
        try {
          const hub: Hub = await fetchHubById(hubId);
          setHubName(hub.hub_name);
          setHubPriority(hub.hub_priority);
          setIsActive(hub.is_active ?? true);
        } catch (error: any) {
          toast({
            variant: "error",
            title: "Error",
            description: error.message || "Failed to fetch hub details.",
          });
        }
      };

      fetchHub();
    }
  }, [hubId, toast]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!hub_name || !hub_priority) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Hub name and priority are required.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Construct the updated hub object
      const updatedHub: Hub = {
        hub_name,
        hub_priority,
        is_active, // Set the is_active status
      };

      await updateHub(hubId as string, updatedHub);

      toast({
        variant: "success",
        title: "Success",
        description: "Hub updated successfully!",
      });

      // Redirect to hub list
      router.push("/admin/hub");
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to update hub.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Hub Management</h1>
        <p className="text-gray-500">Edit hub details</p>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Edit Hub</CardTitle>
            <CardDescription>Update the details below to edit the hub entry.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Hub Name Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">Hub Name</label>
                <Input
                  value={hub_name}
                  onChange={(e) => setHubName(e.target.value)}
                  placeholder="Enter hub name"
                  required
                />
              </div>

              {/* Hub Priority Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">Hub Priority</label>
                <Input
                  value={hub_priority}
                  onChange={(e) => setHubPriority(e.target.value)}
                  placeholder="Enter hub priority"
                  required
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch checked={is_active} onCheckedChange={setIsActive} />
                <span className="text-sm text-gray-700">Active</span>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
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

export default EditHubForm;
