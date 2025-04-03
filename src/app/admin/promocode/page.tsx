"use client";

import React, { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus } from "lucide-react";
import { fetchPromocodes, deletePromocode } from "@/lib/api";
import Link from "next/link";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const PromocodeList = () => {
  const [promocodes, setPromocodes] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
const [filterStatus, setFilterStatus] = useState<string>("all");
     const [searchTerm, setSearchTerm] = useState("");
 const [pagination, setPagination] = useState<PaginationState>({
     pageIndex: 0,
     pageSize: 50,
   });
  const { toast } = useToast();

   const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilterStatus(e.target.value);
    };

  // Fetch promocodes from backend with pagination
  const fetchPromocodesData = async (page = 1, size = 50, status = "all",search = "") => {
    try {
      const { data, totalPages } = await fetchPromocodes(page, size, status,search);
      setPromocodes(data);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Error fetching promocodes:", error);
    }
  };

  

   useEffect(() => {
    fetchPromocodesData(pagination.pageIndex + 1, pagination.pageSize,filterStatus,searchTerm);
    }, [pagination.pageIndex, pagination.pageSize,filterStatus,searchTerm]);
  
  const handlePromocodeDelete = async (promocode: any) => {
    try {
      await deletePromocode(promocode.id);
      toast({
        title: "Success",
        description: `Promocode "${promocode.code}" deleted successfully`,
        variant: "success",
      });
      fetchPromocodesData(currentPage);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete promocode: ${error}`,
        variant: "destructive",
      });
    }
  };

  const promocodeColumns: ColumnDef<any>[] = [
    {
      accessorKey: "sno",
      header: "S.No",
      cell: (info) => info.row.index + 1 + (currentPage - 1) * 5, // Adjust serial number based on page
    },
    { accessorKey: "code", header: "Code" },
    { accessorKey: "discount_type", header: "Discount Type" },
    { accessorKey: "discount_value", header: "Discount Value" },
    { accessorKey: "start_date", header: "Start Date" },
    { accessorKey: "end_date", header: "End Date" },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        console.log("status",status)
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
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Link href={`/admin/promocode/edit/${row.original.id}`} passHref>
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
                <p>Are you sure you want to delete promocode: {row.original.code}?</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="secondary" onClick={() => handlePromocodeDelete(row.original)}>
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

  const promocodeTable = useReactTable({
    data: promocodes,
    columns: promocodeColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Promocodes List</h1>
        <div className="flex space-x-2">
          <select value={filterStatus} onChange={handleStatusChange} className="border p-2 rounded">
            <option value="">All</option>
            <option value="1">Active</option>
            <option value="0">Deactivated</option>
            <option value="2">Deleted</option>
          </select>
          
          
          <Link href="/admin/promocode/add">
            <Button><Plus className="w-4 h-4 mr-2" />Add Promocode</Button>
          </Link>
        </div>
      </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
           <CardHeader className="flex flex-row items-center justify-between gap-4">
                                <CardTitle className="text-xl text-gray-800">Promocodes</CardTitle>
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
                {promocodeTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-left">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {promocodeTable.getRowModel().rows.length ? (
                  promocodeTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={promocodeColumns.length} className="h-24 text-center">
                      No promocodes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
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

export default PromocodeList;
