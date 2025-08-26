'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileImage, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ServiceAttachmentUpload } from '@/components/b2b/ServiceAttachmentUpload';
import { ServiceAttachments } from '@/components/b2b/ServiceAttachments';

interface ProviderServiceAttachmentsPageProps {
  params: {
    bookingId: string;
  };
}

export default function ProviderServiceAttachmentsPage({ params }: ProviderServiceAttachmentsPageProps) {
  const router = useRouter();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchBookingDetails();
  }, [params.bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      // This would typically fetch booking details from the provider API
      // For now, we'll use mock data
      const mockBooking = {
        id: params.bookingId,
        orderNumber: 'B2B-2024-001',
        serviceName: 'Office Cleaning Service',
        serviceDate: '2024-01-15',
        status: 'in_progress',
        customer: {
          companyName: 'Tech Solutions Ltd',
          contactPerson: 'John Smith'
        }
      };
      
      setBookingDetails(mockBooking);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load booking details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    toast({
      title: 'Upload Complete',
      description: 'Service attachments uploaded successfully',
    });
    
    // Refresh the attachments list
    setRefreshKey(prev => prev + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Booking not found or you don't have permission to access it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Service Attachments</h1>
          <p className="text-gray-600">Upload before and after images/videos for your service</p>
        </div>
      </div>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Booking Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Order Number</label>
              <p className="font-medium">{bookingDetails.orderNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Service</label>
              <p className="font-medium">{bookingDetails.serviceName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Customer</label>
              <p className="font-medium">{bookingDetails.customer.companyName}</p>
              <p className="text-sm text-gray-500">{bookingDetails.customer.contactPerson}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge className={getStatusColor(bookingDetails.status)}>
                  {bookingDetails.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Instructions */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Upload Guidelines:</strong><br />
          • Take clear, well-lit photos showing the work area<br />
          • Upload "before" images/videos at the start of service<br />
          • Upload "after" images/videos upon completion<br />
          • Files will be automatically shared with the customer and admin team
        </AlertDescription>
      </Alert>

      {/* Upload Component */}
      <ServiceAttachmentUpload
        bookingId={params.bookingId}
        providerId="current-provider-id" // This would come from auth context
        onUploadComplete={handleUploadComplete}
      />

      {/* Existing Attachments */}
      <div key={refreshKey}>
        <ServiceAttachments
          bookingId={params.bookingId}
          readonly={false}
        />
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>File Requirements:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Images: Maximum 10MB, formats: JPEG, PNG, WebP</li>
              <li>Videos: Maximum 100MB, formats: MP4, MOV, AVI</li>
              <li>Up to 5 files per attachment type (before/after images/videos)</li>
            </ul>
            
            <p className="mt-4"><strong>Tips for Better Photos:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Use good lighting - natural light works best</li>
              <li>Take multiple angles to show the complete work area</li>
              <li>Ensure images are clear and in focus</li>
              <li>Include reference points for scale when relevant</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
