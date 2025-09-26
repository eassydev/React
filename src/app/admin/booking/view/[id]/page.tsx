'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import {
  fetchBookingById,
  fetchProviders,
  Provider,
  updateBookingProvider,
  updateBookingStatus,
  initiateRefund,
} from '@/lib/api';
import { Virtuoso } from 'react-virtuoso';
import { Input } from '@/components/ui/input';

const ViewBookingPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const bookingId = pathname?.split('/').pop();
  // Provider-related state
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedProviderName, setSelectedProviderName] = useState<string>('Select an option');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('accepted');
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [bookingCoupon, setbookingCoupon] = useState<any>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();
  const [isProcessingRefund, setIsProcessingRefund] = useState<boolean>(false);

  useEffect(() => {
    const loadBookingDetails = async () => {
      if (!bookingId) return;

      try {
        const booking = await fetchBookingById(bookingId.toString());
        console.log('🔍 Booking View API Response:', booking);
        console.log('📊 BookingItem data:', booking.booking);
        console.log('💰 Main Booking data (bookingcoupon):', booking.bookingcoupon);

        setBookingDetails(booking.booking);
        setReport(booking.report);
        setFeedback(booking.feedback);
        setbookingCoupon(booking.bookingcoupon);
        setStatus(booking.status || 'accepted');
        setSelectedProviderId(booking.provider_id?.toString() || '');
        console.log('booking.provider_id', booking.provider_id);
        if (booking.booking) {
          await loadProviders(booking.booking.provider_id?.toString() || '');
        }
      } catch (error) {
        console.log('error', error);
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Failed to load booking details.',
        });
      }
    };

    loadBookingDetails();
  }, [bookingId, toast]);

  const loadProviders = async (providerid: string) => {
    try {
      const fetchedProviders = await fetchProviders();
      setProviders(fetchedProviders);
      const selectedProvider = fetchedProviders.find(
        (provider) => provider.id?.toString() === providerid
      );

      setSelectedProviderName(`${selectedProvider?.first_name} ${selectedProvider?.last_name}`);
      console.log('tSelectedProviderName', selectedProviderId);
    } catch (error) {}
  };
  const onProcessRefund = async () => {
    setIsProcessingRefund(true);

    try {
      await initiateRefund(bookingId!.toString());

      toast({
        variant: 'success',
        title: 'Success',
        description: 'Refund processed successfully.',
      });
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Error',
        description: `Failed to process refund: ${error}`,
      });
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const onUpdateStatus = async (value: any) => {
    try {
      await updateBookingStatus(bookingId!.toString(), value);

      toast({
        variant: 'success',
        title: 'Success',
        description: 'Status updated successfully.',
      });
      //router.push("/admin/booking");
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Error',
        description: `Failed to update status: ${error}`,
      });
    } finally {
    }
  };

  const handleValueChange = async (value: string) => {
    const selectedProvider = providers.find((provider) => provider.id?.toString() === value);
    if (selectedProvider) {
      setSelectedProviderId(value);
      setSelectedProviderName(`${selectedProvider.first_name} ${selectedProvider.last_name}`);
      await updateBookingProvider(bookingId!.toString(), value);
    } else {
      setSelectedProviderName('Select an option');
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
                  <p>
                    <strong>First Name:</strong> {bookingDetails.user?.first_name || 'N/A'}
                  </p>
                  <p>
                    <strong>Last Name:</strong> {bookingDetails.user?.last_name || 'N/A'}
                  </p>
                  <p>
                    <strong>Mobile:</strong> {bookingDetails.user?.mobile || 'N/A'}
                  </p>
                  <p>
                    <strong>Email:</strong> {bookingDetails.user?.email || 'N/A'}
                  </p>
                  <p>
                    <strong>Gender:</strong> {bookingDetails.user?.gender || 'N/A'}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">Provider Information</h3>
                  <p>
                    <strong>Current Provider:</strong>{' '}
                    {bookingDetails.rateCard?.provider?.first_name ||
                      bookingDetails.provider?.first_name ||
                      'N/A'}
                  </p>
                  <p>
                    <strong>Mobile:</strong>{' '}
                    {bookingDetails.rateCard?.provider?.phone ||
                      bookingDetails.provider?.phone ||
                      'N/A'}
                  </p>
                  <p>
                    <strong>Email:</strong>{' '}
                    {bookingDetails.rateCard?.provider?.company_name ||
                      bookingDetails.provider?.company_name ||
                      'N/A'}
                  </p>
                  <p>
                    <strong>Gender:</strong>{' '}
                    {bookingDetails.rateCard?.provider?.gender ||
                      bookingDetails.provider?.gender ||
                      'N/A'}
                  </p>
                  <p>
                    <strong>Address:</strong> {bookingDetails.address?.flat_no || 'N/A'}-
                    {bookingDetails.address?.building_name || 'N/A'}-
                    {bookingDetails.address?.street_address || 'N/A'}-
                    {bookingDetails.address?.city || 'N/A'}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">Booking Details</h3>
                  <p>
                    <strong>Order ID:</strong> {bookingDetails.order_id || 'N/A'}
                  </p>
                  <p>
                    <strong>Booking ID:</strong> {bookingDetails.order_id_display || 'N/A'}
                  </p>
                  <p>
                    <strong>Service Date:</strong> {bookingDetails.booking_date || 'N/A'}
                  </p>
                  <p>
                    <strong>Service Time:</strong> {bookingDetails.booking_time_from || 'N/A'} -{' '}
                    {bookingDetails.booking_time_to || 'N/A'}
                  </p>

                  <p>
                    <strong>Category:</strong> {bookingDetails.rateCard.category?.name || 'N/A'}
                  </p>
                  <p>
                    <strong>Subcategory:</strong>{' '}
                    {bookingDetails.rateCard.subcategory?.name || 'N/A'}
                  </p>
                  <p>
                    <strong>Segment:</strong>{' '}
                    {bookingDetails.rateCard.segment?.segment_name || 'N/A'}
                  </p>
                  <p>
                    <strong>Attribute & Option:</strong>{' '}
                    {bookingDetails.rateCard.attributes
                      ?.map(
                        (attr: {
                          filterAttribute: { name: string };
                          filterOption: { value: string };
                        }) => `${attr.filterAttribute.name}: ${attr.filterOption.value}`
                      )
                      .join(', ') || 'N/A'}
                  </p>

                  <p>
                    <strong>Package:</strong> {bookingDetails.package?.name || 'N/A'}
                  </p>
                  {/* Price Breakdown Section */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-3">
                      💰 Payment Breakdown
                    </h4>
                    {(() => {
                      // Get the correct values from the right data sources
                      const totalAmountPaid = Number(bookingCoupon?.total_amount || bookingDetails.total_amount) || 0;
                      const gstAmount = Number(bookingCoupon?.total_gst || bookingDetails.total_gst) || 0;
                      const convenienceCharge = Number(bookingCoupon?.convenience_charge) || 0;
                      const discountAmount = Number(bookingDetails.discount_amount) || 0;

                      // Calculate basic service amount: total_amount - gst - convenience_charge
                      const basicServiceAmount = totalAmountPaid - gstAmount - convenienceCharge;

                      return (
                        <div className="space-y-2 text-sm text-blue-700">
                          <div className="flex justify-between">
                            <span>Basic Service Amount:</span>
                            <span>₹{basicServiceAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>GST Amount:</span>
                            <span>₹{gstAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Convenience Charge:</span>
                            <span>₹{convenienceCharge.toFixed(2)}</span>
                          </div>
                          {discountAmount > 0 && (
                            <div className="flex justify-between text-red-600">
                              <span>Discount Applied:</span>
                              <span>-₹{discountAmount.toFixed(2)}</span>
                            </div>
                          )}
                          <hr className="border-blue-300 my-2" />
                          <div className="flex justify-between font-bold text-base">
                            <span>Total Amount Paid:</span>
                            <span>₹{totalAmountPaid.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Booking Report Details</h3>
                  <p>
                    <strong>Comment:</strong> {report?.comment || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Booking Feedback Details</h3>
                  <p>
                    <strong>Rating:</strong> {feedback?.rating || 'N/A'}
                  </p>
                  <p>
                    <strong>Comment:</strong> {feedback?.comment || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Booking Coupon Details</h3>

                  <p>
                    <strong>Coupon Name:</strong> {bookingCoupon?.coupon_name || 'N/A'}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2 w-full">
              <label className="text-sm font-medium text-gray-700">Select Provider</label>
              <Select value={selectedProviderId || ''} onValueChange={handleValueChange}>
                <SelectTrigger className="w-full">
                  {selectedProviderName || 'Select an option'}
                </SelectTrigger>
                <SelectContent className="w-full p-0">
                  {/* Search input */}
                  <div className="sticky top-0 z-10 bg-background p-2 border-b">
                    <Input
                      placeholder="Search providers..."
                      value={searchTerm}
                      onChange={(e: any) => setSearchTerm(e.target.value)}
                      className="w-full"
                      autoFocus
                    />
                  </div>

                  {/* Filtered provider list */}
                  {providers.filter((provider) =>
                    `${provider.first_name} ${provider.last_name || ''}`
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  ).length > 0 ? (
                    <Virtuoso
                      style={{ height: '200px', width: '100%' }}
                      totalCount={
                        providers.filter((provider) =>
                          `${provider.first_name} ${provider.last_name || ''}`
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        ).length
                      }
                      itemContent={(index) => {
                        const filteredProviders = providers.filter((provider) =>
                          `${provider.first_name} ${provider.last_name || ''}`
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        );
                        const provider = filteredProviders[index];
                        return (
                          <SelectItem key={provider.id} value={provider.id?.toString() ?? ''}>
                            {provider.first_name} {provider.last_name || ''}
                          </SelectItem>
                        );
                      }}
                    />
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No providers found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

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

            <Button className="mt-2" disabled={isProcessingRefund} onClick={onProcessRefund}>
              {isProcessingRefund ? 'Processing...' : 'Process Refund'}
            </Button>
          </CardContent>

          <CardFooter></CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ViewBookingPage;
