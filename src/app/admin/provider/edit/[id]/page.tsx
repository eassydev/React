"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 ,FileImage} from "lucide-react";
import { fetchProviderById, updateProvider, Provider } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";

const EditProviderForm: React.FC = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [gstNumber, setGstNumber] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [panNumber, setPanNumber] = useState<string>("");
  const [linkedAccountId, setLinkedAccountId] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [rating, setRating] = useState<string>("0.0");
  const [country, setCountry] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [existingImage, setExistingImage] = useState<string>("");

  const [postalCode, setPostalCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [gstError, setGstError] = useState("");
  const [panError, setPanError] = useState("");

  const { toast } = useToast();
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const providerData = await fetchProviderById(id as string);
        setFirstName(providerData.first_name);
        setLastName(providerData.last_name);
        setGender(providerData.gender || "male");
        setEmail(providerData.email);
        setPhone(providerData.phone);
        setCompanyName(providerData.company_name || "");
        setGstNumber(providerData.gst_number || "");
        setPanNumber(providerData.pan_number || "");
        setLinkedAccountId(providerData.linked_account_id || "");
        if (typeof providerData.image === "string") {
          setExistingImage(providerData.image); // Set existing image URL
        } else {
          setExistingImage(""); // Handle unexpected values gracefully
        }
        setIsActive(providerData.active === 1);
        setRating(providerData.rating?.toString() || "0.0");
        setCountry(providerData.country || "");
        setState(providerData.state || "");
        setCity(providerData.city || "");
        setPostalCode(providerData.postal_code || "");
      } catch (error) {
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to load provider data.",
        });
      }
    };

    fetchProviderData();
  }, [id, toast]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setImage(e.target.files[0]);
      }
    };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!firstName || !phone) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "First Name and Phone are required.",
      });
      setIsSubmitting(false);
      return;
    }

    const updatedProvider: Provider = {
      first_name: firstName,
      last_name: lastName,
      gender,
      email,
      image,
      phone,
      company_name: companyName,
      gst_number: gstNumber,
      pan_number: panNumber,
      linked_account_id: linkedAccountId,
      active: isActive ? 0 : 1,
      rating: parseFloat(rating),
      country,
      state,
      city,
      postal_code: postalCode,
    };

    try {
      await updateProvider(id as string, updatedProvider);
      toast({
        variant: "success",
        title: "Success",
        description: "Provider updated successfully.",
      });
     // router.push("/admin/provider");
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to update provider.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateGST = (value: string) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/;
    setGstNumber(value); // Allow updating the input value
    if (!gstRegex.test(value) && value !== "") {
      setGstError("Invalid GST number format. Example: 22AAAAA0000A1Z5");
    } else {
      setGstError("");
    }
  };

  const validatePAN = (value: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    setPanNumber(value); // Allow updating the input value
    if (!panRegex.test(value) && value !== "") {
      setPanError("Invalid PAN number format. Example: ABCDE1234F");
    } else {
      setPanError("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Edit Provider</h1>
          <p className="text-gray-500">Update provider details</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">Edit Provider</CardTitle>
                <CardDescription className="text-gray-500">
                  Modify the details below to update provider information
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value as "male" | "female" | "other")} className="w-full border p-2 rounded">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>

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

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Company Name</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                />
              </div>

               {/* GST Number */}
             <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700">GST Number</label>
               <Input
                 value={gstNumber}
                 onChange={(e) => validateGST(e.target.value)}
                 placeholder="Enter GST number"
               />
               {gstError && <p className="text-sm text-red-500">{gstError}</p>}
             </div>

             {/* PAN Number */}
             <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700">PAN Number</label>
               <Input
                 value={panNumber}
                 onChange={(e) => validatePAN(e.target.value)}
                 placeholder="Enter PAN number"
               />
               {panError && <p className="text-sm text-red-500">{panError}</p>}
             </div>

             {/* Linked Account ID */}
             <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700">Razorpay Linked Account ID</label>
               <Input
                 value={linkedAccountId}
                 onChange={(e) => setLinkedAccountId(e.target.value)}
                 placeholder="Enter Razorpay linked account ID"
               />
             </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Country</label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Enter country"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">State</label>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Enter state"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">City</label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FileImage className="w-4 h-5 text-blue-500" />
                  <span>Image</span>
                </label>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {existingImage && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">Current Image:</span>
                    <img
                      src={existingImage}
                      alt="Existing Onboarding"
                      className="mt-2 max-h-32 rounded-md"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Postal Code</label>
                <Input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Enter postal code"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Rating</label>
                <Input
                  type="number"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="Enter rating"
                />
              </div>

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
                    <span>Updating...</span>
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

export default EditProviderForm;
