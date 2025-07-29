'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, Send, Calculator } from 'lucide-react';
import { createB2BQuotation, updateB2BQuotation, createB2BQuotationForOrder, B2BQuotation, B2BQuotationItem } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface B2BQuotationFormProps {
  quotation?: B2BQuotation; // For editing existing quotation
  orderId?: string; // For creating quotation for specific order
  onSuccess?: (quotation: B2BQuotation) => void;
  onCancel?: () => void;
}

const B2BQuotationForm: React.FC<B2BQuotationFormProps> = ({
  quotation,
  orderId,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<B2BQuotation>>({
    b2b_booking_id: orderId || quotation?.b2b_booking_id || '',
    initial_amount: quotation?.initial_amount || 0,
    final_amount: quotation?.final_amount || 0,
    quotation_items: quotation?.quotation_items || [],
    terms_and_conditions: quotation?.terms_and_conditions || 'Payment within 30 days of service completion.',
    validity_days: quotation?.validity_days || 30,
    sp_notes: quotation?.sp_notes || '',
    admin_notes: quotation?.admin_notes || '',
    status: quotation?.status || 'draft'
  });

  const [quotationItems, setQuotationItems] = useState<B2BQuotationItem[]>(
    quotation?.quotation_items || [
      { service: '', description: '', quantity: 1, rate: 0, amount: 0 }
    ]
  );

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = quotationItems.reduce((sum, item) => sum + item.amount, 0);
    const gstAmount = subtotal * 0.18; // 18% GST
    const totalAmount = subtotal + gstAmount;

    setFormData(prev => ({
      ...prev,
      initial_amount: subtotal,
      final_amount: subtotal,
      gst_amount: gstAmount,
      total_amount: totalAmount
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [quotationItems]);

  const handleItemChange = (index: number, field: keyof B2BQuotationItem, value: string | number) => {
    const updatedItems = [...quotationItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Recalculate amount for this item
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }

    setQuotationItems(updatedItems);
  };

  const addQuotationItem = () => {
    setQuotationItems([
      ...quotationItems,
      { service: '', description: '', quantity: 1, rate: 0, amount: 0 }
    ]);
  };

  const removeQuotationItem = (index: number) => {
    if (quotationItems.length > 1) {
      setQuotationItems(quotationItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (action: 'save' | 'send' = 'save') => {
    try {
      setLoading(true);

      // Validation
      if (!formData.b2b_booking_id) {
        toast({
          title: 'Error',
          description: 'Booking ID is required',
          variant: 'destructive',
        });
        return;
      }

      if (quotationItems.some(item => !item.service || item.rate <= 0)) {
        toast({
          title: 'Error',
          description: 'All quotation items must have service name and valid rate',
          variant: 'destructive',
        });
        return;
      }

      const quotationData = {
        ...formData,
        quotation_items: quotationItems,
        status: action === 'send' ? 'sent' : formData.status
      };

      let response;
      
      if (quotation?.id) {
        // Update existing quotation
        response = await updateB2BQuotation(quotation.id, quotationData);
      } else if (orderId) {
        // Create quotation for specific order
        response = await createB2BQuotationForOrder(orderId, quotationData);
      } else {
        // Create new quotation
        response = await createB2BQuotation(quotationData);
      }

      if (response.success) {
        toast({
          title: 'Success',
          description: `Quotation ${quotation?.id ? 'updated' : 'created'} successfully${action === 'send' ? ' and sent' : ''}`,
        });
        onSuccess?.(response.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save quotation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {quotation?.id ? 'Edit Quotation' : 'Create New Quotation'}
            {quotation?.quotation_number && (
              <span className="text-sm font-normal text-gray-500">
                ({quotation.quotation_number})
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="booking_id">Booking ID</Label>
              <Input
                id="booking_id"
                value={formData.b2b_booking_id}
                onChange={(e) => setFormData(prev => ({ ...prev, b2b_booking_id: e.target.value }))}
                placeholder="Enter booking ID"
                disabled={!!orderId || !!quotation?.id}
              />
            </div>

            <div>
              <Label htmlFor="validity_days">Validity (Days)</Label>
              <Input
                id="validity_days"
                type="number"
                value={formData.validity_days}
                onChange={(e) => setFormData(prev => ({ ...prev, validity_days: parseInt(e.target.value) || 30 }))}
                placeholder="30"
              />
            </div>
          </div>

          {/* Quotation Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-semibold">Quotation Items</Label>
              <Button onClick={addQuotationItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotationItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={item.service}
                        onChange={(e) => handleItemChange(index, 'service', e.target.value)}
                        placeholder="Service name"
                        className="min-w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Description (optional)"
                        className="min-w-40"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-20"
                        min="1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-24"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(item.amount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeQuotationItem(index)}
                        disabled={quotationItems.length === 1}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="mt-4 space-y-2 text-right">
              <div className="flex justify-end gap-4">
                <span>Subtotal:</span>
                <span className="font-medium w-24">
                  {formatCurrency(formData.initial_amount || 0)}
                </span>
              </div>
              <div className="flex justify-end gap-4">
                <span>GST (18%):</span>
                <span className="font-medium w-24">
                  {formatCurrency(formData.gst_amount || 0)}
                </span>
              </div>
              <div className="flex justify-end gap-4 text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="w-24">
                  {formatCurrency(formData.total_amount || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Terms and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={formData.terms_and_conditions}
                onChange={(e) => setFormData(prev => ({ ...prev, terms_and_conditions: e.target.value }))}
                placeholder="Enter terms and conditions"
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="sp_notes">Service Provider Notes</Label>
                <Textarea
                  id="sp_notes"
                  value={formData.sp_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, sp_notes: e.target.value }))}
                  placeholder="Notes for service provider"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="admin_notes">Admin Notes</Label>
                <Textarea
                  id="admin_notes"
                  value={formData.admin_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                  placeholder="Internal admin notes"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              onClick={() => handleSubmit('save')}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Draft'}
            </Button>

            <Button
              onClick={() => handleSubmit('send')}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Save & Send'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default B2BQuotationForm;
