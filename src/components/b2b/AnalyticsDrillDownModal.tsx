'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, ExternalLink } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { fetchB2BOrders } from '@/lib/api';

export type MetricType =
    | 'orders_received'
    | 'orders_cancelled'
    | 'net_orders'
    | 'orders_executed'
    | 'collections'
    | 'wip_orders'
    | 'wip_billed'
    | 'wip_collections'
    | 'billed_orders_total'
    | 'billed_orders_completed';

// ... (interface DrillDownOrder)

// Map metric type to API filter parameters
const getFiltersForMetric = (metricType: MetricType): Record<string, string> => {
    switch (metricType) {
        case 'orders_received':
            return {}; // All orders in date range
        case 'orders_cancelled':
            return { status: 'cancelled' };
        case 'net_orders':
            // Pending orders - only show orders with pending status
            return { status: 'pending' };
        case 'orders_executed':
            return { status: 'completed' };
        case 'collections':
            return { status: 'completed', paymentStatus: 'paid' };
        case 'wip_orders':
            // Work in progress - only show orders with in_progress status
            return { status: 'in_progress' };
        case 'wip_billed':
            return { status: 'in_progress' };
        case 'wip_collections':
            // ✅ FIX: Use hasPayment filter to match backend logic (payment_amount > 0)
            return { status: 'in_progress', hasPayment: 'true' };
        case 'billed_orders_total':
            return {}; // All statuses
        case 'billed_orders_completed':
            return { status: 'completed' };
        default:
            return {};
    }
};

export default function AnalyticsDrillDownModal({
    isOpen,
    onClose,
    metricType,
    metricTitle,
    dateRange,
    selectedMonth,
    useReceivedDate = false
}: AnalyticsDrillDownModalProps) {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<DrillDownOrder[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    // ✅ NEW: Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(50); // Keep 50 as default limit for table view

    // ✅ NEW: Reset pagination when modal opens or metric changes
    useEffect(() => {
        if (isOpen && metricType) {
            setCurrentPage(1);
            fetchOrders(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, metricType, useReceivedDate, selectedMonth, dateRange?.from?.toISOString(), dateRange?.to?.toISOString()]);

    const fetchOrders = async (page = 1) => {
        if (!metricType) return;

        setLoading(true);
        try {
            const filters = getFiltersForMetric(metricType);

            // Build date parameters
            let dateFrom = '';
            let dateTo = '';

            if (selectedMonth && selectedMonth !== 'all') {
                const [year, month] = selectedMonth.split('-');
                const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
                const endDate = new Date(parseInt(year), parseInt(month), 0);
                dateFrom = startDate.toISOString().split('T')[0];
                dateTo = endDate.toISOString().split('T')[0];
            } else if (dateRange?.from) {
                dateFrom = dateRange.from.toISOString().split('T')[0];
                dateTo = dateRange.to?.toISOString().split('T')[0] || dateFrom;
            }

            const response = await fetchB2BOrders({
                page: page,
                limit: limit,
                search: '',
                status: filters.status || '',
                paymentStatus: filters.paymentStatus || '',
                hasPayment: filters.hasPayment || '',
                dateFrom: useReceivedDate ? '' : dateFrom,
                dateTo: useReceivedDate ? '' : dateTo,
                receivedDateFrom: useReceivedDate ? dateFrom : '',
                receivedDateTo: useReceivedDate ? dateTo : '',
            });

            if (response.success) {
                let filteredOrders = response.data.orders || [];

                // Client-side filtering if needed (legacy, preferably move to backend if possible)
                if (filters.excludeCancelled === 'true') {
                    filteredOrders = filteredOrders.filter((o: DrillDownOrder) => o.status !== 'cancelled');
                }
                if (filters.excludeCompleted === 'true') {
                    filteredOrders = filteredOrders.filter((o: DrillDownOrder) => o.status !== 'completed');
                }

                setOrders(filteredOrders);
                if (response.data.pagination) {
                    setTotalRecords(response.data.pagination.total_records);
                    setTotalPages(response.data.pagination.total_pages);
                } else {
                    // Fallback if pagination metadata is missing
                    setTotalRecords(filteredOrders.length);
                    setTotalPages(1);
                }
            }
        } catch (error) {
            console.error('Error fetching drill-down orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ NEW: Export Functionality
    const handleExport = () => {
        if (!metricType) return;

        const filters = getFiltersForMetric(metricType);
        let dateFrom = '';
        let dateTo = '';

        if (selectedMonth && selectedMonth !== 'all') {
            const [year, month] = selectedMonth.split('-');
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0);
            dateFrom = startDate.toISOString().split('T')[0];
            dateTo = endDate.toISOString().split('T')[0];
        } else if (dateRange?.from) {
            dateFrom = dateRange.from.toISOString().split('T')[0];
            dateTo = dateRange.to?.toISOString().split('T')[0] || dateFrom;
        }

        // Construct query parameters manually for the export URL
        const queryParams = new URLSearchParams({
            status: filters.status || '',
            payment_status: filters.paymentStatus || '',
            has_payment: filters.hasPayment || '',
            date_from: useReceivedDate ? '' : dateFrom,
            date_to: useReceivedDate ? '' : dateTo,
            received_date_from: useReceivedDate ? dateFrom : '',
            received_date_to: useReceivedDate ? dateTo : '',
            date_filter_type: useReceivedDate ? 'received' : 'service' // Explicitly tell backend which date logic to use
        });

        const exportUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/admin-api'}/b2b/dashboard/export-orders?${queryParams.toString()}`;

        // Trigger download
        window.open(exportUrl, '_blank');
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchOrders(newPage);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-purple-100 text-purple-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <div>
                            <DialogTitle className="flex items-center gap-2">
                                <span>{metricTitle}</span>
                                <Badge variant="secondary">{totalRecords} orders</Badge>
                            </DialogTitle>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleExport} className="flex gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Export List
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto border rounded-md my-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground">Loading orders...</span>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No orders found for this metric
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50 sticky top-0">
                                <TableRow>
                                    <TableHead>Order #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Service Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order: DrillDownOrder) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.order_number}</TableCell>
                                        <TableCell>{order.customer?.company_name || 'N/A'}</TableCell>
                                        <TableCell className="max-w-[150px] truncate" title={order.service_name}>
                                            {order.service_name}
                                        </TableCell>
                                        <TableCell>
                                            {order.service_date ? new Date(order.service_date).toLocaleDateString('en-IN') : '-'}
                                        </TableCell>
                                        <TableCell>{formatCurrency(order.final_amount || 0)}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusBadge(order.status)}>
                                                {order.status?.replace(/_/g, ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'}>
                                                {order.payment_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/admin/b2b/orders/${order.id}`} target="_blank">
                                                <Button variant="ghost" size="sm">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* ✅ NEW: Pagination Footer */}
                <div className="flex justify-between items-center pt-4 border-t bg-white">
                    <div className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1 || loading}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages || loading}
                        >
                            Next
                        </Button>
                        <Button variant="default" onClick={onClose} className="ml-4">
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
