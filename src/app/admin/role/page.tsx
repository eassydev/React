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
import { fetchRoles, deleteRole, Role } from '@/lib/api';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const RoleList = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);

  const { toast } = useToast();

  // Fetch roles with pagination
  const loadRoles = async (page = 1, size = 50) => {
    try {
      const { data, meta } = await fetchRoles(page, size);
      setRoles(data);
      setTotalPages(meta.totalPages);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load roles.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadRoles(pagination.pageIndex + 1, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleDelete = async (role: Role) => {
    try {
      await deleteRole(role.id!.toString());
      toast({
        title: 'Success',
        description: `Role "${role.role_name}" deleted.`,
        variant: 'success',
      });
      loadRoles(pagination.pageIndex + 1, pagination.pageSize);
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error',
        description: 'Failed to delete role.',
        variant: 'destructive',
      });
    }
  };

  const roleColumns: ColumnDef<Role>[] = [
    {
      accessorKey: 'sno', // Placeholder key for S.No
      header: 'S.No',
      cell: (info) => info.row.index + 1, // Calculate the serial number dynamically
    },
    { accessorKey: 'role_name', header: 'Role Name' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Link href={`/admin/role/edit/${row.original.id}`}>
            <Button variant="ghost" size="icon">
              <Edit className="w-4 h-4 text-blue-600" />
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <h2 className="text-lg font-bold">Delete Role</h2>
                <p>Are you sure you want to delete "{row.original.role_name}"?</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button onClick={() => handleDelete(row.original)} variant="destructive">
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
    data: roles,
    columns: roleColumns,
    state: { pagination },
    pageCount: totalPages,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Roles List</h1>
          <Button asChild className="flex items-center space-x-2 bg-primary">
            <Link href="/admin/role/add">
              <Plus className="w-4 h-4 mr-2" />
              <span>Add Role</span>
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
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
                    <TableCell colSpan={roleColumns.length} className="text-center">
                      No roles found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>

            <span>
              Page {pagination.pageIndex + 1} of {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RoleList;
