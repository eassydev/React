"use client";

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
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, Download, Copy, Printer } from 'lucide-react';
import { fetchRateCards,downloadSampleCSV, deleteRateCard, exportRatecard } from '@/lib/api';
import Link from 'next/link';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast";

const RateCardList = () => {
  const [rateCards, setRateCards] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const fetchRateCardsData = async (page = 1, size = 50, status = "all") => {
    try {
      const { data, meta } = await fetchRateCards(page, size, filterStatus);
      setRateCards(data);
      setTotalPages(meta.totalPages);
      setTotalItems(meta.totalItems);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error('Error fetching rate cards:', error);
    }
  };

  useEffect(() => {
    fetchRateCardsData(pagination.pageIndex + 1, pagination.pageSize, filterStatus);
  }, [pagination.pageIndex, pagination.pageSize, filterStatus]);

  const handleRateCardDelete = async (rateCardId: number) => {
    try {
      await deleteRateCard(rateCardId.toString());
      toast({
        title: 'Success',
        description: 'Rate Card deleted successfully',
        variant: 'success',
      });
      fetchRateCardsData(pagination.pageIndex + 1, pagination.pageSize);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete rate card',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportRatecard();
     
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export rate cards',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSampleExport = async () => {
    try {
      await   downloadSampleCSV();
    } catch (error) {
     
    } finally {
    }
  };



  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

    const handlePrint = () => {
      const printableContent = rateCards
        .map((item) => `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.status}</td></tr>`)
        .join("");
      const newWindow = window.open("", "_blank");
      newWindow?.document.write(`
        <html>
          <head>
            <title>Print Categories</title>
            <style>
              table { width: 100%; border-collapse: collapse; }
              td, th { border: 1px solid black; padding: 8px; text-align: left; }
            </style>
          </head>
          <body>
            <h1>Categories</h1>
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Status</th></tr></thead>
              <tbody>${printableContent}</tbody>
            </table>
          </body>
        </html>
      `);
      newWindow?.print();
    };
  
    const handleCopy = () => {
      const formattedData = rateCards.map((item) => `${item.id}, ${item.name}, ${item.status}`).join("\n");
      navigator.clipboard.writeText(formattedData);
      toast({ title: "Copied to Clipboard", description: "Category data copied." });
    };
  
    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value) }));
    };
  

  const rateCardColumns: ColumnDef<any>[] = [
    {
      accessorKey: "sno", // Placeholder key for S.No
      header: "S.No",
      cell: (info) => info.row.index + 1, // Calculate the serial number dynamically
    },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'category_name', header: 'Category' },
    { accessorKey: 'subcategory_name', header: 'Subcategory' },
    { accessorKey: 'price', header: 'Price' },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => {
        const statusValue = row.original.active;

        let statusLabel = "";
        let statusClass = "";

        switch (statusValue) {
          case 1:
            statusLabel = "Active";
            statusClass = "bg-green-200 text-green-800";
            break;
          case 0:
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
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Link href={`/admin/rate-card/edit/${row.original.id}`} passHref>
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
                <p>Are you sure you want to delete this rate card?</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="secondary" onClick={() => handleRateCardDelete(row.original.id)}>
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

  const rateCardTable = useReactTable({
    data: rateCards,
    columns: rateCardColumns,
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
          <h1 className="text-3xl font-bold text-gray-900">Rate Card List</h1>
          <div className="flex space-x-2">
            <select value={filterStatus} onChange={handleStatusChange} className="border p-2 rounded">
                       <option value="">All</option>
                       <option value="0">Active</option>
                       <option value="1">Deactivated</option>
                       <option value="2">Deleted</option>
                     </select>
                     <select value={pagination.pageSize} onChange={handlePageSizeChange} className="border p-2 rounded">
                       <option value={50}>50</option>
                       <option value={100}>100</option>
                       <option value={150}>150</option>
                     </select>
                     <Button onClick={handleExport}><Download className="w-4 h-4 mr-2" />Export</Button>
                     <Button onClick={handleCopy}><Copy className="w-4 h-4 mr-2" />Copy</Button>
            <Button asChild variant="default" className="flex items-center space-x-2">
              <Link href="/admin/rate-card/add">
                <Plus className="w-4 h-4 mr-1" />
                <span>Add Rate Card</span>
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xl text-gray-800">Rate Cards</CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto">
          <Button className="mx-2" onClick={handleSampleExport}><span>Sample CSV</span></Button>
            <Button >
  <Link href="/admin/rate-card/import">Import</Link>
</Button>
<Button   className="mx-2">
  <Link  href="/admin/rate-card/update-batch">Update in Batch</Link>
</Button>
            <Table>
              <TableHeader>
                {rateCardTable.getHeaderGroups().map((headerGroup) => (
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
                {rateCardTable.getRowModel().rows.length ? (
                  rateCardTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={rateCardColumns.length} className="h-24 text-center">
                      No rate cards found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              onClick={() => rateCardTable.previousPage()}
              disabled={!rateCardTable.getCanPreviousPage()}
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
              onClick={() => rateCardTable.nextPage()}
              disabled={!rateCardTable.getCanNextPage()}
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

export default RateCardList;
