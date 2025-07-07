'use client';

import React, { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Edit, Printer, Copy, UserPlus, Calendar, Users, Eye } from 'lucide-react';
import {
  fetchWolooBookings,
  updateWolooBookingStatus,
  assignWolooBookingProvider,
  rescheduleWolooBooking,
  assignWolooBookingStaff,
  WolooBooking,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { DateRangePicker } from '@/components/DateRangePicker';

const WolooBookingList = () => {
  const [bookings, setBookings] = useState<WolooBooking[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<WolooBooking | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const { toast } = useToast();

  // Status update form
  const [statusForm, setStatusForm] = useState({
    status: '',
    reason: '',
    notes: '',
  });

  // Provider assignment form
  const [providerForm, setProviderForm] = useState({
    provider_id: '',
    assignment_notes: '',
    notify_provider: true,
  });

  // Reschedule form
  const [rescheduleForm, setRescheduleForm] = useState({
    booking_date: '',
    start_service_time: '',
    end_service_time: '',
    reschedule_reason: '',
    notify_customer: true,
  });

  // Staff assignment form
  const [staffForm, setStaffForm] = useState({
    staff_assignments: [{ staff_id: '', role: '', name: '' }],
    assignment_notes: '',
  });

  // Fetch bookings with pagination and filters
  const fetchBookingsData = async (
    page = 1,
    size = 50,
    status = '',
    search = '',
    dateFrom = '',
    dateTo = ''
  ) => {
    try {
      const { data, meta } = await fetchWolooBookings(page, size, status, search, dateFrom, dateTo);
      setBookings(data);
      setTotalPages(meta.totalPages);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error('Error fetching Woloo bookings:', error);
      toast({ title: 'Error', description: 'Failed to fetch bookings.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const dateFrom = dateRange?.from ? dateRange.from.toISOString().split('T')[0] : '';
      const dateTo = dateRange?.to ? dateRange.to.toISOString().split('T')[0] : '';

      fetchBookingsData(
        pagination.pageIndex + 1,
        pagination.pageSize,
        filterStatus,
        searchTerm,
        dateFrom,
        dateTo
      );
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [pagination.pageIndex, pagination.pageSize, filterStatus, searchTerm, dateRange]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast({ title: 'Success', description: 'Bookings exported successfully.' });
    } catch (error) {
      console.error('Error exporting bookings:', error);
      toast({ title: 'Error', description: 'Failed to export bookings.', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = () => {
    const formattedData = bookings
      .map(
        (item) =>
          `${item.woloo_order_id}, ${item.customer_name}, ${item.service_category}, ${item.status}`
      )
      .join('\n');
    navigator.clipboard.writeText(formattedData);
    toast({ title: 'Copied to Clipboard', description: 'Booking data copied.' });
  };

  const handlePrint = () => {
    const printableContent = bookings
      .map(
        (item) =>
          `<tr><td>${item.woloo_order_id}</td><td>${item.customer_name}</td><td>${item.service_category}</td><td>${item.status}</td></tr>`
      )
      .join('');
    const newWindow = window.open('', '_blank');
    newWindow?.document.write(`
      <html>
        <head>
          <title>Print Woloo Bookings</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            td, th { border: 1px solid black; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Woloo Bookings</h1>
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Service</th><th>Status</th></tr></thead>
            <tbody>${printableContent}</tbody>
          </table>
        </body>
      </html>
    `);
    newWindow?.print();
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value) }));
  };

  const handleUpdateStatus = async () => {
    if (!selectedBooking || !statusForm.status) return;

    try {
      await updateWolooBookingStatus(selectedBooking.id!, statusForm);
      toast({ title: 'Success', description: 'Booking status updated successfully.' });
      setIsStatusDialogOpen(false);
      const dateFrom = dateRange?.from ? dateRange.from.toISOString().split('T')[0] : '';
      const dateTo = dateRange?.to ? dateRange.to.toISOString().split('T')[0] : '';
      fetchBookingsData(
        pagination.pageIndex + 1,
        pagination.pageSize,
        filterStatus,
        searchTerm,
        dateFrom,
        dateTo
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status.',
        variant: 'destructive',
      });
    }
  };

  const handleAssignProvider = async () => {
    if (!selectedBooking || !providerForm.provider_id) return;

    try {
      await assignWolooBookingProvider(selectedBooking.id!, providerForm);
      toast({ title: 'Success', description: 'Provider assigned successfully.' });
      setIsProviderDialogOpen(false);
      const dateFrom = dateRange?.from ? dateRange.from.toISOString().split('T')[0] : '';
      const dateTo = dateRange?.to ? dateRange.to.toISOString().split('T')[0] : '';
      fetchBookingsData(
        pagination.pageIndex + 1,
        pagination.pageSize,
        filterStatus,
        searchTerm,
        dateFrom,
        dateTo
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign provider.',
        variant: 'destructive',
      });
    }
  };

  const handleReschedule = async () => {
    if (!selectedBooking || !rescheduleForm.booking_date) return;

    try {
      await rescheduleWolooBooking(selectedBooking.id!, rescheduleForm);
      toast({ title: 'Success', description: 'Booking rescheduled successfully.' });
      setIsRescheduleDialogOpen(false);
      const dateFrom = dateRange?.from ? dateRange.from.toISOString().split('T')[0] : '';
      const dateTo = dateRange?.to ? dateRange.to.toISOString().split('T')[0] : '';
      fetchBookingsData(
        pagination.pageIndex + 1,
        pagination.pageSize,
        filterStatus,
        searchTerm,
        dateFrom,
        dateTo
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reschedule booking.',
        variant: 'destructive',
      });
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedBooking) return;

    try {
      await assignWolooBookingStaff(selectedBooking.id!, staffForm);
      toast({ title: 'Success', description: 'Staff assigned successfully.' });
      setIsStaffDialogOpen(false);
      const dateFrom = dateRange?.from ? dateRange.from.toISOString().split('T')[0] : '';
      const dateTo = dateRange?.to ? dateRange.to.toISOString().split('T')[0] : '';
      fetchBookingsData(
        pagination.pageIndex + 1,
        pagination.pageSize,
        filterStatus,
        searchTerm,
        dateFrom,
        dateTo
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign staff.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-200 text-yellow-800',
      accepted: 'bg-blue-200 text-blue-800',
      running: 'bg-green-200 text-green-800',
      completed: 'bg-green-200 text-green-800',
      cancelled: 'bg-red-200 text-red-800',
    };

    return (
      <span
        className={`badge px-2 py-1 rounded ${statusColors[status as keyof typeof statusColors] || 'bg-gray-200 text-gray-800'}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const bookingColumns: ColumnDef<WolooBooking>[] = [
    { accessorKey: 'woloo_order_id', header: 'Order ID', size: 150 },
    { accessorKey: 'customer_name', header: 'Customer', size: 150 },
    { accessorKey: 'customer_mobile', header: 'Mobile' },
    { accessorKey: 'service_category', header: 'Service', size: 200 },
    { accessorKey: 'booking_date', header: 'Date' },
    { accessorKey: 'start_service_time', header: 'Start Time' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    { accessorKey: 'provider_name', header: 'Provider' },
    {
      accessorKey: 'final_price',
      header: 'Price',
      cell: ({ row }) => `₹${row.original.final_price}`,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(`/admin/woloo/bookings/view/${row.original.id}`, '_blank')}
            title="View booking details"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </Button>
          <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedBooking(row.original);
                  setStatusForm({ status: row.original.status, reason: '', notes: '' });
                }}
              >
                <Edit className="w-4 h-4 text-blue-600" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Booking Status</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={statusForm.status}
                    onValueChange={(value) => setStatusForm((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reason</Label>
                  <Input
                    value={statusForm.reason}
                    onChange={(e) => setStatusForm((prev) => ({ ...prev, reason: e.target.value }))}
                    placeholder="Reason for status change"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={statusForm.notes}
                    onChange={(e) => setStatusForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes"
                  />
                </div>
                <Button onClick={handleUpdateStatus}>Update Status</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isProviderDialogOpen} onOpenChange={setIsProviderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setSelectedBooking(row.original)}>
                <UserPlus className="w-4 h-4 text-green-600" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Provider</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Provider ID</Label>
                  <Input
                    value={providerForm.provider_id}
                    onChange={(e) =>
                      setProviderForm((prev) => ({ ...prev, provider_id: e.target.value }))
                    }
                    placeholder="Enter provider ID"
                  />
                </div>
                <div>
                  <Label>Assignment Notes</Label>
                  <Textarea
                    value={providerForm.assignment_notes}
                    onChange={(e) =>
                      setProviderForm((prev) => ({ ...prev, assignment_notes: e.target.value }))
                    }
                    placeholder="Notes for provider assignment"
                  />
                </div>
                <Button onClick={handleAssignProvider}>Assign Provider</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setSelectedBooking(row.original)}>
                <Calendar className="w-4 h-4 text-orange-600" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reschedule Booking</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Booking Date</Label>
                  <Input
                    type="date"
                    value={rescheduleForm.booking_date}
                    onChange={(e) =>
                      setRescheduleForm((prev) => ({ ...prev, booking_date: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={rescheduleForm.start_service_time}
                      onChange={(e) =>
                        setRescheduleForm((prev) => ({
                          ...prev,
                          start_service_time: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={rescheduleForm.end_service_time}
                      onChange={(e) =>
                        setRescheduleForm((prev) => ({ ...prev, end_service_time: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Reschedule Reason</Label>
                  <Textarea
                    value={rescheduleForm.reschedule_reason}
                    onChange={(e) =>
                      setRescheduleForm((prev) => ({ ...prev, reschedule_reason: e.target.value }))
                    }
                    placeholder="Reason for rescheduling"
                  />
                </div>
                <Button onClick={handleReschedule}>Reschedule Booking</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setSelectedBooking(row.original)}>
                <Users className="w-4 h-4 text-purple-600" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Staff</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {staffForm.staff_assignments.map((staff, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Staff ID"
                      value={staff.staff_id}
                      onChange={(e) => {
                        const newStaff = [...staffForm.staff_assignments];
                        newStaff[index].staff_id = e.target.value;
                        setStaffForm((prev) => ({ ...prev, staff_assignments: newStaff }));
                      }}
                    />
                    <Input
                      placeholder="Role"
                      value={staff.role}
                      onChange={(e) => {
                        const newStaff = [...staffForm.staff_assignments];
                        newStaff[index].role = e.target.value;
                        setStaffForm((prev) => ({ ...prev, staff_assignments: newStaff }));
                      }}
                    />
                    <Input
                      placeholder="Name"
                      value={staff.name}
                      onChange={(e) => {
                        const newStaff = [...staffForm.staff_assignments];
                        newStaff[index].name = e.target.value;
                        setStaffForm((prev) => ({ ...prev, staff_assignments: newStaff }));
                      }}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setStaffForm((prev) => ({
                      ...prev,
                      staff_assignments: [
                        ...prev.staff_assignments,
                        { staff_id: '', role: '', name: '' },
                      ],
                    }))
                  }
                >
                  Add Staff Member
                </Button>
                <div>
                  <Label>Assignment Notes</Label>
                  <Textarea
                    value={staffForm.assignment_notes}
                    onChange={(e) =>
                      setStaffForm((prev) => ({ ...prev, assignment_notes: e.target.value }))
                    }
                    placeholder="Notes for staff assignment"
                  />
                </div>
                <Button onClick={handleAssignStaff}>Assign Staff</Button>
              </div>
            </DialogContent>
          </Dialog>
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
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Woloo Bookings</h1>
        <div className="flex space-x-2">
          <select value={filterStatus} onChange={handleStatusChange} className="border p-2 rounded">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={pagination.pageSize}
            onChange={handlePageSizeChange}
            className="border p-2 rounded"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
          </select>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Bookings</CardTitle>
          <div className="flex space-x-2">
            <DateRangePicker selectedRange={dateRange} onChangeRange={setDateRange} />
            <div className="relative">
              <input
                type="text"
                placeholder="Search bookings..."
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {bookingTable.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} style={{ width: header.column.getSize() }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {bookingTable.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default WolooBookingList;
