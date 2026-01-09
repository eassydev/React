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
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, Eye } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { fetchAllCategoryPackages, deleteCategoryPackage } from '@/lib/api';

// Category Package interface
interface CategoryPackage {
  id: string;
  name: string;
  description?: string;
  image?: string;
  package_type: 'regular' | 'amc';
  is_active: number;
  weight?: number;
  packages_count?: number;
  created_at?: number;
  updated_at?: number;
  deleted_at?: number | null;
}

const CategoryPackageList: React.FC = () => {
  const [categoryPackages, setCategoryPackages] = useState<CategoryPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [filterType, setFilterType] = useState<string>('');
  const { toast } = useToast();

  // Fetch category packages
  const fetchCategoryPackages = async () => {
    setLoading(true);
    try {
      const response = await fetchAllCategoryPackages(
        pagination.pageIndex + 1,
        pagination.pageSize,
        filterType || undefined
      );

      setCategoryPackages(response.data);
      setTotalPages(response.pagination.total_pages);
      setTotalItems(response.pagination.total_items);
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to fetch category packages',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryPackages();
  }, [pagination.pageIndex, pagination.pageSize, filterType]);

  // Delete category package
  const handleDelete = async (id: string) => {
    try {
      await deleteCategoryPackage(id);
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Category package deleted successfully',
      });
      // Refresh the list after deletion
      await fetchCategoryPackages();
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to delete category package',
      });
    }
  };

  // Table columns
  const columns: ColumnDef<CategoryPackage>[] = [
    {
      id: 'serial',
      header: '#',
      size: 50,
      cell: ({ row }) => {
        return <span>{pagination.pageIndex * pagination.pageSize + row.index + 1}</span>;
      },
    },
    {
      accessorKey: 'image',
      header: 'Image',
      size: 80,
      cell: ({ row }) => {
        const image = row.getValue('image') as string;
        return image ? (
          <img src={image} alt="Category" className="w-12 h-12 object-cover rounded" />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
            No Image
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Category Name',
      size: 200,
    },
    {
      accessorKey: 'package_type',
      header: 'Type',
      size: 100,
      cell: ({ row }) => {
        const type = row.getValue('package_type') as string;
        return (
          <span className={`px-2 py-1 rounded text-xs ${
            type === 'amc' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {type.toUpperCase()}
          </span>
        );
      },
    },
    {
      accessorKey: 'weight',
      header: 'Weight',
      size: 80,
    },
    {
      accessorKey: 'packages_count',
      header: 'Packages',
      size: 80,
      cell: ({ row }) => {
        const count = row.getValue('packages_count') as number;
        return <span className="font-semibold">{count || 0}</span>;
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      size: 100,
      cell: ({ row }) => {
        const isActive = row.getValue('is_active') as number;
        return (
          <span className={`px-2 py-1 rounded text-xs ${
            isActive === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isActive === 1 ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 150,
      cell: ({ row }) => {
        const categoryPackage = row.original;
        return (
          <div className="flex space-x-2">
            <Link href={`/admin/category-package/${categoryPackage.id}/view`}>
              <Button variant="outline" size="sm" title="View">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
            <Link href={`/admin/category-package/${categoryPackage.id}/edit`}>
              <Button variant="outline" size="sm" title="Edit">
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" title="Delete">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Category Package</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{categoryPackage.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(categoryPackage.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: categoryPackages,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Category Packages</h1>
            <p className="text-gray-500 mt-1">Manage package categories and groups</p>
          </div>
          <div className="flex space-x-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Types</option>
              <option value="regular">Regular</option>
              <option value="amc">AMC</option>
            </select>
            <Link href="/admin/category-package/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Category Package
              </Button>
            </Link>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xl text-gray-800">Category Package List</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length > 0 ? (
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
                        <TableCell colSpan={columns.length} className="text-center py-8">
                          No category packages found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Page {pagination.pageIndex + 1} of {totalPages} ({totalItems} total items)
                  </div>
                  <div className="flex space-x-2">
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

export default CategoryPackageList;


