'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import B2BQuotationForm from '@/components/b2b/B2BQuotationForm';
import { B2BQuotation } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function B2BQuotationAddPage() {
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
