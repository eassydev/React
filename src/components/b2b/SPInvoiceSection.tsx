'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Clock, 
  Check, 
  X, 
  Edit, 
  Eye, 
  FileText,
  AlertCircle 
} from 'lucide-react';

interface SPInvoice {
  id: string;
  invoice_number?: string;
  invoice_amount?: number;
  approval_status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  uploaded_at: string;
  approved_at?: string;
  admin_notes?: string;
  sp_notes?: string;
}

interface SPInvoiceSectionProps {
  booking: {
    id: string;
    sp_invoice_status?: 'not_uploaded' | 'uploaded' | 'approved' | 'rejected' | 'needs_revision';
    workflow_stage?: string;
    spInvoices?: SPInvoice[];
  };
  onViewInvoice?: (invoiceId: string) => void;
}

const SPInvoiceSection: React.FC<SPInvoiceSectionProps> = ({ 
  booking, 
  onViewInvoice 
}) => {
  const { sp_invoice_status, spInvoices } = booking;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      not_uploaded: { 
        label: 'Not Uploaded', 
        variant: 'secondary' as const, 
        icon: Clock,
        color: 'text-gray-600'
      },
      uploaded: { 
        label: 'Pending Review', 
        variant: 'secondary' as const, 
        icon: Clock,
        color: 'text-orange-600'
      },
      pending: { 
        label: 'Pending Review', 
        variant: 'secondary' as const, 
        icon: Clock,
        color: 'text-orange-600'
      },
      approved: { 
        label: 'Approved', 
        variant: 'default' as const, 
        icon: Check,
        color: 'text-green-600'
      },
      rejected: { 
        label: 'Rejected', 
        variant: 'destructive' as const, 
        icon: X,
        color: 'text-red-600'
      },
      needs_revision: { 
        label: 'Needs Revision', 
        variant: 'outline' as const, 
        icon: Edit,
        color: 'text-yellow-600'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_uploaded;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewInvoice = (invoiceId: string) => {
    if (onViewInvoice) {
      onViewInvoice(invoiceId);
    } else {
      // Default behavior: open in new tab
      window.open(`/admin/b2b/sp-invoices?invoice=${invoiceId}`, '_blank');
    }
  };

  if (sp_invoice_status === 'not_uploaded') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Service Provider Invoice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Waiting for SP to upload invoice</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The service provider will upload their invoice after completing the service.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Service Provider Invoice
          </div>
          {sp_invoice_status && getStatusBadge(sp_invoice_status)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {spInvoices && spInvoices.length > 0 ? (
          <div className="space-y-4">
            {spInvoices.map((invoice, index) => (
              <div key={invoice.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" />
                      <p className="font-medium">
                        {invoice.invoice_number || `Invoice #${index + 1}`}
                      </p>
                      {getStatusBadge(invoice.approval_status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>
                        <strong>Amount:</strong> {formatCurrency(invoice.invoice_amount)}
                      </div>
                      <div>
                        <strong>Uploaded:</strong> {formatDate(invoice.uploaded_at)}
                      </div>
                      {invoice.approved_at && (
                        <div>
                          <strong>Approved:</strong> {formatDate(invoice.approved_at)}
                        </div>
                      )}
                    </div>

                    {invoice.sp_notes && (
                      <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                        <p className="font-medium text-blue-900">SP Notes:</p>
                        <p className="text-blue-800">{invoice.sp_notes}</p>
                      </div>
                    )}

                    {invoice.admin_notes && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                        <p className="font-medium text-gray-900">Admin Notes:</p>
                        <p className="text-gray-800">{invoice.admin_notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewInvoice(invoice.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>No invoice data available</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/admin/b2b/sp-invoices', '_blank')}
            >
              <Upload className="w-4 h-4 mr-1" />
              Manage All SP Invoices
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SPInvoiceSection;
