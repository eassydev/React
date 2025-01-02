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
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, Download, Upload } from "lucide-react";
import {
  fetchAllSpHubs,
  deleteSpHub,
  exportSpHubsToXLS,
  importSpHubsFromCSV,
  downloadSampleSpHubExcel,
} from "@/lib/api";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const SpHubList = () => {
  const [spHubs, setSpHubs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [totalPages, setTotalPages] = useState(0);

  const { toast } = useToast();

  // Fetch SpHubs from backend with pagination
  const fetchSpHubsData = async (page = 1, size = 5) => {
    try {
      const { data, meta } = await fetchAllSpHubs(page, size);
      setSpHubs(data);
      setTotalPages(meta.totalPages);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error("Error fetching SpHubs:", error);
    }
  };

  useEffect(() => {
    fetchSpHubsData(pagination.pageIndex + 1, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleSpHubDelete = async (spHub: any) => {
    try {
      await deleteSpHub(spHub.id);
      toast({
        title: "Success",
        description: `SpHub deleted successfully`,
        variant: "success",
      });
      fetchSpHubsData(pagination.pageIndex + 1, pagination.pageSize);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete SpHub: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    try {
      await exportSpHubsToXLS();
      toast({
        title: "Success",
        description: "SpHubs exported successfully!",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export SpHubs.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (file: File) => {
    try {
      await importSpHubsFromCSV(file);
      toast({
        title: "Success",
        description: "SpHubs imported successfully!",
        variant: "success",
      });
      fetchSpHubsData(pagination.pageIndex + 1, pagination.pageSize);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message,
        variant: "destructive",
      });
    }
  };

  const handleDownloadSample = async () => {
    try {
      await downloadSampleSpHubExcel();
      toast({
        title: "Success",
        description: "Sample file downloaded successfully!",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download sample file.",
        variant: "destructive",
      });
    }
  };

  const spHubColumns: ColumnDef<any>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "hub.hub_name", header: "Hub Name" },
    { accessorKey: "city.name", header: "City" },
    { accessorKey: "category.name", header: "Category" },
    { accessorKey: "subcategory.name", header: "Subcategory" },
    { accessorKey: "staff", header: "Staff" },
    { accessorKey: "weightage", header: "Weightage" },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: (info) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${info.getValue() ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}
        >
          {info.getValue() ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Link href={`/admin/sp-hubs/edit/${row.original.id}`} passHref>
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
                <p>Are you sure you want to delete this SpHub?</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="secondary" onClick={() => handleSpHubDelete(row.original)}>
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

  const spHubTable = useReactTable({
    data: spHubs,
    columns: spHubColumns,
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
          <h1 className="text-3xl font-bold text-gray-900">SpHub List</h1>
          <div className="flex space-x-2">
            <Button asChild variant="default" className="flex items-center space-x-2">
              <Link href="/admin/sp-hubs/add">
                <Plus className="w-4 h-4 mr-1" />
                <span>Add SpHub</span>
              </Link>
            </Button>
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
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xl text-gray-800">SpHubs</CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                {spHubTable.getHeaderGroups().map((headerGroup) => (
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
                {spHubTable.getRowModel().rows.length ? (
                  spHubTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={spHubColumns.length} className="h-24 text-center">
                      No SpHubs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              onClick={() => spHubTable.previousPage()}
              disabled={!spHubTable.getCanPreviousPage()}
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
              onClick={() => spHubTable.nextPage()}
              disabled={!spHubTable.getCanNextPage()}
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

export default SpHubList;

