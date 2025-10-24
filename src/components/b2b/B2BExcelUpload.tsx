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
import { downloadB2BExcelTemplate, previewB2BExcelUpload, importB2BExcelData } from '@/lib/api';

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

  // ✅ NEW: Enhanced import options
  const [importMode, setImportMode] = useState<'create_customers' | 'customer_id'>('create_customers');
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [createCustomers, setCreateCustomers] = useState(true);

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

  // ✅ ENHANCED: Template download with mode support
  const downloadTemplate = async (format: 'xlsx' | 'csv' = 'xlsx', mode: 'create_customers' | 'customer_id' = importMode) => {
    try {
      await downloadB2BExcelTemplate(format, mode);
      toast({
        title: 'Success',
        description: `${mode === 'customer_id' ? 'Customer ID' : 'Customer Creation'} template downloaded as ${format.toUpperCase()}`,
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
      const result = await previewB2BExcelUpload(selectedFile);

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

  // ✅ ENHANCED: Import with mode support
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
      const result = await importB2BExcelData(selectedFile, {
        skip_invalid: skipInvalid,
        create_customers: createCustomers,
        import_mode: importMode,
      });

      if (result.success) {
        setImportResults(result.data);
        setActiveTab('results');
        toast({
          title: 'Import Completed',
          description: result.message,
        });
        onUploadComplete?.(result.data);
      } else {
        // ✅ IMPROVED: Handle failed imports with detailed errors
        // Even if success=false, we still have import results with detailed errors
        if (result.data) {
          setImportResults(result.data);
          setActiveTab('results');

          // Show summary in toast but detailed errors will be visible in results tab
          const errorSummary = result.data.errors && result.data.errors.length > 0
            ? `${result.data.failed_imports} rows failed. Check details below.`
            : result.message || 'Import failed';

          toast({
            title: 'Import Completed with Errors',
            description: errorSummary,
            variant: 'destructive',
          });

          // Still call onUploadComplete so parent knows import finished (even with errors)
          onUploadComplete?.(result.data);
        } else {
          // No detailed data available, show generic error
          throw new Error(result.message || 'Import failed');
        }
      }
    } catch (error: any) {
      // Only show generic error if we don't have detailed import results
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
              {/* ✅ NEW: Import Mode Selection */}
              <div className="border rounded-lg p-4 bg-green-50">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import Mode
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="create_customers"
                      name="import_mode"
                      value="create_customers"
                      checked={importMode === 'create_customers'}
                      onChange={(e) => setImportMode(e.target.value as 'create_customers')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="create_customers" className="text-sm font-medium">
                      Customer Creation Mode
                    </label>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">
                    Creates new customers if they don't exist. Requires: company_name, contact_person, email, phone, service_name, custom_price
                  </p>

                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="customer_id"
                      name="import_mode"
                      value="customer_id"
                      checked={importMode === 'customer_id'}
                      onChange={(e) => setImportMode(e.target.value as 'customer_id')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="customer_id" className="text-sm font-medium">
                      Customer ID Mode (Faster)
                    </label>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">
                    Uses existing customer IDs. Requires: customer_id, service_name, custom_price. Best for bulk orders from existing customers.
                  </p>
                </div>
              </div>

              {/* Template Download Section */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Template
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Download the Excel template for your selected import mode with sample data and required column headers.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => downloadTemplate('xlsx', importMode)} variant="outline" size="sm">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel (.xlsx) - {importMode === 'customer_id' ? 'Customer ID' : 'Customer Creation'}
                  </Button>
                  <Button onClick={() => downloadTemplate('csv', importMode)} variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    CSV (.csv) - {importMode === 'customer_id' ? 'Customer ID' : 'Customer Creation'}
                  </Button>
                </div>
              </div>

              {/* ✅ NEW: Import Options */}
              <div className="border rounded-lg p-4 bg-yellow-50">
                <h3 className="font-semibold mb-3">Import Options</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="skip_invalid"
                      checked={skipInvalid}
                      onChange={(e) => setSkipInvalid(e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="skip_invalid" className="text-sm font-medium">
                      Skip invalid rows and continue import
                    </label>
                  </div>

                  {importMode === 'create_customers' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="create_customers"
                        checked={createCustomers}
                        onChange={(e) => setCreateCustomers(e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="create_customers" className="text-sm font-medium">
                        Create new customers if they don't exist
                      </label>
                    </div>
                  )}
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
                      <h3 className="font-semibold mb-3 text-red-600 flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        Import Errors ({importResults.errors.length} rows failed)
                      </h3>

                      {/* Error Summary */}
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Common Issues Found:</strong>
                        </p>
                        <ul className="text-sm text-red-700 mt-1 ml-4 list-disc">
                          {importResults.errors.some((error: string) => error.includes('Category')) && (
                            <li>Invalid category IDs - Use numeric IDs from the system</li>
                          )}
                          {importResults.errors.some((error: string) => error.includes('payment_status')) && (
                            <li>Invalid payment status - Use: pending, paid, overdue, cancelled</li>
                          )}
                          {importResults.errors.some((error: string) => error.includes('address')) && (
                            <li>Missing or invalid address information</li>
                          )}
                          {importResults.errors.some((error: string) => error.includes('customer')) && (
                            <li>Customer-related validation errors</li>
                          )}
                          {importResults.errors.some((error: string) => error.includes('date')) && (
                            <li>Invalid date format - Use DD/MM/YYYY format</li>
                          )}
                        </ul>
                      </div>

                      {/* Detailed Errors */}
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {importResults.errors.map((error: string, index: number) => {
                          // Parse row number and error message for better display
                          const rowMatch = error.match(/Row (\d+): (.+)/);
                          const rowNumber = rowMatch ? rowMatch[1] : null;
                          const errorMessage = rowMatch ? rowMatch[2] : error;

                          return (
                            <Alert key={index} variant="destructive" className="py-2">
                              <XCircle className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                {rowNumber && (
                                  <span className="font-semibold text-red-800">Row {rowNumber}: </span>
                                )}
                                <span className="text-red-700">{errorMessage}</span>
                              </AlertDescription>
                            </Alert>
                          );
                        })}
                      </div>

                      {/* ✅ ENHANCED: Helper sections for different error types */}

                      {/* Category/Subcategory ID Helper */}
                      {importResults.errors.some((error: string) =>
                        error.includes('Category') || error.includes('Subcategory')
                      ) && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800 mb-2">
                            <strong>Need valid Category/Subcategory IDs?</strong>
                          </p>
                          <Button
                            onClick={() => window.open('/admin-api/b2b/orders/excel-helper', '_blank')}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-100"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Get Valid IDs
                          </Button>
                          <p className="text-xs text-blue-600 mt-1">
                            Opens a new tab with all valid Category and Subcategory IDs for your Excel file.
                          </p>
                        </div>
                      )}

                      {/* Payment Status Helper */}
                      {importResults.errors.some((error: string) =>
                        error.includes('payment_status')
                      ) && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800 mb-2">
                            <strong>Valid Payment Status Values:</strong>
                          </p>
                          <div className="text-xs text-yellow-700 space-y-1">
                            <div><code className="bg-yellow-100 px-1 rounded">pending</code> - Payment not yet received</div>
                            <div><code className="bg-yellow-100 px-1 rounded">paid</code> - Payment completed</div>
                            <div><code className="bg-yellow-100 px-1 rounded">overdue</code> - Payment is overdue</div>
                            <div><code className="bg-yellow-100 px-1 rounded">cancelled</code> - Payment cancelled</div>
                          </div>
                        </div>
                      )}

                      {/* Date Format Helper */}
                      {importResults.errors.some((error: string) =>
                        error.includes('date') || error.includes('Date')
                      ) && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800 mb-2">
                            <strong>Supported Date Formats:</strong>
                          </p>
                          <div className="text-xs text-green-700 space-y-1">
                            <div><code className="bg-green-100 px-1 rounded">DD/MM/YYYY</code> - e.g., 21/09/2025</div>
                            <div><code className="bg-green-100 px-1 rounded">MM/DD/YYYY</code> - e.g., 09/21/2025</div>
                            <div><code className="bg-green-100 px-1 rounded">YYYY-MM-DD</code> - e.g., 2025-09-21</div>
                          </div>
                        </div>
                      )}
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
