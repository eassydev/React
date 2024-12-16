"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { updateBank, fetchBankById, Bank } from "@/lib/api"; // Import API functions and Bank interface

const EditBankForm: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();
  const { id: bankId } = useParams(); // Assuming the bank ID is passed in the route

  // Fetch bank details for editing
  useEffect(() => {
    const loadBankData = async () => {
      try {
        const bank: Bank = await fetchBankById(bankId.toString());
        setName(bank.name);
        setIsActive(bank.is_active); // Assuming 1 is active, 2 is inactive
      } catch (error) {
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to load bank data.",
        });
      }
    };

    loadBankData();
  }, [bankId]);

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Bank name is required.",
      });
      setIsSubmitting(false);
      return;
    }

    const updatedBank: Bank = {
      id: bankId.toString(), // Include ID for update
      name,
      is_active: isActive, // Assuming 1 is active, 2 is inactive
    };

    try {
      await updateBank(bankId.toString(), updatedBank); // Submit updated bank data to the API
      toast({
        variant: "success",
        title: "Success",
        description: "Bank updated successfully.",
      });

      router.push("/admin/bank"); // Redirect to the bank list after update
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to update bank.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Bank Management</h1>
          <p className="text-gray-500">Edit bank details</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">Edit Bank</CardTitle>
                <CardDescription className="text-gray-500">
                  Update the details below to modify the bank record
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Bank Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Bank Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter bank name"
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
              <Button className="w-100 flex-1 h-11 bg-primary" disabled={isSubmitting} onClick={onSubmit}>
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
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

export default EditBankForm;
