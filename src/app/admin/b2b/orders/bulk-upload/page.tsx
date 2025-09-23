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
    // ✅ IMPROVED: Better handling of mixed success/failure scenarios
    if (results.successful_imports > 0) {
      if (results.failed_imports > 0) {
        // Mixed results - some success, some failures
        toast({
          title: 'Import Completed with Issues',
          description: `${results.successful_imports} orders imported successfully, ${results.failed_imports} failed. Review errors below.`,
          variant: 'default', // Not destructive since some succeeded
        });

        // Don't auto-redirect when there are errors - let user review them
        console.log('Import completed with mixed results - not auto-redirecting');
      } else {
        // Complete success
        toast({
          title: 'Upload Completed Successfully',
          description: `Successfully imported ${results.successful_imports} orders`,
        });

        // Only redirect on complete success
        setTimeout(() => {
          router.push('/admin/b2b/orders');
        }, 3000);
      }
    } else {
      // Complete failure - no orders imported
      toast({
        title: 'Import Failed',
        description: `No orders were imported. ${results.failed_imports || 0} rows failed. Please review the errors and fix your data.`,
        variant: 'destructive',
      });

      // Don't redirect on failure
      console.log('Import failed completely - staying on upload page for error review');
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
