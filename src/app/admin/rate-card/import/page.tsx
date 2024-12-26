"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { importRateCards } from '@/lib/api';

const ImportRateCardForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      toast({ title: "Error", description: "No file selected.", variant: "destructive" });
      return;
    }

    try {
      setIsImporting(true);
      await importRateCards(file);
       toast({ title: "Success", description: "Rate cards imported successfully.", variant: "success" });
    //   setFile(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to import rate cards.", variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xl text-gray-800">Import Rate Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Upload CSV File</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="upload-ratecard"
                />
                <label htmlFor="upload-ratecard" className="cursor-pointer inline-flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Choose File</span>
                </label>
                {file && <span className="text-sm text-gray-600">{file.name}</span>}
              </div>

              <Button onClick={handleImport} disabled={isImporting || !file} className="mt-4">
                {isImporting ? "Importing..." : "Import"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportRateCardForm;
