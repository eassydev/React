'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, Download } from 'lucide-react';
import { fetchBookings, deleteBooking, exportBookings } from '@/lib/api';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const BookingList = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pincode, setPincode] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [serviceDate, setServiceDate] = useState('');

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [filters, setFilters] = useState({
    today: false,
    tomorrow: false,
    yesterday: false,
    initiated: false,
    past: false,
  });

  const { toast } = useToast();
  const datePickerRef = useRef<HTMLDivElement>(null);

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
        serviceDate,
        status: filterStatus,
        search: searchTerm,
        ...filters,
        startDate: dateRange[0].startDate?.toISOString().split('T')[0] || '',
        endDate: dateRange[0].endDate?.toISOString().split('T')[0] || '',
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

  const handleExport = async () => {
    try {
      setIsExporting(true);

      if (!dateRange[0].startDate || !dateRange[0].endDate) {
        toast({
          title: 'Error',
          description: 'Please select a date range before exporting',
          variant: 'destructive',
        });
        return;
      }

      const startDate = dateRange[0].startDate.toISOString().split('T')[0];
      const endDate = dateRange[0].endDate.toISOString().split('T')[0];

      await exportBookings(startDate, endDate);

      toast({
        title: 'Success',
        description: 'Bookings exported successfully',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error exporting bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to export bookings',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatDateRange = () => {
    if (!dateRange[0].startDate || !dateRange[0].endDate) {
      return 'Select date range';
    }
    return `${dateRange[0].startDate?.toLocaleDateString()} - ${dateRange[0].endDate?.toLocaleDateString()}`;
  };

  useEffect(() => {
    fetchBookingsData();
  }, [pagination, filterStatus, searchTerm, pincode, serviceDate, filters, dateRange]);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

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
    {
      accessorKey: 'sampleid',
      header: 'ID',
    },
    {
      accessorKey: 'booking_date',
      header: 'Service Date',
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <span>
            {booking.booking_date} {booking.booking_time_from}-{booking.booking_time_to}
          </span>
        );
      },
    },
    {
      header: 'Category Details',
      accessorFn: (row) => {
        const category = row.rateCard?.category?.name || 'N/A';
        const subcategory = row.rateCard?.subcategory?.name || 'N/A';
        const attributes =
          row.rateCard?.attributes
            ?.map(
              (attr: { filterAttribute: { name: string }; filterOption: { value: string } }) =>
                `${attr.filterAttribute?.name}: ${attr.filterOption?.value}`
            )
            .join(', ') || 'N/A';

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
            <p>
              <strong>Category:</strong> {value.category}
            </p>
            <p>
              <strong>Subcategory:</strong> {value.subcategory}
            </p>
            <p>
              <strong>Attributes:</strong> {value.attributes}
            </p>
          </div>
        );
      },
    },
    { accessorKey: 'user.first_name', header: 'User' },
    { accessorKey: 'user.mobile', header: 'Customer Mobile' },
    {
      accessorFn: (row) => {
        const provider = row.provider;
        return provider ? `${provider.first_name} ${provider.last_name || ''}`.trim() : 'N/A';
      },
      header: 'Provider',
    },
    {
      accessorFn: (row) => row.provider?.phone || 'N/A',
      header: 'Provider Mobile',
    },
    {
      accessorKey: 'is_partial',
      header: 'Partial',
      cell: (info) => {
        const row = info.row.original;
        const isPartial = row.is_partial;
        const hasPartialIds = row.partial_transaction_id && row.razorpay_partial_order_id;

        let statusText = '';
        let statusClass = '';

        if (hasPartialIds) {
          statusText = 'Yes';
          statusClass = 'bg-green-100 text-green-600';
        } else {
          statusText = 'No';
          statusClass = 'bg-red-100 text-red-600';
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
            {statusText}
          </span>
        );
      },
    },

    {
      accessorFn: (row) => row.razorpay_partial_order_id || 'N/A',
      header: 'Partial order id ',
    },
    {
      accessorFn: (row) => row.partial_transaction_id || 'N/A',
      header: 'Partial Transection id ',
    },
    {
      accessorKey: 'is full',
      header: 'Is Full',
      cell: (info) => {
        const row = info.row.original;
        const hasFull = row.transaction_id;

        let statusText = '';
        let statusClass = '';

        if (hasFull) {
          statusText = 'Yes';
          statusClass = 'bg-green-100 text-green-600';
        } else {
          statusText = 'No';
          statusClass = 'bg-red-100 text-red-600';
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
            {statusText}
          </span>
        );
      },
    },
    {
      accessorFn: (row) => row.transaction_id || 'N/A',
      header: 'Transection id ',
    },
    {
      accessorFn: (row) => row.start_service_otp || 'N/A',
      header: 'Start otp ',
    },
    {
      accessorFn: (row) => row.end_service_otp || 'N/A',
      header: 'End Otp',
    },
    {
      header: 'Booking date and Time',
      cell: ({ row }) => {
        const booking = row.original;
        // Convert Unix timestamp to readable date and time
        const createdDate = booking.created_at
          ? new Date(booking.created_at * 1000).toLocaleDateString()
          : 'N/A';
        const createdTime = booking.created_at
          ? new Date(booking.created_at * 1000).toLocaleTimeString()
          : '';

        return (
          <span>
            {createdDate} {createdTime}
          </span>
        );
      },
    },
    {
      header: 'Basic Amount',
      cell: (info) => {
        const row = info.row.original;
        return <span>₹ {row.total_amount}</span>;
      },
    },
    {
      header: 'GST Amount',
      cell: (info) => {
        const row = info.row.original;
        return <span>₹ {row.total_gst}</span>;
      },
    },
    {
      header: 'Final Amount',
      cell: (info) => {
        const row = info.row.original;
        return <span>₹ {row.final_amount}</span>;
      },
    },
    {
      header: 'Address',
      cell: (info) => {
        const row = info.row.original;
        const address = row.address;

        return (
          <span>
            {address?.flat_no},{address?.building_name},{address?.street_address},{address?.city},
            {address?.state},{address?.country} - {address?.postal_code}
          </span>
        );
      },
    },

    { accessorKey: 'payment_status', header: 'Payment Status' },
    { accessorKey: 'status', header: 'Status' },
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
            <select
              value={filterStatus}
              onChange={handleStatusChange}
              className="border p-2 rounded"
            >
              <option value="">All</option>
              <option value="1">Active</option>
              <option value="0">Deactivated</option>
              <option value="2">Deleted</option>
            </select>
            <div className="relative" ref={datePickerRef}>
              <input
                type="text"
                placeholder="Date Range"
                value={formatDateRange()}
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="border p-2 rounded w-full cursor-pointer"
                readOnly
              />
              {showDatePicker && (
                <div className="absolute z-50 mt-1 bg-white shadow-lg border rounded-lg right-0">
                  <DateRange
                    editableDateInputs={true}
                    onChange={(item: any) => {
                      setDateRange([item.selection]);
                      if (item.selection.startDate && item.selection.endDate) {
                        setShowDatePicker(false);
                      }
                    }}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                  />
                </div>
              )}
            </div>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <span className="flex items-center">
                  <span className="loader mr-2"></span> Exporting...
                </span>
              ) : (
                <span className="flex items-center">
                  <Download className="w-4 h-4 mr-2" /> Export
                </span>
              )}
            </Button>
            <Link href="/admin/booking/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Booking
              </Button>
            </Link>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 mb-4">Filter Bookings</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search ...."
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
                <label>
                  <input
                    type="checkbox"
                    name="today"
                    checked={filters.today}
                    onChange={handleCheckboxChange}
                  />{' '}
                  Today Orders
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="tomorrow"
                    checked={filters.tomorrow}
                    onChange={handleCheckboxChange}
                  />{' '}
                  Tomorrow Orders
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="yesterday"
                    checked={filters.yesterday}
                    onChange={handleCheckboxChange}
                  />{' '}
                  Yesterday Orders
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="initiated"
                    checked={filters.initiated}
                    onChange={handleCheckboxChange}
                  />{' '}
                  Initiated Orders
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="past"
                    checked={filters.past}
                    onChange={handleCheckboxChange}
                  />{' '}
                  Past Orders
                </label>
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
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
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
