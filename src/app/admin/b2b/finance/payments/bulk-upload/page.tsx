'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    FileSpreadsheet,
    Upload,
    CheckCircle,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BulkUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('adminToken');
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eassylife.in';

            const response = await fetch(`${API_BASE_URL}/admin-api/b2b/finance/payments/bulk-upload`, {
                method: 'POST',
                headers: {
                    'admin-auth-token': token || '',
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            setResult(data.data);
            if (data.success) {
                toast({
                    title: 'Upload Processed',
                    description: data.message,
                    variant: data.data.failed > 0 ? 'default' : 'default', // Using default (usually green/blue) for partial success too
                });
            }

        } catch (error: any) {
            console.error('Upload Error:', error);
            toast({
                title: 'Upload Failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/b2b/finance/payments">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Bulk Payment Upload</h1>
                        <p className="text-gray-600 mt-1">Upload Excel or CSV file to record multiple payments</p>
                    </div>
                </div>

                {/* Upload Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upload File</CardTitle>
                        <CardDescription>
                            Supported formats: .CSV, .XLSX, .XLS
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Template Info */}
                        <Alert>
                            <FileSpreadsheet className="h-4 w-4" />
                            <AlertTitle>Expected Columns</AlertTitle>
                            <AlertDescription className="mt-2 text-xs md:text-sm font-mono text-gray-600">
                                Customer ID (or Company Name), Amount, Payment Date (YYYY-MM-DD), Payment Mode, Transaction Ref, Notes
                            </AlertDescription>
                        </Alert>

                        {/* File Input Zone */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept=".csv, .xlsx, .xls"
                                onChange={handleFileChange}
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer flex flex-col items-center gap-4"
                            >
                                <div className="bg-primary/10 p-4 rounded-full">
                                    <Upload className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-lg text-gray-900">
                                        {file ? file.name : "Click to select file"}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {file ? `${(file.size / 1024).toFixed(2)} KB` : "or drag and drop here"}
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setFile(null)}
                                disabled={!file || loading}
                            >
                                Clear
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={!file || loading}
                                className="w-32"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                            </Button>
                        </div>

                    </CardContent>
                </Card>

                {/* Results */}
                {result && (
                    <div className="space-y-4 fade-in">
                        <h2 className="text-xl font-semibold">Upload Results</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-green-50 border-green-200">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-900">Successfully Processed</p>
                                        <p className="text-3xl font-bold text-green-700">{result.success}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </CardContent>
                            </Card>

                            <Card className="bg-red-50 border-red-200">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-red-900">Failed Rows</p>
                                        <p className="text-3xl font-bold text-red-700">{result.failed}</p>
                                    </div>
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Error Log */}
                        {result.errors.length > 0 && (
                            <Card className="border-red-200">
                                <CardHeader>
                                    <CardTitle className="text-red-700 text-base">Error Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-64 overflow-y-auto space-y-2">
                                        {result.errors.map((err: any, index: number) => (
                                            <div key={index} className="flex gap-4 p-3 bg-red-50 rounded text-sm text-red-800">
                                                <span className="font-bold whitespace-nowrap">Row {err.row}:</span>
                                                <span>{err.error}</span>
                                                {/* Optional: Show raw data */}
                                                {/* <span className="text-xs text-gray-500">{JSON.stringify(err.data)}</span> */}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
