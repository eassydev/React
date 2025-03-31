"use client";

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
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import { fetchServiceSegmentsAll, deleteServiceSegment } from '@/lib/api'; // Import segment API functions
import Link from 'next/link';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast";

const ServiceSegmentList = () => {
  const [serviceSegments, setServiceSegments] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();

  const fetchServiceSegmentsData = async (page = 1, size = 50) => {
    try {
      const { data, meta } = await fetchServiceSegmentsAll(page, size); // Call fetchServiceSegments
      setServiceSegments(data);
      setTotalPages(meta.totalPages);
      setTotalItems(meta.totalItems);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error('Error fetching service segments:', error);
    }
  };

  useEffect(() => {
    fetchServiceSegmentsData(pagination.pageIndex + 1, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleServiceSegmentDelete = async (serviceSegmentId: string) => { // ID is a string
    try {
      await deleteServiceSegment(serviceSegmentId); // Call deleteServiceSegment
      toast({
        title: 'Success',
        description: 'Service segment deleted successfully',
        variant: 'success',
      });
      fetchServiceSegmentsData(pagination.pageIndex + 1, pagination.pageSize);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete service segment',
        variant: 'destructive',
      });
    }
  };


  const serviceSegmentColumns: ColumnDef<any>[] = [
    {
      accessorKey: "sno",
      header: "S.No",
      cell: (info) => info.row.index + 1,
    },
    { accessorKey: 'segment_name', header: 'Segment Name' },
    { accessorKey: 'category.name', header: 'Category' },
    { accessorKey: 'subcategory.name', header: 'Subcategory' },
    { accessorKey: 'filterAttribute.name', header: 'Attribute' },

    {
      accessorKey: "is_active", // Correct accessor key
      header: "Status",
      cell: ({ row }) => {
        const statusValue = row.original.is_active; // Access is_active

        let statusLabel = "";
        let statusClass = "";

        switch (statusValue) {
          case 1:
            statusLabel = "Active";
            statusClass = "bg-green-200 text-green-800";
            break;
          case 0:
            statusLabel = "Inactive";
            statusClass = "bg-yellow-200 text-yellow-800";
            break;
          default:
            statusLabel = "Unknown";
            statusClass = "bg-gray-200 text-gray-800";
            break;
        }

        return <span className={`badge px-2 py-1 rounded ${statusClass}`}>{statusLabel}</span>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Link href={`/admin/segment/edit/${row.original.id}`} passHref> {/* Correct link */}
              <Edit className="w-4 h-4 text-blue-600" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <h2 className="text-xl font-bold">Confirm Delete</h2>
                <p>Are you sure you want to delete this service segment?</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="secondary" onClick={() => handleServiceSegmentDelete(row.original.id)}> {/* Pass ID */}
                  Yes, Delete
                </Button>
                <Button variant="outline">Cancel</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  const serviceSegmentTable = useReactTable({
    data: serviceSegments,
    columns: serviceSegmentColumns,
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
          <h1 className="text-3xl font-bold text-gray-900">Service Segment List</h1>
          <Button asChild variant="default" className="flex items-center space-x-2">
            <Link href="/admin/segment/add"> {/* Correct link */}
              <Plus className="w-4 h-4 mr-1" />
              <span>Add Segment</span>
            </Link>
          </Button>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xl text-gray-800">Service Segments</CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                {serviceSegmentTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-left">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {serviceSegmentTable.getRowModel().rows.length ? (
                  serviceSegmentTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={serviceSegmentColumns.length} className="h-24 text-center">
                      No service segments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              onClick={() => serviceSegmentTable.previousPage()}
              disabled={!serviceSegmentTable.getCanPreviousPage()}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <span className="text-gray-600">
              Page {pagination.pageIndex + 1} of {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() => serviceSegmentTable.nextPage()}
                disabled={!serviceSegmentTable.getCanNextPage()}
              className="flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ServiceSegmentList;