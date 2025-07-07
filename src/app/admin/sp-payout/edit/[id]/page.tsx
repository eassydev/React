'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { fetchPayoutById, updatePayout } from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { format, addHours } from 'date-fns';

interface Provider {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  linked_account_id: string;
}

interface PayoutDetails {
  id: string;
  sampleid: number; // Decrypted ID for display
  booking_id: number;
  order_id: string;
  provider_id: string;
  provider_name: string;
  service_amount: number;
  commission_rate: number;
  commission_amount: number;
  base_tcs: number;
  base_tds: number;
  base_payable: number;
  total_payable: number;
  remaining_amount: number;
  settled_amount: number;
  payout_status: string;
  scheduled_transfer: string;
  allow_transfer: string;
  razorpay_transfer_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  provider: Provider;
}

export default function EditSpPayoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [payout, setPayout] = useState<PayoutDetails | null>(null);
  const [formData, setFormData] = useState({
    remaining_amount: 0,
    scheduled_transfer: '',
    allow_transfer: 'no',
    notes: '',
  });
  const [errors, setErrors] = useState({
    remaining_amount: '',
    scheduled_transfer: '',
  });

  useEffect(() => {
    const fetchPayoutDetails = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPayoutById(String(id));
        setPayout(data);
        setFormData({
          remaining_amount: data.remaining_amount,
          scheduled_transfer: data.scheduled_transfer || '',
          allow_transfer: data.allow_transfer || 'no',
          notes: data.notes || '',
        });

        // Automatically set editing mode if status is not "Paid"
        if (data.payout_status !== 'Paid') {
          setIsEditing(true);
        }
      } catch (error) {
        console.error('Error fetching payout details:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch payout details.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPayoutDetails();
    }
  }, [id, toast]);

  const formatDateForAPI = (dateString: string) => {
    try {
      // Parse the date string to a Date object
      const date = new Date(dateString);

      // Add 5 hours and 30 minutes to convert to IST timezone (UTC+5:30)
      // First add 5 hours
      let istDate = addHours(date, 5);
      // Then add 30 minutes (0.5 hours doesn't work with addHours)
      istDate = new Date(istDate.getTime() + 30 * 60 * 1000);

      // Format with explicit timezone
      const formattedDate = format(istDate, "yyyy-MM-dd'T'HH:mm:ss.SSS");
      return `${formattedDate}+05:30`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // Helper function to safely format timestamps
  const formatTimestamp = (timestamp: string | number) => {
    if (!timestamp) return 'N/A';

    try {
      // If it's a string, try to use it directly
      if (typeof timestamp === 'string') {
        return timestamp;
      }

      // If it's a number, check if it's seconds or milliseconds
      if (typeof timestamp === 'number') {
        // Unix timestamps are typically 10 digits (seconds since epoch)
        const date =
          timestamp < 10000000000
            ? new Date(timestamp * 1000) // Convert seconds to milliseconds
            : new Date(timestamp); // Already in milliseconds

        return format(date, 'dd/MM/yyyy HH:mm');
      }

      return 'N/A';
    } catch (error) {
      console.error('Error formatting timestamp:', timestamp, error);
      return 'Invalid Date';
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      remaining_amount: '',
      scheduled_transfer: '',
    };

    // Validate remaining amount
    const remainingAmount = parseFloat(formData.remaining_amount.toString());
    if (isNaN(remainingAmount)) {
      newErrors.remaining_amount = 'Remaining amount must be a valid number.';
      valid = false;
    } else if (remainingAmount < 0) {
      newErrors.remaining_amount = 'Remaining amount cannot be negative.';
      valid = false;
    } else if (payout && remainingAmount > payout.total_payable - payout.settled_amount) {
      const maxAmount =
        typeof payout.total_payable === 'number' && typeof payout.settled_amount === 'number'
          ? (payout.total_payable - payout.settled_amount).toFixed(2)
          : payout.total_payable - payout.settled_amount;
      newErrors.remaining_amount = `Remaining amount cannot exceed ${maxAmount}.`;
      valid = false;
    }

    // Validate scheduled transfer date
    if (formData.scheduled_transfer && !Date.parse(formData.scheduled_transfer)) {
      newErrors.scheduled_transfer = 'Scheduled transfer date is invalid.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when field is changed
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the date for API if it exists
      const formattedData = {
        ...formData,
        scheduled_transfer: formData.scheduled_transfer
          ? formatDateForAPI(formData.scheduled_transfer)
          : undefined,
      };

      await updatePayout(String(id), formattedData);

      toast({
        title: 'Success',
        description: 'Payout updated successfully.',
      });

      // Redirect to the listing page after successful update
      router.push('/admin/sp-payout');
    } catch (error: any) {
      console.error('Error updating payout:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update payout.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if fields should be editable based on payout status

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8 flex justify-center items-center">
        <p className="text-gray-500">Loading payout details...</p>
      </div>
    );
  }

  if (!payout) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8 flex justify-center items-center">
        <p className="text-red-500">Payout not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/admin/sp-payout" passHref>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Payout Details</h1>
          </div>

          {payout && payout.payout_status === 'Paid' ? (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm">
              This payout is already paid and cannot be edited
            </div>
          ) : (
            isEditing && (
              <div className="flex space-x-2">
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save & Return
                    </>
                  )}
                </Button>
              </div>
            )
          )}
        </div>

        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Payout Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Read-only fields */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Payout ID</Label>
                  <div className="text-sm font-medium font-mono">{payout.sampleid}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Order ID</Label>
                  <div className="text-sm font-medium">{payout.order_id}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Provider Name</Label>
                  <div className="text-sm font-medium">{payout.provider_name}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Provider Email</Label>
                  <div className="text-sm font-medium">{payout.provider?.email || 'N/A'}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Service Amount</Label>
                  <div className="text-sm font-medium">
                    ₹
                    {typeof payout.service_amount === 'number'
                      ? payout.service_amount.toFixed(2)
                      : payout.service_amount}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Commission Rate</Label>
                  <div className="text-sm font-medium">{payout.commission_rate}%</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Commission Amount</Label>
                  <div className="text-sm font-medium">
                    ₹
                    {typeof payout.commission_amount === 'number'
                      ? payout.commission_amount.toFixed(2)
                      : payout.commission_amount}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">TCS</Label>
                  <div className="text-sm font-medium">
                    ₹
                    {typeof payout.base_tcs === 'number'
                      ? payout.base_tcs.toFixed(2)
                      : payout.base_tcs}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">TDS</Label>
                  <div className="text-sm font-medium">
                    ₹
                    {typeof payout.base_tds === 'number'
                      ? payout.base_tds.toFixed(2)
                      : payout.base_tds}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Base Payable</Label>
                  <div className="text-sm font-medium">
                    ₹
                    {typeof payout.base_payable === 'number'
                      ? payout.base_payable.toFixed(2)
                      : payout.base_payable}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Total Payable</Label>
                  <div className="text-sm font-medium">
                    ₹
                    {typeof payout.total_payable === 'number'
                      ? payout.total_payable.toFixed(2)
                      : payout.total_payable}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Settled Amount</Label>
                  <div className="text-sm font-medium">
                    ₹
                    {typeof payout.settled_amount === 'number'
                      ? payout.settled_amount.toFixed(2)
                      : payout.settled_amount}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                    ${
                      payout.payout_status === 'Paid'
                        ? 'bg-green-100 text-green-600'
                        : payout.payout_status === 'Partially Paid'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {payout.payout_status}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Razorpay Transfer ID</Label>
                  <div className="text-sm font-medium">{payout.razorpay_transfer_id || 'N/A'}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Created At</Label>
                  <div className="text-sm font-medium">{formatTimestamp(payout.created_at)}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Updated At</Label>
                  <div className="text-sm font-medium">{formatTimestamp(payout.updated_at)}</div>
                </div>

                {/* Editable fields */}
                <div className="space-y-2">
                  <Label htmlFor="remaining_amount" className="text-sm font-medium">
                    Remaining Amount
                  </Label>
                  {isEditing ? (
                    <div>
                      <Input
                        id="remaining_amount"
                        type="number"
                        step="0.01"
                        value={formData.remaining_amount}
                        onChange={(e) => handleChange('remaining_amount', e.target.value)}
                        disabled={!isEditing || isSubmitting}
                        className={errors.remaining_amount ? 'border-red-500' : ''}
                      />
                      {errors.remaining_amount && (
                        <p className="text-red-500 text-xs mt-1">{errors.remaining_amount}</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm font-medium">
                      ₹
                      {typeof payout.remaining_amount === 'number'
                        ? payout.remaining_amount.toFixed(2)
                        : payout.remaining_amount}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_transfer" className="text-sm font-medium">
                    Scheduled Transfer
                  </Label>
                  {isEditing ? (
                    <div>
                      <Input
                        id="scheduled_transfer"
                        type="datetime-local"
                        value={formData.scheduled_transfer}
                        onChange={(e) => handleChange('scheduled_transfer', e.target.value)}
                        disabled={!isEditing || isSubmitting}
                        className={errors.scheduled_transfer ? 'border-red-500' : ''}
                      />
                      {errors.scheduled_transfer && (
                        <p className="text-red-500 text-xs mt-1">{errors.scheduled_transfer}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Date will be converted to IST timezone (UTC+5:30)
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm font-medium">
                      {payout.scheduled_transfer || 'Not scheduled'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allow_transfer" className="text-sm font-medium">
                    Allow Transfer
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.allow_transfer}
                      onValueChange={(value) => handleChange('allow_transfer', value)}
                      disabled={!isEditing || isSubmitting}
                    >
                      <SelectTrigger id="allow_transfer">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm font-medium capitalize">{payout.allow_transfer}</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </Label>
                {isEditing ? (
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    disabled={!isEditing || isSubmitting}
                    rows={4}
                  />
                ) : (
                  <div className="text-sm font-medium whitespace-pre-line border p-3 rounded-md bg-gray-50 min-h-[100px]">
                    {payout.notes || 'No notes available.'}
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
