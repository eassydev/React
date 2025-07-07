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
import { ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { fetchCarts, deleteCart, exportLiveCart } from '@/lib/api';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Theme css

const CartList = () => {
  const [carts, setCarts] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { toast } = useToast();

  const fetchCartData = async (page = 1, size = 50) => {
    try {
      const { data, meta } = await fetchCarts(page, size);
      setCarts(data);
      setTotalPages(meta.totalPages);
      setTotalItems(meta.totalItems);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error('Error fetching carts:', error);
    }
  };

  useEffect(() => {
    fetchCartData(pagination.pageIndex + 1, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleCartDelete = async (cart: any) => {
    try {
      await deleteCart(cart.id);
      toast({
        title: 'Success',
        description: `Cart ID "${cart.id}" deleted successfully.`,
        variant: 'success',
      });
      fetchCartData(pagination.pageIndex + 1, pagination.pageSize);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete cart: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const startDate = dateRange[0].startDate.toISOString().split('T')[0];
      const endDate = dateRange[0].endDate.toISOString().split('T')[0];
      await exportLiveCart(startDate, endDate);
      setIsExporting(true);
    } catch (error: any) {
      console.error('Error exporting categories:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const cartColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'sno', // Placeholder key for S.No
      header: 'S.No',
      cell: (info) => info.row.index + 1, // Calculate the serial number dynamically
    },
    {
      accessorKey: 'user.first_name',
      header: 'User Name',
      cell: ({ row }) => {
        const user = row.original.user;
        return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'N/A';
      },
    },
    {
      accessorKey: 'provider.first_name',
      header: 'Provider Name',
      cell: ({ row }) => {
        const provider = row.original.provider;
        return provider ? `${provider.first_name || ''} ${provider.last_name || ''}`.trim() : 'N/A';
      },
    },
    { accessorKey: 'service_type', header: 'Service Type' },
    {
      accessorKey: 'service',
      header: 'Service',
      cell: ({ row }) => {
        const rateCard = row.original.rateCard;
        if (!rateCard) return 'N/A';

        const categoryName = rateCard.category?.name || 'Unknown Category';
        const subcategoryName = rateCard.subcategory?.name || 'Unknown Subcategory';

        // Extract filter attributes
        const attributes =
          rateCard.attributes?.map(
            (attr: any) =>
              `${attr.filterAttribute?.name || 'Unknown'}: ${attr.filterOption?.value || 'N/A'}`
          ) || [];

        return (
          <div className="space-y-1">
            <p>
              <span className="font-bold">Category:</span> {categoryName}
            </p>
            <p>
              <span className="font-bold">Subcategory:</span> {subcategoryName}
            </p>
            {attributes.length > 0 && (
              <div>
                <span className="font-bold">Attributes:</span>
                <ul className="list-disc list-inside">
                  {attributes.map((attr: any, index: any) => (
                    <li key={index} className="text-sm text-gray-600">
                      {attr}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      },
    },

    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => row.original.quantity || 'N/A',
    },
    {
      accessorKey: 'total_price',
      header: 'Total Price',
      cell: ({ row }) =>
        row.original.total_price !== undefined ? `₹${row.original.total_price}` : 'N/A',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Link href={`/admin/carts/edit/${row.original.id}`} passHref>
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
                <p>Are you sure you want to delete cart ID: {row.original.id}?</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="secondary" onClick={() => handleCartDelete(row.original)}>
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

  const cartTable = useReactTable({
    data: carts,
    columns: cartColumns,
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
          <h1 className="text-3xl font-bold text-gray-900">Cart List</h1>
          {isCalendarOpen && (
            <div
              className="absolute z-50 bg-white shadow-lg mt-2"
              style={{
                top: '20%',
                left: '40%',
                right: '0',
                maxWidth: '500px',
                margin: 'auto',
              }}
            >
              <DateRange
                ranges={dateRange}
                months={2} // Allow 2 months to be visible
                direction="horizontal" // Arrange months horizontally
                onChange={(ranges: any) => {
                  const selectedRange = ranges.selection;
                  setDateRange([selectedRange]);
                  if (selectedRange.startDate && selectedRange.endDate) {
                    setIsCalendarOpen(false); // Close calendar when end date is selected
                  }
                }}
                rangeColors={['#4A90E2']}
              />
            </div>
          )}
          <div className="relative space-x-6">
            <input
              type="text"
              className="border rounded px-2 py-1"
              value={`${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`}
              onClick={() => setIsCalendarOpen((prev) => !prev)}
              readOnly
            />

            <Button variant="default" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <div className="flex items-center">
                  <span className="loader mr-2"></span> Exporting...
                </div>
              ) : (
                'Export to XLS'
              )}
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xl text-gray-800">Carts</CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                {cartTable.getHeaderGroups().map((headerGroup) => (
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
                {cartTable.getRowModel().rows.length ? (
                  cartTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={cartColumns.length} className="h-24 text-center">
                      No carts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              onClick={() => cartTable.previousPage()}
              disabled={!cartTable.getCanPreviousPage()}
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
              onClick={() => cartTable.nextPage()}
              disabled={!cartTable.getCanNextPage()}
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

export default CartList;
