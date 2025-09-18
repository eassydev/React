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
import { ChevronLeft, ChevronRight, Edit, Building2, Filter, CreditCard } from 'lucide-react';
import { fetchB2BProviders, updateProviderType, Provider } from '@/lib/api';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const B2BProvidersPage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalProviders, setTotalProviders] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [providerTypeFilter, setProviderTypeFilter] = useState<string>('all');
  const [b2bApprovedFilter, setB2bApprovedFilter] = useState<string>('all');
  const { toast } = useToast();

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const response = await fetchB2BProviders(
        pagination.pageIndex + 1,
        pagination.pageSize,
        providerTypeFilter,
        b2bApprovedFilter
      );
      setProviders(response.providers);
      setTotalPages(response.totalPages);
      setTotalProviders(response.totalProviders);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch B2B providers.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [pagination.pageIndex, pagination.pageSize, providerTypeFilter, b2bApprovedFilter]);

  const handleProviderTypeUpdate = async (providerId: string, newType: 'b2c' | 'b2b' | 'hybrid') => {
    try {
      await updateProviderType(providerId, newType, 0);
      
      // Update local state
      setProviders(prev => 
        prev.map(provider => 
          provider.id === providerId 
            ? { ...provider, provider_type: newType, b2b_approved: 0 }
            : provider
        )
      );

      toast({
        variant: 'success',
        title: 'Success',
        description: 'Provider type updated successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update provider type.',
      });
    }
  };

  const handleB2BApprovalToggle = async (providerId: string, currentApproval: number) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return;

    const newApproval = currentApproval === 1 ? 0 : 1;
    
    try {
      await updateProviderType(providerId, provider.provider_type || 'b2c', newApproval);
      
      // Update local state
      setProviders(prev => 
        prev.map(p => 
          p.id === providerId 
            ? { ...p, b2b_approved: newApproval }
            : p
        )
      );

      toast({
        variant: 'success',
        title: 'Success',
        description: `Provider ${newApproval === 1 ? 'approved' : 'disapproved'} for B2B services.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update B2B approval.',
      });
    }
  };

  const b2bProviderColumns: ColumnDef<Provider>[] = [
    { accessorKey: 'sampleid', header: 'ID' },
    { 
      accessorKey: 'first_name', 
      header: 'Provider Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.first_name} {row.original.last_name}</div>
          {row.original.company_name && (
            <div className="text-sm text-gray-500">{row.original.company_name}</div>
          )}
        </div>
      ),
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Phone' },
    {
      accessorKey: 'provider_type',
      header: 'Provider Type',
      cell: ({ row }) => {
        const currentType = row.original.provider_type || 'b2c';
        
        return (
          <Select
            value={currentType}
            onValueChange={(value: 'b2c' | 'b2b' | 'hybrid') => 
              handleProviderTypeUpdate(row.original.id!, value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="b2c">B2C Only</SelectItem>
              <SelectItem value="b2b">B2B Only</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: 'b2b_approved',
      header: 'B2B Approved',
      cell: ({ row }) => {
        const providerType = row.original.provider_type || 'b2c';
        const b2bApproved = row.original.b2b_approved || 0;

        if (providerType === 'b2c') {
          return <span className="text-gray-400 text-sm">N/A</span>;
        }

        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={b2bApproved === 1}
              onCheckedChange={() => handleB2BApprovalToggle(row.original.id!, b2bApproved)}
            />
            <span className="text-sm">
              {b2bApproved === 1 ? 'Approved' : 'Pending'}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" title="Edit Provider" asChild>
            <Link href={`/admin/provider/edit/${row.original.id}`}>
              <Edit className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" title="Manage Bank Accounts" asChild>
            <Link href={`/admin/provider/${row.original.id}/account`}>
              <CreditCard className="w-4 h-4 text-orange-600" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: providers,
    columns: b2bProviderColumns,
    state: { pagination },
    pageCount: totalPages,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Building2 className="w-8 h-8 mr-3 text-blue-600" />
              B2B Provider Management
            </h1>
            <p className="text-gray-500 mt-1">Manage providers who serve business clients</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Provider Type</label>
                <Select value={providerTypeFilter} onValueChange={setProviderTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="b2b">B2B Only</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">B2B Approval</label>
                <Select value={b2bApprovedFilter} onValueChange={setB2bApprovedFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="1">Approved</SelectItem>
                    <SelectItem value="0">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Providers Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              B2B Providers ({totalProviders} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
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
                        <TableCell colSpan={b2bProviderColumns.length} className="h-24 text-center">
                          No B2B providers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-gray-500">
                    Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
                    {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalProviders)} of{' '}
                    {totalProviders} providers
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default B2BProvidersPage;
