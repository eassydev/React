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
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus } from "lucide-react";
import { fetchOnboardings, deleteOnboarding } from "@/lib/api";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const OnboardingList = () => {
  const [onboardings, setOnboardings] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const { toast } = useToast();

  // Fetch onboardings from the backend with pagination
  const fetchOnboardingsData = async (page = 1, size = 5) => {
    try {
      const { data, meta } = await fetchOnboardings(page, size); // Adjust API function
      setOnboardings(data);
      setTotalPages(meta.totalPages);
      setTotalItems(meta.totalItems);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error("Error fetching onboardings:", error);
    }
  };

  useEffect(() => {
    fetchOnboardingsData(pagination.pageIndex + 1, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleOnboardingDelete = async (onboarding: any) => {
    try {
      await deleteOnboarding(onboarding.id); // Adjust delete API function
      toast({
        title: "Success",
        description: `Onboarding "${onboarding.title}" deleted successfully`,
        variant: "success",
      });
      fetchOnboardingsData(pagination.pageIndex + 1, pagination.pageSize);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete onboarding: ${error}`,
        variant: "destructive",
      });
    }
  };

  const onboardingColumns: ColumnDef<any>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "title", header: "Title" },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ getValue }) => {
        const rawDescription = getValue() as string;
    
        // Function to strip HTML tags
        const stripHtmlTags = (html: string) => {
          const doc = new DOMParser().parseFromString(html, "text/html");
          return doc.body.textContent || "";
        };
    
        const plainText = stripHtmlTags(rawDescription);
    
        return (
          <span>
            {plainText.length > 50 ? `${plainText.slice(0, 50)}...` : plainText}
          </span>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: (info) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            info.getValue() ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
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
            <Link href={`/admin/onboarding/edit/${row.original.id}`} passHref>
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
                <p>Are you sure you want to delete onboarding: {row.original.title}?</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="secondary" onClick={() => handleOnboardingDelete(row.original)}>
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

  const onboardingTable = useReactTable({
    data: onboardings,
    columns: onboardingColumns,
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
          <h1 className="text-3xl font-bold text-gray-900">Onboarding List</h1>
          <Button asChild variant="default" className="flex items-center space-x-2">
            <Link href="/admin/onboarding/add">
              <Plus className="w-4 h-4 mr-1" />
              <span>Add Onboarding</span>
            </Link>
          </Button>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xl text-gray-800">Onboardings</CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                {onboardingTable.getHeaderGroups().map((headerGroup) => (
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
                {onboardingTable.getRowModel().rows.length ? (
                  onboardingTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={onboardingColumns.length} className="h-24 text-center">
                      No onboardings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              onClick={() => onboardingTable.previousPage()}
              disabled={!onboardingTable.getCanPreviousPage()}
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
              onClick={() => onboardingTable.nextPage()}
              disabled={!onboardingTable.getCanNextPage()}
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

export default OnboardingList;
