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
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, Download, Upload } from 'lucide-react';
import {
  fetchAllStates,
  deleteState,
  exportStatesToXLS,
  importStatesFromCSV,
  downloadSampleStateExcel,
} from '@/lib/api';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const StateList = () => {
  const [states, setStates] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };
  // Fetch states from backend with pagination
  const fetchStatesData = async (page = 1, size = 50, status = 'all', search = '') => {
    try {
      const { data, meta } = await fetchAllStates(page, size, status, search);
      setStates(data);
      setTotalPages(meta.totalPages);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  useEffect(() => {
    fetchStatesData(pagination.pageIndex + 1, pagination.pageSize, filterStatus, searchTerm);
  }, [pagination.pageIndex, pagination.pageSize, filterStatus, searchTerm]);

  const handleStateDelete = async (state: any) => {
    try {
      await deleteState(state.id);
      toast({
        title: 'Success',
        description: `State "${state.name}" deleted successfully`,
        variant: 'success',
      });
      fetchStatesData(pagination.pageIndex + 1, pagination.pageSize);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete state: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    try {
      await exportStatesToXLS();
      toast({
        title: 'Success',
        description: 'States exported successfully!',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export states.',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async (file: File) => {
    try {
      await importStatesFromCSV(file);
      toast({
        title: 'Success',
        description: 'States imported successfully!',
        variant: 'success',
      });
      fetchStatesData(pagination.pageIndex + 1, pagination.pageSize);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message,
        variant: 'destructive',
      });
    }
  };

  const handleDownloadSample = async () => {
    try {
      await downloadSampleStateExcel();
      toast({
        title: 'Success',
        description: 'Sample file downloaded successfully!',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download sample file.',
        variant: 'destructive',
      });
    }
  };

  const stateColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'sno', // Placeholder key for S.No
      header: 'S.No',
      cell: (info) => info.row.index + 1, // Calculate the serial number dynamically
    },
    { accessorKey: 'name', header: 'Name' },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        console.log('status', status);
        let statusText = '';
        let statusClass = '';

        switch (status) {
          case false:
            statusText = 'Inactive';
            statusClass = 'bg-red-100 text-red-600';
            break;
          case true:
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
            <Link href={`/admin/state/edit/${row.original.id}`} passHref>
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
                <p>Are you sure you want to delete state: {row.original.name}?</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="secondary" onClick={() => handleStateDelete(row.original)}>
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

  const stateTable = useReactTable({
    data: states,
    columns: stateColumns,
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
          <h1 className="text-3xl font-bold text-gray-900">State List</h1>
          <div className="flex space-x-2">
            <Button asChild variant="default" className="flex items-center space-x-2">
              <Link href="/admin/state/add">
                <Plus className="w-4 h-4 mr-1" />
                <span>Add State</span>
              </Link>
            </Button>
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
            <Button variant="outline" onClick={handleDownloadSample}>
              <Download className="w-4 h-4 mr-2" />
              Sample CSV
            </Button>
            <Button variant="outline" asChild>
              <label>
                <Upload className="w-4 h-4 mr-2" />
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files && handleImport(e.target.files[0])}
                  className="hidden"
                />
                Import CSV
              </label>
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export XLS
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-xl text-gray-800">States</CardTitle>
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
                {stateTable.getHeaderGroups().map((headerGroup) => (
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
                {stateTable.getRowModel().rows.length ? (
                  stateTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={stateColumns.length} className="h-24 text-center">
                      No states found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              onClick={() => stateTable.previousPage()}
              disabled={!stateTable.getCanPreviousPage()}
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
              onClick={() => stateTable.nextPage()}
              disabled={!stateTable.getCanNextPage()}
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

export default StateList;
