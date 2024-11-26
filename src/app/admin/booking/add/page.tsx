"use client";

import React, { useState, useEffect, FormEvent } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Save, Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAllProvidersWithoupagination,
  fetchAllUsersWithouPagination,
  fetchUserAddresses,
  fetchAllCategories,
  fetchAllSubCategories,
  fetchAllRatecard,
  fetchAllpackages,
  createBooking,
} from "@/lib/api";

const CreateBookingForm: React.FC = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<string>("");
  const [deliveryAddressId, setDeliveryAddressId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [selectionType, setSelectionType] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [options, setOptions] = useState<{ id: number; name: string }[]>([]);

  const [providers, setProviders] = useState<{ id: number; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [addresses, setAddresses] = useState<{ id: number; full_address: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch providers and users on component mount
    const loadInitialData = async () => {
      try {
        const providerData = await fetchAllProvidersWithoupagination();
        const userData = await fetchAllUsersWithouPagination();

        setProviders(
          providerData.map((provider: any) => ({
            id: provider.id,
            name: `${provider.first_name} ${provider.last_name}`,
          }))
        );
        setUsers(
          userData.map((user: any) => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
          }))
        );
      } catch (error) {
        toast({ variant: "error", title: "Error", description: "Failed to load initial data." });
      }
    };

    loadInitialData();
  }, [toast]);

  useEffect(() => {
    // Fetch addresses when a user is selected
    if (userId) {
      const loadAddresses = async () => {
        try {
          const addressData = await fetchUserAddresses(userId);
          setAddresses(addressData); // addressData is already mapped in fetchUserAddresses
        } catch (error: any) {
          toast({
            variant: "error",
            title: "Error",
            description: error.message || "Failed to load user addresses.",
          });
        }
      };
  
      loadAddresses();
    } else {
      setAddresses([]); // Clear addresses if no user is selected
    }
  }, [userId, toast]);
  useEffect(() => {
    // Fetch selection options based on selectionType
    const loadOptions = async () => {
      try {
        let data: { id: number; name: string }[] = [];
        switch (selectionType) {
          case "Category":
            const categories = await fetchAllCategories();
            data = categories.map((category) => ({
              id: Number(category.id) || 0,
              name: category.name || "Unnamed Category",
            }));
            break;
          case "Subcategory":
            const subcategories = await fetchAllSubCategories();
            data = subcategories.map((subcategory) => ({
              id: Number(subcategory.id) || 0,
              name: subcategory.name || "Unnamed Subcategory",
            }));
            break;
          case "Ratecard":
            const ratecards = await fetchAllRatecard();
            data = ratecards.map((ratecard) => ({
              id: Number(ratecard.id) || 0,
              name: ratecard.name || "Unnamed Ratecard",
            }));
            break;
          case "Package":
            const packages = await fetchAllpackages();
            data = packages.map((pkg) => ({
              id: Number(pkg.id) || 0,
              name: pkg.name || "Unnamed Package",
            }));
            break;
          default:
            setOptions([]);
            return;
        }
        setOptions(data);
        setSelectedItemId(null);
      } catch (error) {
        toast({ variant: "error", title: "Error", description: `Failed to load ${selectionType} options.` });
      }
    };

    if (selectionType) loadOptions();
  }, [selectionType, toast]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!userId || !providerId || !orderNumber || !bookingDate || !deliveryAddressId || !selectionType || !selectedItemId) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData = {
        user_id: userId,
        provider_id: providerId,
        order_number: orderNumber,
        booking_date: bookingDate,
        address_id: deliveryAddressId,
        quantity,
        base_price: basePrice,
        total_amount: totalAmount,
        selection_type: selectionType,
        selection_id: selectedItemId,
      };

      await createBooking(bookingData);

      toast({
        variant: "success",
        title: "Success",
        description: "Booking created successfully.",
      });

      // Reset form fields
      setUserId(null);
      setProviderId(null);
      setOrderNumber("");
      setBookingDate("");
      setDeliveryAddressId(null);
      setQuantity(1);
      setBasePrice(0);
      setTotalAmount(0);
      setSelectionType("");
      setSelectedItemId(null);
      setOptions([]);
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to create booking.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <form onSubmit={onSubmit} className="space-y-6">
            <CardHeader>
              <CardTitle>Create New Booking</CardTitle>
              <CardDescription>Fill in the details below to create a new booking</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Select User</label>
                <Select value={String(userId)} onValueChange={(value) => setUserId(Number(value))}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Select Provider</label>
                <Select value={String(providerId)} onValueChange={(value) => setProviderId(Number(value))}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={String(provider.id)}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {userId && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Delivery Address</label>
                  <Select
                    value={String(deliveryAddressId)}
                    onValueChange={(value) => setDeliveryAddressId(Number(value))}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select Address" />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses.map((address) => (
                        <SelectItem key={address.id} value={String(address.id)}>
                          {address.full_address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Order Number</label>
                <Input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter order number"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Booking Date</label>
                <Input
                  type="datetime-local"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Selection Type</label>
                <Select value={selectionType} onValueChange={(value) => setSelectionType(value)}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Category">Category</SelectItem>
                    <SelectItem value="Subcategory">Subcategory</SelectItem>
                    <SelectItem value="Ratecard">Ratecard</SelectItem>
                    <SelectItem value="Package">Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectionType && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Select {selectionType}</label>
                  <Select value={String(selectedItemId)} onValueChange={(value) => setSelectedItemId(Number(value))}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder={`Select ${selectionType}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Base Price</label>
                <Input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  placeholder="Enter base price"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Total Amount</label>
                <Input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  placeholder="Enter total amount"
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Booking
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateBookingForm;
