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
    // Only redirect if there were successful imports
    if (results.successful_imports > 0) {
      toast({
        title: 'Upload Completed Successfully',
        description: `Successfully imported ${results.successful_imports} orders${results.failed_imports > 0 ? ` (${results.failed_imports} failed)` : ''}`,
      });

      // Redirect to orders list after a delay only on success
      setTimeout(() => {
        router.push('/admin/b2b/orders');
      }, 3000);
    } else {
      // Show error message and don't redirect
      toast({
        title: 'Import Failed',
        description: `No orders were imported. ${results.failed_imports} rows failed.`,
        variant: 'destructive',
      });
    }
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
