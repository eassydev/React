"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { createHub, Hub } from "@/lib/api";

const AddHubForm: React.FC = () => {
  const [hub_name, setHubName] = useState<string>("");
  const [hub_priority, setHubPriority] = useState<string>("");
  const [is_active, setIsActive] = useState<boolean>(true); // Active switch state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!hub_name) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Hub name is required.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Construct the hub object
      const newHub: Hub = {
        hub_name,
        hub_priority,
        is_active, // Set the is_active status
      };

      await createHub(newHub);

      toast({
        variant: "success",
        title: "Success",
        description: "Hub created successfully!",
      });

      // Redirect to hub list
      router.push("/admin/hub");
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to create hub.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Hub Management</h1>
        <p className="text-gray-500">Create a new hub</p>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>New Hub</CardTitle>
            <CardDescription>Fill in the details below to create a new hub entry.</CardDescription>
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
                  type="text"
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
                    <span>Save Hub</span>
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

export default AddHubForm;
