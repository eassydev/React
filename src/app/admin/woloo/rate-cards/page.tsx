"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Upload,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  fetchWolooRateCards,
  deleteWolooRateCard,
  downloadWolooRateCardSampleCSV,
  bulkUploadWolooRateCards,
  fetchWolooCategories,
  fetchWolooSubcategories,
  exportWolooRateCards,
  WolooRateCard,
  WolooCategory,
  WolooSubcategory
} from "@/lib/api";
import Link from "next/link";
import { AlertDialog, AlertDialogTrigger, AlertDialogTitle, AlertDialogContent, AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const WolooRateCardList = () => {
  const [rateCards, setRateCards] = useState<WolooRateCard[]>([]);
  const [categories, setCategories] = useState<WolooCategory[]>([]);
  const [subcategories, setSubcategories] = useState<WolooSubcategory[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterSubcategory, setFilterSubcategory] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories and subcategories for filter dropdowns
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [categoriesRes, subcategoriesRes] = await Promise.all([
          fetchWolooCategories(1, 1000, 'all', ''),
          fetchWolooSubcategories(1, 1000, 'all', '', '')
        ]);
        setCategories(categoriesRes.data);
        setSubcategories(subcategoriesRes.data);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };
    fetchFiltersData();
  }, []);

  // Fetch rate cards with pagination and filters
  const fetchRateCardsData = async (page = 1, size = 50, status = "all", search = "", categoryId = "", subcategoryId = "") => {
    try {
      const { data, meta } = await fetchWolooRateCards(page, size, status, search, categoryId, subcategoryId);
      setRateCards(data);
      setTotalPages(meta.totalPages);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error("Error fetching Woloo rate cards:", error);
      toast({ title: "Error", description: "Failed to fetch rate cards.", variant: "destructive" });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRateCardsData(pagination.pageIndex + 1, pagination.pageSize, filterStatus, searchTerm, filterCategory, filterSubcategory);
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [pagination.pageIndex, pagination.pageSize, filterStatus, searchTerm, filterCategory, filterSubcategory]);

  const handleExport = async (format: 'excel' | 'csv' = 'excel') => {
    try {
      setIsExporting(true);
      const blob = await exportWolooRateCards(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `woloo_rate_cards_export.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Success", description: "Rate cards exported successfully." });
    } catch (error) {
      console.error("Error exporting rate cards:", error);
      toast({ title: "Error", description: "Failed to export rate cards.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = () => {
    const formattedData = rateCards.map((item) =>
      `${item.raw_id || item.sampleid}, ${item.name}, ${item.category?.name || getCategoryName(item.category_id) || 'N/A'}, ${item.subcategory?.name || (item.subcategory_id ? getSubcategoryName(item.subcategory_id) : 'N/A')}, ₹${item.price}, ${item.strike_price ? `₹${item.strike_price}` : 'N/A'}, ${item.weight || 0}, ${item.recommended ? 'Yes' : 'No'}, ${item.best_deal ? 'Yes' : 'No'}, ${item.active ? 'Active' : 'Inactive'}`
    ).join("\n");
    const header = 'ID, Name, Category, Subcategory, Price, Strike Price, Weight, Recommended, Best Deal, Status\n';
    navigator.clipboard.writeText(header + formattedData);
    toast({ title: "Copied to Clipboard", description: "Rate card data copied." });
  };

  const handlePrint = () => {
    const printableContent = rateCards
      .map((item) => `<tr>
        <td>${item.raw_id || item.sampleid}</td>
        <td>${item.name}</td>
        <td>${item.category?.name || getCategoryName(item.category_id) || 'N/A'}</td>
        <td>${item.subcategory?.name || (item.subcategory_id ? getSubcategoryName(item.subcategory_id) : 'N/A')}</td>
        <td>₹${item.price}</td>
        <td>${item.strike_price ? `₹${item.strike_price}` : 'N/A'}</td>
        <td>${item.weight || 0}</td>
        <td>${item.recommended ? 'Yes' : 'No'}</td>
        <td>${item.best_deal ? 'Yes' : 'No'}</td>
        <td>${item.active ? 'Active' : 'Inactive'}</td>
      </tr>`)
      .join("");
    const newWindow = window.open("", "_blank");
    newWindow?.document.write(`
      <html>
        <head>
          <title>Print Woloo Rate Cards</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            td, th { border: 1px solid black; padding: 8px; text-align: left; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Woloo Rate Cards</h1>
          <table>
            <thead><tr>
              <th>ID</th><th>Name</th><th>Category</th><th>Subcategory</th>
              <th>Price</th><th>Strike Price</th><th>Weight</th>
              <th>Recommended</th><th>Best Deal</th><th>Status</th>
            </tr></thead>
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterCategory(e.target.value);
    setFilterSubcategory(""); // Reset subcategory when category changes
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterSubcategory(e.target.value);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value) }));
  };

  const handleSampleExport = async () => {
    try {
      await downloadWolooRateCardSampleCSV();
      toast({ title: "Success", description: "Sample CSV downloaded successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to download sample CSV.", variant: "destructive" });
    }
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await bulkUploadWolooRateCards(file);
      toast({ title: "Success", description: "Rate cards uploaded successfully." });
      fetchRateCardsData(pagination.pageIndex + 1, pagination.pageSize, filterStatus, searchTerm, filterCategory, filterSubcategory);
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload rate cards.", variant: "destructive" });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteTargetId !== null) {
        await deleteWolooRateCard(deleteTargetId);
        toast({ title: "Deleted", description: "Rate card deleted successfully." });
        fetchRateCardsData(pagination.pageIndex + 1, pagination.pageSize, filterStatus, searchTerm, filterCategory, filterSubcategory);
        setIsDialogOpen(false);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete rate card.", variant: "destructive" });
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getSubcategoryName = (subcategoryId: string) => {
    const subcategory = subcategories.find(sub => sub.id === subcategoryId);
    return subcategory?.name || 'N/A';
  };

  const filteredSubcategories = filterCategory 
    ? subcategories.filter(sub => sub.category_id === filterCategory)
    : subcategories;

  const rateCardColumns: ColumnDef<WolooRateCard>[] = [
    { accessorKey: "raw_id", header: "ID" },
    { accessorKey: "name", header: "Name", size: 200 },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        // Try to get from the included category object first, then fallback to lookup
        return row.original.category?.name || getCategoryName(row.original.category_id) || 'N/A';
      },
    },
    {
      accessorKey: "subcategory",
      header: "Subcategory",
      cell: ({ row }) => {
        // Try to get from the included subcategory object first, then fallback to lookup
        return row.original.subcategory?.name ||
               (row.original.subcategory_id ? getSubcategoryName(row.original.subcategory_id) : 'N/A');
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => `₹${row.original.price}`,
    },
    {
      accessorKey: "strike_price",
      header: "Strike Price",
      cell: ({ row }) => row.original.strike_price ? `₹${row.original.strike_price}` : 'N/A',
    },
    {
      accessorKey: "weight",
      header: "Weight",
      cell: ({ row }) => row.original.weight || 0,
    },
    {
      accessorKey: "recommended",
      header: "Recommended",
      cell: ({ row }) => (
        <span className={`badge px-2 py-1 rounded ${row.original.recommended ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
          {row.original.recommended ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      accessorKey: "best_deal",
      header: "Best Deal",
      cell: ({ row }) => (
        <span className={`badge px-2 py-1 rounded ${row.original.best_deal ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-800'}`}>
          {row.original.best_deal ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.active;
        return (
          <span className={`badge px-2 py-1 rounded ${isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = row.original.created_at;
        return date ? new Date(date).toLocaleDateString() : '-';
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Link href={`/admin/woloo/rate-cards/edit/${row.original.id}`}>
            <Button variant="ghost" size="icon">
              <Edit className="w-4 h-4 text-blue-600" />
            </Button>
          </Link>
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteTargetId(row.original.id || null)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <VisuallyHidden>Confirm Delete</VisuallyHidden>
                </AlertDialogTitle>
                <p className="text-xl font-bold">Are you sure you want to delete rate card: {row.original.name}?</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="secondary" onClick={handleDelete}>
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
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Woloo Rate Cards</h1>
        <div className="flex space-x-2">
          <select value={filterCategory} onChange={handleCategoryChange} className="border p-2 rounded">
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select value={filterSubcategory} onChange={handleSubcategoryChange} className="border p-2 rounded">
            <option value="">All Subcategories</option>
            {filteredSubcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
          <select value={filterStatus} onChange={handleStatusChange} className="border p-2 rounded">
            <option value="all">All</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
          <select value={pagination.pageSize} onChange={handlePageSizeChange} className="border p-2 rounded">
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
          </select>
          <Button onClick={handleSampleExport}>
            <Download className="w-4 h-4 mr-2" />Sample CSV
          </Button>
          <Button
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Bulk Upload'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleBulkUpload}
            className="hidden"
            disabled={isUploading}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isExporting}>
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export'}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                Export as Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV (.csv)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />Copy
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />Print
          </Button>
          <Link href="/admin/woloo/rate-cards/add">
            <Button>
              <Plus className="w-4 h-4 mr-2" />Add Rate Card
            </Button>
          </Link>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Rate Cards</CardTitle>
          <div className="relative">
            <input
              type="text"
              placeholder="Search rate cards..."
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
          <Table>
            <TableHeader>
              {rateCardTable.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} style={{ width: header.column.getSize() }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rateCardTable.getRowModel().rows.map((row) => (
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

export default WolooRateCardList;
