'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Send, CheckCircle, XCircle, FileText, Search, Filter } from 'lucide-react';
import { fetchB2BQuotations, sendB2BQuotation, approveB2BQuotation, rejectB2BQuotation, B2BQuotation } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface B2BQuotationListProps {
  orderId?: string; // Optional: if showing quotations for specific order
  onViewQuotation?: (quotation: B2BQuotation) => void;
  onEditQuotation?: (quotation: B2BQuotation) => void;
}

const B2BQuotationList: React.FC<B2BQuotationListProps> = ({
  orderId,
  onViewQuotation,
  onEditQuotation
}) => {
  const [quotations, setQuotations] = useState<B2BQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Loading states for actions
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        b2b_booking_id: orderId || undefined
      };

      const response = await fetchB2BQuotations(params);
      
      if (response.success) {
        setQuotations(response.data || []);
        setTotalPages(response.pagination?.total_pages || 1);
        setTotalRecords(response.pagination?.total_records || 0);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch quotations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [currentPage, statusFilter, sortBy, sortOrder]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchQuotations();
  };

  const handleSendQuotation = async (quotationId: string, sendVia: 'whatsapp' | 'email' | 'both' = 'both') => {
    try {
      setActionLoading(prev => ({ ...prev, [`send_${quotationId}`]: true }));
      
      const response = await sendB2BQuotation(quotationId, sendVia);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: `Quotation sent successfully via ${sendVia}`,
        });
        fetchQuotations(); // Refresh list
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send quotation',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`send_${quotationId}`]: false }));
    }
  };

  const handleApproveQuotation = async (quotationId: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [`approve_${quotationId}`]: true }));
      
      const response = await approveB2BQuotation(quotationId, 'Approved by admin');
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Quotation approved successfully',
        });
        fetchQuotations(); // Refresh list
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve quotation',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`approve_${quotationId}`]: false }));
    }
  };

  const handleRejectQuotation = async (quotationId: string, reason: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [`reject_${quotationId}`]: true }));
      
      const response = await rejectB2BQuotation(quotationId, reason, 'Rejected by admin');
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Quotation rejected successfully',
        });
        fetchQuotations(); // Refresh list
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject quotation',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`reject_${quotationId}`]: false }));
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
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {orderId ? 'Order Quotations' : 'B2B Quotations'}
            <Badge variant="outline">{totalRecords}</Badge>
          </CardTitle>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search quotations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-64"
            />
            <Button onClick={handleSearch} size="sm">
              Search
            </Button>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="negotiating">Negotiating</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Created Date</SelectItem>
              <SelectItem value="quotation_number">Quote Number</SelectItem>
              <SelectItem value="final_amount">Amount</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(value: 'ASC' | 'DESC') => setSortOrder(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESC">Newest</SelectItem>
              <SelectItem value="ASC">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : quotations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No quotations found</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">
                      {quotation.quotation_number}
                    </TableCell>
                    <TableCell>
                      {/* @ts-ignore - booking relationship */}
                      {quotation.booking?.customer?.company_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {formatCurrency(quotation.final_amount || quotation.initial_amount)}
                        </div>
                        {quotation.gst_amount && (
                          <div className="text-sm text-gray-500">
                            + GST: {formatCurrency(quotation.gst_amount)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(quotation.status)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">v{quotation.version || 1}</Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(quotation.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewQuotation?.(quotation)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {quotation.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendQuotation(quotation.id!, 'both')}
                            disabled={actionLoading[`send_${quotation.id}`]}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}

                        {quotation.status === 'sent' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => handleApproveQuotation(quotation.id!)}
                              disabled={actionLoading[`approve_${quotation.id}`]}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() => handleRejectQuotation(quotation.id!, 'Rejected by admin')}
                              disabled={actionLoading[`reject_${quotation.id}`]}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalRecords)} of {totalRecords} quotations
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default B2BQuotationList;
