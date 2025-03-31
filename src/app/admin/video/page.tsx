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
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import { fetchServiceVideosAll, deleteServiceVideo } from '@/lib/api'; // Import video API functions
import Link from 'next/link';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast";

const ServiceVideoList = () => {
    const [serviceVideos, setServiceVideos] = useState<any[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const { toast } = useToast();

    const fetchServiceVideosData = async (page = 1, size = 50) => {
        try {
            const { data, meta } = await fetchServiceVideosAll(page, size); // Call fetchServiceVideos
            setServiceVideos(data);
            setTotalPages(meta.totalPages);
            setTotalItems(meta.totalItems);
            setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
        } catch (error) {
            console.error('Error fetching service videos:', error);
        }
    };

    useEffect(() => {
        fetchServiceVideosData(pagination.pageIndex + 1, pagination.pageSize);
    }, [pagination.pageIndex, pagination.pageSize]);

    const handleServiceVideoDelete = async (serviceVideoId: string) => {
        try {
            await deleteServiceVideo(serviceVideoId);
            toast({
                title: 'Success',
                description: 'Service video deleted successfully',
                variant: 'success',
            });
            fetchServiceVideosData(pagination.pageIndex + 1, pagination.pageSize);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete service video',
                variant: 'destructive',
            });
        }
    };

    const serviceVideoColumns: ColumnDef<any>[] = [
        {
            accessorKey: "sno",
            header: "S.No",
            cell: (info) => info.row.index + 1,
        },
        { accessorKey: 'video_url', header: 'Video URL', cell: ({ row }) => {
            const videoUrl = row.original.video_url;

            if (videoUrl) {
              return (
                <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                  {videoUrl.length > 50 ? `${videoUrl.substring(0, 50)}...` : videoUrl} {/* Truncate if too long */}
                </a>
              );
            } else {
              return "No URL";
            }
          } },
        { accessorKey: 'category.name', header: 'Category' },
        { accessorKey: 'subcategory.name', header: 'Subcategory' },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => {
                const statusValue = row.original.is_active;

                let statusLabel = "";
                let statusClass = "";

                switch (statusValue) {
                    case true:
                        statusLabel = "Active";
                        statusClass = "bg-green-200 text-green-800";
                        break;
                    case false:
                        statusLabel = "Inactive";
                        statusClass = "bg-yellow-200 text-yellow-800";
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
                        <Link href={`/admin/video/edit/${row.original.id}`} passHref>
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
                                <p>Are you sure you want to delete this service video?</p>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <Button variant="secondary" onClick={() => handleServiceVideoDelete(row.original.id)}>
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

    const serviceVideoTable = useReactTable({
        data: serviceVideos,
        columns: serviceVideoColumns,
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
                    <h1 className="text-3xl font-bold text-gray-900">Service Video List</h1>
                    <Button asChild variant="default" className="flex items-center space-x-2">
                        <Link href="/admin/video/add">
                            <Plus className="w-4 h-4 mr-1" />
                            <span>Add Video</span>
                        </Link>
                    </Button>
                </div>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
                    <CardHeader className="border-b border-gray-100 pb-4">
                        <CardTitle className="text-xl text-gray-800">Service Videos</CardTitle>
                    </CardHeader>

                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                {serviceVideoTable.getHeaderGroups().map((headerGroup) => (
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
                                {serviceVideoTable.getRowModel().rows.length ? (
                                    serviceVideoTable.getRowModel().rows.map((row) => (
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
                                        <TableCell colSpan={serviceVideoColumns.length} className="h-24 text-center">
                                            No service videos found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>

                   
                    <div className="flex justify-between items-center p-4">
                        <Button
                            variant="outline"
                            onClick={() => serviceVideoTable.previousPage()}
                            disabled={!serviceVideoTable.getCanPreviousPage()}
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
                            onClick={() => serviceVideoTable.nextPage()}
                            disabled={!serviceVideoTable.getCanNextPage()}
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

  export default ServiceVideoList;
