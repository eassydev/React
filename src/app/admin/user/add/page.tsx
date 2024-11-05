"use client";

import React, { useState, FormEvent } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, FileText } from "lucide-react";
import { createUser, User } from "@/lib/api"; // Import the API function and User interface


const AddUserForm: React.FC = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!firstName || !lastName || !email || !mobile) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "All fields are required.",
      });
      setIsSubmitting(false);
      return;
    }

    // Construct the User object
    const newUser: User = {
      first_name: firstName,
      last_name: lastName,
      email,
      mobile,
      is_active: isActive,
    };

    try {
      await createUser(newUser); // Submit the User object to the API
      toast({
        variant: "success",
        title: "Success",
        description: "User created successfully.",
      });

      // Reset form fields after successful submission
      setFirstName("");
      setLastName("");
      setEmail("");
      setMobile("");
      setIsActive(true);
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to create user.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Create a new user</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">New User</CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below to create a new user
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* First Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>

              {/* Last Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                />
              </div>

              {/* Mobile Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mobile</label>
                <Input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter mobile number"
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
                    <span>Save User</span>
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

export default AddUserForm;
