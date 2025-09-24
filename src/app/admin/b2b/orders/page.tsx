'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, Edit, Settings, Download, FileText, Upload, CheckSquare, Square } from 'lucide-react';
import { fetchB2BOrders, downloadB2BInvoiceSimple, fetchB2BStatusOptions, StatusOption, bulkUpdateB2BOrderStatus } from '@/lib/api';
import { StatusBadge } from '@/components/b2b/StatusDropdown';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface B2BOrder {
  id: string;
  order_number: string;
  customer: {
    company_name: string;
    contact_person: string;
  };
  service_name: string;
  service_address: string;
  custom_price: number;
  service_rate?: number;
  store_name?: string;
  store_code?: string;
  booking_poc_name?: string;
  booking_poc_number?: string;
  service_area_sqft?: number;
  status: 'pending' | 'accepted' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  payment_status: 'pending' | 'paid' | 'overdue';
  invoice_status?: 'pending' | 'generated' | 'sent' | 'paid';
  service_date?: string;
  booking_received_date?: string | number;
  created_at: string;
  // SP Pricing Breakdown
  sp_base_price?: number;
  sp_gst_amount?: number;
  sp_total_amount?: number;
}

export default function B2BOrdersPage() {
  const { toast } = useToast();

  // Status options state
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [paymentStatusOptions, setPaymentStatusOptions] = useState<StatusOption[]>([]);
  const [orders, setOrders] = useState<B2BOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Bulk selection state
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('no_change');
  const [bulkPaymentStatus, setBulkPaymentStatus] = useState('no_change');
  const [bulkNotes, setBulkNotes] = useState('');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchB2BOrders(
        currentPage,
        10,
        statusFilter || 'all',
        paymentStatusFilter || 'all',
        searchTerm
      );

      // Ensure we have valid data structure
      if (data && data.data) {
        const orders = data.data.orders || [];
        console.log('📋 Orders fetched:', orders.length);
        console.log('📋 Sample order invoice_status:', orders[0]?.invoice_status);
        setOrders(orders);
        setTotalPages(data.data.pagination?.total_pages || 1);
        setTotalRecords(data.data.pagination?.total_records || 0);
      } else {
        // Fallback to empty state if data structure is unexpected
        setOrders([]);
        setTotalPages(1);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Set empty state on error
      setOrders([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      // ✅ Get the invoice ID first, then download
      const adminToken = localStorage.getItem('token') || localStorage.getItem('adminToken');

      // First, get the invoice details to find the invoice ID
      const invoiceResponse = await fetch(`/admin-api/b2b/orders/${orderId}`, {
        headers: {
          'admin-auth-token': adminToken || ''
        }
      });

      if (invoiceResponse.ok) {
        const orderData = await invoiceResponse.json();
        // ✅ Use proxy download to bypass S3 permission issues
        const downloadUrl = `/admin-api/b2b/invoices/${orderId}/proxy-download`;
        window.open(downloadUrl, '_blank');
        console.log('Invoice proxy download initiated');
      } else {
        throw new Error('Failed to get order details');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const handleGenerateInvoice = async (orderId: string, orderNumber: string) => {
    try {
      // ✅ First check if invoice already exists
      const adminToken = localStorage.getItem('token') || localStorage.getItem('adminToken');

      const checkResponse = await fetch(`/admin-api/b2b/orders/${orderId}/invoice-check`, {
        headers: {
          'admin-auth-token': adminToken || ''
        }
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.data.exists) {
          toast({
            title: "Invoice Already Exists",
            description: `Invoice ${checkData.data.invoice_number} already exists for this order. Redirecting to invoice listing...`,
            duration: 3000,
          });

          // Redirect to invoice listing with search query
          setTimeout(() => {
            if (checkData.data.redirect_to) {
              window.location.href = checkData.data.redirect_to;
            } else {
              window.location.href = `/admin/b2b/invoices?search=${checkData.data.invoice_number}`;
            }
          }, 1500);
          return;
        }
      }

      // ✅ Generate new invoice
      const response = await fetch(`/admin-api/b2b/orders/${orderId}/generate-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': adminToken || ''
        },
        body: JSON.stringify({
          // ✅ FIXED: Remove hardcoded subtotal - let backend calculate from order
          payment_terms: 'Net 30 days',
          notes: `Invoice for order ${orderNumber}`,
          due_days: 30
        })
      });

      if (response.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please check your login status and try again.",
          variant: "destructive",
        });
        return;
      }

      if (response.ok) {
        const data = await response.json();

        // ✅ Handle PDF generation status
        const pdfStatus = data.data.pdf_status;
        const pdfError = data.data.pdf_error;

        // Show appropriate message based on invoice and PDF status
        let title = "Invoice Generated Successfully!";
        let description = "";
        let duration = 3000;

        if (data.data.existing) {
          title = "Invoice Already Exists";
          description = `Invoice ${data.data.invoice_number} already exists for this order. Redirecting to invoice listing...`;
        } else if (pdfStatus === 'success') {
          title = "Invoice Generated Successfully!";
          description = `Invoice ${data.data.invoice_number} has been generated successfully with PDF. Redirecting to invoice listing...`;
        } else if (pdfStatus === 'failed') {
          title = "Invoice Generated (PDF Failed)";
          description = `Invoice ${data.data.invoice_number} generated, but PDF generation failed. You can retry PDF generation from the invoice details. Redirecting...`;
          duration = 5000; // Longer duration for important message
        } else {
          title = "Invoice Generated Successfully!";
          description = `Invoice ${data.data.invoice_number} has been generated successfully. Redirecting to invoice listing...`;
        }

        toast({
          title,
          description,
          duration,
        });

        // Update the order status immediately
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId
              ? { ...order, invoice_status: 'generated' }
              : order
          )
        );

        // Auto-redirect to invoice listing
        setTimeout(() => {
          if (data.data.redirect_to) {
            window.location.href = data.data.redirect_to;
          } else {
            window.location.href = '/admin/b2b/invoices';
          }
        }, 2000); // 2 second delay to show the message

      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: `Failed to generate invoice: ${errorData.message || 'Unknown error'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to generate invoice. Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  // ✅ NEW: Quick function to check invoice status for an order
  const checkInvoiceStatus = async (orderId: string) => {
    try {
      const adminToken = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const response = await fetch(`/admin-api/b2b/orders/${orderId}/invoice-check`, {
        headers: {
          'admin-auth-token': adminToken || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return { exists: false };
    } catch (error) {
      console.error('Error checking invoice status:', error);
      return { exists: false };
    }
  };

  useEffect(() => {
    fetchOrders();
    loadStatusOptions();
  }, [currentPage, searchTerm, statusFilter, paymentStatusFilter]);

  const loadStatusOptions = async () => {
    try {
      const response = await fetchB2BStatusOptions();
      if (response.success) {
        setStatusOptions(response.data.status_options);
        setPaymentStatusOptions(response.data.payment_status_options);
      }
    } catch (error) {
      console.error('Failed to load status options:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  const handlePaymentStatusFilter = (value: string) => {
    setPaymentStatusFilter(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  // Bulk selection functions
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select orders to update",
        variant: "destructive",
      });
      return;
    }

    if ((!bulkStatus || bulkStatus === 'no_change') && (!bulkPaymentStatus || bulkPaymentStatus === 'no_change')) {
      toast({
        title: "No Status Selected",
        description: "Please select at least one status to update",
        variant: "destructive",
      });
      return;
    }

    try {
      setBulkUpdating(true);

      const updateData: any = {
        order_ids: selectedOrders
      };

      if (bulkStatus && bulkStatus !== 'no_change') updateData.status = bulkStatus;
      if (bulkPaymentStatus && bulkPaymentStatus !== 'no_change') updateData.payment_status = bulkPaymentStatus;
      if (bulkNotes.trim()) updateData.notes = bulkNotes.trim();

      const response = await bulkUpdateB2BOrderStatus(updateData);

      toast({
        title: "Bulk Update Successful",
        description: `Updated ${response.data.successful_updates} orders successfully`,
      });

      // Reset bulk selection and refresh orders
      setSelectedOrders([]);
      setShowBulkActions(false);
      setBulkStatus('no_change');
      setBulkPaymentStatus('no_change');
      setBulkNotes('');
      fetchOrders();

    } catch (error: any) {
      toast({
        title: "Bulk Update Failed",
        description: error.message || "Failed to update orders",
        variant: "destructive",
      });
    } finally {
      setBulkUpdating(false);
    }
  };

  // Status badge functions removed - now using StatusBadge component





  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">B2B Orders</h1>
            <p className="text-gray-600 mt-1">Manage B2B service orders with editable fields</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex items-center space-x-2">
              <Link href="/admin/b2b/orders/bulk-upload">
                <Upload className="w-4 h-4 mr-1" />
                <span>Bulk Upload</span>
              </Link>
            </Button>
            <Button asChild className="flex items-center space-x-2">
              <Link href="/admin/b2b/orders/add">
                <Plus className="w-4 h-4 mr-1" />
                <span>Create Order</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by order number, company name, or service..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter || 'all'} onValueChange={handleStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Order Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={paymentStatusFilter || 'all'} onValueChange={handlePaymentStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary and Bulk Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {orders.length} of {totalRecords} orders
            {selectedOrders.length > 0 && (
              <span className="ml-4 text-blue-600 font-medium">
                {selectedOrders.length} selected
              </span>
            )}
          </div>

          {selectedOrders.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkActions(!showBulkActions)}
              >
                Bulk Actions ({selectedOrders.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrders([])}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && selectedOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Bulk Update {selectedOrders.length} Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Order Status</label>
                  <Select value={bulkStatus} onValueChange={setBulkStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_change">No Change</SelectItem>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment Status</label>
                  <Select value={bulkPaymentStatus} onValueChange={setBulkPaymentStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_change">No Change</SelectItem>
                      {paymentStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                  <Input
                    placeholder="Add bulk update notes..."
                    value={bulkNotes}
                    onChange={(e) => setBulkNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkActions(false)}
                  disabled={bulkUpdating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkUpdate}
                  disabled={bulkUpdating || ((!bulkStatus || bulkStatus === 'no_change') && (!bulkPaymentStatus || bulkPaymentStatus === 'no_change'))}
                >
                  {bulkUpdating ? 'Updating...' : `Update ${selectedOrders.length} Orders`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Order List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSelectAll}
                          className="p-0 h-auto"
                        >
                          {selectedOrders.length === orders.length && orders.length > 0 ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Store Info</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Service Date</TableHead>
                      <TableHead>Received Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders && orders.length > 0 ? orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectOrder(order.id)}
                            className="p-0 h-auto"
                          >
                            {selectedOrders.includes(order.id) ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.order_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {order.customer?.company_name || 'Customer Info Not Available'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customer?.contact_person || 'Contact info not loaded'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.service_name}</div>
                            {order.service_area_sqft && (
                              <div className="text-sm text-gray-500">{order.service_area_sqft} sq ft</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.store_name ? (
                            <div>
                              <div className="font-medium">{order.store_name}</div>
                              <div className="text-sm text-gray-500">{order.store_code}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              ₹{order.custom_price ? order.custom_price.toLocaleString() : '0'}
                            </div>
                            {order.service_rate && order.service_rate !== order.custom_price && (
                              <div className="text-sm text-gray-500">
                                Rate: ₹{order.service_rate.toLocaleString()}
                              </div>
                            )}
                            {order.sp_total_amount && (
                              <div className="text-sm text-blue-600">
                                SP: ₹{parseFloat(order.sp_total_amount).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge type="status" value={order.status} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge type="payment" value={order.payment_status} />
                        </TableCell>
                        <TableCell>
                          {order.invoice_status === 'generated' ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Generated
                            </Badge>
                          ) : order.invoice_status === 'sent' ? (
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                              Sent
                            </Badge>
                          ) : order.invoice_status === 'paid' ? (
                            <Badge variant="default" className="bg-purple-100 text-purple-800">
                              Paid
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {order.service_date ? new Date(order.service_date).toLocaleDateString() : 'TBD'}
                        </TableCell>
                        <TableCell>
                          {order.booking_received_date ?
                            new Date(typeof order.booking_received_date === 'number' ?
                              order.booking_received_date * 1000 :
                              order.booking_received_date
                            ).toLocaleDateString() :
                            order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/b2b/orders/${order.id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/b2b/orders/${order.id}/editable-fields`}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Order
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/b2b/quotations/add?orderId=${order.id}`}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Create Quotation
                                </Link>
                              </DropdownMenuItem>
                              {(!order.invoice_status || order.invoice_status === 'pending') ? (
                                <DropdownMenuItem onClick={() => handleGenerateInvoice(order.id, order.order_number)}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Generate Invoice
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleDownloadInvoice(order.id)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Invoice
                                </DropdownMenuItem>
                              )}

                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                          {loading ? 'Loading orders...' : 'No orders found'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 py-2 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
