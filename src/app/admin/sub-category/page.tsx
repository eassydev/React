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
import {
  Download,
  Plus,
  Edit,
  Trash2,
  Printer,
  Copy,
} from "lucide-react";
import { fetchSubcategories, exportSubcategories, deleteSubcategory,downloadSampleSucategoryCSV } from "@/lib/api";
import Link from "next/link";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const SubcategoryList = () => {
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Manage Alert visibility
    const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();


  
  const fetchSubcategoriesData = async (page = 1, size = 50, status = "all", search = "") => {
    try {
      const { data, meta } = await fetchSubcategories(page, size, status, search);
      setSubcategories(data);
      setTotalPages(meta.totalPages);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };


  const handleSampleExport = async () => {
      try {
        await   downloadSampleSucategoryCSV();
      } catch (error) {
       
      } finally {
      }
    };
  
    useEffect(() => {
      const timer = setTimeout(() => {
        fetchSubcategoriesData(1, pagination.pageSize, filterStatus, searchTerm);
        setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset to first page on search
      }, 500); // Debounce search by 500ms
    
      return () => clearTimeout(timer);
    }, [searchTerm, pagination.pageSize, filterStatus]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportSubcategories();
      toast({ title: "Exported Successfully", description: "Subcategories exported to Excel." });
    } catch (error) {
      console.error("Error exporting subcategories:", error);
      toast({ title: "Error", description: "Failed to export subcategories." });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = () => {
    const formattedData = subcategories.map((item) => `${item.id}, ${item.name}, ${item.status}`).join("\n");
    navigator.clipboard.writeText(formattedData);
    toast({ title: "Copied", description: "Subcategory data copied to clipboard." });
  };

  const handlePrint = () => {
    const printableContent = subcategories
      .map((item) => `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.status}</td></tr>`)
      .join("");
    const newWindow = window.open("", "_blank");
    newWindow?.document.write(`
      <html>
        <head>
          <title>Print Subcategories</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            td, th { border: 1px solid black; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Subcategories</h1>
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Status</th></tr></thead>
            <tbody>${printableContent}</tbody>
          </table>
        </body>
      </html>
    `);
    newWindow?.print();
  };

   const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilterStatus(e.target.value);
    };
  
    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value) }));
    };
  

  const handleDelete = async () => {
    try {
      if (deleteTargetId) {
        await deleteSubcategory(deleteTargetId.toString());
        toast({ title: "Deleted", description: "Subcategory deleted successfully." });
        fetchSubcategoriesData(pagination.pageIndex + 1, pagination.pageSize, filterStatus);
        setIsDialogOpen(false); // Close the dialog

      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete subcategory." });
    }
  };

  const subcategoryColumns: ColumnDef<any>[] = [
    {
      accessorKey: "sno", // Placeholder key for S.No
      header: "S.No",
      cell: (info) => info.row.index + 1, // Calculate the serial number dynamically
    },
    { accessorKey: "name", header: "Name", size: 200 },
    {
      accessorKey: 'category.name',
      header: 'Category Name',
      cell: ({ getValue }) => <span>{String(getValue())}</span>, // Convert to string
    },
    {
      accessorKey: "status",
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
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const imageUrl = row.original.image;
    
        // Only render the img tag if imageUrl is valid
        if (!imageUrl) return null;
    
        return (
          <img
            src={imageUrl}
            alt={row.original.name || "No Image"}
            className="h-12 w-12 object-cover rounded"
          />
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Link href={`/admin/sub-category/edit/${row.original.id}`}>
            <Button variant="ghost" size="icon">
              <Edit className="w-4 h-4 text-blue-600" />
            </Button>
          </Link>
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteTargetId(row.original.id)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <h2 className="text-xl font-bold">Confirm Delete</h2>
                <p>Are you sure you want to delete subcategory: {row.original.name}?</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="secondary" onClick={handleDelete}>
                  Yes, Delete
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  const subcategoryTable = useReactTable({
    data: subcategories,
    columns: subcategoryColumns,
    state: { pagination },
    pageCount: totalPages,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Subcategory List</h1>
        
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
          <Button onClick={handlePrint}><Printer className="w-4 h-4 mr-2" />Print</Button>
          <Link href="/admin/sub-category/add">
            <Button><Plus className="w-4 h-4 mr-2" />Add Subcategory</Button>
          </Link>
        </div>
      </div>
      <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Subcategories</CardTitle>
        <div className="relative">
      <input
        type="text"
        placeholder="Search subcategories..."
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
        <CardContent>
           <Button className="mx-2" onClick={handleSampleExport}><span>Sample CSV</span></Button>
                      <Button >
            <Link href="/admin/sub-category/import">Import</Link>
            
          </Button>
          <Table>
            <TableHeader>
              {subcategoryTable.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {subcategoryTable.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubcategoryList;
