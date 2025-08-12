'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText, Save, Calculator, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
}

interface B2BOrder {
  id: string;
  order_number: string;
  service_name: string;
  service_description: string;
  custom_price: number;
  quantity: number;
  total_amount: number;
  payment_terms: string;
  notes: string;
  customer: {
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
  };
  status: string;
  invoice_generated_at: string | null;
}

export default function GenerateInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<B2BOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

  const [invoiceData, setInvoiceData] = useState({
    subtotal: 0,
    payment_terms: 'Net 30 days',
    notes: '',
    due_days: 30,
    invoice_items: [] as InvoiceItem[]
  });

  useEffect(() => {
    fetchOrderDetails();
    checkExistingInvoice();
  }, [orderId]);

  const checkExistingInvoice = async () => {
    try {
      const response = await fetch(`/admin-api/b2b/orders/${orderId}/invoice-check`, {
        headers: {
          'admin-auth-token': localStorage.getItem('adminToken')
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data.exists) {
          setInvoiceGenerated(true);
          setGeneratedInvoice({
            invoice_id: data.data.invoice_id,
            invoice_number: data.data.invoice_number,
            total_amount: data.data.total_amount,
            payment_status: data.data.payment_status,
            download_url: data.data.download_url
          });

          toast({
            title: 'Invoice Already Exists',
            description: `Invoice ${data.data.invoice_number} already exists for this order`,
          });
        }
      }
    } catch (error) {
      console.error('Error checking existing invoice:', error);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/admin-api/b2b/orders/${orderId}`, {
        headers: {
          'admin-auth-token': localStorage.getItem('adminToken')
        }
      });

      if (response.ok) {
        const data = await response.json();
        const orderData = data.data;
        setOrder(orderData);

        // Initialize invoice data from order
        setInvoiceData(prev => ({
          ...prev,
          subtotal: orderData.custom_price || orderData.total_amount || 0,
          payment_terms: orderData.payment_terms || 'Net 30 days',
          notes: orderData.notes || `Invoice for ${orderData.service_name}`,
          invoice_items: [
            {
              description: orderData.service_name || 'Service',
              quantity: orderData.quantity || 1,
              unit_price: orderData.custom_price || 0,
              tax_rate: 18,
              total: (orderData.custom_price || 0) * (orderData.quantity || 1)
            }
          ]
        }));
      } else {
        throw new Error('Failed to fetch order details');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch order details'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = invoiceData.invoice_items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * 0.18; // 18% GST
    const totalAmount = subtotal + taxAmount;
    
    return { subtotal, taxAmount, totalAmount };
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoiceData.invoice_items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total for the item
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setInvoiceData(prev => ({ ...prev, invoice_items: updatedItems }));
  };

  const addInvoiceItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      invoice_items: [
        ...prev.invoice_items,
        {
          description: '',
          quantity: 1,
          unit_price: 0,
          tax_rate: 18,
          total: 0
        }
      ]
    }));
  };

  const removeInvoiceItem = (index: number) => {
    setInvoiceData(prev => ({
      ...prev,
      invoice_items: prev.invoice_items.filter((_, i) => i !== index)
    }));
  };

  const generateInvoice = async () => {
    try {
      setGenerating(true);

      const { subtotal } = calculateTotals();

      const response = await fetch(`/admin-api/b2b/orders/${orderId}/generate-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': localStorage.getItem('adminToken')
        },
        body: JSON.stringify({
          subtotal: subtotal,
          payment_terms: invoiceData.payment_terms,
          notes: invoiceData.notes,
          due_days: invoiceData.due_days,
          invoice_items: invoiceData.invoice_items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tax_rate: item.tax_rate
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedInvoice(data.data);
        setInvoiceGenerated(true);

        // Show appropriate message based on whether invoice was existing or new
        const message = data.data.existing
          ? `Invoice ${data.data.invoice_number} already exists for this order`
          : `Invoice ${data.data.invoice_number} generated successfully`;

        toast({
          title: data.data.existing ? 'Invoice Already Exists' : 'Success',
          description: message
        });

        // Auto-redirect to invoice listing after a short delay
        setTimeout(() => {
          if (data.data.redirect_to) {
            router.push(data.data.redirect_to);
          } else {
            router.push('/admin/b2b/invoices');
          }
        }, 2000); // 2 second delay to show the success message

      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate invoice');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to generate invoice'
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadInvoice = async () => {
    try {
      const response = await fetch(`/admin-api/b2b/invoices/${generatedInvoice?.invoice_id}/download`, {
        headers: {
          'admin-auth-token': localStorage.getItem('adminToken')
        }
      });

      if (response.ok) {
        // Handle PDF download
        window.open(response.url, '_blank');
      } else {
        throw new Error('Failed to download invoice');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to download invoice'
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-red-600">Order not found</p>
          <Button onClick={() => router.push('/admin/b2b/orders')} className="mt-4">
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const { subtotal, taxAmount, totalAmount } = calculateTotals();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/b2b/orders')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Generate Invoice</h1>
            <p className="text-gray-600">Order #{order.order_number}</p>
          </div>
        </div>

        {invoiceGenerated && (
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="bg-green-100 text-green-800">
              Invoice Generated
            </Badge>
            {generatedInvoice && (
              <>
                <Button onClick={downloadInvoice} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={() => router.push('/admin/b2b/invoices')}
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Invoices
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {invoiceGenerated ? (
        /* Invoice Generated Success */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <FileText className="h-5 w-5 mr-2" />
              Invoice Generated Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedInvoice && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Invoice Number</Label>
                    <p className="font-medium">{generatedInvoice.invoice_number}</p>
                  </div>
                  <div>
                    <Label>Total Amount</Label>
                    <p className="font-medium">₹{generatedInvoice.total_amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <p className="font-medium">{generatedInvoice.due_date}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant="outline">Unpaid</Badge>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={downloadInvoice} className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin/b2b/invoices')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View All Invoices
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin/b2b/payment-reminders')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Manage Payment Reminders
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Invoice Generation Form */
        <>
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company</Label>
                  <p className="font-medium">{order.customer.company_name}</p>
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <p className="font-medium">{order.customer.contact_person}</p>
                </div>
                <div>
                  <Label>Service</Label>
                  <p className="font-medium">{order.service_name}</p>
                </div>
                <div>
                  <Label>Order Amount</Label>
                  <p className="font-medium">₹{order.custom_price?.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Invoice Items
                <Button onClick={addInvoiceItem} size="sm" variant="outline">
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Tax Rate</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceData.invoice_items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateInvoiceItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.tax_rate}
                          onChange={(e) => updateInvoiceItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        ₹{item.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => removeInvoiceItem(index)}
                          size="sm"
                          variant="destructive"
                          disabled={invoiceData.invoice_items.length === 1}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Input
                    id="payment_terms"
                    value={invoiceData.payment_terms}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, payment_terms: e.target.value }))}
                    placeholder="Net 30 days"
                  />
                </div>
                <div>
                  <Label htmlFor="due_days">Due Days</Label>
                  <Input
                    id="due_days"
                    type="number"
                    value={invoiceData.due_days}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, due_days: parseInt(e.target.value) || 30 }))}
                    placeholder="30"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for the invoice"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>₹{taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
              
              <Button 
                onClick={generateInvoice} 
                disabled={generating || invoiceData.invoice_items.length === 0}
                className="w-full mt-4"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Invoice...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Invoice
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
