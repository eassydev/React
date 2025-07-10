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
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  Download,
  Copy,
  Printer,
  Search,
  Filter,
  X,
  Eye,
} from 'lucide-react';
import {
  fetchRateCards,
  downloadSampleCSV,
  deleteRateCard,
  exportRatecard,
  fetchAllCategories,
  fetchSubCategoriesByCategoryId,
  fetchFilterAttributes,
  fetchFilterOptionsByAttributeId,
  fetchServiceSegments,
  fetchProvidersByFilters,
} from '@/lib/api';

import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

// Filter interfaces
interface FilterOptions {
  categories: Array<{ id: string; name: string }>;
  subcategories: Array<{ id: string; name: string; category_id: string }>;
  attributes: Array<{ id: string; name: string }>;
  attributeOptions: Array<{ id: string; value: string; attribute_id: string }>;
  segments: Array<{ id: string; name: string }>;
  providers: Array<{ id: string; name: string }>;
}

interface ActiveFilters {
  category_id: string;
  subcategory_id: string;
  attribute_id: string;
  option_id: string;
  segment_id: string;
  provider_id: string;
  min_price: string;
  max_price: string;
  recommended: string;
  best_deal: string;
}

const RateCardList = () => {
  const [rateCards, setRateCards] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Advanced filter states
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    subcategories: [],
    attributes: [],
    attributeOptions: [],
    segments: [],
    providers: [],
  });
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    category_id: '',
    subcategory_id: '',
    attribute_id: '',
    option_id: '',
    segment_id: '',
    provider_id: '',
    min_price: '',
    max_price: '',
    recommended: '',
    best_deal: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [isFilteringData, setIsFilteringData] = useState(false);

  const fetchRateCardsData = async (page = 1, size = 50) => {
    try {
      setIsFilteringData(true);
      // Build filter object
      const filters: any = {
        page,
        size,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm.trim() || undefined,
        category_id: activeFilters.category_id || undefined,
        subcategory_id: activeFilters.subcategory_id || undefined,
        attribute_id: activeFilters.attribute_id || undefined,
        option_id: activeFilters.option_id || undefined,
        segment_id: activeFilters.segment_id || undefined,
        provider_id: activeFilters.provider_id || undefined,
        min_price: activeFilters.min_price ? parseFloat(activeFilters.min_price) : undefined,
        max_price: activeFilters.max_price ? parseFloat(activeFilters.max_price) : undefined,
        recommended: activeFilters.recommended ? activeFilters.recommended === 'true' : undefined,
        best_deal: activeFilters.best_deal ? activeFilters.best_deal === 'true' : undefined,
      };

      // Remove undefined values
      Object.keys(filters).forEach((key) => filters[key] === undefined && delete filters[key]);

      const { data, meta } = await fetchRateCards(filters);
      console.log(`✅ Rate cards filtered: ${data.length} results found`);

      setRateCards(data);
      setTotalPages(meta.totalPages);
      setTotalItems(meta.totalItems);
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    } catch (error) {
      console.error('Error fetching rate cards:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch rate cards',
        variant: 'destructive',
      });
    } finally {
      setIsFilteringData(false);
    }
  };

  // Load initial categories only
  const fetchInitialCategories = async () => {
    try {
      setIsLoadingFilters(true);
      console.log('🔍 Loading categories...');

      const categories = await fetchAllCategories();
      console.log('✅ Categories loaded:', categories);

      setFilterOptions((prev) => ({
        ...prev,
        categories: Array.isArray(categories)
          ? categories.map((cat) => ({
              id: cat.id?.toString() || '',
              name: cat.name || 'Unknown Category',
            }))
          : [],
      }));
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFilters(false);
    }
  };

  // Load subcategories when category is selected
  const fetchSubcategoriesForCategory = async (categoryId: string) => {
    if (!categoryId) {
      setFilterOptions((prev) => ({
        ...prev,
        subcategories: [],
        attributes: [],
        attributeOptions: [],
        segments: [],
        providers: [],
      }));
      return;
    }

    try {
      console.log('🔍 Loading subcategories for category:', categoryId);
      const subcategories = await fetchSubCategoriesByCategoryId(categoryId);
      console.log('✅ Subcategories loaded:', subcategories);

      setFilterOptions((prev) => ({
        ...prev,
        subcategories: Array.isArray(subcategories)
          ? subcategories.map((sub) => ({
              id: sub.id?.toString() || '',
              name: sub.name || 'Unknown Subcategory',
              category_id: sub.category_id?.toString() || categoryId,
            }))
          : [],
        attributes: [], // Reset dependent filters
        attributeOptions: [],
        segments: [],
        providers: [],
      }));
    } catch (error) {
      console.error('❌ Error loading subcategories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subcategories',
        variant: 'destructive',
      });
    }
  };

  // Load attributes when subcategory is selected
  const fetchAttributesForSubcategory = async (categoryId: string, subcategoryId: string) => {
    if (!categoryId || !subcategoryId) {
      setFilterOptions((prev) => ({
        ...prev,
        attributes: [],
        attributeOptions: [],
        segments: [],
        providers: [],
      }));
      return;
    }

    try {
      console.log('🔍 Loading attributes for subcategory:', subcategoryId);
      const attributes = await fetchFilterAttributes(categoryId, subcategoryId);
      console.log('✅ Attributes loaded:', attributes);

      setFilterOptions((prev) => ({
        ...prev,
        attributes: Array.isArray(attributes)
          ? attributes.map((attr) => ({
              id: attr.id?.toString() || '',
              name: attr.name || 'Unknown Attribute',
            }))
          : [],
        attributeOptions: [], // Reset dependent filters
        segments: [],
        providers: [],
      }));
    } catch (error) {
      console.error('❌ Error loading attributes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load attributes',
        variant: 'destructive',
      });
    }
  };

  // Load attribute options when attribute is selected
  const fetchOptionsForAttribute = async (attributeId: string) => {
    if (!attributeId) {
      setFilterOptions((prev) => ({ ...prev, attributeOptions: [] }));
      return;
    }

    try {
      console.log('🔍 Loading options for attribute:', attributeId);
      const options = await fetchFilterOptionsByAttributeId(attributeId);
      console.log('✅ Attribute options loaded:', options);
      console.log('✅ Options structure:', JSON.stringify(options, null, 2));

      // The API function returns AttributeOption[] directly
      let optionsArray: any[] = [];
      if (Array.isArray(options)) {
        optionsArray = options;
      } else {
        console.warn('⚠️ Unexpected options structure:', options);
        optionsArray = [];
      }

      console.log('📋 Processing options array:', optionsArray);

      setFilterOptions((prev) => ({
        ...prev,
        attributeOptions: optionsArray.map((option, index) => {
          console.log(`📋 Processing option ${index}:`, option);
          return {
            id: option?.id?.toString() || option?.option_id?.toString() || index.toString(),
            value: option?.value || option?.name || option?.option_value || `Option ${index + 1}`,
            attribute_id:
              option?.attribute_id?.toString() ||
              option?.filter_attribute_id?.toString() ||
              attributeId,
          };
        }),
      }));
    } catch (error) {
      console.error('❌ Error loading attribute options:', error);

      // Set empty array on error to prevent crashes
      setFilterOptions((prev) => ({
        ...prev,
        attributeOptions: [],
      }));

      toast({
        title: 'Error',
        description: 'Failed to load attribute options',
        variant: 'destructive',
      });
    }
  };

  // Load segments when category and subcategory are selected
  const fetchSegmentsForSelection = async (
    categoryId: string,
    subcategoryId: string,
    attributeId?: string
  ) => {
    if (!categoryId || !subcategoryId) {
      setFilterOptions((prev) => ({ ...prev, segments: [] }));
      return;
    }

    try {
      console.log('🔍 Loading segments for selection:', { categoryId, subcategoryId, attributeId });
      const segments = await fetchServiceSegments(categoryId, subcategoryId, attributeId);
      console.log('✅ Segments loaded:', segments);

      setFilterOptions((prev) => ({
        ...prev,
        segments: Array.isArray(segments) ? segments.map(segment => ({
          id: segment.id?.toString() || '',
          name: segment.segment_name || 'Unknown Segment'
        })) : []
      }));
    } catch (error) {
      console.error('❌ Error loading segments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load segments',
        variant: 'destructive',
      });
    }
  };

  // Load providers based on all selections
  const fetchProvidersForSelection = async (
    categoryId: string,
    subcategoryId: string,
    attributeId?: string,
    optionId?: string
  ) => {
    if (!categoryId || !subcategoryId) {
      setFilterOptions((prev) => ({ ...prev, providers: [] }));
      return;
    }

    try {
      console.log('🔍 Loading providers for selection:', {
        categoryId,
        subcategoryId,
        attributeId,
        optionId,
      });
      const providersResponse = await fetchProvidersByFilters(
        categoryId,
        subcategoryId,
        attributeId,
        optionId
      );
      console.log('✅ Providers loaded:', providersResponse);

      const providers = providersResponse?.data || [];
      setFilterOptions((prev) => ({
        ...prev,
        providers: Array.isArray(providers)
          ? providers.map((provider) => ({
              id: provider.id?.toString() || '',
              name: provider.company_name || provider.first_name || 'Unknown Provider',
            }))
          : [],
      }));
    } catch (error) {
      console.error('❌ Error loading providers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load providers',
        variant: 'destructive',
      });
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchInitialCategories();
  }, []);

  // Fetch data when pagination changes
  useEffect(() => {
    fetchRateCardsData(pagination.pageIndex + 1, pagination.pageSize);
  }, [pagination.pageIndex]);

  // Debounced fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRateCardsData(1, pagination.pageSize);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, pagination.pageSize, filterStatus, activeFilters]);

  // Enhanced filter handling with cascading
  const handleFilterChange = async (filterKey: keyof ActiveFilters, value: string) => {
    // Update the filter value
    setActiveFilters((prev) => {
      const newFilters = { ...prev, [filterKey]: value };

      // Reset dependent filters based on what changed
      if (filterKey === 'category_id') {
        newFilters.subcategory_id = '';
        newFilters.attribute_id = '';
        newFilters.option_id = '';
        newFilters.segment_id = '';
        newFilters.provider_id = '';
      } else if (filterKey === 'subcategory_id') {
        newFilters.attribute_id = '';
        newFilters.option_id = '';
        newFilters.segment_id = '';
        newFilters.provider_id = '';
      } else if (filterKey === 'attribute_id') {
        newFilters.option_id = '';
        newFilters.segment_id = '';
        newFilters.provider_id = '';
      }

      return newFilters;
    });

    // Trigger cascading API calls based on the filter that changed
    if (filterKey === 'category_id') {
      if (value) {
        await fetchSubcategoriesForCategory(value);
      }
    } else if (filterKey === 'subcategory_id') {
      if (value && activeFilters.category_id) {
        await fetchAttributesForSubcategory(activeFilters.category_id, value);
        await fetchSegmentsForSelection(activeFilters.category_id, value);
        await fetchProvidersForSelection(activeFilters.category_id, value);
      }
    } else if (filterKey === 'attribute_id') {
      if (value) {
        await fetchOptionsForAttribute(value);
        if (activeFilters.category_id && activeFilters.subcategory_id) {
          await fetchSegmentsForSelection(
            activeFilters.category_id,
            activeFilters.subcategory_id,
            value
          );
          await fetchProvidersForSelection(
            activeFilters.category_id,
            activeFilters.subcategory_id,
            value
          );
        }
      }
    } else if (filterKey === 'option_id') {
      if (
        value &&
        activeFilters.category_id &&
        activeFilters.subcategory_id &&
        activeFilters.attribute_id
      ) {
        await fetchProvidersForSelection(
          activeFilters.category_id,
          activeFilters.subcategory_id,
          activeFilters.attribute_id,
          value
        );
      }
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({
      category_id: '',
      subcategory_id: '',
      attribute_id: '',
      option_id: '',
      segment_id: '',
      provider_id: '',
      min_price: '',
      max_price: '',
      recommended: '',
      best_deal: '',
    });
    setSearchTerm('');
    setFilterStatus('all');

    // Reset filter options to only categories
    setFilterOptions((prev) => ({
      ...prev,
      subcategories: [],
      attributes: [],
      attributeOptions: [],
      segments: [],
      providers: [],
    }));
  };

  const getActiveFilterCount = () => {
    return (
      Object.values(activeFilters).filter((value) => value !== '').length +
      (searchTerm ? 1 : 0) +
      (filterStatus !== 'all' ? 1 : 0)
    );
  };

  // Get filtered subcategories based on selected category
  const getFilteredSubcategories = () => {
    if (!activeFilters.category_id) return filterOptions.subcategories;
    return filterOptions.subcategories.filter(
      (sub) => sub.category_id === activeFilters.category_id
    );
  };

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
      await downloadSampleCSV();
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
      .join('');
    const newWindow = window.open('', '_blank');
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
    const formattedData = rateCards
      .map((item) => `${item.id}, ${item.name}, ${item.status}`)
      .join('\n');
    navigator.clipboard.writeText(formattedData);
    toast({ title: 'Copied to Clipboard', description: 'Category data copied.' });
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value) }));
  };

  const rateCardColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'sno', // Placeholder key for S.No
      header: 'S.No',
      cell: (info) => info.row.index + 1, // Calculate the serial number dynamically
      size: 60,
    },
    {
      accessorKey: 'name',
      header: 'Service Name',
      size: 200,
    },
    {
      accessorKey: 'category_name',
      header: 'Category',
      size: 120,
    },
    {
      accessorKey: 'subcategory_name',
      header: 'Subcategory',
      size: 120,
    },
    {
      accessorKey: 'provider_name',
      header: 'Provider',
      size: 150,
    },
    {
      accessorKey: 'segment_name',
      header: 'Segment',
      size: 100,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      size: 80,
      cell: ({ row }) => `₹${row.original.price}`,
    },
    {
      accessorKey: 'strike_price',
      header: 'Strike Price',
      size: 100,
      cell: ({ row }) => (row.original.strike_price ? `₹${row.original.strike_price}` : '-'),
    },
    {
      accessorKey: 'weight',
      header: 'Weight',
      size: 80,
      cell: ({ row }) => row.original.weight || '-',
    },
    {
      accessorKey: 'attributes',
      header: 'Attributes',
      size: 200,
      cell: ({ row }) => {
        const attributes = row.original.attributes || [];
        if (attributes.length === 0) return '-';

        return (
          <div className="space-y-1">
            {attributes.slice(0, 2).map((attr: any, index: number) => (
              <div key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {attr.attribute_name}: {attr.option_value}
              </div>
            ))}
            {attributes.length > 2 && (
              <div className="text-xs text-gray-500">+{attributes.length - 2} more</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'recommended',
      header: 'Recommended',
      size: 100,
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            row.original.recommended ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.original.recommended ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      accessorKey: 'best_deal',
      header: 'Best Deal',
      size: 100,
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            row.original.best_deal ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.original.best_deal ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      accessorKey: 'active',
      header: 'Status',
      size: 100,
      cell: ({ row }) => {
        const statusValue = row.original.active;

        let statusLabel = '';
        let statusClass = '';

        switch (statusValue) {
          case 1:
            statusLabel = 'Active';
            statusClass = 'bg-green-100 text-green-800';
            break;
          case 0:
            statusLabel = 'Inactive';
            statusClass = 'bg-yellow-100 text-yellow-800';
            break;
          case 2:
            statusLabel = 'Deleted';
            statusClass = 'bg-red-100 text-red-800';
            break;
          default:
            statusLabel = 'Unknown';
            statusClass = 'bg-gray-100 text-gray-800';
            break;
        }

        return <span className={`px-2 py-1 rounded text-xs ${statusClass}`}>{statusLabel}</span>;
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      size: 120,
      cell: ({ row }) => {
        const date = row.original.created_at;
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      },
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated',
      size: 120,
      cell: ({ row }) => {
        const date = row.original.updated_at;
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 120,
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Details">
            <Link href={`/admin/rate-card/view/${row.original.id}`} passHref>
              <Eye className="w-3 h-3 text-gray-600" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit">
            <Link href={`/admin/rate-card/edit/${row.original.id}`} passHref>
              <Edit className="w-3 h-3 text-blue-600" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Delete">
                <Trash2 className="w-3 h-3 text-red-600" />
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
            <select
              value={filterStatus}
              onChange={handleStatusChange}
              className="border p-2 rounded"
            >
              <option value="">All</option>
              <option value="0">Active</option>
              <option value="1">Deactivated</option>
              <option value="2">Deleted</option>
            </select>
            <select
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              className="border p-2 rounded"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={150}>150</option>
            </select>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button asChild variant="default" className="flex items-center space-x-2">
              <Link href="/admin/rate-card/add">
                <Plus className="w-4 h-4 mr-1" />
                <span>Add Rate Card</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <Card className="border-none shadow-lg bg-white/90 backdrop-blur">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Advanced Filters</span>
                  {getActiveFilterCount() > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </Button>
                {getActiveFilterCount() > 0 && (
                  <Button
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="text-red-600 hover:text-red-700"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
              <div className="text-sm text-gray-600">{totalItems} total rate cards</div>
            </div>
          </CardHeader>

          {showFilters && (
            <CardContent className="pt-0 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={activeFilters.category_id}
                    onChange={(e) => handleFilterChange('category_id', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoadingFilters}
                  >
                    <option value="">All Categories</option>
                    {filterOptions.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subcategory</label>
                  <select
                    value={activeFilters.subcategory_id}
                    onChange={(e) => handleFilterChange('subcategory_id', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoadingFilters || !activeFilters.category_id}
                  >
                    <option value="">All Subcategories</option>
                    {getFilteredSubcategories().map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Attribute Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Attribute</label>
                  <select
                    value={activeFilters.attribute_id}
                    onChange={(e) => handleFilterChange('attribute_id', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoadingFilters || !activeFilters.subcategory_id}
                  >
                    <option value="">All Attributes</option>
                    {filterOptions.attributes.map((attribute) => (
                      <option key={attribute.id} value={attribute.id}>
                        {attribute.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Attribute Options Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Attribute Option</label>
                  <select
                    value={activeFilters.option_id}
                    onChange={(e) => handleFilterChange('option_id', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoadingFilters || !activeFilters.attribute_id}
                  >
                    <option value="">All Options</option>
                    {filterOptions.attributeOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Provider Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Provider</label>
                  <select
                    value={activeFilters.provider_id}
                    onChange={(e) => handleFilterChange('provider_id', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoadingFilters}
                  >
                    <option value="">All Providers</option>
                    {filterOptions.providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Segment Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Segment</label>
                  <select
                    value={activeFilters.segment_id}
                    onChange={(e) => handleFilterChange('segment_id', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoadingFilters}
                  >
                    <option value="">All Segments</option>
                    {filterOptions.segments.map((segment) => (
                      <option key={segment.id} value={segment.id}>
                        {segment.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Range and Special Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Min Price */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Min Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={activeFilters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Max Price */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Max Price</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={activeFilters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Recommended Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Recommended</label>
                  <select
                    value={activeFilters.recommended}
                    onChange={(e) => handleFilterChange('recommended', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All</option>
                    <option value="true">Recommended Only</option>
                    <option value="false">Not Recommended</option>
                  </select>
                </div>

                {/* Best Deal Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Best Deal</label>
                  <select
                    value={activeFilters.best_deal}
                    onChange={(e) => handleFilterChange('best_deal', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All</option>
                    <option value="true">Best Deals Only</option>
                    <option value="false">Regular Deals</option>
                  </select>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Active Filter Chips */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap gap-2 px-4">
            {searchTerm && (
              <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>Search: "{searchTerm}"</span>
                <button onClick={() => setSearchTerm('')} className="ml-2 hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {filterStatus !== 'all' && (
              <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <span>
                  Status:{' '}
                  {filterStatus === '1' ? 'Active' : filterStatus === '0' ? 'Inactive' : 'Deleted'}
                </span>
                <button
                  onClick={() => setFilterStatus('all')}
                  className="ml-2 hover:text-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {activeFilters.category_id && (
              <div className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                <span>
                  Category:{' '}
                  {filterOptions.categories.find((c) => c.id === activeFilters.category_id)?.name}
                </span>
                <button
                  onClick={() => handleFilterChange('category_id', '')}
                  className="ml-2 hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {activeFilters.subcategory_id && (
              <div className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                <span>
                  Subcategory:{' '}
                  {
                    filterOptions.subcategories.find((s) => s.id === activeFilters.subcategory_id)
                      ?.name
                  }
                </span>
                <button
                  onClick={() => handleFilterChange('subcategory_id', '')}
                  className="ml-2 hover:text-indigo-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {activeFilters.attribute_id && (
              <div className="flex items-center bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
                <span>
                  Attribute:{' '}
                  {filterOptions.attributes.find((a) => a.id === activeFilters.attribute_id)?.name}
                </span>
                <button
                  onClick={() => handleFilterChange('attribute_id', '')}
                  className="ml-2 hover:text-cyan-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {activeFilters.option_id && (
              <div className="flex items-center bg-lime-100 text-lime-800 px-3 py-1 rounded-full text-sm">
                <span>
                  Option:{' '}
                  {
                    filterOptions.attributeOptions.find((o) => o.id === activeFilters.option_id)
                      ?.value
                  }
                </span>
                <button
                  onClick={() => handleFilterChange('option_id', '')}
                  className="ml-2 hover:text-lime-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {activeFilters.provider_id && (
              <div className="flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                <span>
                  Provider:{' '}
                  {filterOptions.providers.find((p) => p.id === activeFilters.provider_id)?.name}
                </span>
                <button
                  onClick={() => handleFilterChange('provider_id', '')}
                  className="ml-2 hover:text-orange-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {activeFilters.segment_id && (
              <div className="flex items-center bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm">
                <span>
                  Segment:{' '}
                  {filterOptions.segments.find((s) => s.id === activeFilters.segment_id)?.name}
                </span>
                <button
                  onClick={() => handleFilterChange('segment_id', '')}
                  className="ml-2 hover:text-teal-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {(activeFilters.min_price || activeFilters.max_price) && (
              <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                <span>
                  Price: {activeFilters.min_price || '0'} - {activeFilters.max_price || '∞'}
                </span>
                <button
                  onClick={() => {
                    handleFilterChange('min_price', '');
                    handleFilterChange('max_price', '');
                  }}
                  className="ml-2 hover:text-yellow-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {activeFilters.recommended && (
              <div className="flex items-center bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">
                <span>Recommended: {activeFilters.recommended === 'true' ? 'Yes' : 'No'}</span>
                <button
                  onClick={() => handleFilterChange('recommended', '')}
                  className="ml-2 hover:text-pink-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {activeFilters.best_deal && (
              <div className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                <span>Best Deal: {activeFilters.best_deal === 'true' ? 'Yes' : 'No'}</span>
                <button
                  onClick={() => handleFilterChange('best_deal', '')}
                  className="ml-2 hover:text-red-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-gray-800">Rate Cards</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rate cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Button className="mx-2" onClick={handleSampleExport}>
              <span>Sample CSV</span>
            </Button>
            <Button>
              <Link href="/admin/rate-card/import">Import</Link>
            </Button>
            <Button className="mx-2">
              <Link href="/admin/rate-card/update-batch">Update in Batch</Link>
            </Button>

            {/* Applied Filters Summary */}
            {(getActiveFilterCount() > 0 || searchTerm) && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-blue-800">
                    <span className="font-medium">Filters Applied:</span>
                    {searchTerm && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 rounded">
                        Search: "{searchTerm}"
                      </span>
                    )}
                    {filterStatus !== 'all' && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 rounded">
                        Status: {filterStatus}
                      </span>
                    )}
                    {Object.entries(activeFilters).map(
                      ([key, value]) =>
                        value && (
                          <span key={key} className="ml-2 px-2 py-1 bg-blue-100 rounded">
                            {key.replace('_', ' ')}: {value}
                          </span>
                        )
                    )}
                  </div>
                  <div className="text-sm text-blue-600">
                    {totalItems} result{totalItems !== 1 ? 's' : ''} found
                  </div>
                </div>
              </div>
            )}

            {/* Filtering Indicator */}
            {isFilteringData && (
              <div className="flex items-center justify-center py-4 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span>Applying filters...</span>
              </div>
            )}

            <Table>
              <TableHeader>
                {rateCardTable.getHeaderGroups().map((headerGroup) => (
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
