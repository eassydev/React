"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { fetchTransactionById, PayoutTransaction } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function TransactionDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<PayoutTransaction | null>(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTransactionById(String(id));
        setTransaction(data);
      } catch (error) {
        console.error("Error fetching transaction details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch transaction details.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTransactionDetails();
    }
  }, [id, toast]);

  // Helper function to safely format timestamps
  const formatTimestamp = (timestamp: string | number) => {
    if (!timestamp) return "N/A";
    
    try {
      // If it's a string, try to use it directly
      if (typeof timestamp === 'string') {
        return format(new Date(timestamp), "dd/MM/yyyy HH:mm");
      }
      
      // If it's a number, check if it's seconds or milliseconds
      if (typeof timestamp === 'number') {
        // Unix timestamps are typically 10 digits (seconds since epoch)
        const date = timestamp < 10000000000
          ? new Date(timestamp * 1000)  // Convert seconds to milliseconds
          : new Date(timestamp);        // Already in milliseconds
        
        return format(date, "dd/MM/yyyy HH:mm");
      }
      
      return "N/A";
    } catch (error) {
      console.error("Error formatting timestamp:", timestamp, error);
      return "Invalid Date";
    }
  };

  // Format JSON response details for display
  const formatResponseDetails = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      return jsonString; // Return as is if not valid JSON
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8 flex justify-center items-center">
        <p className="text-gray-500">Loading transaction details...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8 flex justify-center items-center">
        <p className="text-red-500">Transaction not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/admin/transactions" passHref>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
          </div>
        </div>

        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-800">Transaction Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Transaction ID</Label>
                <div className="text-sm font-medium">{transaction.id}</div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Booking ID</Label>
                <div className="text-sm font-medium">{transaction.booking_id}</div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Provider Name</Label>
                <div className="text-sm font-medium">
                  {transaction.provider 
                    ? `${transaction.provider.first_name} ${transaction.provider.last_name}` 
                    : "N/A"}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Provider Email</Label>
                <div className="text-sm font-medium">{transaction.provider?.email || "N/A"}</div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Provider Phone</Label>
                <div className="text-sm font-medium">{transaction.provider?.phone || "N/A"}</div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Linked Account ID</Label>
                <div className="text-sm font-medium">{transaction.provider?.linked_account_id || "N/A"}</div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Amount</Label>
                <div className="text-sm font-medium">₹{transaction.amount}</div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                  ${transaction.status === "Success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                  {transaction.status}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Razorpay Transfer ID</Label>
                <div className="text-sm font-medium">{transaction.razorpay_transfer_id || "N/A"}</div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Created At</Label>
                <div className="text-sm font-medium">{formatTimestamp(transaction.created_at)}</div>
              </div>
            </div>
            
            {transaction.bookingItem && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Booking Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Order ID</Label>
                    <div className="text-sm font-medium">{transaction.bookingItem.order_id}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Booking Date</Label>
                    <div className="text-sm font-medium">{transaction.bookingItem.booking_date}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Booking Time</Label>
                    <div className="text-sm font-medium">
                      {transaction.bookingItem.booking_time_from} - {transaction.bookingItem.booking_time_to}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Booking Status</Label>
                    <div className="text-sm font-medium">{transaction.bookingItem.status}</div>
                  </div>
                  
                  {transaction.bookingItem.rateCard && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">Service Name</Label>
                        <div className="text-sm font-medium">{transaction.bookingItem.rateCard.name}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">Service Price</Label>
                        <div className="text-sm font-medium">₹{transaction.bookingItem.rateCard.price}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">Category</Label>
                        <div className="text-sm font-medium">{transaction.bookingItem.rateCard.category?.name || "N/A"}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">Subcategory</Label>
                        <div className="text-sm font-medium">{transaction.bookingItem.rateCard.subcategory?.name || "N/A"}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Response Details</h3>
              <div className="bg-gray-50 p-4 rounded-md overflow-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {transaction.response_details ? formatResponseDetails(transaction.response_details) : "No response details available"}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
