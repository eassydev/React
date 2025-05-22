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
import { ChevronLeft, ChevronRight, Edit, Download } from "lucide-react";
import { fetchPayoutsDetailed } from "@/lib/api";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface SpPayout {
  id: string;
  provider_id: string;
  provider_name: string;
  service_amount: number;
  commission_rate: number;
  commission_amount: number;
  base_tcs: number;
  base_tds: number;
  base_payable: number;
  total_payable: number;
  remaining_amount: number;
  settled_amount: number;
  payout_status: string;
  scheduled_transfer: string;
  allow_transfer: string;
  razorpay_transfer_id: string;
  notes: string;
  created_at: number;
  updated_at: number;
  bookingItem: {
    id: number;
    order_id: string;
    rate_card_id: number;
    service_date: string;
    service_time: string;
    status: string;
    rateCard: {
      id: number;
      name: string;
      price: number;
      category_id: number;
      subcategory_id: number;
      category: {
        id: number;
        name: string;
      };
      subcategory: {
        id: number;
        name: string;
      };
      attributes: Array<{
        id: number;
        filter_attribute_id: number;
        filter_option_id: number;
        filterAttribute: {
          id: number;
          name: string;
          title: string;
        };
        filterOption: {
          id: number;
          value: string;
          title: string;
        };
      }>;
    };
  };
}

export default function SpPayoutPage() {
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<SpPayout[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPayouts = async () => {
      setIsLoading(true);
      try {
        const response = await fetchPayoutsDetailed(
          pagination.pageIndex + 1,
          pagination.pageSize
        );
        setPayouts(response.data);
        setTotalPages(response.meta.totalPages);
      } catch (error) {
        console.error("Error fetching payouts:", error);
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to fetch payout details.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayouts();
  }, [pagination, toast]);

  // const handleExport = async () => {
  //   try {
  //     await exportPayoutsToExcel();
  //     toast({
  //       title: "Success",
  //       description: "Payouts exported successfully.",
  //     });
  //   } catch (error) {
  //     console.error("Error exporting payouts:", error);
  //     toast({
  //       variant: "error",
  //       title: "Error",
  //       description: "Failed to export payouts.",
  //     });
  //   }
  // };

  const payoutColumns: ColumnDef<SpPayout>[] = [
    {
      accessorKey: "sno",
      header: "S.No",
      cell: (info) => info.row.index + 1,
    },
    { 
      accessorKey: "id", 
      header: "Payout ID",
    },
    { 
      accessorKey: "provider_name", 
      header: "Provider Name",
    },
    {
      header: "Services",
      cell: ({ row }) => {
        const payout = row.original;
        const rateCard = payout.bookingItem?.rateCard;
        
        if (!rateCard) return "N/A";
        
        const attributes = rateCard.attributes?.map(attr => {
          const attrName = attr.filterAttribute?.title || attr.filterAttribute?.name || "Unknown";
          const attrValue = attr.filterOption?.title || attr.filterOption?.value || "N/A";
          return `${attrName}: ${attrValue}`;
        }).join("\n") || "None";
        
        return (
          <div className="whitespace-pre-line text-sm">
            <strong>Service:</strong> {rateCard.name}<br />
            <strong>Price:</strong> ₹{rateCard.price}<br />
            <strong>Category:</strong> {rateCard.category?.name || "N/A"}<br />
            <strong>Subcategory:</strong> {rateCard.subcategory?.name || "N/A"}<br />
            <strong>Attributes:</strong><br />
            {attributes}
          </div>
        );
      },
    },
    { 
      accessorKey: "service_amount", 
      header: "Service Amount",
      cell: (info) => `₹${info.getValue<number>()}`,
    },
    { 
      accessorKey: "commission_rate", 
      header: "Commission Rate",
      cell: (info) => `${info.getValue<number>()}%`,
    },
    { 
      accessorKey: "commission_amount", 
      header: "Commission Amount",
      cell: (info) => `₹${info.getValue<number>()}`,
    },
    { 
      accessorKey: "base_tcs", 
      header: "TCS",
      cell: (info) => `₹${info.getValue<number>()}`,
    },
    { 
      accessorKey: "base_tds", 
      header: "TDS",
      cell: (info) => `₹${info.getValue<number>()}`,
    },
    { 
      accessorKey: "base_payable", 
      header: "Base Payable",
      cell: (info) => `₹${info.getValue<number>()}`,
    },
    { 
      accessorKey: "total_payable", 
      header: "Total Payable",
      cell: (info) => `₹${info.getValue<number>()}`,
    },
    { 
      accessorKey: "remaining_amount", 
      header: "Remaining Amount",
      cell: (info) => `₹${info.getValue<number>()}`,
    },
    { 
      accessorKey: "settled_amount", 
      header: "Settled Amount",
      cell: (info) => `₹${info.getValue<number>()}`,
    },
    { 
      accessorKey: "payout_status", 
      header: "Status",
      cell: (info) => {
        const status = info.getValue<string>();
        let bgColor = "bg-gray-100";
        let textColor = "text-gray-600";
        
        if (status === "Paid") {
          bgColor = "bg-green-100";
          textColor = "text-green-600";
        } else if (status === "Partially Paid") {
          bgColor = "bg-yellow-100";
          textColor = "text-yellow-600";
        } else if (status === "Not Initiated") {
          bgColor = "bg-red-100";
          textColor = "text-red-600";
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            {status}
          </span>
        );
      },
    },
    { 
      accessorKey: "scheduled_transfer", 
      header: "Scheduled Transfer",
      cell: (info) => {
        const date = info.getValue<string>();
        return date ? format(new Date(date), "dd/MM/yyyy") : "N/A";
      },
    },
    { 
      accessorKey: "allow_transfer", 
      header: "Allow Transfer",
      cell: (info) => info.getValue<string>(),
    },
    { 
      accessorKey: "razorpay_transfer_id", 
      header: "Razorpay Transfer ID",
      cell: (info) => info.getValue<string>() || "N/A",
    },
    { 
      accessorKey: "notes", 
      header: "Notes",
      cell: (info) => info.getValue<string>() || "N/A",
    },
    { 
      accessorKey: "created_at", 
      header: "Created At",
      cell: (info) => {
        const timestamp = info.getValue<number>();
        return timestamp ? format(new Date(timestamp * 1000), "dd/MM/yyyy HH:mm") : "N/A";
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Link href={`/admin/sp-payout/edit/${row.original.id}`} passHref>
              <Edit className="w-4 h-4 text-blue-600" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  const payoutTable = useReactTable({
    data: payouts,
    columns: payoutColumns,
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
          <h1 className="text-3xl font-bold text-gray-900">SP Payout Details</h1>
          {/* <Button onClick={handleExport} className="flex items-center space-x-2">
            <Download className="w-4 h-4 mr-1" />
            <span>Export</span>
          </Button> */}
        </div>

        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-800">All Payouts</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading payouts...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  {payoutTable.getHeaderGroups().map((headerGroup) => (
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
                  {payoutTable.getRowModel().rows.length ? (
                    payoutTable.getRowModel().rows.map((row) => (
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
                      <TableCell colSpan={payoutColumns.length} className="h-24 text-center">
                        No payouts found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {pagination.pageIndex + 1} of {totalPages || 1}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                  disabled={pagination.pageIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                  disabled={pagination.pageIndex + 1 >= totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
