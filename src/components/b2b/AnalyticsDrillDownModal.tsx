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
    | 'wip_collections';

interface DrillDownOrder {
    id: string;
    order_number: string;
    customer?: {
        company_name: string;
    };
    service_name: string;
    service_date: string;
    final_amount: number;
    status: string;
    payment_status: string;
}

interface AnalyticsDrillDownModalProps {
    isOpen: boolean;
    onClose: () => void;
    metricType: MetricType | null;
    metricTitle: string;
    dateRange?: {
        from?: Date;
        to?: Date;
    };
    selectedMonth?: string;
    useReceivedDate?: boolean;
}

// Map metric type to API filter parameters
const getFiltersForMetric = (metricType: MetricType): Record<string, string> => {
    switch (metricType) {
        case 'orders_received':
            return {}; // All orders in date range
        case 'orders_cancelled':
            return { status: 'cancelled' };
        case 'net_orders':
            return { excludeCancelled: 'true' };
        case 'orders_executed':
            return { status: 'completed' };
        case 'collections':
            return { status: 'completed', paymentStatus: 'paid' };
        case 'wip_orders':
            return { excludeCompleted: 'true', excludeCancelled: 'true' };
        case 'wip_billed':
            return { excludeCompleted: 'true', excludeCancelled: 'true', invoiceStatus: 'generated' };
        case 'wip_collections':
            return { excludeCompleted: 'true', excludeCancelled: 'true', paymentStatus: 'paid' };
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

    useEffect(() => {
        if (isOpen && metricType) {
            fetchOrders();
        }
    }, [isOpen, metricType]);

    const fetchOrders = async () => {
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
                page: 1,
                limit: 50, // Show top 50 orders
                search: '',
                status: filters.status || '',
                paymentStatus: filters.paymentStatus || '',
                dateFrom: useReceivedDate ? '' : dateFrom,
                dateTo: useReceivedDate ? '' : dateTo,
                receivedDateFrom: useReceivedDate ? dateFrom : '',
                receivedDateTo: useReceivedDate ? dateTo : '',
            });

            if (response.success) {
                // Apply additional client-side filters if needed
                let filteredOrders = response.data.orders || [];

                if (filters.excludeCancelled === 'true') {
                    filteredOrders = filteredOrders.filter((o: DrillDownOrder) => o.status !== 'cancelled');
                }
                if (filters.excludeCompleted === 'true') {
                    filteredOrders = filteredOrders.filter((o: DrillDownOrder) => o.status !== 'completed');
                }

                setOrders(filteredOrders);
                setTotalRecords(filteredOrders.length);
            }
        } catch (error) {
            console.error('Error fetching drill-down orders:', error);
        } finally {
            setLoading(false);
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
            <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>{metricTitle} - Order Details</span>
                        <Badge variant="secondary">{totalRecords} orders</Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto">
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
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Service Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead></TableHead>
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

                <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
