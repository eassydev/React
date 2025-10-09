'use client';

import React, { useState, useEffect } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Edit, Download, Play, Square, CheckCircle, Settings } from 'lucide-react';
import { fetchPayoutsDetailed, singlePaymentAction, fetchUTRs, handleFailedTransactions as handleFailedTransactionsAPI, retryFailedPayout, updatePayoutUTR } from '@/lib/api';
import PaymentControlPanel from '@/components/PaymentControlPanel';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { UTREditDialog } from '@/components/ui/utr-edit-dialog';

interface SpPayout {
  id: string;
  sampleid: number; // Decrypted ID for display
  provider_id: string;
  provider_name: string;
  service_amount: number;
  commission_rate: number;
  commission_amount: number;
  base_tcs: number;
  base_tds: number;
  base_payable: number;
  total_payable: number;
  remaining_amount: number;
  settled_amount: number;
  payout_status: string;
  scheduled_transfer: string;
  allow_transfer: string;
  razorpay_transfer_id: string;
  utr_number: string; // ✅ Added UTR field
  notes: string;
  created_at: number;
  updated_at: number;
  bookingItem: {
    id: number;
    order_id: string;
    rate_card_id: number;
    service_date: string;
    service_time: string;
    status: string;
    rateCard: {
      id: number;
      name: string;
      price: number;
      category_id: number;
      subcategory_id: number;
      category: {
        id: number;
        name: string;
      };
      subcategory: {
        id: number;
        name: string;
      };
      attributes: Array<{
        id: number;
        filter_attribute_id: number;
        filter_option_id: number;
        filterAttribute: {
          id: number;
          name: string;
          title: string;
        };
        filterOption: {
          id: number;
          value: string;
          title: string;
        };
      }>;
    };
  };
}

export default function SpPayoutPage() {
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<SpPayout[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [showControlPanel, setShowControlPanel] = useState(false);

  const fetchPayouts = async () => {
    setIsLoading(true);
    try {
      const response = await fetchPayoutsDetailed(pagination.pageIndex + 1, pagination.pageSize);
      setPayouts(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast({
        variant: 'error',
        title: 'Error',
        description: 'Failed to fetch payout details.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [pagination, toast]);

  const handleSinglePaymentAction = async (action: string, paymentId: string) => {
    const actionMessages = {
      stop: 'stop',
      allow: 'allow',
      'mark-paid': 'mark as paid'
    };

    const confirmMessage = `Are you sure you want to ${actionMessages[action as keyof typeof actionMessages]} this payment?`;
    if (!confirm(confirmMessage)) return;

    try {
      const result = await singlePaymentAction(action, paymentId);

      toast({
        title: 'Success',
        description: result.message,
      });

      // Refresh the payouts list
      fetchPayouts();

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Action failed.',
      });
    }
  };

  const handleSelectPayment = (paymentId: string, checked: boolean) => {
    const newSelected = new Set(selectedPayments);
    if (checked) {
      newSelected.add(paymentId);
    } else {
      newSelected.delete(paymentId);
    }
    setSelectedPayments(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = payouts.map(payout => payout.id);
      setSelectedPayments(new Set(allIds));
    } else {
      setSelectedPayments(new Set());
    }
  };

  const refreshPayouts = () => {
    fetchPayouts();
    setSelectedPayments(new Set());
  };

  const handleFetchUTRs = async () => {
    try {
      setIsLoading(true);

      const result = await fetchUTRs(50, false);

      if (result.success) {
        toast({
          title: "Success",
          description: `UTR fetch completed. Found ${result.data.utrs_found} UTRs, updated ${result.data.utrs_updated} records.`,
        });

        // Refresh the payouts to show updated UTRs
        fetchPayouts();
      } else {
        throw new Error(result.error || 'Failed to fetch UTRs');
      }

    } catch (error) {
      console.error('Error fetching UTRs:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch UTRs from Razorpay",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFailedTransactions = async () => {
    try {
      setIsLoading(true);

      const result = await handleFailedTransactionsAPI(50, false);

      if (result.success) {
        toast({
          title: "Success",
          description: `Failed transaction detection completed. Found ${result.data.failed_found} failed payouts, marked ${result.data.permanently_failed} as failed (manual retry required).`,
        });

        // Refresh the payouts to show updated statuses
        fetchPayouts();
      } else {
        throw new Error(result.error || 'Failed to handle failed transactions');
      }

    } catch (error) {
      console.error('Error handling failed transactions:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to handle failed transactions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const handleExport = async () => {
  //   try {
  //     await exportPayoutsToExcel();
  //     toast({
  //       title: "Success",
  //       description: "Payouts exported successfully.",
  //     });
  //   } catch (error) {
  //     console.error("Error exporting payouts:", error);
  //     toast({
  //       variant: "error",
  //       title: "Error",
  //       description: "Failed to export payouts.",
  //     });
  //   }
  // };

  const payoutColumns: ColumnDef<SpPayout>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="rounded border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedPayments.has(row.original.id)}
          onChange={(e) => handleSelectPayment(row.original.id, e.target.checked)}
          className="rounded border-gray-300"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'sno',
      header: 'S.No',
      cell: (info) => info.row.index + 1,
    },
    {
      accessorKey: 'sampleid',
      header: 'Payout ID',
      cell: (info) => <span className="font-mono text-sm">{info.getValue<number>()}</span>,
    },
    {
      accessorKey: 'provider_name',
      header: 'Provider Name',
    },
    {
      header: 'Services',
      cell: ({ row }) => {
        const payout = row.original;
        const rateCard = payout.bookingItem?.rateCard;

        if (!rateCard) return 'N/A';

        const attributes =
          rateCard.attributes
            ?.map((attr) => {
              const attrName =
                attr.filterAttribute?.title || attr.filterAttribute?.name || 'Unknown';
              const attrValue = attr.filterOption?.title || attr.filterOption?.value || 'N/A';
              return `${attrName}: ${attrValue}`;
            })
            .join('\n') || 'None';

        return (
          <div className="whitespace-pre-line text-sm">
            <strong>Service:</strong> {rateCard.name}
            <br />
            <strong>Price:</strong> ₹{rateCard.price}
            <br />
            <strong>Category:</strong> {rateCard.category?.name || 'N/A'}
            <br />
            <strong>Subcategory:</strong> {rateCard.subcategory?.name || 'N/A'}
            <br />
            <strong>Attributes:</strong>
            <br />
            {attributes}
          </div>
        );
      },
    },
    {
      accessorKey: 'service_amount',
      header: 'Service Amount',
      cell: (info) => `₹${info.getValue<number>()}`,
    },
    {
      accessorKey: 'commission_rate',
      header: 'Commission Rate',
      cell: (info) => `${info.getValue<number>()}%`,
    },
    {
      accessorKey: 'commission_amount',
      header: 'Commission Amount',
      cell: (info) => `₹${info.getValue<number>()}`,
    },
    {
      accessorKey: 'base_tcs',
      header: 'TCS',
      cell: (info) => `₹${info.getValue<number>()}`,
    },
    {
      accessorKey: 'base_tds',
      header: 'TDS',
      cell: (info) => `₹${info.getValue<number>()}`,
    },
    {
      accessorKey: 'base_payable',
      header: 'Base Payable',
      cell: (info) => `₹${info.getValue<number>()}`,
    },
    {
      accessorKey: 'total_payable',
      header: 'Total Payable',
      cell: (info) => `₹${info.getValue<number>()}`,
    },
    {
      accessorKey: 'remaining_amount',
      header: 'Remaining Amount',
      cell: (info) => `₹${info.getValue<number>()}`,
    },
    {
      accessorKey: 'settled_amount',
      header: 'Settled Amount',
      cell: (info) => `₹${info.getValue<number>()}`,
    },
    {
      accessorKey: 'payout_status',
      header: 'Status',
      cell: (info) => {
        const status = info.getValue<string>();
        let bgColor = 'bg-gray-100';
        let textColor = 'text-gray-600';

        if (status === 'Paid') {
          bgColor = 'bg-green-100';
          textColor = 'text-green-600';
        } else if (status === 'Partially Paid') {
          bgColor = 'bg-yellow-100';
          textColor = 'text-yellow-600';
        } else if (status === 'Not Initiated') {
          bgColor = 'bg-red-100';
          textColor = 'text-red-600';
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'scheduled_transfer',
      header: 'Scheduled Transfer',
      cell: (info) => {
        const date = info.getValue<string>();
        if (!date) return 'N/A';

        try {
          return format(new Date(date), 'dd/MM/yyyy');
        } catch (error) {
          console.error('Error formatting scheduled transfer date:', date, error);
          return 'Invalid Date';
        }
      },
    },
    {
      accessorKey: 'allow_transfer',
      header: 'Allow Transfer',
      cell: (info) => info.getValue<string>(),
    },
    {
      accessorKey: 'razorpay_transfer_id',
      header: 'Razorpay Transfer ID',
      cell: (info) => info.getValue<string>() || 'N/A',
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: (info) => info.getValue<string>() || 'N/A',
    },
    {
      accessorKey: 'utr_number',
      header: 'UTR Number',
      cell: ({ row }) => {
        const utr = row.original.utr_number;
        const isPaid = row.original.payout_status === 'Paid';
        const hasTransferId = row.original.razorpay_transfer_id;
        const payoutId = row.original.id;

        const handleUTRUpdate = (updatedPayoutId: string, newUTR: string) => {
          // Update the local state to reflect the change
          setPayouts(prevPayouts =>
            prevPayouts.map(payout =>
              payout.id === updatedPayoutId
                ? { ...payout, utr_number: newUTR }
                : payout
            )
          );
        };

        if (utr) {
          return (
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm bg-green-50 text-green-700 px-2 py-1 rounded">
                {utr}
              </span>
              <span className="text-xs text-gray-400" title="UTR cannot be edited once set">
                🔒
              </span>
            </div>
          );
        } else if (isPaid && hasTransferId) {
          return (
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600 text-xs bg-yellow-50 px-2 py-1 rounded">
                Pending
              </span>
              <UTREditDialog
                payoutId={payoutId}
                currentUTR=""
                onUTRUpdate={handleUTRUpdate}
              />
            </div>
          );
        } else {
          return (
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-xs">
                N/A
              </span>
              {isPaid && (
                <UTREditDialog
                  payoutId={payoutId}
                  currentUTR=""
                  onUTRUpdate={handleUTRUpdate}
                />
              )}
            </div>
          );
        }
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: (info) => {
        const timestamp = info.getValue<number | string>();
        if (!timestamp) return 'N/A';

        try {
          // Check if timestamp is a valid number
          if (typeof timestamp === 'number') {
            // Check if timestamp is in seconds (Unix timestamp) or milliseconds
            // Unix timestamps are typically 10 digits (seconds since epoch)
            const date =
              timestamp < 10000000000
                ? new Date(timestamp * 1000) // Convert seconds to milliseconds
                : new Date(timestamp); // Already in milliseconds

            return format(date, 'dd/MM/yyyy HH:mm');
          } else if (typeof timestamp === 'string') {
            // Handle string timestamps
            return format(new Date(timestamp), 'dd/MM/yyyy HH:mm');
          }
          return 'N/A';
        } catch (error) {
          console.error('Error formatting date:', timestamp, error);
          return 'Invalid Date';
        }
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const payout = row.original;
        const isPaid = payout.payout_status === 'Paid';
        const isFailed = payout.payout_status === 'Failed';

        const handleRetryPayout = async () => {
          try {
            const result = await retryFailedPayout(payout.id);

            if (result.success) {
              toast({
                title: "Success",
                description: `Payout retry initiated for ${result.data.provider_name}`,
              });
              fetchPayouts(); // Refresh the list
            } else {
              throw new Error(result.error || 'Failed to retry payout');
            }
          } catch (error) {
            toast({
              title: "Error",
              description: error instanceof Error ? error.message : "Failed to retry payout",
              variant: "destructive",
            });
          }
        };

        return (
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm">
              <Link href={`/admin/sp-payout/edit/${payout.id}`} passHref>
                {isPaid ? (
                  <div className="flex items-center">
                    <span className="mr-1 text-xs">View</span>
                    <Edit className="w-3 h-3 text-gray-600" />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="mr-1 text-xs">Edit</span>
                    <Edit className="w-3 h-3 text-blue-600" />
                  </div>
                )}
              </Link>
            </Button>

            {isFailed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetryPayout}
                className="text-green-600 hover:text-green-700"
                title="Retry Failed Transfer"
              >
                <Play className="w-3 h-3" />
              </Button>
            )}

            {!isPaid && (
              <>
                {payout.allow_transfer === 'yes' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSinglePaymentAction('stop', payout.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Stop Payment"
                  >
                    <Square className="w-3 h-3" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSinglePaymentAction('allow', payout.id)}
                    className="text-green-600 hover:text-green-700"
                    title="Allow Payment"
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSinglePaymentAction('mark-paid', payout.id)}
                  className="text-blue-600 hover:text-blue-700"
                  title="Mark as Paid"
                >
                  <CheckCircle className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const payoutTable = useReactTable({
    data: payouts,
    columns: payoutColumns,
    state: { pagination },
    pageCount: totalPages,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">SP Payout Details</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleFetchUTRs}
              className="flex items-center space-x-2 text-blue-600 border-blue-200 hover:bg-blue-50"
              disabled={isLoading}
            >
              <Download className="w-4 h-4" />
              <span>Fetch UTRs</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleFailedTransactions}
              className="flex items-center space-x-2 text-orange-600 border-orange-200 hover:bg-orange-50"
              disabled={isLoading}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Handle Failed</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowControlPanel(!showControlPanel)}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>{showControlPanel ? 'Hide' : 'Show'} Payment Control</span>
            </Button>
            {/* <Button onClick={handleExport} className="flex items-center space-x-2">
              <Download className="w-4 h-4 mr-1" />
              <span>Export</span>
            </Button> */}
          </div>
        </div>

        {showControlPanel && (
          <PaymentControlPanel onRefresh={refreshPayouts} />
        )}

        {selectedPayments.size > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  {selectedPayments.size} payment(s) selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      const selectedIds = Array.from(selectedPayments);
                      selectedIds.forEach(id => handleSinglePaymentAction('stop', id));
                    }}
                  >
                    <Square className="w-3 h-3 mr-1" />
                    Stop Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      const selectedIds = Array.from(selectedPayments);
                      selectedIds.forEach(id => handleSinglePaymentAction('allow', id));
                    }}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Allow Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPayments(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-800">All Payouts</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading payouts...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  {payoutTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="text-left">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {payoutTable.getRowModel().rows.length ? (
                    payoutTable.getRowModel().rows.map((row) => {
                      const payout = row.original;
                      const isPaid = payout.payout_status === 'Paid';
                      const isBlocked = payout.allow_transfer === 'no';
                      const isSelected = selectedPayments.has(payout.id);

                      let rowClassName = '';
                      if (isSelected) {
                        rowClassName = 'bg-blue-50 border-l-4 border-blue-400';
                      } else if (isPaid) {
                        rowClassName = 'bg-green-50';
                      } else if (isBlocked) {
                        rowClassName = 'bg-red-50';
                      } else {
                        rowClassName = 'bg-blue-50';
                      }

                      return (
                        <TableRow key={row.id} className={rowClassName}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={payoutColumns.length} className="h-24 text-center">
                        No payouts found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {pagination.pageIndex + 1} of {totalPages || 1}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))
                  }
                  disabled={pagination.pageIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))
                  }
                  disabled={pagination.pageIndex + 1 >= totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
