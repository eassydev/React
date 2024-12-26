"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { fetchAllProvidersWithoupagination, createStaff, Staff, Provider} from "@/lib/api"; // Add staff creation API
import { useRouter, useParams } from "next/navigation";

const AddStaffForm: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]); // State for providers list
  const [providerId, setProviderId] = useState<string>(""); // State for selected provider
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [gender, setGender] = useState<string>("male");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [adharCardNumber, setAdharCardNumber] = useState<string>("");
  const [panNumber, setPanNumber] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [adhaarCardFront, setAdhaarCardFront] = useState<File | null>(null);
  const [adhaarCardBack, setAdhaarCardBack] = useState<File | null>(null);
  const [panCard, setPanCard] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch all providers on component mount
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const data = await fetchAllProvidersWithoupagination();
        setProviders(data);
      } catch (error: any) {
        toast({
          variant: "error",
          title: "Error",
          description: error.message || "Failed to load providers.",
        });
      }
    };

    loadProviders();
  }, [toast]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!firstName || !phone || !providerId) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Provider, First Name, and Phone are required.",
      });
      setIsSubmitting(false);
      return;
    }

    const staffData: Staff = {
      parent_id: providerId,
      first_name: firstName,
      last_name: lastName,
      gender: gender as "male" | "female" | "other",
      email,
      phone,
      adhaar_card_front: adhaarCardFront,
      adhaar_card_back: adhaarCardBack,
      pan_number:panNumber,
      pan_card: panCard,
      adhar_card_number:adharCardNumber,
      designation: "Staff",
      active: isActive,
    };

    try {
           await createStaff(staffData);
      toast({
        variant: "success",
        title: "Success",
        description: "Staff created successfully.",
      });
      router.push("/admin/staff");
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to create staff.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500">Add a new staff member</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">New Staff</CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below to add a new staff member
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Provider Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Provider</label>
                <select
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="" disabled>
                    Select a Provider
                  </option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.first_name} {provider.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border p-2 rounded">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              {/* Aadhaar Card Front */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Aadhaar Card Front</label>
                <Input
                  type="file"
                  onChange={(e) => setAdhaarCardFront(e.target.files?.[0] || null)}
                />
              </div>

              {/* Aadhaar Card Back */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Aadhaar Card Back</label>
                <Input
                  type="file"
                  onChange={(e) => setAdhaarCardBack(e.target.files?.[0] || null)}
                />
              </div>

              {/* PAN Card */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">PAN Card</label>
                <Input
                  type="file"
                  onChange={(e) => setPanCard(e.target.files?.[0] || null)}
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
                    <span>Save Staff</span>
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

export default AddStaffForm;
