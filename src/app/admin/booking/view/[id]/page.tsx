"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from "next/navigation";
import { fetchBookingById, fetchProviders, updateBookingProvider, updateBookingStatus, initiateRefund } from '@/lib/api';

const ViewBookingPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const bookingId = pathname?.split("/").pop();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);
  const [status, setStatus] = useState<string>('accepted');
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const { toast } = useToast();
  const [isProcessingRefund, setIsProcessingRefund] = useState<boolean>(false);

  useEffect(() => {
    const loadBookingDetails = async () => {
      if (!bookingId) return;

      try {
        const booking = await fetchBookingById(bookingId.toString());
        setBookingDetails(booking);

        setProviderId(booking.provider_id.toString());
        setStatus(booking.status || 'accepted');

        const providerData = await fetchProviders();
        setProviders(
          providerData.map((provider: any) => ({
            id: provider.id,
            name: provider.first_name,
          }))
        );
      } catch (error) {
        console.log("error",error)
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to load booking details.",
        });
      }
    };

    loadBookingDetails();
  }, [bookingId, toast]);

  const onProcessRefund = async () => {
  
    setIsProcessingRefund(true);

    try {
      await initiateRefund(bookingId!.toString());

      toast({
        variant: "success",
        title: "Success",
        description: "Refund processed successfully.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: `Failed to process refund: ${error}`,
      });
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const onUpdateProvider = async (value:any) => {

    try {
      await updateBookingProvider(bookingId!.toString(),value);

      toast({
        variant: "success",
        title: "Success",
        description: "Provider updated successfully.",
      });
    //  router.push("/admin/booking");
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: `Failed to update provider: ${error}`,
      });
    } finally {
    }
  };

  const onUpdateStatus = async (value:any) => {

    try {
      await updateBookingStatus(bookingId!.toString(), value);

      toast({
        variant: "success",
        title: "Success",
        description: "Status updated successfully.",
      });
      //router.push("/admin/booking");
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: `Failed to update status: ${error}`,
      });
    } finally {
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-left space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
        <p className="text-gray-500">View and update booking details</p>
      </div>

      <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
        <CardHeader className="border-b border-gray-100 pb-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-1 bg-blue-600 rounded-full" />
            <div>
              <CardTitle>Booking Information</CardTitle>
              <CardDescription>Details about the booking</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {bookingDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg">Customer Information</h3>
                <p><strong>First Name:</strong> {bookingDetails.user?.first_name || "N/A"}</p>
                <p><strong>Last Name:</strong> {bookingDetails.user?.last_name || "N/A"}</p>
                <p><strong>Mobile:</strong> {bookingDetails.user?.mobile || "N/A"}</p>
                <p><strong>Email:</strong> {bookingDetails.user?.email || "N/A"}</p>
                <p><strong>Gender:</strong> {bookingDetails.user?.gender || "N/A"}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg">Provider Information</h3>
                <p><strong>Current Provider:</strong> {bookingDetails.provider?.first_name || "N/A"}</p>
                <p><strong>Mobile:</strong> {bookingDetails.provider?.phone || "N/A"}</p>
                <p><strong>Email:</strong> {bookingDetails.provider?.company_name || "N/A"}</p>
                <p><strong>Gender:</strong> {bookingDetails.provider?.gender || "N/A"}</p>
                <p><strong>Address:</strong> {bookingDetails.address.flat_no || "N/A"}-{bookingDetails.address.building_name || "N/A"}-{bookingDetails.address.street_address || "N/A"}-{bookingDetails.address.city || "N/A"}</p>
              </div>

              <div className="col-span-2">
                <h3 className="font-semibold text-lg">Booking Details</h3>
                <p><strong>Order ID:</strong> {bookingDetails.booking_id || "N/A"}</p>
                <p><strong>Service Date:</strong> {bookingDetails.booking_date || "N/A"}</p>
                <p><strong>Service Time:</strong> {bookingDetails.booking_time_from || "N/A"} -  {bookingDetails.booking_time_to || "N/A"}</p>
               
                <p><strong>Category:</strong> {bookingDetails.category?.name || "N/A"}</p>
                <p><strong>Subcategory:</strong> {bookingDetails.subcategory?.name || "N/A"}</p>
                <p><strong>Package:</strong> {bookingDetails.package?.name || "N/A"}</p>
                <p><strong>Sub Total:</strong> ₹{bookingDetails.total_amount || 0}</p>
                <p><strong>Discount:</strong> ₹{bookingDetails.discount_amount || 0}</p>
                <p><strong>Final Total:</strong> ₹{bookingDetails.final_amount || 0}</p>
              </div>
            </div>
          )}

<Select
  value={String(providerId)}
  onValueChange={(value) => {
    setProviderId(value);
    onUpdateProvider(value); // Call update provider API on change
  }}
>
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


          <div>
            <label className="text-sm font-medium text-gray-700">Change Status</label>
            <select
  name="status"
  id="statusSelect"
  className="form-control bg-white border-gray-200 p-2 rounded"
  value={status}
  onChange={(e) => {
    setStatus(e.target.value);
    onUpdateStatus(e.target.value); // Call update status API on change
  }}
>
  <option value="completed">Completed</option>
  <option value="cancelled">Cancelled</option>
  <option value="pending">Pending</option>
  <option value="accepted">Accepted</option>
  <option value="running">Running</option>
  <option value="initiated">Initiated</option>
</select>

          </div>

          <Button
                className="mt-2"
                disabled={isProcessingRefund}
                onClick={onProcessRefund}
              >
                {isProcessingRefund ? "Processing..." : "Process Refund"}
              </Button>
        </CardContent>

        <CardFooter>
         
        </CardFooter>
      </Card>
    </div>
  </div>
  );
};

export default ViewBookingPage;
