'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import B2BQuotationForm from '@/components/b2b/B2BQuotationForm';
import { B2BQuotation } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

// Component that uses useSearchParams - must be wrapped in Suspense
function B2BQuotationAddContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get order ID from URL params if creating quotation for specific order
  const orderId = searchParams.get('orderId');

  const handleBack = () => {
    router.push('/admin/b2b/quotations');
  };

  const handleSuccess = (quotation: B2BQuotation) => {
    toast({
      title: 'Success',
      description: 'Quotation created successfully',
    });

    // Redirect to the newly created quotation detail page
    if (quotation.id) {
      router.push(`/admin/b2b/quotations/${quotation.id}`);
    } else {
      router.push('/admin/b2b/quotations');
    }
  };

  const handleCancel = () => {
    router.push('/admin/b2b/quotations');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quotations
        </Button>

        <div className="mb-4">
          <h1 className="text-2xl font-bold">Create New Quotation</h1>
          <p className="text-gray-600">
            {orderId
              ? `Creating quotation for order: ${orderId}`
              : 'Create a new B2B quotation'
            }
          </p>
        </div>
      </div>

      <B2BQuotationForm
        orderId={orderId || undefined}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function B2BQuotationAddPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <B2BQuotationAddContent />
    </Suspense>
  );
}
