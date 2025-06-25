"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, MapPin, Phone, Mail, CreditCard, Clock, Package, Shield, Users, Webhook, FileText } from "lucide-react";
import { fetchWolooBookingById, WolooBooking } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const WolooBookingDetails = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [booking, setBooking] = useState<WolooBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (params.id) {
          const response = await fetchWolooBookingById(params.id as string);
          setBooking(response.data);
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
        toast({
          title: "Error",
          description: "Failed to fetch booking details.",
          variant: "destructive",
        });
        router.push("/admin/woloo/bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [params.id, toast, router]);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      accepted: 'bg-blue-200 text-blue-800',
      running: 'bg-green-200 text-green-800',
      rescheduled: 'bg-orange-200 text-orange-800',
      completed: 'bg-green-200 text-green-800',
      cancelled: 'bg-red-200 text-red-800',
    };

    return (
      <span className={`badge px-3 py-1 rounded-full text-sm font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-200 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Booking not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/admin/woloo/bookings">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Booking Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Booking Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Order ID:</span>
              <span className="text-blue-600 font-mono">{booking.woloo_order_id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              {getStatusBadge(booking.status)}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Service Category:</span>
              <span>{booking.service_category}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Rate Card:</span>
              <div className="text-right">
                <div className="font-medium">{booking.rateCard?.name || 'N/A'}</div>
                <div className="text-sm text-gray-500 font-mono">ID: {booking.ratecard_id}</div>
              </div>
            </div>
            {booking.rateCard && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Rate Card Price:</span>
                <div className="text-right">
                  <span className="text-green-600 font-bold">₹{booking.rateCard.price}</span>
                  {booking.rateCard.strike_price && (
                    <span className="text-gray-500 line-through ml-2 text-sm">₹{booking.rateCard.strike_price}</span>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-medium">Booking Date:</span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {booking.booking_date}
              </span>
            </div>
            {booking.booking_time && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Booking Time:</span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {booking.booking_time}
                </span>
              </div>
            )}
            {(booking.start_service_time || booking.end_service_time) && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Service Time:</span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {booking.start_service_time || 'N/A'} - {booking.end_service_time || 'N/A'}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-medium">Final Price:</span>
              <span className="text-green-600 font-bold text-lg">₹{booking.final_price}</span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Name:</span>
              <span>{booking.customer_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Mobile:</span>
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                {booking.customer_mobile}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Email:</span>
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {booking.customer_email}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Pincode:</span>
              <span>{booking.pincode}</span>
            </div>
          </CardContent>
        </Card>

        {/* Service Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Service Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-700 whitespace-pre-wrap">
              {booking.customer_address}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Pincode: {booking.pincode}
            </div>
          </CardContent>
        </Card>

        {/* Provider & Staff Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Provider & Staff Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Provider ID:</span>
              <span>{booking.provider_id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Provider Name:</span>
              <span>{booking.provider_name || 'Not Assigned'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Provider Mobile:</span>
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                {booking.provider_mobile || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Staff ID:</span>
              <span>{booking.staff_id || 'Not Assigned'}</span>
            </div>
          </CardContent>
        </Card>

        {/* OTP & Service Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Service Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Start Service OTP:</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {booking.start_service_otp || 'Not Generated'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">End Service OTP:</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {booking.end_service_otp || 'Not Generated'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Webhook & System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Webhook className="w-5 h-5 mr-2" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Created At:</span>
              <span>{new Date(booking.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Updated At:</span>
              <span>{new Date(booking.updated_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Woloo Notified At:</span>
              <span>{booking.woloo_notified_at ? new Date(booking.woloo_notified_at).toLocaleString() : 'Not Notified'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Payment Status:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                booking.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {booking.payment_status || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Payment Method:</span>
              <span>{booking.payment_method || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Transaction ID:</span>
              <span className="font-mono text-sm">{booking.transaction_id || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Admin Notes */}
        {booking.admin_notes && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Admin Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 whitespace-pre-wrap bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                {booking.admin_notes}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Notes */}
        {booking.notes && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 whitespace-pre-wrap">
                {booking.notes}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 mt-6">
        <Link href="/admin/woloo/bookings">
          <Button variant="outline">
            Back to Bookings
          </Button>
        </Link>
        <Button onClick={() => window.print()}>
          Print Details
        </Button>
      </div>
    </div>
  );
};

export default WolooBookingDetails;
