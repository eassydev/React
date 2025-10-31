'use client';

import React, { useState } from 'react';
import { Download, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { exportB2BOrders } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface B2BOrdersExportDialogProps {
  currentFilters?: {
    status?: string;
    payment_status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  };
}

export default function B2BOrdersExportDialog({ currentFilters }: B2BOrdersExportDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Export filters - initialize with current page filters
  const [dateFrom, setDateFrom] = useState(currentFilters?.date_from || '');
  const [dateTo, setDateTo] = useState(currentFilters?.date_to || '');
  const [status, setStatus] = useState(currentFilters?.status || 'all');
  const [paymentStatus, setPaymentStatus] = useState(currentFilters?.payment_status || 'all');
  const [invoiceStatus, setInvoiceStatus] = useState('all');
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');

  // Update filters when dialog opens and current filters change
  React.useEffect(() => {
    if (open) {
      setDateFrom(currentFilters?.date_from || '');
      setDateTo(currentFilters?.date_to || '');
      setStatus(currentFilters?.status || 'all');
      setPaymentStatus(currentFilters?.payment_status || 'all');
    }
  }, [open, currentFilters]);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Build filters object
      const filters: any = { format };

      // Add date filters
      if (dateFrom) filters.date_from = dateFrom;
      if (dateTo) filters.date_to = dateTo;

      // Add status filters
      if (status && status !== 'all') filters.status = status;
      if (paymentStatus && paymentStatus !== 'all') filters.payment_status = paymentStatus;
      if (invoiceStatus && invoiceStatus !== 'all') filters.invoice_status = invoiceStatus;

      console.log('📊 Exporting with filters:', filters);

      await exportB2BOrders(filters);

      toast({
        title: "Success",
        description: `Orders exported successfully as ${format.toUpperCase()}`,
      });

      // Close dialog after successful export
      setOpen(false);
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export orders",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setStatus('all');
    setPaymentStatus('all');
    setInvoiceStatus('all');
    setFormat('xlsx');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Orders
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Export B2B Orders
          </DialogTitle>
          <DialogDescription>
            Select filters and format to export orders. All 75+ columns will be included in the export.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range (Service Date)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="date_from" className="text-xs text-muted-foreground">From</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="Start date"
                />
              </div>
              <div>
                <Label htmlFor="date_to" className="text-xs text-muted-foreground">To</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="End date"
                />
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Order Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status */}
          <div className="space-y-2">
            <Label htmlFor="payment_status">Payment Status</Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger id="payment_status">
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoice Status */}
          <div className="space-y-2">
            <Label htmlFor="invoice_status">Invoice Status</Label>
            <Select value={invoiceStatus} onValueChange={setInvoiceStatus}>
              <SelectTrigger id="invoice_status">
                <SelectValue placeholder="Select invoice status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Invoice Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Format */}
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={format} onValueChange={(value: 'xlsx' | 'csv') => setFormat(value)}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
            <p className="font-medium text-blue-900 mb-1">Export includes:</p>
            <ul className="text-blue-700 space-y-1 text-xs">
              <li>• Order, Customer, SPOC, Service details</li>
              <li>• Provider, Pricing, Payment information</li>
              <li>• Invoice, Quotation, SP Invoice details</li>
              <li>• Remarks, Notes, and Timestamps</li>
              <li>• <strong>75+ columns</strong> for complete 360° view</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isExporting}>
            Reset Filters
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : `Export as ${format.toUpperCase()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

