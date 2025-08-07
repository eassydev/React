 'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  FileText,
  History
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ExcelUploadProps {
  onUploadComplete?: (results: any) => void;
}

interface ValidationResult {
  row_index: number;
  data: any;
  errors: string[];
  warnings: string[];
  is_valid: boolean;
}

interface PreviewData {
  summary: {
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    total_errors: number;
    total_warnings: number;
    can_import: boolean;
    file_info: {
      filename: string;
      size: number;
      type: string;
    };
  };
  validation_results: ValidationResult[];
  sample_valid_data: any[];
  invalid_rows: ValidationResult[];
}

const B2BExcelUpload: React.FC<ExcelUploadProps> = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [importResults, setImportResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('upload');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select an Excel (.xlsx, .xls) or CSV file.',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'File size must be less than 10MB.',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
      setPreviewData(null);
      setImportResults(null);
    }
  };

  const downloadTemplate = async (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      const response = await fetch(`/admin-api/b2b/orders/excel-template?format=${format}`, {
        headers: {
          'admin-auth-token': localStorage.getItem('token') || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `B2B_Orders_Template.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: `Template downloaded successfully as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to download template',
        variant: 'destructive',
      });
    }
  };

  const previewUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a file to preview.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('excel_file', selectedFile);

      const response = await fetch('/admin-api/b2b/orders/excel-preview', {
        method: 'POST',
        headers: {
          'admin-auth-token': localStorage.getItem('token') || '',
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setPreviewData(result.data);
        setActiveTab('preview');
        toast({
          title: 'Preview Generated',
          description: result.message,
        });
      } else {
        throw new Error(result.message || 'Preview failed');
      }
    } catch (error: any) {
      toast({
        title: 'Preview Failed',
        description: error.message || 'Failed to preview file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const importData = async () => {
    if (!selectedFile || !previewData) {
      toast({
        title: 'No Data to Import',
        description: 'Please preview the file first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('excel_file', selectedFile);
      formData.append('skip_invalid', 'true');
      formData.append('create_customers', 'true');

      const response = await fetch('/admin-api/b2b/orders/excel-import', {
        method: 'POST',
        headers: {
          'admin-auth-token': localStorage.getItem('token') || '',
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setImportResults(result.data);
        setActiveTab('results');
        toast({
          title: 'Import Completed',
          description: result.message,
        });
        onUploadComplete?.(result.data);
      } else {
        throw new Error(result.message || 'Import failed');
      }
    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import data',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Excel Bulk Upload
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="preview" disabled={!previewData}>Preview Data</TabsTrigger>
              <TabsTrigger value="results" disabled={!importResults}>Import Results</TabsTrigger>
              <TabsTrigger value="history">Import History</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              {/* Template Download Section */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Template
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Download the Excel template with sample data and required column headers.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => downloadTemplate('xlsx')} variant="outline" size="sm">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel (.xlsx)
                  </Button>
                  <Button onClick={() => downloadTemplate('csv')} variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    CSV (.csv)
                  </Button>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="excel-file">Select Excel or CSV File</Label>
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                </div>

                {selectedFile && (
                  <Alert>
                    <Upload className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Selected File:</strong> {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={previewUpload} 
                    disabled={!selectedFile || uploading}
                    className="flex-1"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Previewing...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {previewData && (
                <>
                  {/* Preview Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{previewData.summary.total_rows}</div>
                        <div className="text-sm text-gray-500">Total Rows</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{previewData.summary.valid_rows}</div>
                        <div className="text-sm text-gray-500">Valid Rows</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">{previewData.summary.invalid_rows}</div>
                        <div className="text-sm text-gray-500">Invalid Rows</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-600">{previewData.summary.total_warnings}</div>
                        <div className="text-sm text-gray-500">Warnings</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Import Button */}
                  {previewData.summary.can_import && (
                    <div className="flex justify-center">
                      <Button 
                        onClick={importData} 
                        disabled={importing}
                        className="bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        {importing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Importing {previewData.summary.valid_rows} Orders...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Import {previewData.summary.valid_rows} Valid Orders
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Validation Results */}
                  {previewData.invalid_rows.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 text-red-600">Invalid Rows (First 10)</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {previewData.invalid_rows.map((row, index) => (
                          <Alert key={index} variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Row {row.row_index}:</strong> {row.errors.join(', ')}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {importResults && (
                <>
                  {/* Import Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{importResults.total_rows}</div>
                        <div className="text-sm text-gray-500">Total Processed</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{importResults.successful_imports}</div>
                        <div className="text-sm text-gray-500">Successfully Imported</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">{importResults.failed_imports}</div>
                        <div className="text-sm text-gray-500">Failed Imports</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{importResults.created_customers}</div>
                        <div className="text-sm text-gray-500">New Customers</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Success Message */}
                  {importResults.successful_imports > 0 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Successfully imported {importResults.successful_imports} orders and created {importResults.created_customers} new customers.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Imported Orders Table */}
                  {importResults.imported_orders && importResults.imported_orders.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Imported Orders</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order Number</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importResults.imported_orders.slice(0, 10).map((order: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{order.order_number}</TableCell>
                              <TableCell>{order.customer_company}</TableCell>
                              <TableCell>{order.service_name}</TableCell>
                              <TableCell>₹{order.total_amount?.toLocaleString('en-IN')}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Errors */}
                  {importResults.errors && importResults.errors.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 text-red-600">Import Errors</h3>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {importResults.errors.map((error: string, index: number) => (
                          <Alert key={index} variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Import history will be displayed here</p>
                <p className="text-sm">Feature coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default B2BExcelUpload;
