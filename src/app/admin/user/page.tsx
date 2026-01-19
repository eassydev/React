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
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import { fetchAllUsers, deleteUser, exportUsers } from '@/lib/api'; // Replace with actual API functions
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
import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Theme css

const UserList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [pincode, setPincode] = useState(''); // State for pincode filter
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };
  // Fetch users from the backend with pagination
  const fetchUsersData = async (page = 1, size = 50, status = 'all', search = '') => {
    try {
      const { data, meta } = await fetchAllUsers(page, size, status, search);
      setUsers(data);
      setTotalPages(meta.totalPages);
      setTotalItems(meta.totalItems);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const startDate = formatDateToYYYYMMDD(dateRange[0].startDate);
      const endDate = formatDateToYYYYMMDD(dateRange[0].endDate);

      // Call the exportUsers function with separate arguments
      await exportUsers(startDate, endDate, pincode);

      toast({ title: 'Success', description: 'Data exported successfully.' });
    } catch (error) {
      console.error('Error exporting users:', error);
      toast({ title: 'Error', description: 'Failed to export data.' });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchUsersData(pagination.pageIndex + 1, pagination.pageSize, filterStatus, searchTerm);
  }, [pagination.pageIndex, pagination.pageSize, filterStatus, searchTerm]);

  const handleUserDelete = async (user: any) => {
    try {
      await deleteUser(user.id);
      toast({
        title: 'Success',
        description: `User "${user.first_name} ${user.last_name}" deleted successfully`,
        variant: 'success',
      });
      fetchUsersData(pagination.pageIndex + 1, pagination.pageSize);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete user: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const userColumns: ColumnDef<any>[] = [
    { accessorKey: 'sampleid', header: 'ID' },
    { accessorKey: 'first_name', header: 'First Name' },
    { accessorKey: 'last_name', header: 'Last Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'mobile', header: 'Mobile' },
    {
      id: 'plainDetails',
      header: 'Plain Details',
      cell: ({ row }) => {
        const user = row.original;
        const vipPlanName = user.vip?.plan_name;

        const vipExpiry = user?.vip_subscription_expiry
          ? new Date(user.vip_subscription_expiry).toLocaleDateString()
          : 'No VIP';

        return (
          <div className="flex flex-col text-sm text-gray-700">
            <span>
              <strong>Plan:</strong> {vipPlanName}
            </span>
            <span>
              <strong>VIP Expiry:</strong> {vipExpiry}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        console.log('status', status);
        let statusText = '';
        let statusClass = '';

        switch (status) {
          case 0:
            statusText = 'Inactive';
            statusClass = 'bg-red-100 text-red-600';
            break;
          case 1:
            statusText = 'Active';
            statusClass = 'bg-green-100 text-green-600';
            break;
          case 2:
            statusText = 'Deleted';
            statusClass = 'bg-gray-100 text-gray-600';
            break;
          default:
            statusText = 'Unknown';
            statusClass = 'bg-yellow-100 text-yellow-600';
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
            {statusText}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Link href={`/admin/user/edit/${row.original.id}`} passHref>
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
                <p>
                  Are you sure you want to delete user: {row.original.first_name}{' '}
                  {row.original.last_name}?
                </p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="secondary" onClick={() => handleUserDelete(row.original)}>
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

  const userTable = useReactTable({
    data: users,
    columns: userColumns,
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
          <h1 className="text-3xl font-bold text-gray-900">User List</h1>
          <select value={filterStatus} onChange={handleStatusChange} className="border p-2 rounded">
            <option value="">All</option>
            <option value="1">Active</option>
            <option value="0">Deactivated</option>
            <option value="2">Deleted</option>
          </select>
          {isCalendarOpen && (
            <div
              className="absolute z-50 bg-white shadow-lg mt-2"
              style={{
                top: '20%',
                left: '40%',
                right: '0',
                maxWidth: '500px',
                margin: 'auto',
              }}
            >
              <DateRange
                ranges={dateRange}
                months={2} // Allow 2 months to be visible
                direction="horizontal" // Arrange months horizontally
                onChange={(ranges: any) => {
                  const selectedRange = ranges.selection;
                  setDateRange([selectedRange]);
                  if (selectedRange.startDate && selectedRange.endDate) {
                    setIsCalendarOpen(false); // Close calendar when end date is selected
                  }
                }}
                rangeColors={['#4A90E2']}
              />
            </div>
          )}
          <div className="flex items-center justify-between relative space-x-6">
            <input
              type="text"
              className="border rounded px-2 py-1"
              placeholder="Filter by Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
            <input
              type="text"
              className="border rounded px-2 py-1"
              value={`${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`}
              onClick={() => setIsCalendarOpen((prev) => !prev)}
              readOnly
            />

            <Button variant="default" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <div className="flex items-center">
                  <span className="loader mr-2"></span> Exporting...
                </div>
              ) : (
                'Export to XLS'
              )}
            </Button>

            <Button asChild variant="default" className="flex items-center space-x-2">
              <Link href="/admin/user/add">
                <Plus className="w-4 h-4 mr-1" />
                <span>Add User</span>
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-xl text-gray-800">Users</CardTitle>
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
                {userTable.getHeaderGroups().map((headerGroup) => (
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
                {userTable.getRowModel().rows.length ? (
                  userTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={userColumns.length} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              onClick={() => userTable.previousPage()}
              disabled={!userTable.getCanPreviousPage()}
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
              onClick={() => userTable.nextPage()}
              disabled={!userTable.getCanNextPage()}
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

export default UserList;
