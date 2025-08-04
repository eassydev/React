'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import B2BExcelUpload from '@/components/b2b/B2BExcelUpload';
import { toast } from '@/hooks/use-toast';

export default function B2BBulkUploadPage() {
  const router = useRouter();

  const handleUploadComplete = (results: any) => {
    // Show success message and optionally redirect
    toast({
      title: 'Upload Completed',
      description: `Successfully imported ${results.successful_imports} orders`,
    });

    // Optionally redirect to orders list after a delay
    setTimeout(() => {
      router.push('/admin/b2b/orders');
    }, 3000);
  };

  const handleBack = () => {
    router.push('/admin/b2b/orders');
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
          Back to Orders
        </Button>
        
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Bulk Upload B2B Orders</h1>
          <p className="text-gray-600">
            Upload Excel or CSV files to import multiple B2B orders at once
          </p>
        </div>
      </div>

      <B2BExcelUpload onUploadComplete={handleUploadComplete} />
    </div>
  );
}
