'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Loader2, AlertCircle } from 'lucide-react';
import {
  fetchB2BCustomers,
  fetchUnbilledOrders,
  generateStandardInvoice,
  generateConsolidatedInvoice,
  generatePartialInvoice,
  fetchAdditionalCostsForOrder // ✅ NEW: Import additional costs API
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function GenerateInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [unbilledOrders, setUnbilledOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Search states
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Common fields
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [customInvoiceNumber, setCustomInvoiceNumber] = useState(''); // ✅ NEW: Custom invoice number
  const [invoiceDateType, setInvoiceDateType] = useState<'current' | 'old' | 'future'>('current'); // ✅ NEW: Invoice date type
  const [invoiceDate, setInvoiceDate] = useState(''); // ✅ NEW: Custom invoice date

  // Standard invoice
  const [standardOrderId, setStandardOrderId] = useState('');

  // Consolidated invoice
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  // Partial invoice
  const [partialOrderId, setPartialOrderId] = useState('');
  const [partialAmount, setPartialAmount] = useState('');
  const [includeAdditionalCosts, setIncludeAdditionalCosts] = useState(false); // ✅ NEW: Checkbox state
  const [selectedOrderAdditionalCosts, setSelectedOrderAdditionalCosts] = useState<any[]>([]); // ✅ NEW: Store additional costs

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      loadUnbilledOrders(selectedCustomer);
    } else {
      setUnbilledOrders([]);
      resetOrderSelections();
    }
  }, [selectedCustomer]);

  // ✅ NEW: Load additional costs when partial order is selected
  useEffect(() => {
    if (partialOrderId) {
      loadAdditionalCosts(partialOrderId);
    } else {
      setSelectedOrderAdditionalCosts([]);
      setIncludeAdditionalCosts(false);
    }
  }, [partialOrderId]);

  const loadCustomers = async () => {
    try {
      // ✅ Load ALL customers for dropdown (set high limit to get all)
      const response = await fetchB2BCustomers({
        status: 'active',
        page: 1,
        limit: 1000 // High limit to get all active customers
      });
      setCustomers(response.data?.customers || response.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive',
      });
    }
  };

  const loadUnbilledOrders = async (customerId: string) => {
    try {
      setLoadingOrders(true);
      const response = await fetchUnbilledOrders(customerId);
      setUnbilledOrders(response.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load unbilled orders',
        variant: 'destructive',
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  // ✅ FIXED: Load only UNINVOICED additional costs for selected order
  const loadAdditionalCosts = async (orderId: string) => {
    try {
      // ✅ Pass onlyUninvoiced=true to get only costs not yet invoiced
      const response = await fetchAdditionalCostsForOrder(orderId, true);
      // Filter only approved costs (backend already filters uninvoiced)
      const approvedCosts = (response.data || []).filter(
        (cost: any) => cost.status === 'approved'
      );
      setSelectedOrderAdditionalCosts(approvedCosts);
    } catch (error: any) {
      console.error('Error loading additional costs:', error);
      setSelectedOrderAdditionalCosts([]);
    }
  };

  const resetOrderSelections = () => {
    setStandardOrderId('');
    setSelectedOrders([]);
    setPartialOrderId('');
    setPartialAmount('');
    setIncludeAdditionalCosts(false);
    setSelectedOrderAdditionalCosts([]);
  };

  const handleGenerateStandard = async () => {
    if (!standardOrderId || !dueDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select an order and due date',
        variant: 'destructive',
      });
      return;
    }

    // Validate invoice date for old/future types
    if (invoiceDateType !== 'current' && !invoiceDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select an invoice date',
        variant: 'destructive',
      });
      return;
    }

    // Determine the final invoice date
    const finalInvoiceDate = invoiceDateType === 'current' ? new Date().toISOString().split('T')[0] : invoiceDate;

    try {
      setLoading(true);
      await generateStandardInvoice(standardOrderId, dueDate, notes, customInvoiceNumber || undefined, finalInvoiceDate);

      toast({
        title: 'Success',
        description: 'Standard invoice generated successfully',
      });

      router.push('/admin/b2b/invoices');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate invoice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateConsolidated = async () => {
    if (selectedOrders.length === 0 || !dueDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one order and due date',
        variant: 'destructive',
      });
      return;
    }

    // Validate invoice date for old/future types
    if (invoiceDateType !== 'current' && !invoiceDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select an invoice date',
        variant: 'destructive',
      });
      return;
    }

    // Determine the final invoice date
    const finalInvoiceDate = invoiceDateType === 'current' ? new Date().toISOString().split('T')[0] : invoiceDate;

    try {
      setLoading(true);
      await generateConsolidatedInvoice({
        customerId: selectedCustomer,
        bookingIds: selectedOrders,
        periodStart,
        periodEnd,
        dueDate,
        notes,
        invoiceNumber: customInvoiceNumber || undefined,
        invoiceDate: finalInvoiceDate,
      });

      toast({
        title: 'Success',
        description: `Consolidated invoice generated for ${selectedOrders.length} orders`,
      });

      router.push('/admin/b2b/invoices');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate consolidated invoice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePartial = async () => {
    if (!partialOrderId || !partialAmount || !dueDate) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(partialAmount);
    if (amount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Amount must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    // ✅ NEW: Calculate additional costs total
    const additionalCostsTotal = selectedOrderAdditionalCosts.reduce(
      (sum, cost) => sum + parseFloat(cost.total_amount || 0),
      0
    );
    const additionalCostsWithGst = additionalCostsTotal * 1.18;

    // Validate against order's remaining amount
    const selectedOrder = unbilledOrders.find(o => o.id === partialOrderId);
    const maxAllowedAmount = includeAdditionalCosts
      ? selectedOrder.remaining_amount + additionalCostsWithGst
      : selectedOrder.remaining_amount;

    if (selectedOrder && amount > maxAllowedAmount) {
      toast({
        title: 'Validation Error',
        description: `Amount (₹${amount.toLocaleString()}) exceeds ${includeAdditionalCosts ? 'remaining amount + additional costs' : 'remaining amount'} (₹${maxAllowedAmount.toLocaleString()})`,
        variant: 'destructive',
      });
      return;
    }

    // Validate invoice date for old/future types
    if (invoiceDateType !== 'current' && !invoiceDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select an invoice date',
        variant: 'destructive',
      });
      return;
    }

    // Determine the final invoice date
    const finalInvoiceDate = invoiceDateType === 'current' ? new Date().toISOString().split('T')[0] : invoiceDate;

    try {
      setLoading(true);
      // Pass includeAdditionalCosts, custom invoice number, and invoiceDate to API
      await generatePartialInvoice(partialOrderId, amount, dueDate, notes, includeAdditionalCosts, customInvoiceNumber || undefined, finalInvoiceDate);

      toast({
        title: 'Success',
        description: 'Partial invoice generated successfully',
      });

      router.push('/admin/b2b/invoices');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate partial invoice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const getSelectedOrdersTotal = () => {
    return unbilledOrders
      .filter(order => selectedOrders.includes(order.id))
      .reduce((sum, order) => sum + (order.remaining_amount || 0), 0);
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.company_name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.contact_person?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Filter orders based on search
  const filteredOrders = unbilledOrders.filter(order =>
    order.order_number?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.service_name?.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/b2b/finance/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Generate Invoice</h1>
            <p className="text-gray-600 mt-1">Create standard, consolidated, or partial invoices</p>
          </div>
        </div>

        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="customer">
                Customer <span className="text-red-500">*</span>
              </Label>

              {/* Search Input */}
              <Input
                placeholder="Search customers by name, contact, or email..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="mb-2"
              />

              {/* Customer List */}
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No customers found
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer.id);
                        setCustomerSearch(customer.company_name);
                      }}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${selectedCustomer === customer.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                    >
                      <div className="font-medium">{customer.company_name}</div>
                      <div className="text-sm text-gray-600">
                        {customer.contact_person} • {customer.email}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Type Tabs */}
        {selectedCustomer && (
          <Tabs defaultValue="standard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="standard">Standard Invoice</TabsTrigger>
              <TabsTrigger value="consolidated">Consolidated Invoice</TabsTrigger>
              <TabsTrigger value="partial">Partial Invoice</TabsTrigger>
            </TabsList>

            {/* Standard Invoice Tab */}
            <TabsContent value="standard" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Standard Invoice - One Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-gray-600">
                    Generate a single invoice for one complete order
                  </p>

                  {loadingOrders ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600 mt-2">Loading unbilled orders...</p>
                    </div>
                  ) : unbilledOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No unbilled orders found for this customer</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="standard-order">
                          Select Order <span className="text-red-500">*</span>
                        </Label>

                        {/* Order Search */}
                        <Input
                          placeholder="Search orders..."
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                          className="mb-2"
                        />

                        <Select value={standardOrderId} onValueChange={setStandardOrderId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select order" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredOrders.map((order) => (
                              <SelectItem key={order.id} value={order.id}>
                                {order.order_number} - {order.service_name} - ₹{order.remaining_amount?.toLocaleString() || 0}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="custom-invoice-number">
                          Custom Invoice Number (Optional)
                        </Label>
                        <Input
                          id="custom-invoice-number"
                          type="text"
                          placeholder="e.g., Inst/246/2025-26 (leave empty for auto-generation)"
                          value={customInvoiceNumber}
                          onChange={(e) => setCustomInvoiceNumber(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                          Leave empty to auto-generate in format: Inst/[number]/[FY]
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Invoice Date Type</Label>
                        <Select
                          value={invoiceDateType}
                          onValueChange={(val: 'current' | 'old' | 'future') => {
                            setInvoiceDateType(val);
                            if (val === 'current') {
                              setInvoiceDate(new Date().toISOString().split('T')[0]);
                            } else {
                              setInvoiceDate('');
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select date type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current">Current Date (Today)</SelectItem>
                            <SelectItem value="old">Old Date (Backdate)</SelectItem>
                            <SelectItem value="future">Future Date</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {invoiceDateType !== 'current' && (
                        <div className="space-y-2">
                          <Label htmlFor="standard-invoice-date">
                            Invoice Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="standard-invoice-date"
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            max={invoiceDateType === 'old' ? new Date().toISOString().split('T')[0] : undefined}
                            min={invoiceDateType === 'future' ? new Date(Date.now() + 86400000).toISOString().split('T')[0] : undefined}
                            required
                          />
                          <p className="text-xs text-gray-500">
                            {invoiceDateType === 'old' ? 'Select a past date for backdating' : 'Select a future date'}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="standard-due-date">
                          Due Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="standard-due-date"
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="standard-notes">Notes</Label>
                        <Textarea
                          id="standard-notes"
                          placeholder="Additional notes for the invoice..."
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      <Button onClick={handleGenerateStandard} disabled={loading} className="w-full">
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Generate Standard Invoice
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Consolidated Invoice Tab */}
            <TabsContent value="consolidated" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Consolidated Invoice - Multiple Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-gray-600">
                    Generate a single invoice for multiple orders (e.g., monthly billing)
                  </p>

                  {loadingOrders ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600 mt-2">Loading unbilled orders...</p>
                    </div>
                  ) : unbilledOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No unbilled orders found for this customer</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>
                          Select Orders <span className="text-red-500">*</span>
                        </Label>

                        {/* Order Search */}
                        <Input
                          placeholder="Search orders by number or service name..."
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                          className="mb-2"
                        />

                        <div className="border rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
                          {filteredOrders.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                              No orders found matching your search
                            </div>
                          ) : (
                            filteredOrders.map((order) => (
                              <div key={order.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`order-${order.id}`}
                                  checked={selectedOrders.includes(order.id)}
                                  onCheckedChange={() => toggleOrderSelection(order.id)}
                                />
                                <label
                                  htmlFor={`order-${order.id}`}
                                  className="flex-1 text-sm cursor-pointer"
                                >
                                  {order.order_number} - {order.service_name} - ₹{order.remaining_amount?.toLocaleString() || 0}
                                  <span className="text-gray-500 ml-2">
                                    ({new Date(order.service_date).toLocaleDateString()})
                                  </span>
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                        {selectedOrders.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Selected {selectedOrders.length} orders - Total: ₹{getSelectedOrdersTotal().toLocaleString()}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="consolidated-invoice-number">
                          Custom Invoice Number (Optional)
                        </Label>
                        <Input
                          id="consolidated-invoice-number"
                          type="text"
                          placeholder="e.g., Inst/246/2025-26 (leave empty for auto-generation)"
                          value={customInvoiceNumber}
                          onChange={(e) => setCustomInvoiceNumber(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                          Leave empty to auto-generate in format: Inst/[number]/[FY]
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="period-start">Period Start (Optional)</Label>
                          <Input
                            id="period-start"
                            type="date"
                            value={periodStart}
                            onChange={(e) => setPeriodStart(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="period-end">Period End (Optional)</Label>
                          <Input
                            id="period-end"
                            type="date"
                            value={periodEnd}
                            onChange={(e) => setPeriodEnd(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* ✅ Invoice Date Type Selector */}
                      <div className="space-y-2">
                        <Label>Invoice Date Type</Label>
                        <Select
                          value={invoiceDateType}
                          onValueChange={(val: 'current' | 'old' | 'future') => {
                            setInvoiceDateType(val);
                            if (val === 'current') {
                              setInvoiceDate(new Date().toISOString().split('T')[0]);
                            } else {
                              setInvoiceDate('');
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select date type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current">Current Date (Today)</SelectItem>
                            <SelectItem value="old">Old Date (Backdate)</SelectItem>
                            <SelectItem value="future">Future Date</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {invoiceDateType !== 'current' && (
                        <div className="space-y-2">
                          <Label htmlFor="consolidated-invoice-date">
                            Invoice Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="consolidated-invoice-date"
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            max={invoiceDateType === 'old' ? new Date().toISOString().split('T')[0] : undefined}
                            min={invoiceDateType === 'future' ? new Date(Date.now() + 86400000).toISOString().split('T')[0] : undefined}
                            required
                          />
                          <p className="text-xs text-gray-500">
                            {invoiceDateType === 'old' ? 'Select a past date for backdating' : 'Select a future date'}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="consolidated-due-date">
                          Due Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="consolidated-due-date"
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="consolidated-notes">Notes</Label>
                        <Textarea
                          id="consolidated-notes"
                          placeholder="Additional notes for the invoice..."
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      <Button onClick={handleGenerateConsolidated} disabled={loading} className="w-full">
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Generate Consolidated Invoice
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Partial Invoice Tab */}
            <TabsContent value="partial" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Partial Invoice - Milestone Billing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-gray-600">
                    Generate a partial invoice for milestone or advance billing
                  </p>

                  {loadingOrders ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600 mt-2">Loading unbilled orders...</p>
                    </div>
                  ) : unbilledOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No unbilled orders found for this customer</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="partial-order">
                          Select Order <span className="text-red-500">*</span>
                        </Label>

                        {/* Order Search */}
                        <Input
                          placeholder="Search orders..."
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                          className="mb-2"
                        />

                        <Select value={partialOrderId} onValueChange={setPartialOrderId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select order" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredOrders.map((order) => (
                              <SelectItem key={order.id} value={order.id}>
                                {order.order_number} - {order.service_name} - Remaining: ₹{order.remaining_amount?.toLocaleString() || 0}
                                {order.uninvoiced_additional_costs > 0 && ` (incl. ₹${order.uninvoiced_additional_costs.toLocaleString()} additional)`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="partial-invoice-number">
                          Custom Invoice Number (Optional)
                        </Label>
                        <Input
                          id="partial-invoice-number"
                          type="text"
                          placeholder="e.g., Inst/246/2025-26 (leave empty for auto-generation)"
                          value={customInvoiceNumber}
                          onChange={(e) => setCustomInvoiceNumber(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                          Leave empty to auto-generate in format: Inst/[number]/[FY]
                        </p>
                      </div>

                      {partialOrderId && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                          {/* ✅ NEW: Show breakdown of remaining amount */}
                          {selectedOrderAdditionalCosts.length > 0 ? (
                            <>
                              <div className="space-y-2">
                                <p className="text-sm font-semibold text-blue-900">
                                  Total Remaining Amount: ₹
                                  {unbilledOrders.find(o => o.id === partialOrderId)?.remaining_amount?.toLocaleString() || 0}
                                </p>
                                <div className="ml-4 space-y-1 text-sm text-blue-800">
                                  <p>
                                    ├─ Base Order Amount: ₹
                                    {(unbilledOrders.find(o => o.id === partialOrderId)?.base_remaining ||
                                      unbilledOrders.find(o => o.id === partialOrderId)?.remaining_amount || 0).toLocaleString()}
                                  </p>
                                  <p>
                                    └─ Uninvoiced Additional Costs: ₹
                                    {selectedOrderAdditionalCosts.reduce((sum, cost) => sum + parseFloat(cost.total_amount || 0), 0).toLocaleString()}
                                    {' '}({selectedOrderAdditionalCosts.length} item{selectedOrderAdditionalCosts.length > 1 ? 's' : ''})
                                  </p>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-blue-300">
                                <p className="text-xs text-blue-700">
                                  💡 <strong>Note:</strong> Use the checkbox below to choose whether to include additional costs in this invoice.
                                </p>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-blue-800">
                              <strong>Remaining Amount:</strong> ₹
                              {unbilledOrders.find(o => o.id === partialOrderId)?.remaining_amount?.toLocaleString() || 0}
                            </p>
                          )}
                        </div>
                      )}

                      {/* ✅ NEW: Additional Costs Checkbox */}
                      {partialOrderId && selectedOrderAdditionalCosts.length > 0 && (
                        <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <Checkbox
                            id="include-additional-costs"
                            checked={includeAdditionalCosts}
                            onCheckedChange={(checked) => setIncludeAdditionalCosts(checked as boolean)}
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor="include-additional-costs"
                              className="text-sm font-medium cursor-pointer"
                            >
                              Include Additional Costs in This Invoice
                            </Label>
                            <p className="text-xs text-gray-600 mt-1">
                              {includeAdditionalCosts ? (
                                <>
                                  ✅ Additional costs (₹{selectedOrderAdditionalCosts.reduce((sum, cost) => sum + parseFloat(cost.total_amount || 0), 0).toLocaleString()} + GST) will be included in this invoice
                                </>
                              ) : (
                                <>
                                  Additional costs will NOT be included. You can include them in a future invoice.
                                </>
                              )}
                            </p>
                            {includeAdditionalCosts && (
                              <div className="mt-2 text-xs text-gray-700 space-y-1">
                                <p className="font-medium">Items to be included:</p>
                                {selectedOrderAdditionalCosts.map((cost, idx) => (
                                  <p key={idx} className="ml-2">
                                    • {cost.item_name}: ₹{parseFloat(cost.total_amount || 0).toLocaleString()}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="partial-amount">
                          Invoice Amount (₹) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="partial-amount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="10000.00"
                          value={partialAmount}
                          onChange={(e) => setPartialAmount(e.target.value)}
                          required
                        />
                        {/* ✅ NEW: Show max allowed amount based on checkbox */}
                        {partialOrderId && (
                          <div className="text-xs space-y-1">
                            {includeAdditionalCosts && selectedOrderAdditionalCosts.length > 0 ? (
                              <p className="text-green-700 font-medium">
                                ✅ Maximum allowed: ₹
                                {(
                                  (unbilledOrders.find(o => o.id === partialOrderId)?.base_remaining ||
                                    unbilledOrders.find(o => o.id === partialOrderId)?.remaining_amount || 0) +
                                  selectedOrderAdditionalCosts.reduce((sum, cost) => sum + parseFloat(cost.total_amount || 0), 0)
                                ).toLocaleString()}
                                {' '}(Base: ₹{(unbilledOrders.find(o => o.id === partialOrderId)?.base_remaining ||
                                  unbilledOrders.find(o => o.id === partialOrderId)?.remaining_amount || 0).toLocaleString()} + Additional: ₹
                                {selectedOrderAdditionalCosts.reduce((sum, cost) => sum + parseFloat(cost.total_amount || 0), 0).toLocaleString()})
                              </p>
                            ) : (
                              <p className="text-blue-700 font-medium">
                                Maximum allowed: ₹
                                {(unbilledOrders.find(o => o.id === partialOrderId)?.base_remaining ||
                                  unbilledOrders.find(o => o.id === partialOrderId)?.remaining_amount || 0).toLocaleString()}
                                {' '}(Base order amount only)
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* ✅ Invoice Date Type Selector */}
                      <div className="space-y-2">
                        <Label>Invoice Date Type</Label>
                        <Select
                          value={invoiceDateType}
                          onValueChange={(val: 'current' | 'old' | 'future') => {
                            setInvoiceDateType(val);
                            if (val === 'current') {
                              setInvoiceDate(new Date().toISOString().split('T')[0]);
                            } else {
                              setInvoiceDate('');
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select date type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current">Current Date (Today)</SelectItem>
                            <SelectItem value="old">Old Date (Backdate)</SelectItem>
                            <SelectItem value="future">Future Date</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {invoiceDateType !== 'current' && (
                        <div className="space-y-2">
                          <Label htmlFor="partial-invoice-date">
                            Invoice Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="partial-invoice-date"
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            max={invoiceDateType === 'old' ? new Date().toISOString().split('T')[0] : undefined}
                            min={invoiceDateType === 'future' ? new Date(Date.now() + 86400000).toISOString().split('T')[0] : undefined}
                            required
                          />
                          <p className="text-xs text-gray-500">
                            {invoiceDateType === 'old' ? 'Select a past date for backdating' : 'Select a future date'}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="partial-due-date">
                          Due Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="partial-due-date"
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="partial-notes">Notes</Label>
                        <Textarea
                          id="partial-notes"
                          placeholder="e.g., Advance payment, Milestone 1 of 3, etc."
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      <Button onClick={handleGeneratePartial} disabled={loading} className="w-full">
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Generate Partial Invoice
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

