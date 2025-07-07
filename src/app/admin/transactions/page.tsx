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
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { fetchPayoutTransactions, PayoutTransaction } from '@/lib/api';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export default function TransactionsPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<PayoutTransaction[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const fetchTransactionsData = async () => {
    setIsLoading(true);
    try {
      const { data, meta } = await fetchPayoutTransactions(
        pagination.pageIndex + 1,
        pagination.pageSize
      );
      setTransactions(data);
      setTotalPages(meta.totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch transactions.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionsData();
  }, [pagination.pageIndex, pagination.pageSize]);

  const transactionColumns: ColumnDef<PayoutTransaction>[] = [
    {
      accessorKey: 'sno',
      header: 'S.No',
      cell: (info) => info.row.index + 1,
    },
    {
      accessorKey: 'sampleid',
      header: 'Transaction ID',
      cell: (info) => <span className="font-mono text-sm">{info.getValue<number>()}</span>,
    },
    {
      accessorKey: 'provider',
      header: 'Provider Name',
      cell: (info) => {
        const provider = info.getValue<PayoutTransaction['provider']>();
        return provider ? `${provider.first_name} ${provider.last_name}` : 'N/A';
      },
    },
    {
      accessorKey: 'bookingItem',
      header: 'Service Details',
      cell: (info) => {
        const bookingItem = info.getValue<PayoutTransaction['bookingItem']>();
        if (!bookingItem || !bookingItem.rateCard) return 'N/A';

        const rateCard = bookingItem.rateCard;

        return (
          <div className="whitespace-pre-line text-sm">
            <strong>Service:</strong> {rateCard.name}
            <br />
            <strong>Price:</strong> ₹{rateCard.price}
            <br />
            <strong>Category:</strong> {rateCard.category?.name || 'N/A'}
            <br />
            <strong>Subcategory:</strong> {rateCard.subcategory?.name || 'N/A'}
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: (info) => `₹${info.getValue<string>()}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => {
        const status = info.getValue<string>();
        let bgColor = 'bg-gray-100';
        let textColor = 'text-gray-600';

        if (status === 'Success') {
          bgColor = 'bg-green-100';
          textColor = 'text-green-600';
        } else if (status === 'Failed') {
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
      accessorKey: 'razorpay_transfer_id',
      header: 'Razorpay Transfer ID',
      cell: (info) => info.getValue<string>() || 'N/A',
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: (info) => {
        const timestamp = info.getValue<string>();
        if (!timestamp) return 'N/A';

        try {
          return format(new Date(timestamp), 'dd/MM/yyyy HH:mm');
        } catch (error) {
          console.error('Error formatting date:', timestamp, error);
          return 'Invalid Date';
        }
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Link href={`/admin/transactions/${row.original.id}`} passHref>
              <div className="flex items-center">
                <span className="mr-1 text-xs">View</span>
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  const transactionTable = useReactTable({
    data: transactions,
    columns: transactionColumns,
    state: { pagination },
    pageCount: totalPages,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Payout Transactions</h1>
        </div>

        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-800">All Transactions</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading transactions...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  {transactionTable.getHeaderGroups().map((headerGroup) => (
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
                  {transactionTable.getRowModel().rows.length ? (
                    transactionTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={transactionColumns.length} className="h-24 text-center">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-gray-500">
                Showing{' '}
                {transactions.length > 0 ? pagination.pageIndex * pagination.pageSize + 1 : 0} to{' '}
                {Math.min((pagination.pageIndex + 1) * pagination.pageSize, transactions.length)} of{' '}
                {transactions.length} transactions
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
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous Page</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))
                  }
                  disabled={pagination.pageIndex >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next Page</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
