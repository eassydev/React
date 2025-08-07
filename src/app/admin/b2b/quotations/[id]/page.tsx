'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import B2BQuotationDetail from '@/components/b2b/B2BQuotationDetail';

export default function B2BQuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id as string;

  const handleBack = () => {
    router.push('/admin/b2b/quotations');
  };

  const handleEdit = () => {
    router.push(`/admin/b2b/quotations/${quotationId}/edit`);
  };

  if (!quotationId) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-red-500">Invalid quotation ID</p>
          <Button onClick={handleBack} className="mt-4">
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
          Back to Quotations
        </Button>
      </div>

      <B2BQuotationDetail
        quotationId={quotationId}
        onEdit={handleEdit}
        onClose={handleBack}
      />
    </div>
  );
}
