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
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { fetchCampaign, deleteCampaign } from "@/lib/api"; // you should implement these
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Copy } from "lucide-react";
const CampaignList = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();
 const [filterStatus, setFilterStatus] = useState<string>("all");
     const [searchTerm, setSearchTerm] = useState("");
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
       setFilterStatus(e.target.value);
     };
  const fetchData = async (page = 1, size = 50, status = "all",search = "") => {
    try {
      const { data, pagination } = await fetchCampaign(page, size, status,search);
      setCampaigns(data);
      setTotalPages(pagination.totalPages);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  useEffect(() => {
    fetchData(pagination.pageIndex + 1, pagination.pageSize,filterStatus,searchTerm);
  }, [pagination.pageIndex, pagination.pageSize,,filterStatus,searchTerm]);

  const handleDelete = async (campaign: any) => {
    try {
      await deleteCampaign(campaign.id);
      toast({
        title: "Deleted",
        description: `Campaign "${campaign.campaign_name}" deleted successfully.`,
      });
      fetchData(pagination.pageIndex + 1, pagination.pageSize);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "sno",
      header: "S.No",
      cell: (info) => info.row.index + 1,
    },
    {
      accessorKey: "campaign_name",
      header: "Campaign Name",
    },
    {
      accessorKey: "category.name",
      header: "Category",
      cell: ({ row }) => row.original.category?.name || "N/A",
    },
    {
      accessorKey: "subcategory.name",
      header: "Subcategory",
      cell: ({ row }) => row.original.subcategory?.name || "N/A",
    },
    {
      accessorKey: "rateCard",
      header: "Rate Card Details",
      cell: ({ row }) => {
        const rateCard = row.original.rateCard;
        if (!rateCard) return "N/A";

        const attributes =
          rateCard.attributes?.map(
            (attr: any) =>
              `${attr.filterAttribute?.name || "Unknown"}: ${attr.filterOption?.value || "N/A"}`
          ) || [];

        return (
          <div>
            <p>
              <strong>Rate Card ID:</strong> {rateCard.id}
            </p>
            {attributes.length > 0 && (
              <div>
                <strong>Attributes:</strong>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {attributes.map((attr: string, i: number) => (
                    <li key={i}>{attr}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      },
    },
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
      accessorKey: "firebase_url",
      header: "Utm Firebase Url",
      size: 100,
      cell: ({ row }) => {
        const url = row.getValue("firebase_url") as string;  
        const handleCopy = () => {
          navigator.clipboard.writeText(url);
          toast({
            variant: "success", title: "Success",
            description: `Campaign link copied successfully.`,
          });        };
  
        return (
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-1" /> Copy
          </Button>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                Confirm Deletion
                <p>Delete campaign "{row.original.campaign_name}"?</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="secondary" onClick={() => handleDelete(row.original)}>
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

  const table = useReactTable({
    data: campaigns,
    columns,
    state: { pagination },
    pageCount: totalPages,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="p-4">
     <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">UTM List</h1>
        <div className="flex space-x-2">
          <select value={filterStatus} onChange={handleStatusChange} className="border p-2 rounded">
            <option value="">All</option>
            <option value="1">Active</option>
            <option value="0">Deactivated</option>
            <option value="2">Deleted</option>
          </select>
          
          
          <Link href="/admin/campaign/add">
            <Button><Plus className="w-4 h-4 mr-2" />Add UTM</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
         <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
                  <CardHeader className="flex flex-row items-center justify-between gap-4">
                              <CardTitle className="text-xl text-gray-800">Campaign</CardTitle>
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
        
                  <CardContent className="overflow-x-auto"></CardContent>
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
                <TableCell colSpan={columns.length} className="text-center py-4">
                  No campaigns found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </Card>

        <div className="flex justify-between items-center p-4">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span>
            Page {pagination.pageIndex + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignList;
