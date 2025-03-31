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
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  Download,
  Copy,
} from "lucide-react";
import {
  fetchAllStaff,
  deleteStaff,
  exportStaff,
} from "@/lib/api"; // Update the API imports
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const StaffList = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const fetchStaffData = async (page = 1, size = 5, status = "all") => {
    try {
      const { data, meta } = await fetchAllStaff("", page, size, filterStatus);
      setStaff(data);
      setTotalPages(meta.totalPages);
      setTotalItems(meta.totalItems);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch staff.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStaffData(pagination.pageIndex + 1, pagination.pageSize, filterStatus);
  }, [pagination.pageIndex, pagination.pageSize, filterStatus]);

  const handleStaffDelete = async (staffMember: any) => {
    try {
      await deleteStaff(staffMember.id);
      toast({
        title: "Success",
        description: `Staff "${staffMember.first_name} ${staffMember.last_name}" deleted successfully`,
        variant: "success",
      });
      fetchStaffData(pagination.pageIndex + 1, pagination.pageSize, filterStatus);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete staff.",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportStaff();
      toast({
        title: "Success",
        description: "Staff data exported successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export staff data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = () => {
    const formattedData = staff
      .map((item) => `${item.id}, ${item.first_name}, ${item.active}`)
      .join("\n");
    navigator.clipboard.writeText(formattedData);
    toast({
      title: "Copied to Clipboard",
      description: "Staff data copied.",
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value) }));
  };

  const staffColumns: ColumnDef<any>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "first_name", header: "First Name" },
    { accessorKey: "last_name", header: "Last Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => {
        const statusValue = row.original.active;

        let statusLabel = "";
        let statusClass = "";

        switch (statusValue) {
          case 0:
            statusLabel = "Active";
            statusClass = "bg-green-200 text-green-800";
            break;
          case 1:
            statusLabel = "Inactive";
            statusClass = "bg-yellow-200 text-yellow-800";
            break;
          case 2:
            statusLabel = "Deleted";
            statusClass = "bg-red-200 text-red-800";
            break;
          default:
            statusLabel = "Unknown";
            statusClass = "bg-gray-200 text-gray-800";
            break;
        }

        return <span className={`badge px-2 py-1 rounded ${statusClass}`}>{statusLabel}</span>;
      },
    },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        {/* Edit Button */}
        <Button variant="ghost" size="icon">
          <Link href={`/admin/staff/edit/${row.original.id}`} passHref>
            <Edit className="w-4 h-4 text-blue-600" />
          </Link>
        </Button>
  
        {/* Bank Icon for Redirect */}
        <Button variant="ghost" size="icon">
          <Link href={`/admin/provider/${row.original.id}/account`} passHref>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-green-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10.5V12a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 12v-1.5m-18 0h18m-18 0a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 10.5m-18 0a2.25 2.25 0 00-2.25-2.25h13.5A2.25 2.25 0 0021 10.5M9.75 15v6m-3-6v6m9-6v6m-3-6v6"
              />
            </svg>
          </Link>
        </Button>
  
        {/* Delete Button */}
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
                Are you sure you want to delete staff: {row.original.first_name}{" "}
                {row.original.last_name}?
              </p>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                variant="secondary"
                onClick={() => handleStaffDelete(row.original)}
              >
                Yes, Delete
              </Button>
              <Button variant="outline">Cancel</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    ),
  }
  
  ];

  const staffTable = useReactTable({
    data: staff,
    columns: staffColumns,
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
          <h1 className="text-3xl font-bold text-gray-900">Staff List</h1>
          <div className="flex space-x-2">
            <select
              value={filterStatus}
              onChange={handleStatusChange}
              className="border p-2 rounded"
            >
              <option value="">All</option>
              <option value="0">Active</option>
              <option value="1">Inactive</option>
              <option value="2">Deleted</option>
            </select>
            <select
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              className="border p-2 rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            <Button onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
            <Button asChild variant="default" className="flex items-center space-x-2">
              <Link href="/admin/staff/add">
                <Plus className="w-4 h-4 mr-1" />
                <span>Add Staff</span>
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xl text-gray-800">Staff</CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                {staffTable.getHeaderGroups().map((headerGroup) => (
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
                {staffTable.getRowModel().rows.length ? (
                  staffTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={staffColumns.length} className="h-24 text-center">
                      No staff members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              onClick={() => staffTable.previousPage()}
              disabled={!staffTable.getCanPreviousPage()}
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
              onClick={() => staffTable.nextPage()}
              disabled={!staffTable.getCanNextPage()}
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

export default StaffList;
