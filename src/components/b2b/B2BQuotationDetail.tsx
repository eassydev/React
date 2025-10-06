'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  Download, 
  Edit, 
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
import { 
  fetchB2BQuotationById, 
  sendB2BQuotation, 
  approveB2BQuotation, 
  rejectB2BQuotation,
  downloadB2BQuotationPDF,
  B2BQuotation
} from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { AdditionalCostsManager } from './AdditionalCostsManager';

interface B2BQuotationDetailProps {
  quotationId: string;
  onEdit?: (quotation: B2BQuotation) => void;
  onClose?: () => void;
}

const B2BQuotationDetail: React.FC<B2BQuotationDetailProps> = ({
  quotationId,
  onEdit,
  onClose
}) => {
  const [quotation, setQuotation] = useState<B2BQuotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [additionalCostsTotal, setAdditionalCostsTotal] = useState(0);

  const fetchQuotationDetail = async () => {
    try {
      setLoading(true);
      const response = await fetchB2BQuotationById(quotationId);
      
      if (response.success) {
        setQuotation(response.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch quotation details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quotationId) {
      fetchQuotationDetail();
    }
  }, [quotationId]);

  const handleSendQuotation = async (sendVia: 'whatsapp' | 'email' | 'both' = 'both') => {
    try {
      setActionLoading(prev => ({ ...prev, send: true }));
      
      const response = await sendB2BQuotation(quotationId, sendVia);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: `Quotation sent successfully via ${sendVia}`,
        });
        fetchQuotationDetail(); // Refresh data
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send quotation',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(prev => ({ ...prev, send: false }));
    }
  };

  const handleApproveQuotation = async () => {
    try {
      setActionLoading(prev => ({ ...prev, approve: true }));
      
      const response = await approveB2BQuotation(quotationId, 'Approved by admin');
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Quotation approved successfully',
        });
        fetchQuotationDetail(); // Refresh data
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve quotation',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(prev => ({ ...prev, approve: false }));
    }
  };

  const handleRejectQuotation = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setActionLoading(prev => ({ ...prev, reject: true }));
      
      const response = await rejectB2BQuotation(quotationId, reason, 'Rejected by admin');
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Quotation rejected successfully',
        });
        fetchQuotationDetail(); // Refresh data
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject quotation',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(prev => ({ ...prev, reject: false }));
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setActionLoading(prev => ({ ...prev, download: true }));
      await downloadB2BQuotationPDF(quotationId);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to download PDF',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(prev => ({ ...prev, download: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      sent: { color: 'bg-blue-100 text-blue-800', label: 'Sent' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      negotiating: { color: 'bg-yellow-100 text-yellow-800', label: 'Negotiating' },
      expired: { color: 'bg-gray-100 text-gray-600', label: 'Expired' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '₹0.00';
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Quotation not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quotation Details
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-lg font-semibold">{quotation.quotation_number}</span>
                {getStatusBadge(quotation.status)}
                <Badge variant="outline">Version {quotation.version || 1}</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              {quotation.status === 'draft' && (
                <Button
                  onClick={() => handleSendQuotation('both')}
                  disabled={actionLoading.send}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {actionLoading.send ? 'Sending...' : 'Send'}
                </Button>
              )}

              {quotation.status === 'sent' && (
                <>
                  <Button
                    onClick={handleApproveQuotation}
                    disabled={actionLoading.approve}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {actionLoading.approve ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button
                    onClick={handleRejectQuotation}
                    disabled={actionLoading.reject}
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {actionLoading.reject ? 'Rejecting...' : 'Reject'}
                  </Button>
                </>
              )}

              <Button
                onClick={handleDownloadPDF}
                disabled={actionLoading.download}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                {actionLoading.download ? 'Downloading...' : 'PDF'}
              </Button>

              <Button
                onClick={() => onEdit?.(quotation)}
                size="sm"
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                {/* Customer info from either booking relationship or direct customer relationship */}
                <p><strong>Company:</strong> {quotation.booking?.customer?.company_name || quotation.customer?.company_name || 'N/A'}</p>
                <p><strong>Contact:</strong> {quotation.booking?.customer?.contact_person || quotation.customer?.contact_person || 'N/A'}</p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {quotation.booking?.customer?.phone || quotation.customer?.phone || 'N/A'}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  {quotation.booking?.customer?.email || quotation.customer?.email || 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Created:</strong> {formatDate(quotation.created_at)}</p>
                <p><strong>Valid Until:</strong> {formatDate(quotation.valid_until)}</p>
                {quotation.sent_at && (
                  <p><strong>Sent:</strong> {formatDate(quotation.sent_at)} via {quotation.sent_via}</p>
                )}
                {quotation.approved_at && (
                  <p><strong>Approved:</strong> {formatDate(quotation.approved_at)}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Quotation Items */}
          <div className="mt-6">
            <h3 className="font-semibold mb-4">Quotation Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotation.quotation_items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.service}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.rate)}</TableCell>
                    <TableCell>{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="mt-4 space-y-2 text-right">
              <div className="flex justify-end gap-4">
                <span>Subtotal:</span>
                <span className="font-medium w-32">
                  {formatCurrency(quotation.final_amount || quotation.initial_amount)}
                </span>
              </div>
              <div className="flex justify-end gap-4">
                <span>GST (18%):</span>
                <span className="font-medium w-32">
                  {formatCurrency(quotation.gst_amount)}
                </span>
              </div>
              <div className="flex justify-end gap-4 text-lg font-bold border-t pt-2">
                <span>Total Amount:</span>
                <span className="w-32">
                  {formatCurrency(quotation.total_amount)}
                </span>
              </div>
              {additionalCostsTotal > 0 && (
                <>
                  <div className="flex justify-end gap-4 text-sm text-orange-600 mt-2">
                    <span>+ Additional Costs:</span>
                    <span className="w-32 font-semibold">
                      {formatCurrency(additionalCostsTotal)}
                    </span>
                  </div>
                  <div className="flex justify-end gap-4 text-xl font-bold border-t-2 pt-2 mt-2 text-green-600">
                    <span>Grand Total:</span>
                    <span className="w-32">
                      {formatCurrency(parseFloat(quotation.total_amount.toString()) + parseFloat(additionalCostsTotal.toString()))}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Terms and Notes */}
          {(quotation.terms_and_conditions || quotation.admin_notes || quotation.sp_notes || quotation.client_notes) && (
            <>
              <Separator className="my-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quotation.terms_and_conditions && (
                  <div>
                    <h3 className="font-semibold mb-2">Terms & Conditions</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {quotation.terms_and_conditions}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {quotation.admin_notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Admin Notes</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {quotation.admin_notes}
                      </p>
                    </div>
                  )}

                  {quotation.sp_notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Service Provider Notes</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {quotation.sp_notes}
                      </p>
                    </div>
                  )}

                  {quotation.client_notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Client Notes</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {quotation.client_notes}
                      </p>
                    </div>
                  )}

                  {quotation.rejection_reason && (
                    <div>
                      <h3 className="font-semibold mb-2 text-red-600">Rejection Reason</h3>
                      <p className="text-sm text-red-600 whitespace-pre-wrap">
                        {quotation.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Additional Costs */}
      <AdditionalCostsManager
        entityId={quotationId}
        entityType="quotation"
        readonly={quotation.status === 'approved' || quotation.status === 'rejected'}
        onTotalChange={(total) => {
          setAdditionalCostsTotal(total);
        }}
      />
    </div>
  );
};

export default B2BQuotationDetail;
