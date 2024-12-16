"use client";
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, FileText, Loader2, Tag, DollarSign, Calendar, Settings } from "lucide-react";
import { fetchVIPPlanById, updateVIPPlan } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";

// Importing React-Quill dynamically
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

// Custom toolbar configuration for React-Quill
const quillModules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const EditVIPPlanForm: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [planName, setPlanName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [discountPrice, setDiscountPrice] = useState<string>("");
  const [platformFees, setPlatformFees] = useState<boolean>(true);
  const [noOfBookings, setNoOfBookings] = useState<string>("0");
  const [description, setDescription] = useState<string>("");
  const [validityPeriod, setValidityPeriod] = useState<string>("30");
  const [image, setImage] = useState<File | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch existing VIP plan data by ID
  useEffect(() => {
    const fetchVIPPlan = async () => {
      try {
        const vipPlan = await fetchVIPPlanById(id.toString());
        setPlanName(vipPlan.plan_name);
        setPrice(vipPlan.price.toString());
        setDiscountPrice(vipPlan.discount_price ? vipPlan.discount_price.toString() : "");
        setPlatformFees(vipPlan.platform_fees);
        setNoOfBookings(vipPlan.no_of_bookings.toString());
        setDescription(vipPlan.description);
        setValidityPeriod(vipPlan.validity_period.toString());
        setIsActive(vipPlan.status);
      } catch (error) {
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to load VIP plan data.",
        });
      }
    };
    fetchVIPPlan();
  }, [id, toast]);

  // Handle image selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const vipPlanData = {
      plan_name: planName,
      description,
      image,
      discount_price: parseFloat(discountPrice),
      validity_period: parseInt(validityPeriod),
      price: parseFloat(price),
      platform_fees: platformFees,
      no_of_bookings: parseInt(noOfBookings),
      status: isActive,
    };

    try {
      const response = await updateVIPPlan(id.toString(), vipPlanData);
      toast({
        variant: "success",
        title: "Success",
        description: response.message,
      });
     router.push("/admin/vip-plan");
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: `Failed to update VIP plan: ${error.message || error}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Edit VIP Plan</h1>
          <p className="text-gray-500">Modify the details of the VIP plan</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">Edit VIP Plan</CardTitle>
                <CardDescription className="text-gray-500">
                  Update the fields below to edit the VIP plan
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Plan Name Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Tag className="w-4 h-4 text-blue-500" />
                  <span>Plan Name</span>
                </label>
                <Input
                  placeholder="Enter VIP plan name"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              {/* Price Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <span>Price</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              {/* Discount Price */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Discount Price</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter discount price"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Platform Fees Switch */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Settings className="w-4 h-4 text-blue-500" />
                  <span>Platform Fees</span>
                </label>
                <Switch
                  checked={platformFees}
                  onCheckedChange={setPlatformFees}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>

              {/* Number of Bookings */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Number of Bookings</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter number of bookings"
                  value={noOfBookings}
                  onChange={(e) => setNoOfBookings(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              {/* Validity Period Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Validity Period (days)</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter validity period"
                  value={validityPeriod}
                  onChange={(e) => setValidityPeriod(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              {/* Description Field with React-Quill */}
              <div className="space-y-2" style={{ height: "270px" }}>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-5 text-blue-500" />
                  <span>Description</span>
                </label>
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  theme="snow"
                  modules={quillModules}
                  style={{ height: "200px" }}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>Upload Image</span>
                </label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>

              {/* Active Status Switch */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>VIP Plan Status</span>
                </label>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Inactive</span>
                  <Switch
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    className="data-[state=checked]:bg-blue-500"
                  />
                  <span className="text-sm text-gray-600">Active</span>
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <Button
                  className="w-100 flex-1 h-11 bg-primary"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Update VIP Plan</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditVIPPlanForm;
