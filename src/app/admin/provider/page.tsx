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
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, Download, Copy, Users, Building2, CreditCard } from 'lucide-react';
import { fetchAllProviders, deleteProvider, exportProvider, approvedProvider, updateProviderType } from '@/lib/api';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

const ProviderList = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProviderType, setFilterProviderType] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch providers from the backend with pagination
  const fetchProvidersData = async (page = 1, size = 50, status = 'all', search = '', providerType = '') => {
    try {
      const { data, meta } = await fetchAllProviders(page, size, filterStatus, search, providerType);
      setProviders(data);
      setTotalPages(meta.totalPages);
      setTotalItems(meta.totalItems);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  useEffect(() => {
    fetchProvidersData(pagination.pageIndex + 1, pagination.pageSize, filterStatus, searchTerm, filterProviderType);
  }, [pagination.pageIndex, pagination.pageSize, filterStatus, searchTerm, filterProviderType]);

  const handleProviderDelete = async (provider: any) => {
    try {
      await deleteProvider(provider.id);
      toast({
        title: 'Success',
        description: `Provider "${provider.first_name} ${provider.last_name}" deleted successfully`,
        variant: 'success',
      });
      fetchProvidersData(pagination.pageIndex + 1, pagination.pageSize, filterStatus);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete provider: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportProvider();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export rate cards',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  const handlePrint = () => {
    const printableContent = providers
      .map(
        (item) =>
          `<tr><td>${item.id}</td><td>${item.full_name}</td><td>${item.is_active}</td></tr>`
      )
      .join('');
    const newWindow = window.open('', '_blank');
    newWindow?.document.write(`
          <html>
            <head>
              <title>Print Categories</title>
              <style>
                table { width: 100%; border-collapse: collapse; }
                td, th { border: 1px solid black; padding: 8px; text-align: left; }
              </style>
            </head>
            <body>
              <h1>Categories</h1>
              <table>
                <thead><tr><th>ID</th><th>Name</th><th>Status</th></tr></thead>
                <tbody>${printableContent}</tbody>
              </table>
            </body>
          </html>
        `);
    newWindow?.print();
  };

  const handleCopy = () => {
    const formattedData = providers
      .map((item) => `${item.id}, ${item.first_name}, ${item.is_active}`)
      .join('\n');
    navigator.clipboard.writeText(formattedData);
    toast({ title: 'Copied to Clipboard', description: 'Category data copied.' });
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value) }));
  };

  const providerColumns: ColumnDef<any>[] = [
    { accessorKey: 'sampleid', header: 'ID' },
    { accessorKey: 'full_name', header: 'Full Name' },
    // { accessorKey: 'last_name', header: 'Last Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Phone' },
    {
      accessorKey: 'account_approved',
      header: 'Approved',
      cell: ({ row }) => {
        const approved = row.original.account_approved === 1;

        const handleToggle = async () => {
          const newStatus = approved ? 0 : 1;
          try {
            await approvedProvider(row.original.id, newStatus);

            // Update the providers list to reflect the change locally
            setProviders((prev) =>
              prev.map((prov) =>
                prov.id === row.original.id ? { ...prov, account_approved: newStatus } : prov
              )
            );

            toast({
              title: 'Success',
              description: `Provider account ${newStatus ? 'approved' : 'disapproved'}.`,
              variant: 'success',
            });
          } catch (error) {
            toast({
              title: 'Error',
              description: String(error),
              variant: 'destructive',
            });
          }
        };

        return <Switch checked={approved} onCheckedChange={handleToggle} />;
      },
    },

    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => {
        const statusValue = row.original.active;

        let statusLabel = '';
        let statusClass = '';

        switch (statusValue) {
          case 0:
            statusLabel = 'Inactive'; // ✅ FIX: 0 = Inactive
            statusClass = 'bg-yellow-200 text-yellow-800';
            break;
          case 1:
            statusLabel = 'Active'; // ✅ FIX: 1 = Active
            statusClass = 'bg-green-200 text-green-800';
            break;
          case 2:
            statusLabel = 'Deleted';
            statusClass = 'bg-red-200 text-red-800';
            break;
          default:
            statusLabel = 'Unknown';
            statusClass = 'bg-gray-200 text-gray-800';
            break;
        }

        return <span className={`badge px-2 py-1 rounded ${statusClass}`}>{statusLabel}</span>;
      },
    },
    // ✅ B2B PROVIDER COLUMNS
    {
      accessorKey: 'provider_type',
      header: 'Provider Type',
      cell: ({ row }) => {
        const type = row.original.provider_type || 'b2c';
        let typeLabel = '';
        let typeClass = '';

        switch (type) {
          case 'b2c':
            typeLabel = 'B2C Only';
            typeClass = 'bg-blue-100 text-blue-800';
            break;
          case 'b2b':
            typeLabel = 'B2B Only';
            typeClass = 'bg-purple-100 text-purple-800';
            break;
          case 'hybrid':
            typeLabel = 'Hybrid';
            typeClass = 'bg-green-100 text-green-800';
            break;
          default:
            typeLabel = 'B2C Only';
            typeClass = 'bg-blue-100 text-blue-800';
            break;
        }

        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeClass}`}>{typeLabel}</span>;
      },
    },
    {
      accessorKey: 'b2b_approved',
      header: 'B2B Status',
      cell: ({ row }) => {
        const providerType = row.original.provider_type || 'b2c';
        const b2bApproved = row.original.b2b_approved === 1;

        if (providerType === 'b2c') {
          return <span className="text-gray-400 text-xs">N/A</span>;
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            b2bApproved
              ? 'bg-green-100 text-green-800'
              : 'bg-orange-100 text-orange-800'
          }`}>
            {b2bApproved ? 'Approved' : 'Pending'}
          </span>
        );
      },
    },
    {
      accessorKey: 'commission',
      header: 'Commission (%)',
      cell: ({ row }) => {
        const commission = row.original.commission;

        if (!commission || commission === 0) {
          return (
            <span className="text-gray-400 text-xs px-2 py-1 bg-gray-100 rounded">
              Default
            </span>
          );
        }

        return (
          <span className="text-blue-800 text-sm font-medium px-2 py-1 bg-blue-100 rounded">
            {commission}%
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" title="Edit Provider">
            <Link href={`/admin/provider/edit/${row.original.id}`} passHref>
              <Edit className="w-4 h-4 text-blue-600" />
            </Link>
          </Button>
          {/* Staff Management Button - Show if staff exists */}
          {row.original.staff_count > 0 && (
            <Button variant="ghost" size="icon" title={`View Staff (${row.original.staff_count})`}>
              <Link href={`/admin/staff?provider_id=${row.original.id}`} passHref>
                <Users className="w-4 h-4 text-green-600" />
              </Link>
            </Button>
          )}

          {/* Bank Account Management Button */}
          <Button variant="ghost" size="icon" title="Manage Bank Accounts">
            <Link href={`/admin/provider/${row.original.id}/account`} passHref>
              <CreditCard className="w-4 h-4 text-orange-600" />
            </Link>
          </Button>

          {/* B2B Provider Type Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            title={`${row.original.provider_type === 'b2b' ? 'Convert to B2C' : 'Convert to B2B'}`}
            onClick={async () => {
              const newType = row.original.provider_type === 'b2b' ? 'b2c' : 'b2b';
              try {
                await updateProviderType(row.original.id, newType, 0);
                // Refresh the providers list
                fetchProviders();
                toast({
                  title: 'Success',
                  description: `Provider converted to ${newType.toUpperCase()} successfully.`,
                  variant: 'success',
                });
              } catch (error) {
                toast({
                  title: 'Error',
                  description: String(error),
                  variant: 'destructive',
                });
              }
            }}
          >
            <Building2 className={`w-4 h-4 ${row.original.provider_type === 'b2b' ? 'text-purple-600' : 'text-gray-400'}`} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Delete Provider">
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <h2 className="text-xl font-bold">Confirm Delete</h2>
                <p>
                  Are you sure you want to delete provider: {row.original.first_name}{' '}
                  {row.original.last_name}?
                </p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="secondary" onClick={() => handleProviderDelete(row.original)}>
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

  const providerTable = useReactTable({
    data: providers,
    columns: providerColumns,
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
          <h1 className="text-3xl font-bold text-gray-900">Provider List</h1>
          <div className="flex space-x-2">
            <select
              value={filterStatus}
              onChange={handleStatusChange}
              className="border p-2 rounded"
            >
              <option value="">All Status</option>
              <option value="0">Inactive</option> {/* ✅ FIX: 0 = Inactive */}
              <option value="1">Active</option> {/* ✅ FIX: 1 = Active */}
              <option value="2">Deleted</option>
            </select>
            <select
              value={filterProviderType}
              onChange={(e) => setFilterProviderType(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Types</option>
              <option value="b2c">B2C Only</option>
              <option value="b2b">B2B Only</option>
              <option value="hybrid">Hybrid</option>
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
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button asChild variant="outline" className="flex items-center space-x-2">
              <Link href="/admin/provider/b2b">
                <Building2 className="w-4 h-4 mr-1" />
                <span>B2B Providers</span>
              </Link>
            </Button>
            <Button asChild variant="default" className="flex items-center space-x-2">
              <Link href="/admin/provider/add">
                <Plus className="w-4 h-4 mr-1" />
                <span>Add Provider</span>
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-xl text-gray-800">Providers</CardTitle>
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
                {providerTable.getHeaderGroups().map((headerGroup) => (
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
                {providerTable.getRowModel().rows.length ? (
                  providerTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={providerColumns.length} className="h-24 text-center">
                      No providers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              onClick={() => providerTable.previousPage()}
              disabled={!providerTable.getCanPreviousPage()}
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
              onClick={() => providerTable.nextPage()}
              disabled={!providerTable.getCanNextPage()}
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

export default ProviderList;
