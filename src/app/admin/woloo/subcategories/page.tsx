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
import { Download, Plus, Edit, Trash2, Printer, Copy, Upload } from 'lucide-react';
import {
  fetchWolooSubcategories,
  deleteWolooSubcategory,
  downloadWolooSubcategorySampleCSV,
  bulkUploadWolooSubcategories,
  fetchWolooCategories,
  WolooSubcategory,
  WolooCategory,
} from '@/lib/api';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const WolooSubcategoryList = () => {
  const [subcategories, setSubcategories] = useState<WolooSubcategory[]>([]);
  const [categories, setCategories] = useState<WolooCategory[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const { data } = await fetchWolooCategories(1, 1000, 'all', '');
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategoriesData();
  }, []);

  // Fetch subcategories with pagination and filters
  const fetchSubcategoriesData = async (
    page = 1,
    size = 50,
    status = 'all',
    search = '',
    categoryId = ''
  ) => {
    try {
      const { data, meta } = await fetchWolooSubcategories(page, size, status, search, categoryId);
      setSubcategories(data);
      setTotalPages(meta.totalPages);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error('Error fetching Woloo subcategories:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subcategories.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubcategoriesData(
        pagination.pageIndex + 1,
        pagination.pageSize,
        filterStatus,
        searchTerm,
        filterCategory
      );
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [pagination.pageIndex, pagination.pageSize, filterStatus, searchTerm, filterCategory]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast({ title: 'Success', description: 'Subcategories exported successfully.' });
    } catch (error) {
      console.error('Error exporting subcategories:', error);
      toast({
        title: 'Error',
        description: 'Failed to export subcategories.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = () => {
    const formattedData = subcategories
      .map((item) => `${item.sampleid}, ${item.name}, ${item.active ? 'Active' : 'Inactive'}`)
      .join('\n');
    navigator.clipboard.writeText(formattedData);
    toast({ title: 'Copied to Clipboard', description: 'Subcategory data copied.' });
  };

  const handlePrint = () => {
    const printableContent = subcategories
      .map(
        (item) =>
          `<tr><td>${item.sampleid}</td><td>${item.name}</td><td>${item.active ? 'Active' : 'Inactive'}</td></tr>`
      )
      .join('');
    const newWindow = window.open('', '_blank');
    newWindow?.document.write(`
      <html>
        <head>
          <title>Print Woloo Subcategories</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            td, th { border: 1px solid black; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Woloo Subcategories</h1>
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Status</th></tr></thead>
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterCategory(e.target.value);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value) }));
  };

  const handleSampleExport = async () => {
    try {
      await downloadWolooSubcategorySampleCSV();
      toast({ title: 'Success', description: 'Sample CSV downloaded successfully.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download sample CSV.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await bulkUploadWolooSubcategories(file);
      toast({ title: 'Success', description: 'Subcategories uploaded successfully.' });
      fetchSubcategoriesData(
        pagination.pageIndex + 1,
        pagination.pageSize,
        filterStatus,
        searchTerm,
        filterCategory
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload subcategories.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteTargetId !== null) {
        await deleteWolooSubcategory(deleteTargetId);
        toast({ title: 'Deleted', description: 'Subcategory deleted successfully.' });
        fetchSubcategoriesData(
          pagination.pageIndex + 1,
          pagination.pageSize,
          filterStatus,
          searchTerm,
          filterCategory
        );
        setIsDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete subcategory.',
        variant: 'destructive',
      });
    }
  };

  const getCategoryName = (subcategory: any) => {
    // Use the included category data if available
    if (subcategory.category && subcategory.category.name) {
      return subcategory.category.name;
    }

    // Fallback: try to find by category_id
    const categoryId = subcategory.category_id;
    let category = categories.find((cat) => cat.sampleid == categoryId);

    if (!category) {
      category = categories.find((cat) => cat.id === categoryId);
    }

    return category?.name || 'Unknown';
  };

  const subcategoryColumns: ColumnDef<WolooSubcategory>[] = [
    { accessorKey: 'sampleid', header: 'ID' },
    { accessorKey: 'name', header: 'Name', size: 200 },
    {
      accessorKey: 'category_id',
      header: 'Category',
      cell: ({ row }) => getCategoryName(row.original),
    },
    { accessorKey: 'service_time', header: 'Service Time' },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.active;
        return (
          <span
            className={`badge px-2 py-1 rounded ${isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: ({ row }) => {
        const date = row.original.created_at;
        return date ? new Date(date).toLocaleDateString() : '-';
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Link href={`/admin/woloo/subcategories/edit/${row.original.id}`}>
            <Button variant="ghost" size="icon">
              <Edit className="w-4 h-4 text-blue-600" />
            </Button>
          </Link>
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteTargetId(row.original.id || null)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <VisuallyHidden>Confirm Delete</VisuallyHidden>
                </AlertDialogTitle>
                <p className="text-xl font-bold">
                  Are you sure you want to delete subcategory: {row.original.name}?
                </p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="secondary" onClick={handleDelete}>
                  Yes, Delete
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  const subcategoryTable = useReactTable({
    data: subcategories,
    columns: subcategoryColumns,
    state: { pagination },
    pageCount: totalPages,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Woloo Subcategories</h1>
        <div className="flex space-x-2">
          <select
            value={filterCategory}
            onChange={handleCategoryChange}
            className="border p-2 rounded"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select value={filterStatus} onChange={handleStatusChange} className="border p-2 rounded">
            <option value="all">All</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
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
          <Button onClick={handleSampleExport}>
            <Download className="w-4 h-4 mr-2" />
            Sample CSV
          </Button>
          <label className="cursor-pointer">
            <Button disabled={isUploading}>
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Bulk Upload'}
            </Button>
            <input
              type="file"
              accept=".csv"
              onChange={handleBulkUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
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
          <Link href="/admin/woloo/subcategories/add">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Subcategory
            </Button>
          </Link>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Subcategories</CardTitle>
          <div className="relative">
            <input
              type="text"
              placeholder="Search subcategories..."
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
        <CardContent>
          <Table>
            <TableHeader>
              {subcategoryTable.getHeaderGroups().map((headerGroup) => (
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
              {subcategoryTable.getRowModel().rows.map((row) => (
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

export default WolooSubcategoryList;
