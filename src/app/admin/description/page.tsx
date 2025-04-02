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
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, Download, Copy, Printer } from 'lucide-react';
import { fetchServiceDetails, deleteServiceDetail } from '@/lib/api';
import Link from 'next/link';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast";

const ServiceDetailList = () => {
  const [serviceDetails, setServiceDetails] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterStatus(e.target.value);
      };
  const fetchServiceDetailsData = async (page = 1, size = 50, status = "all", search = "") => {
    try {
      const { data, meta } = await fetchServiceDetails(page, size, filterStatus,search);
      setServiceDetails(data);
      setTotalPages(meta.totalPages);
      setTotalItems(meta.totalItems);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error('Error fetching service details:', error);
    }
  };

  
    useEffect(() => {
      fetchServiceDetailsData(pagination.pageIndex + 1, pagination.pageSize, filterStatus, searchTerm);
    }, [pagination.pageIndex,pagination.pageSize,filterStatus,searchTerm]);
  const handleServiceDetailDelete = async (serviceDetailId: number) => {
    try {
      await deleteServiceDetail(serviceDetailId.toString());
      toast({
        title: 'Success',
        description: 'Service detail deleted successfully',
        variant: 'success',
      });
      fetchServiceDetailsData(pagination.pageIndex + 1, pagination.pageSize);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete service detail',
        variant: 'destructive',
      });
    }
  };

 
  const handleCopy = () => {
    const formattedData = serviceDetails.map((item) => `${item.id}, ${item.title}, ${item.status}`).join("\n");
    navigator.clipboard.writeText(formattedData);
    toast({ title: "Copied to Clipboard", description: "Service detail data copied." });
  };

  const serviceDetailColumns: ColumnDef<any>[] = [
    {
      accessorKey: "sno",
      header: "S.No",
      cell: (info) => info.row.index + 1,
    },
    { accessorKey: 'category.name', header: 'Category' },
    { accessorKey: 'subcategory.name', header: 'Subcategory' },
    { accessorKey: 'serviceSegment.segment_name', header: 'Segment' },
    { accessorKey: 'filterAttribute.name', header: 'Filter' },
    { accessorKey: 'filterOption.value', header: 'Option' },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const statusValue = row.original.is_active;
console.log("statusValue",statusValue)
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
          case 2:
            statusLabel = "Deleted";
            statusClass = "bg-red-200 text-red-800";
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
            <Link href={`/admin/description/edit/${row.original.id}`} passHref>
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
                <p>Are you sure you want to delete this service detail?</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="secondary" onClick={() => handleServiceDetailDelete(row.original.id)}>
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

  const serviceDetailTable = useReactTable({
    data: serviceDetails,
    columns: serviceDetailColumns,
    state: { pagination },
    pageCount: totalPages,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="flex justify-between mb-4">
                 <h1 className="text-3xl font-bold text-gray-900">Service Description List</h1>
                 <div className="flex space-x-2">
                          <select value={filterStatus} onChange={handleStatusChange} className="border p-2 rounded">
                            <option value="">All</option>
                            <option value="1">Active</option>
                            <option value="0">Deactivated</option>
                            <option value="2">Deleted</option>
                          </select>
                          
                          
                          <Link href="/admin/description/add">
                            <Button><Plus className="w-4 h-4 mr-2" />Add Description</Button>
                          </Link>
                        </div>
                      </div>
     

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
           <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <CardTitle>Service description list</CardTitle>
                          <div className="relative">
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="border p-2 pl-8 rounded w-64"
                        />
                        <svg
                          className="absolute left-2 top-3 h-4 w-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          ></path>
                        </svg>
                      </div>
                          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                {serviceDetailTable.getHeaderGroups().map((headerGroup) => (
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
                {serviceDetailTable.getRowModel().rows.length ? (
                  serviceDetailTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={serviceDetailColumns.length} className="h-24 text-center">
                      No service details found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              onClick={() => serviceDetailTable.previousPage()}
              disabled={!serviceDetailTable.getCanPreviousPage()}
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
              onClick={() => serviceDetailTable.nextPage()}
              disabled={!serviceDetailTable.getCanNextPage()}
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

export default ServiceDetailList;
