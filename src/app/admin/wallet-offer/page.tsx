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
import { fetchWalletOffers, deleteWalletOffer } from '@/lib/api';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const WalletOfferList = () => {
  const [walletOffers, setWalletOffers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const { toast } = useToast();

  // Fetch wallet offers with pagination
  const fetchWalletOffersData = async (page = 1, size = 50) => {
    try {
      const { data, meta } = await fetchWalletOffers(page, size);
      setWalletOffers(data);
      setTotalPages(meta.totalPages);
      setTotalItems(meta.totalItems);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch wallet offers.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchWalletOffersData(pagination.pageIndex + 1, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleOfferDelete = async (offer: any) => {
    try {
      await deleteWalletOffer(offer.id);
      toast({
        title: 'Success',
        description: `Offer "${offer.event_type}" deleted successfully.`,
        variant: 'success',
      });
      fetchWalletOffersData(pagination.pageIndex + 1, pagination.pageSize);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete wallet offer.',
        variant: 'destructive',
      });
    }
  };

  const walletOfferColumns: ColumnDef<any>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'event_type', header: 'Event Type' },
    { accessorKey: 'es_cash', header: 'ES Cash' },
    { accessorKey: 'start_date', header: 'Start Date' },
    { accessorKey: 'end_date', header: 'End Date' },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: (info) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            info.getValue() ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}
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
            <Link href={`/admin/wallet-offer/edit/${row.original.id}`} passHref>
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
                <p>Are you sure you want to delete offer: {row.original.event_type}?</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="secondary" onClick={() => handleOfferDelete(row.original)}>
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

  const walletOfferTable = useReactTable({
    data: walletOffers,
    columns: walletOfferColumns,
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
          <h1 className="text-3xl font-bold text-gray-900">Wallet Offer List</h1>
          <Button asChild variant="default" className="flex items-center space-x-2">
            <Link href="/admin/wallet-offer/add">
              <Plus className="w-4 h-4 mr-1" />
              <span>Add Offer</span>
            </Link>
          </Button>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xl text-gray-800">Wallet Offers</CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                {walletOfferTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-left">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {walletOfferTable.getRowModel().rows.length ? (
                  walletOfferTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={walletOfferColumns.length} className="h-24 text-center">
                      No wallet offers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              onClick={() => walletOfferTable.previousPage()}
              disabled={!walletOfferTable.getCanPreviousPage()}
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
              onClick={() => walletOfferTable.nextPage()}
              disabled={!walletOfferTable.getCanNextPage()}
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

export default WalletOfferList;
