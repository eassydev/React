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
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchSentNotifications } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface SentNotificationItem {
  id: number;
  title: string;
  head: string;
  image: string | null;
  redirect_link: string;
  schedule_date_time: string;
  is_sent: number;
  created_at: string | null;
  updated_at: string | null;
}

interface SentNotificationBatch {
  batch_id: number;
  key: string;
  total: number;
  sent: number;
  percent: number;
  status: string;
  items: SentNotificationItem[];
  next: string | null;
  remaining: number;
}

const SentNotificationList: React.FC = () => {
  const [batches, setBatches] = useState<SentNotificationBatch[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);
  const [expandedBatches, setExpandedBatches] = useState<Set<number>>(new Set());

  const { toast } = useToast();

  const fetchData = async (page = 1, size = 50) => {
    try {
      const response = await fetchSentNotifications(page, size);
      setBatches(response.data?.batches || []);
      setTotalPages(response.data?.meta?.totalPages || 1);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error('Error fetching sent notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch sent notifications',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchData(pagination.pageIndex + 1, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

  const toggleBatchExpand = (batchId: number) => {
    setExpandedBatches((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(batchId)) {
        newSet.delete(batchId);
      } else {
        newSet.add(batchId);
      }
      return newSet;
    });
  };

  const columns: ColumnDef<SentNotificationBatch>[] = [
    {
      accessorKey: 'sno',
      header: 'S.No',
      cell: (info) => info.row.index + 1 + pagination.pageIndex * pagination.pageSize,
    },
    { accessorKey: 'batch_id', header: 'Batch ID' },
    { accessorKey: 'total', header: 'Total' },
    { accessorKey: 'sent', header: 'Sent' },
    {
      accessorKey: 'percent',
      header: 'Progress',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${getValue()}%` }}
            />
          </div>
          <span className="text-sm">{getValue()}%</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue() as string;
        const statusStyles: Record<string, string> = {
          completed: 'bg-green-100 text-green-600',
          pending: 'bg-yellow-100 text-yellow-600',
          failed: 'bg-red-100 text-red-600',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-600'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      id: 'expand',
      header: 'Details',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleBatchExpand(row.original.batch_id)}
        >
          {expandedBatches.has(row.original.batch_id) ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: batches,
    columns,
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
          <h1 className="text-3xl font-bold text-gray-900">Sent Notifications</h1>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xl text-gray-800">Sent Notifications</CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
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
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <React.Fragment key={row.id}>
                      <TableRow>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                      {expandedBatches.has(row.original.batch_id) && row.original.items.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={columns.length} className="bg-gray-50 p-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-700">Notification Items:</h4>
                              <div className="grid gap-3">
                                {row.original.items.map((item) => (
                                  <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200 flex gap-4">
                                    {item.image && (
                                      <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                                    )}
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-900">{item.title}</h5>
                                      <p className="text-sm text-gray-600">{item.head}</p>
                                      {item.redirect_link && (
                                        <a href={item.redirect_link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                          {item.redirect_link}
                                        </a>
                                      )}
                                      <p className="text-xs text-gray-500 mt-1">
                                        Scheduled: {new Date(item.schedule_date_time.replace('Z', '')).toLocaleString('en-IN')}
                                      </p>
                                    </div>
                                    <span className={`px-2 py-1 h-fit rounded-full text-xs font-medium ${item.is_sent === 1 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                      {item.is_sent === 1 ? 'Sent' : 'Pending'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {row.original.remaining > 0 && (
                                <p className="text-sm text-gray-500">+ {row.original.remaining} more items</p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No sent notifications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                Page {pagination.pageIndex + 1} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
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
};

export default SentNotificationList;

