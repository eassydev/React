"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { fetchWalletOfferById, updateWalletOffer, WalletOffer } from "@/lib/api"; // Import API

const WalletOfferEditForm: React.FC = () => {
  const [eventType, setEventType] = useState<string>("sign_up");
  const [esCash, setEsCash] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [orderAmount, setOrderAmount] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Extract WalletOffer ID from URL
  const walletOfferId = pathname?.split("/").pop();

  // Load Wallet Offer Data
  useEffect(() => {
    if (walletOfferId) {
      const fetchData = async () => {
        try {
          const offer: WalletOffer = await fetchWalletOfferById(parseInt(walletOfferId));
          setEventType(offer.event_type);
          setEsCash(offer.es_cash.toString());
          setStartDate(offer.start_date);
          setEndDate(offer.end_date);
          setIsActive(offer.is_active);
          setOrderAmount(offer.order_amount?.toString() || "");
        } catch (error: any) {
          toast({
            variant: "error",
            title: "Error",
            description: "Failed to load wallet offer details.",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [walletOfferId]);

  // Handle Update Form Submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!esCash || !startDate || !endDate) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "All required fields must be filled.",
      });
      setIsSubmitting(false);
      return;
    }

    const updatedOffer: WalletOffer = {
      event_type: eventType as WalletOffer["event_type"],
      es_cash: parseFloat(esCash),
      start_date: startDate,
      end_date: endDate,
      is_active: isActive,
      order_amount: orderAmount ? parseInt(orderAmount) : null,
    };

    try {
      await updateWalletOffer(parseInt(walletOfferId!), updatedOffer);
      toast({
        variant: "success",
        title: "Success",
        description: "Wallet offer updated successfully.",
      });
      router.push("/wallet-offers"); // Redirect on success
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to update wallet offer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Edit Wallet Offer</h1>
          <p className="text-gray-500">Update wallet offer details</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div>
              <CardTitle className="text-xl text-gray-800">Update Wallet Offer</CardTitle>
              <CardDescription className="text-gray-500">
                Modify the wallet offer details below.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Event Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full border rounded-md p-2"
                >
                  <option value="sign_up">Sign Up</option>
                  <option value="order">Order</option>
                  <option value="referral">Referral</option>
                  <option value="sign_up_referral">Sign Up Referral</option>
                </select>
              </div>

              {/* ES Cash */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">ES Cash</label>
                <Input
                  value={esCash}
                  onChange={(e) => setEsCash(e.target.value)}
                  placeholder="Enter ES Cash amount"
                  required
                />
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              {/* Order Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Order Amount</label>
                <Input
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  placeholder="Enter optional order amount"
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
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Update Wallet Offer</span>
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

export default WalletOfferEditForm;
