'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import B2BQuotationForm from '@/components/b2b/B2BQuotationForm';
import { AdditionalCostsManager } from '@/components/b2b/AdditionalCostsManager';
import { fetchB2BQuotationById, B2BQuotation } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function B2BQuotationEditPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id as string;
  
  const [quotation, setQuotation] = useState<B2BQuotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        setLoading(true);
        const response = await fetchB2BQuotationById(quotationId);
        
        if (response.success) {
          setQuotation(response.data);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch quotation details',
            variant: 'destructive',
          });
          router.push('/admin/b2b/quotations');
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch quotation details',
          variant: 'destructive',
        });
        router.push('/admin/b2b/quotations');
      } finally {
        setLoading(false);
      }
    };

    if (quotationId) {
      fetchQuotation();
    }
  }, [quotationId, router]);

  const handleBack = () => {
    router.push(`/admin/b2b/quotations/${quotationId}`);
  };

  const handleSuccess = (updatedQuotation: B2BQuotation) => {
    toast({
      title: 'Success',
      description: 'Quotation updated successfully',
    });
    router.push(`/admin/b2b/quotations/${quotationId}`);
  };

  const handleCancel = () => {
    router.push(`/admin/b2b/quotations/${quotationId}`);
  };

  if (!quotationId) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-red-500">Invalid quotation ID</p>
          <Button onClick={() => router.push('/admin/b2b/quotations')} className="mt-4">
            Back to Quotations
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-red-500">Quotation not found</p>
          <Button onClick={() => router.push('/admin/b2b/quotations')} className="mt-4">
            Back to Quotations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quotation
        </Button>
        
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Edit Quotation</h1>
          <p className="text-gray-600">
            Editing quotation: {quotation.quotation_number}
          </p>
        </div>
      </div>

      <B2BQuotationForm
        quotation={quotation}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />

      {/* Additional Costs - Separate from form */}
      <div className="mt-6">
        <AdditionalCostsManager
          entityId={quotationId}
          entityType="quotation"
          readonly={quotation.status === 'approved' || quotation.status === 'rejected'}
          onTotalChange={(total) => {
            console.log('Additional costs total:', total);
          }}
        />
      </div>
    </div>
  );
}
