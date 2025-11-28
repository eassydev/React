'use client';

import React, { useState } from 'react';
import { getMonthlyReport } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Loader2, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function MonthlyReportPage() {
    const currentYear = new Date().getFullYear();

    const [year, setYear] = useState<number>(currentYear);
    const [month, setMonth] = useState<string>('all'); // '' = all months
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Fetch JSON data for table display
    const fetchReportData = async () => {
        setLoading(true);
        try {
            const response = await getMonthlyReport(
                {
                    year,
                    month: month !== 'all' ? parseInt(month) : undefined
                },
                'json'
            );

            if (response.success) {
                setReportData(response.data);
                toast.success(`Report loaded: ${response.metadata.totalOrders} orders found`);
            } else {
                toast.error(response.message || 'Failed to load report');
            }
        } catch (error: any) {
            console.error('Failed to fetch report:', error);
            toast.error(error.message || 'Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    // Download Excel file
    const downloadExcel = async () => {
        setDownloading(true);
        try {
            await getMonthlyReport(
                {
                    year,
                    month: month !== 'all' ? parseInt(month) : undefined
                },
                'excel'
            );
            toast.success('Excel file downloaded successfully');
        } catch (error: any) {
            console.error('Failed to download Excel:', error);
            toast.error(error.message || 'Failed to download Excel');
        } finally {
            setDownloading(false);
        }
    };

    const monthOptions = [
        { value: 'all', label: 'All Months' },
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Calendar className="h-8 w-8" />
                        Monthly B2B Report
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Comprehensive monthly breakdown of all B2B orders with detailed tracking
                    </p>
                </div>
            </div>

            {/* Filters Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Report Filters</CardTitle>
                    <CardDescription>Select year and month to view the report</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 items-end">
                        {/* Year Selector */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium mb-2 block">Year</label>
                            <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {yearOptions.map((y) => (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Month Selector */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium mb-2 block">Month</label>
                            <Select value={month} onValueChange={setMonth}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {monthOptions.map((m) => (
                                        <SelectItem key={m.value} value={m.value}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button onClick={fetchReportData} disabled={loading} size="lg">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Report
                                    </>
                                )}
                            </Button>

                            <Button onClick={downloadExcel} disabled={downloading} variant="outline" size="lg">
                                {downloading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Downloading...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Excel
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Report Display */}
            {reportData && (
                <Card>
                    <CardHeader>
                        <CardTitle>Report Data - {year}</CardTitle>
                        <CardDescription>
                            Showing {Object.keys(reportData).length} month(s) of data
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(reportData).length > 1 ? (
                            // Multiple months - use tabs
                            <Tabs defaultValue={Object.keys(reportData)[0]} className="w-full">
                                <TabsList className="mb-4 flex-wrap h-auto">
                                    {Object.entries(reportData).map(([monthKey, monthData]: any) => (
                                        <TabsTrigger key={monthKey} value={monthKey} className="min-w-[120px]">
                                            {monthData.monthName}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {Object.entries(reportData).map(([monthKey, monthData]: any) => (
                                    <TabsContent key={monthKey} value={monthKey}>
                                        <MonthlyReportTable monthData={monthData} />
                                    </TabsContent>
                                ))}
                            </Tabs>
                        ) : (
                            // Single month - direct display
                            <MonthlyReportTable monthData={Object.values(reportData)[0]} />
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {!reportData && !loading && (
                <Card>
                    <CardContent className="py-16 text-center">
                        <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Report Loaded</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Select a year and month (optional) from the filters above, then click "View Report" to display the data in a table format.
                        </p>
                        <Button onClick={fetchReportData} disabled={loading}>
                            <FileText className="mr-2 h-4 w-4" />
                            Load Report
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// Table Component
function MonthlyReportTable({ monthData }: { monthData: any }) {
    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription className="text-xs">Total Orders</CardDescription>
                        <CardTitle className="text-3xl font-bold">{monthData.summary.total_orders}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription className="text-xs">Order Value</CardDescription>
                        <CardTitle className="text-3xl font-bold">
                            ₹{monthData.summary.total_order_value.toLocaleString('en-IN')}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription className="text-xs">Invoice Value</CardDescription>
                        <CardTitle className="text-3xl font-bold">
                            ₹{monthData.summary.total_invoice_value.toLocaleString('en-IN')}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription className="text-xs">Payment Received</CardDescription>
                        <CardTitle className="text-3xl font-bold text-green-600">
                            ₹{monthData.summary.total_payment_received.toLocaleString('en-IN')}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Data Table */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="font-bold whitespace-nowrap">Client Name</TableHead>
                                <TableHead className="font-bold whitespace-nowrap">Order Description</TableHead>
                                <TableHead className="font-bold whitespace-nowrap text-right">Order Value</TableHead>
                                <TableHead className="font-bold whitespace-nowrap">Payment Terms</TableHead>
                                <TableHead className="font-bold whitespace-nowrap">Order Recd Date</TableHead>
                                <TableHead className="font-bold whitespace-nowrap">Work Start Date</TableHead>
                                <TableHead className="font-bold whitespace-nowrap">Work Completion Date</TableHead>
                                <TableHead className="font-bold whitespace-nowrap text-center">Total Days</TableHead>
                                <TableHead className="font-bold whitespace-nowrap">Status</TableHead>
                                <TableHead className="font-bold whitespace-nowrap text-center">% Completed</TableHead>
                                <TableHead className="font-bold whitespace-nowrap">Invoice Raised Date</TableHead>
                                <TableHead className="font-bold whitespace-nowrap text-right">Invoice Value</TableHead>
                                <TableHead className="font-bold whitespace-nowrap">Payment Collection Date</TableHead>
                                <TableHead className="font-bold whitespace-nowrap text-right">Payment Recd Value</TableHead>
                                <TableHead className="font-bold whitespace-nowrap text-center">Payment Recd %</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {monthData.orders.map((order: any, index: number) => (
                                <TableRow key={order.id || index} className="hover:bg-muted/30">
                                    <TableCell className="font-medium">{order.client_name}</TableCell>
                                    <TableCell className="max-w-xs">
                                        <div className="truncate" title={order.order_description}>
                                            {order.order_description}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">₹{order.order_value.toLocaleString('en-IN')}</TableCell>
                                    <TableCell>{order.payment_terms}</TableCell>
                                    <TableCell className="whitespace-nowrap">{order.order_received_date}</TableCell>
                                    <TableCell className="whitespace-nowrap">{order.work_start_date}</TableCell>
                                    <TableCell className="whitespace-nowrap">{order.work_completion_date}</TableCell>
                                    <TableCell className="text-center">{order.total_days}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            order.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center font-medium">{order.percentage_completed}</TableCell>
                                    <TableCell className="whitespace-nowrap">{order.invoice_raised_date}</TableCell>
                                    <TableCell className="text-right font-medium">₹{order.invoice_value.toLocaleString('en-IN')}</TableCell>
                                    <TableCell className="whitespace-nowrap">{order.payment_collection_date}</TableCell>
                                    <TableCell className="text-right font-medium text-green-600">
                                        ₹{order.payment_received_value.toLocaleString('en-IN')}
                                    </TableCell>
                                    <TableCell className="text-center font-medium">{order.payment_received_percentage}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
