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
import { ChevronLeft, ChevronRight, Trash2, Undo } from 'lucide-react';
import { fetchScheduledNotifications, deleteScheduledNotification } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface ScheduledNotification {
  id: number;
  batch_id: number;
  title: string;
  head: string;
  image: string | null;
  redirect_link: string;
  schedule_date_time: string;
  is_sent: number;
  is_delete: number;
  created_at: string | null;
  updated_at: string | null;
}

const ScheduledNotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);

  const { toast } = useToast();

  const fetchData = async (page = 1, size = 50) => {
    try {
      const { data, meta } = await fetchScheduledNotifications(page, size);
      setNotifications(data);
      setTotalPages(meta?.totalPages || 1);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error('Error fetching scheduled notifications:', error);
    }
  };

  useEffect(() => {
    fetchData(pagination.pageIndex + 1, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleDelete = async (batchId: number, title: string,is_delete: number) => {
    try {
      await deleteScheduledNotification(batchId,is_delete);
      toast({
        title: 'Success',
        description: `Scheduled notification "${title}" deleted successfully`,
        variant: 'success',
      });
      fetchData(pagination.pageIndex + 1, pagination.pageSize);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete scheduled notification: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<ScheduledNotification>[] = [
    {
      accessorKey: 'sno',
      header: 'S.No',
      cell: (info) => info.row.index + 1 + pagination.pageIndex * pagination.pageSize,
    },
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'head', header: 'Head' },
    { accessorKey: 'redirect_link', header: 'Redirect Link' },
    {
      accessorKey: 'schedule_date_time',
      header: 'Scheduled At',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        if (!value) return '-';
        // Parse without timezone conversion (treat as local time)
        const date = new Date(value.replace('Z', ''));
        return date.toLocaleString('en-IN');
      },
    },
    {
      accessorKey: 'is_sent',
      header: 'Status',
      cell: ({ getValue }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            getValue() === 1 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
          }`}
        >
          {getValue() === 1 ? 'Sent' : 'Pending'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.is_delete === 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <h2 className="text-xl font-bold">Confirm Delete</h2>
                  <p>Are you sure you want to delete scheduled notification: {row.original.title}?</p>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(row.original.batch_id, row.original.title, 1)}
                  >
                    Yes, Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {row.original.is_delete === 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Undo className="w-4 h-4 text-yellow-600" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <h2 className="text-xl font-bold">Confirm Undo</h2>
                  <p>Are you sure you want to undo scheduled notification: {row.original.title}?</p>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(row.original.batch_id, row.original.title, 0)}
                  >
                    Yes, Undo
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: notifications,
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
          <h1 className="text-3xl font-bold text-gray-900">Scheduled Notifications</h1>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xl text-gray-800">Scheduled Notifications</CardTitle>
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
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No scheduled notifications found.
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

export default ScheduledNotificationList;
