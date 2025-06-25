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
  Plus,
  Edit,
  Trash2,
  Printer,
  Copy,
  Settings,
  Upload,
  Download,
  FileText,
  ChevronDown,
} from "lucide-react";
import {
  fetchWolooAttributes,
  deleteWolooAttribute,
  downloadWolooAttributeSampleCSV,
  bulkUploadWolooAttributes,
  exportWolooAttributes,
  WolooAttribute
} from "@/lib/api";
import Link from "next/link";
import { AlertDialog, AlertDialogTrigger, AlertDialogTitle, AlertDialogContent, AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const WolooAttributeList = () => {
  const [attributes, setAttributes] = useState<WolooAttribute[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Fetch attributes with pagination and status filter
  const fetchAttributesData = async (page = 1, size = 50, status = "all", search = "") => {
    try {
      const { data, meta } = await fetchWolooAttributes(page, size, status, search);
      setAttributes(data);
      setTotalPages(meta.totalPages);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error("Error fetching Woloo attributes:", error);
      toast({ title: "Error", description: "Failed to fetch attributes.", variant: "destructive" });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttributesData(pagination.pageIndex + 1, pagination.pageSize, filterStatus, searchTerm);
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [pagination.pageIndex, pagination.pageSize, filterStatus, searchTerm]);

  const handleCopy = () => {
    const formattedData = attributes.map((item) => `${item.sampleid}, ${item.name}, ${item.type}, ${item.active ? 'Active' : 'Inactive'}`).join("\n");
    navigator.clipboard.writeText(formattedData);
    toast({ title: "Copied to Clipboard", description: "Attribute data copied." });
  };

  const handlePrint = () => {
    const printableContent = attributes
      .map((item) => `<tr><td>${item.sampleid}</td><td>${item.name}</td><td>${item.type}</td><td>${item.active ? 'Active' : 'Inactive'}</td></tr>`)
      .join("");
    const newWindow = window.open("", "_blank");
    newWindow?.document.write(`
      <html>
        <head>
          <title>Print Woloo Attributes</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            td, th { border: 1px solid black; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Woloo Attributes</h1>
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Status</th></tr></thead>
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

  const handleDelete = async () => {
    try {
      if (deleteTargetId !== null) {
        await deleteWolooAttribute(deleteTargetId);
        toast({ title: "Deleted", description: "Attribute deleted successfully." });
        fetchAttributesData(pagination.pageIndex + 1, pagination.pageSize, filterStatus, searchTerm);
        setIsDialogOpen(false);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete attribute.", variant: "destructive" });
    }
  };

  const handleDownloadSample = async () => {
    try {
      await downloadWolooAttributeSampleCSV();
      toast({ title: "Success", description: "Sample CSV downloaded successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to download sample CSV.", variant: "destructive" });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({ title: "Error", description: "Please select a CSV file.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const result = await bulkUploadWolooAttributes(file);
      toast({
        title: "Upload Complete",
        description: result.message || "Attributes uploaded successfully."
      });
      fetchAttributesData(pagination.pageIndex + 1, pagination.pageSize, filterStatus, searchTerm);
    } catch (error) {
      toast({ title: "Upload Failed", description: "Failed to upload CSV file.", variant: "destructive" });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleExport = async (format: 'excel' | 'csv' = 'excel') => {
    try {
      await exportWolooAttributes(format);
      toast({ title: "Success", description: `Attributes exported as ${format.toUpperCase()} successfully.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to export attributes.", variant: "destructive" });
    }
  };

  const attributeColumns: ColumnDef<WolooAttribute>[] = [
    { accessorKey: "sampleid", header: "ID" },
    { accessorKey: "name", header: "Name", size: 200 },
    { accessorKey: "type", header: "Type" },
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
      accessorKey: "options",
      header: "Options Count",
      cell: ({ row }) => {
        const optionsCount = row.original.options?.length || 0;
        return <span>{optionsCount} options</span>;
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
          <Link href={`/admin/woloo/attributes/${row.original.id}/options`}>
            <Button variant="ghost" size="icon" title="Manage Options">
              <Settings className="w-4 h-4 text-green-600" />
            </Button>
          </Link>
          <Link href={`/admin/woloo/attributes/edit/${row.original.id}`}>
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
                <p className="text-xl font-bold">Are you sure you want to delete attribute: {row.original.name}?</p>
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

  const attributeTable = useReactTable({
    data: attributes,
    columns: attributeColumns,
    state: { pagination },
    pageCount: totalPages,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Woloo Attributes</h1>
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
          <Button onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />Copy
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />Print
          </Button>
          <Button onClick={handleDownloadSample} variant="outline">
            <FileText className="w-4 h-4 mr-2" />Sample CSV
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                Export as Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV (.csv)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button variant="outline" disabled={isUploading}>
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload CSV'}
            </Button>
          </div>
          <Link href="/admin/woloo/attributes/add">
            <Button>
              <Plus className="w-4 h-4 mr-2" />Add Attribute
            </Button>
          </Link>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Attributes</CardTitle>
          <div className="relative">
            <input
              type="text"
              placeholder="Search attributes..."
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
              {attributeTable.getHeaderGroups().map((headerGroup) => (
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
              {attributeTable.getRowModel().rows.map((row) => (
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

export default WolooAttributeList;
