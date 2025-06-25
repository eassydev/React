"use client";

import React, { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import {
  Download,
  Plus,
  Edit,
  Trash2,
  Printer,
  Copy,
  Upload,
} from "lucide-react";
import { 
  fetchWolooCategories, 
  deleteWolooCategory, 
  downloadWolooCategorySampleCSV,
  bulkUploadWolooCategories,
  WolooCategory 
} from "@/lib/api";
import Link from "next/link";
import { AlertDialog, AlertDialogTrigger, AlertDialogTitle, AlertDialogContent, AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const WolooCategoryList = () => {
  const [categories, setCategories] = useState<WolooCategory[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Fetch categories with pagination and status filter
  const fetchCategoriesData = async (page = 1, size = 50, status = "all", search = "") => {
    try {
      console.log("🔍 Fetching Woloo categories...", { page, size, status, search });
      const { data, meta } = await fetchWolooCategories(page, size, status, search);
      console.log("✅ Woloo categories fetched successfully:", { data, meta });
      setCategories(data);
      setTotalPages(meta.totalPages);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error("❌ Error fetching Woloo categories:", error);
      toast({ title: "Error", description: "Failed to fetch categories.", variant: "destructive" });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategoriesData(pagination.pageIndex + 1, pagination.pageSize, filterStatus, searchTerm);
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [pagination.pageIndex, pagination.pageSize, filterStatus, searchTerm]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      // Add export functionality here
      toast({ title: "Success", description: "Categories exported successfully." });
    } catch (error) {
      console.error("Error exporting categories:", error);
      toast({ title: "Error", description: "Failed to export categories.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = () => {
    const formattedData = categories.map((item) => `${item.sampleid}, ${item.name}, ${item.active ? 'Active' : 'Inactive'}`).join("\n");
    navigator.clipboard.writeText(formattedData);
    toast({ title: "Copied to Clipboard", description: "Category data copied." });
  };

  const handlePrint = () => {
    const printableContent = categories
      .map((item) => `<tr><td>${item.sampleid}</td><td>${item.name}</td><td>${item.active ? 'Active' : 'Inactive'}</td></tr>`)
      .join("");
    const newWindow = window.open("", "_blank");
    newWindow?.document.write(`
      <html>
        <head>
          <title>Print Woloo Categories</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            td, th { border: 1px solid black; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Woloo Categories</h1>
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

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value) }));
  };

  const handleSampleExport = async () => {
    try {
      await downloadWolooCategorySampleCSV();
      toast({ title: "Success", description: "Sample CSV downloaded successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to download sample CSV.", variant: "destructive" });
    }
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await bulkUploadWolooCategories(file);
      toast({ title: "Success", description: "Categories uploaded successfully." });
      fetchCategoriesData(pagination.pageIndex + 1, pagination.pageSize, filterStatus, searchTerm);
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload categories.", variant: "destructive" });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteTargetId !== null) {
        await deleteWolooCategory(deleteTargetId);
        toast({ title: "Deleted", description: "Category deleted successfully." });
        fetchCategoriesData(pagination.pageIndex + 1, pagination.pageSize, filterStatus);
        setIsDialogOpen(false);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete category.", variant: "destructive" });
    }
  };

  const categoryColumns: ColumnDef<WolooCategory>[] = [
    { accessorKey: "sampleid", header: "ID" },
    { accessorKey: "name", header: "Name", size: 200 },
    { accessorKey: "service_time", header: "Service Time" },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.active;
        return (
          <span className={`badge px-2 py-1 rounded ${isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = row.original.created_at;
        return date ? new Date(date).toLocaleDateString() : '-';
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Link href={`/admin/woloo/categories/edit/${row.original.id}`}>
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
                <p className="text-xl font-bold">Are you sure you want to delete category: {row.original.name}?</p>
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

  const categoryTable = useReactTable({
    data: categories,
    columns: categoryColumns,
    state: { pagination },
    pageCount: totalPages,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Woloo Categories</h1>
        <div className="flex space-x-2">
          <select value={filterStatus} onChange={handleStatusChange} className="border p-2 rounded">
            <option value="all">All</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
          <select value={pagination.pageSize} onChange={handlePageSizeChange} className="border p-2 rounded">
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
          </select>
          <Button onClick={handleSampleExport}>
            <Download className="w-4 h-4 mr-2" />Sample CSV
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
            <Copy className="w-4 h-4 mr-2" />Copy
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />Print
          </Button>
          <Link href="/admin/woloo/categories/add">
            <Button>
              <Plus className="w-4 h-4 mr-2" />Add Category
            </Button>
          </Link>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Categories</CardTitle>
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
        <CardContent>
          <Table>
            <TableHeader>
              {categoryTable.getHeaderGroups().map((headerGroup) => (
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
              {categoryTable.getRowModel().rows.map((row) => (
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

export default WolooCategoryList;
