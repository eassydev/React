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
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import { fetchRatecardBogo, deleteRatecardBogo } from '@/lib/api'; // Fetch and delete BogoRateCard functions
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const BogoRateCardList = () => {
  const [bogoRateCards, setBogoRateCards] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Manage Alert visibility
  const [selectedBogoRateCard, setSelectedBogoRateCard] = useState<any>(null); // Track selected BogoRateCard for deletion

  const { toast } = useToast();

  const fetchBogoRateCardsData = async (page = 1, size = 50) => {
    try {
      const { data, meta } = await fetchRatecardBogo(page, size);
      setBogoRateCards(data);
      setTotalPages(meta.totalPages);
      setTotalItems(meta.totalItems);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error('Error fetching BogoRateCards:', error);
    }
  };

  useEffect(() => {
    fetchBogoRateCardsData(pagination.pageIndex + 1, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleBogoRateCardDelete = async (bogoRateCard: any) => {
    try {
      await deleteRatecardBogo(bogoRateCard.id);
      toast({
        title: 'Success',
        description: `BogoRateCard "${bogoRateCard.name}" deleted successfully`,
        variant: 'success',
      });
      fetchBogoRateCardsData(pagination.pageIndex + 1, pagination.pageSize);
      setIsDialogOpen(false); // Close the dialog
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete BogoRateCard: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const bogoRateCardColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'sno', // Placeholder key for S.No
      header: 'S.No',
      cell: (info) => info.row.index + 1, // Calculate the serial number dynamically
    },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'rate_card_id', header: 'Rate Card ID' },
    { accessorKey: 'bogo_rate_card_id', header: 'Bogo Rate Card ID' },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: (info) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${info.getValue() ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
        >
          {info.getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Link href={`/admin/bogo/edit/${row.original.id}`} passHref>
              <Edit className="w-4 h-4 text-blue-600" />
            </Link>
          </Button>
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedBogoRateCard(row.original);
                  setIsDialogOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <h2 className="text-xl font-bold">Confirm Delete</h2>
                <p>Are you sure you want to delete BogoRateCard: {selectedBogoRateCard?.name}?</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => handleBogoRateCardDelete(selectedBogoRateCard)}
                >
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

  const bogoRateCardTable = useReactTable({
    data: bogoRateCards,
    columns: bogoRateCardColumns,
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
          <h1 className="text-3xl font-bold text-gray-900">BogoRateCard List</h1>
          <Button asChild variant="default" className="flex items-center space-x-2">
            <Link href="/admin/bogo/add">
              <Plus className="w-4 h-4 mr-1" />
              <span>Add BogoRateCard</span>
            </Link>
          </Button>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xl text-gray-800">BogoRateCards</CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                {bogoRateCardTable.getHeaderGroups().map((headerGroup) => (
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
                {bogoRateCardTable.getRowModel().rows.length ? (
                  bogoRateCardTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={bogoRateCardColumns.length} className="h-24 text-center">
                      No BogoRateCards found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              onClick={() => bogoRateCardTable.previousPage()}
              disabled={!bogoRateCardTable.getCanPreviousPage()}
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
              onClick={() => bogoRateCardTable.nextPage()}
              disabled={!bogoRateCardTable.getCanNextPage()}
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

export default BogoRateCardList;
