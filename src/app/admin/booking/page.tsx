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
import { fetchBookings, deleteBooking } from '@/lib/api';
import Link from 'next/link';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast";

const BookingList = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [pincode, setPincode] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [serviceDate, setServiceDate] = useState("");

  const [filters, setFilters] = useState({
    today: false,
    yesterday: false,
    initiated: false,
    past: false
  });

  const { toast } = useToast();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: checked }));
  };

  const fetchBookingsData = async () => {
    try {
      const queryFilters = {
        pincode,
        bookingDate,
        serviceDate,
        status: filterStatus,
        search: searchTerm,
        ...filters,
      };
      const { data, meta } = await fetchBookings(
        pagination.pageIndex + 1,
        pagination.pageSize,
        queryFilters
      );
      setBookings(data);
      setTotalPages(meta.totalPages);
      setTotalItems(meta.totalItems);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    fetchBookingsData();
  }, [pagination, filterStatus, searchTerm, pincode, bookingDate, serviceDate, filters]);

  const handleBookingDelete = async (booking: any) => {
    try {
      await deleteBooking(booking.id);
      toast({
        title: 'Success',
        description: `Booking for "${booking.user}" deleted successfully`,
        variant: 'success',
      });
      fetchBookingsData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete booking: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const bookingColumns: ColumnDef<any>[] = [
    {
      accessorKey: "sno",
      header: "S.No",
      cell: (info) => info.row.index + 1,
    },
    { accessorKey: 'booking_date', header: 'Service Date' },
    {
      header: "Category Details",
      accessorFn: (row) => {
        const category = row.rateCard?.category?.name || "N/A";
        const subcategory = row.rateCard?.subcategory?.name || "N/A";
        const attributes = row.rateCard?.attributes?.map((attr: {
          filterAttribute: { name: string };
          filterOption: { value: string };
        }) => `${attr.filterAttribute?.name}: ${attr.filterOption?.value}`).join(", ") || "N/A";
    
        return { category, subcategory, attributes };
      },
      cell: (info) => {
        const value = info.getValue() as {
          category: string;
          subcategory: string;
          attributes: string;
        };
    
        return (
          <div style={{ whiteSpace: 'pre-wrap' }}>
            <p><strong>Category:</strong> {value.category}</p>
            <p><strong>Subcategory:</strong> {value.subcategory}</p>
            <p><strong>Attributes:</strong> {value.attributes}</p>
          </div>
        );
      }
    },
    { accessorKey: 'payment_type', header: 'Payment Method' },
    { accessorKey: 'user.first_name', header: 'User' },
    { accessorKey: 'user.mobile', header: 'Customer Mobile' },
    {
      accessorFn: (row) => row.rateCard?.provider?.first_name || 'N/A',
      header: 'Provider'
    },
    {
      accessorFn: (row) => row.rateCard?.provider?.phone || 'N/A',
      header: 'Provider Mobile'
    },
    { accessorKey: 'status', header: 'Status' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Link href={`/admin/booking/view/${row.original.id}`} passHref>
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
                <p>Are you sure you want to delete this booking?</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="secondary" onClick={() => handleBookingDelete(row.original)}>
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

  const bookingTable = useReactTable({
    data: bookings,
    columns: bookingColumns,
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
          <h1 className="text-2xl font-bold">Bookings List</h1>
          <div className="flex space-x-2">
            <select value={filterStatus} onChange={handleStatusChange} className="border p-2 rounded">
              <option value="">All</option>
              <option value="1">Active</option>
              <option value="0">Deactivated</option>
              <option value="2">Deleted</option>
            </select>
            <Link href="/admin/bookings/add">
              <Button><Plus className="w-4 h-4 mr-2" />Add Booking</Button>
            </Link>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 mb-4">Filter Bookings</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <input
                type="date"
                placeholder="Booking Date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <input
                type="date"
                placeholder="Service Date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <div className="flex flex-col">
                <label><input type="checkbox" name="today" checked={filters.today} onChange={handleCheckboxChange} /> Today Orders</label>
                <label><input type="checkbox" name="yesterday" checked={filters.yesterday} onChange={handleCheckboxChange} /> Yesterday Orders</label>
                <label><input type="checkbox" name="initiated" checked={filters.initiated} onChange={handleCheckboxChange} /> Initiated Orders</label>
                <label><input type="checkbox" name="past" checked={filters.past} onChange={handleCheckboxChange} /> Past Orders</label>
              </div>
            </div>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                {bookingTable.getHeaderGroups().map((headerGroup) => (
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
                {bookingTable.getRowModel().rows.length ? (
                  bookingTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={bookingColumns.length} className="h-24 text-center">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              onClick={() => bookingTable.previousPage()}
              disabled={!bookingTable.getCanPreviousPage()}
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
              onClick={() => bookingTable.nextPage()}
              disabled={!bookingTable.getCanNextPage()}
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

export default BookingList;
