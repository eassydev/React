"use client";
import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { Virtuoso } from "react-virtuoso";
import { useRouter } from 'next/navigation';

import { Save, FileText, Loader2, Type, Globe2, Plus } from 'lucide-react';
import { fetchAllCategories, createBooking, fetchSubCategoriesByCategoryId, fetchAllUsersWithouPagination, searchUser, fetchUserAddresses, fetchProvidersByFilters, Provider, Package, fetchFilterOptionsByAttributeId, fetchFilterAttributes, AttributeOption, createRateCard, Category, Subcategory, Attribute, SearchUserResult } from '@/lib/api';
import { AddressModal } from '@/components/AddressModal';
// Add this at the top of your file, after the imports
declare global {
  interface Window {
    searchTimeout: NodeJS.Timeout | null;
    providerSearchTimeout: NodeJS.Timeout | null;
  }
}

// Initialize the timeouts
if (typeof window !== 'undefined') {
  window.searchTimeout = null;
  window.providerSearchTimeout = null;
}

const AddBookingForm: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectionType, setSelectionType] = useState<string>('Category');
  // Add this to your state declarations
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filterAttributes, setFilterAttributes] = useState<Attribute[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [selectedFilterAttributesId, setSelectedFilterAttributesId] = useState<string>('');
  const [serviceDate, setServiceDate] = useState<string>('');
  const [serviceTime, setServiceTime] = useState<string>('');
  const [placeToSupply, setPlaceToSupply] = useState<string>('');
  const [placeToDeliver, setPlaceToDeliver] = useState<string>('');
  const [razorpayOrderId, setRazorpayOrderId] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [advanceReceiptNumber, setAdvanceReceiptNumber] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<AttributeOption[]>([]);
  const [selectedFilterOptionId, setSelectedFilterOptionId] = useState<string>('');
  const [packages, setPackages] = useState<Package[]>([]);
  const [userId, setUserId] = useState<string | null>(null); // Store encrypted ID
  // Update the state to include more user details
  const [users, setUsers] = useState<SearchUserResult[]>([]);
  // Update the selectedUser state type
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    name: string;
    mobile: string;
    displayId?: string;
  } | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState<string>("");
  const [providerId, setProviderId] = useState<string | null>(null); // Store encrypted ID
  const [providers, setProviders] = useState<{ id: string; sampleid: number; name: string }[]>([]); // id encrypted, sampleid decrypted
  const [providerSearchTerm, setProviderSearchTerm] = useState<string>('');
  const [providerPage, setProviderPage] = useState<number>(1);
  const [hasMoreProviders, setHasMoreProviders] = useState<boolean>(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState<boolean>(false);
  const [isLoadingMoreProviders, setIsLoadingMoreProviders] = useState<boolean>(false);
  // const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [addresses, setAddresses] = useState<{ id: string; sampleid: number; full_address: string }[]>([]);
  const [deliveryAddressId, setDeliveryAddressId] = useState<string | null>(null); // Store encrypted ID
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Add these state variables for pagination
  const [searchPage, setSearchPage] = useState<number>(1);
  const [hasMoreResults, setHasMoreResults] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const { toast } = useToast();

  // Fetch categories on load
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await fetchAllCategories();
        setCategories(categoryData);
      } catch (error) {
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Failed to load categories.',
        });
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      const loadSubcategoriesAndFilters = async () => {
        try {
          const subcategoryData = await fetchSubCategoriesByCategoryId(selectedCategoryId);
          setSubcategories(subcategoryData);
          try {
            const filterAttributeData = await fetchFilterAttributes(selectedCategoryId, null);
            setFilterAttributes(filterAttributeData);
          } catch (error) {
            setFilterAttributes([]);
          }
        } catch (error) {
          setSubcategories([]);
        }
      };
      loadSubcategoriesAndFilters();
    } else {
      setSubcategories([]);
      setFilterAttributes([]);
    }
  }, [selectedCategoryId]);



  // Fetch filter attributes when a subcategory is selected
  useEffect(() => {
    if (selectedSubcategoryId) {
      const loadFilterAttributes = async () => {
        try {
          const filterAttributeData = await fetchFilterAttributes(selectedCategoryId, selectedSubcategoryId);
          setFilterAttributes(filterAttributeData);
        } catch (error) {
          setFilterAttributes([]);
        }
      };
      loadFilterAttributes();
    }
  }, [selectedSubcategoryId, selectedCategoryId]);


  useEffect(() => {
    if (selectedFilterAttributesId) {
      const loadFilterOptions = async () => {
        try {
          const options = await fetchFilterOptionsByAttributeId(selectedFilterAttributesId);
          setFilterOptions(options);
        } catch (error) {
          setFilterOptions([]);
        }
      };
      loadFilterOptions();
    } else {
      setFilterOptions([]);
    }
  }, [selectedFilterAttributesId]);


  useEffect(() => {
    // Fetch providers and users on component mount
    const loadInitialData = async () => {
      try {
        const userData = await searchUser("");



        setUsers(
          userData.map((user: any) => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
          }))
        );
      } catch (error) {
        toast({ variant: "error", title: "Error", description: "Failed to load initial data." });
      }
    };

    loadInitialData();
  }, [toast]);


  // Load providers with pagination and search support
  const loadProviders = useCallback(async (page = 1, search = '', append = false) => {
    try {
      if (page === 1) {
        setIsLoadingProviders(true);
      } else {
        setIsLoadingMoreProviders(true);
      }

      console.log('Loading providers with fetchProvidersByFilters...', { page, search });

      // Use the updated API function with pagination and search
      const result = await fetchProvidersByFilters(
        selectedCategoryId || '',
        selectedSubcategoryId || '',
        selectedFilterAttributesId || '',
        selectedFilterOptionId || '',
        page,
        50,
        search
      );

      if (result.data) {
        const formattedProviders = result.data.map((provider: any) => ({
          id: provider.id, // Encrypted ID
          sampleid: provider.sampleid, // Decrypted ID for selection
          name: provider.company_name || provider.name || `${provider.first_name} ${provider.last_name || ''} - ${provider.phone || 'No Phone'}`,
        }));

        if (append) {
          setProviders(prev => [...prev, ...formattedProviders]);
        } else {
          setProviders(formattedProviders);
        }

        // Update pagination state
        setHasMoreProviders(result.meta?.hasMore || false);
        setProviderPage(page);

        console.log(`Loaded ${formattedProviders.length} providers - Page ${page}`);
      }
    } catch (error) {
      console.error('Error loading providers:', error);
      if (!append) {
        setProviders([]);
      }
    } finally {
      setIsLoadingProviders(false);
      setIsLoadingMoreProviders(false);
    }
  }, [selectedCategoryId, selectedSubcategoryId, selectedFilterAttributesId, selectedFilterOptionId]);

  // Load providers when filters change
  useEffect(() => {
    setProviderPage(1);
    setProviders([]);
    loadProviders(1, providerSearchTerm);
  }, [selectedCategoryId, selectedSubcategoryId, selectedFilterAttributesId, selectedFilterOptionId, loadProviders]);

  // Handle provider search
  const handleProviderSearch = useCallback((searchTerm: string) => {
    setProviderSearchTerm(searchTerm);
    setProviderPage(1);
    setProviders([]);
    loadProviders(1, searchTerm);
  }, [loadProviders]);

  // Load more providers
  const loadMoreProviders = useCallback(() => {
    if (hasMoreProviders && !isLoadingMoreProviders) {
      loadProviders(providerPage + 1, providerSearchTerm, true);
    }
  }, [hasMoreProviders, isLoadingMoreProviders, providerPage, providerSearchTerm, loadProviders]);



  useEffect(() => {
    // Fetch addresses when a user is selected
    if (userId && selectedUser) {
      const loadAddresses = async () => {
        try {
          const addressData = await fetchUserAddresses(userId); // Use encrypted userId for API call
          setAddresses(addressData); // addressData is already mapped in fetchUserAddresses
        } catch (error: any) {
          toast({
            variant: "error",
            title: "Error",
            description: error.message || "Failed to load user addresses.",
          });
        }
      };
      loadAddresses();
    } else {
      setAddresses([]); // Clear addresses if no user is selected
    }
  }, [userId, toast]);

  // Optimize the user search function
  const handleUserSearch = useCallback(async (searchTerm: string, page = 1, append = false) => {
    if (!searchTerm.trim()) {
      setUsers([]);
      setHasMoreResults(false);
      return;
    }

    try {
      if (page === 1) {
        setIsSearching(true);
      } else {
        setIsLoadingMore(true);
      }

      // Use the page parameter in the API call
      const response = await searchUser(searchTerm, page, 10);

      // Log the response structure to debug
      console.log("Search API response:", response);

      // Check if response is an array directly (old API format)
      if (Array.isArray(response)) {
        const formattedUsers: SearchUserResult[] = response.map((user: any) => ({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          mobile: user.mobile,
          name: `${user.first_name} ${user.last_name}`,
          displayId: user.sampleid || user.id.toString(),
        }));

        if (append) {
          setUsers(prev => [...prev, ...formattedUsers]);
        } else {
          setUsers(formattedUsers);
        }

        // Assume there might be more if we got results
        setHasMoreResults(formattedUsers.length >= 10);
      }
      // Check if response has data property (new API format)
      else if (response && response.data) {
        const userData = response.data;
        const hasMore = response.meta?.totalPages > page;
        setHasMoreResults(hasMore);

        const formattedUsers: SearchUserResult[] = userData.map((user: any) => ({
          id: user.id, // Encrypted ID (for reference)
          sampleid: user.sampleid, // Decrypted ID (for selection)
          first_name: user.first_name,
          last_name: user.last_name,
          mobile: user.mobile,
          name: `${user.first_name} ${user.last_name}`,
          displayId: user.sampleid || user.id.toString(),
        }));

        if (append) {
          setUsers(prev => [...prev, ...formattedUsers]);
        } else {
          setUsers(formattedUsers);
        }
      }
      // Fallback for unexpected response format
      else {
        console.error("Unexpected API response format:", response);
        setUsers([]);
        setHasMoreResults(false);
      }

      // Update the current page
      setSearchPage(page);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to search users."
      });
      setUsers([]);
      setHasMoreResults(false);
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  }, [toast]);

  // Update the handleUserSelect function
  const handleUserSelect = useCallback((user: SearchUserResult) => {
    setUserId(user.id.toString()); // Use encrypted ID for backend
    setSelectedUser({
      id: parseInt(user.sampleid), // Use decrypted sampleid for display
      name: user.name || `${user.first_name || ''} ${user.last_name || ''}`,
      mobile: user.mobile,
      displayId: user.displayId || user.sampleid?.toString() || user.id.toString()
    });

    // Clear search state after a short delay
    requestAnimationFrame(() => {
      setUserSearchTerm("");
      setUsers([]);
    });
  }, []);

  // Function to load more results
  const loadMoreResults = useCallback(() => {
    if (hasMoreResults && !isLoadingMore && userSearchTerm.trim()) {
      handleUserSearch(userSearchTerm, searchPage + 1, true);
    }
  }, [handleUserSearch, hasMoreResults, isLoadingMore, searchPage, userSearchTerm]);

  // Reset pagination when search term changes
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserSearchTerm(value);

    // Reset pagination state
    setSearchPage(1);
    setHasMoreResults(true);

    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
      window.searchTimeout = null;
    }

    if (!value.trim()) {
      setUsers([]);
      return;
    }

    if (value.trim().length < 4) {
      return;
    }

    window.searchTimeout = setTimeout(() => {
      // Always start from page 1 for new searches
      handleUserSearch(value, 1, false);
    }, 600);
  }, [handleUserSearch]);

  // Handler for when a new address is created
  const handleAddressCreated = (newAddress: { id: string; sampleid: number; full_address: string }) => {
    setAddresses(prev => [...prev, newAddress]);
    setDeliveryAddressId(newAddress.id); // Auto-select the newly created address
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const bookingData: any = {
      service_date: serviceDate,
      service_time: serviceTime,
      place_to_supply: placeToSupply,
      place_to_deliver: placeToDeliver,
      razorpay_order_id: razorpayOrderId,
      invoice_number: invoiceNumber,
      advance_receipt_number: advanceReceiptNumber,
      transaction_id: transactionId,
      user_id: userId, // Include selected user
      provider_id: providerId, // Include selected provider
      delivery_address_id: deliveryAddressId, // Include selected delivery address
      selection_type: selectionType, // Include selection type
    };

    // Add category or package-specific data based on selectionType
    if (selectionType === "Category") {
      // Send encrypted IDs directly to backend (don't use parseInt on encrypted strings)
      bookingData.category_id = selectedCategoryId || null;
      bookingData.subcategory_id = selectedSubcategoryId || null;
      bookingData.filter_attribute_id = selectedFilterAttributesId || null;
      bookingData.filter_option_id = selectedFilterOptionId || null;

      // Debug logging
      console.log('Frontend Debug - selectedCategoryId:', selectedCategoryId);
      console.log('Frontend Debug - bookingData.category_id:', bookingData.category_id);
    } else if (selectionType === "Package") {
      bookingData.package_id = selectedPackageId || null;
    }

    console.log('Frontend Debug - Final bookingData:', bookingData);

    try {
      await createBooking(bookingData);

      toast({
        variant: "success",
        title: "Success",
        description: "Booking created successfully.",
      });
      setIsSubmitting(false);
      router.push("/admin/booking"); // Redirect after successful submission
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: `Failed to create rate card: ${error}`,
      });
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Booking Card Management</h1>
          <p className="text-gray-500">Create a new Booking</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle>Create New Booking</CardTitle>
                <CardDescription>Fill in the details below to create a new booking</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Category Selector */}

              <div className="space-x-2">
                <label className="text-sm font-medium text-gray-700">Selection Type</label>
                <Select value={selectionType} onValueChange={(value) => setSelectionType(value)}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Category">Category</SelectItem>
                    <SelectItem value="Package">Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>



              {selectionType === 'Category' && (
                <div className="space-y-4">
                  {/* Category Selector */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Globe2 className="w-4 h-4 text-blue-500" />
                      <span>Select Category</span>
                    </label>
                    <Select
                      value={selectedCategoryId}
                      onValueChange={(value) => setSelectedCategoryId(value)}
                    >
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) =>
                          category?.id && category?.name ? (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ) : null
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subcategory Selector */}
                  {subcategories.length > 0 && (
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <Globe2 className="w-4 h-4 text-blue-500" />
                        <span>Select Subcategory</span>
                      </label>
                      <Select
                        value={selectedSubcategoryId}
                        onValueChange={(value) => setSelectedSubcategoryId(value)}
                      >
                        <SelectTrigger className="bg-white border-gray-200">
                          <SelectValue placeholder="Select a subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategories.map((subcategory) =>
                            subcategory?.id && subcategory?.name ? (
                              <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                                {subcategory.name}
                              </SelectItem>
                            ) : null
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Filter Attributes Selector */}
                  {filterAttributes.length > 0 && (
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <Globe2 className="w-4 h-4 text-blue-500" />
                        <span>Select Filter Attributes</span>
                      </label>
                      <Select
                        value={selectedFilterAttributesId}
                        onValueChange={(value) => setSelectedFilterAttributesId(value)}
                      >
                        <SelectTrigger className="bg-white border-gray-200">
                          <SelectValue placeholder="Select filter attributes" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterAttributes.map((attribute) =>
                            attribute?.id && attribute?.name ? (
                              <SelectItem key={attribute.id} value={attribute.id.toString()}>
                                {attribute.name}
                              </SelectItem>
                            ) : null
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Filter Options Selector */}
                  {filterOptions.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Select Filter Option</label>
                      <Select
                        value={selectedFilterOptionId}
                        onValueChange={(value) => setSelectedFilterOptionId(value)}
                      >
                        <SelectTrigger className="bg-white border-gray-200">
                          <SelectValue placeholder="Select a filter option" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id!.toString()}>
                              {option.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {selectionType === 'Package' && (
                <div className="space-y-4">
                  {/* Package Selector */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Globe2 className="w-4 h-4 text-blue-500" />
                      <span>Select Package</span>
                    </label>
                    <Select
                      value={selectedPackageId} // State variable to track selected package
                      onValueChange={(value) => setSelectedPackageId(value)} // Update the state when a package is selected
                    >
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Select a package" />
                      </SelectTrigger>
                      <SelectContent>
                        {packages.map((pkg) =>
                          pkg?.id && pkg?.name ? (
                            <SelectItem key={pkg.id} value={pkg.id.toString()}>
                              {pkg.name}
                            </SelectItem>
                          ) : null
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}


              {/* <div>
                <label className="text-sm font-medium text-gray-700">Select User</label>
                <Select value={String(userId)} onValueChange={(value) => setUserId(Number(value))}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}
              {/* Add this to your form, replacing any existing user selection */}
              {/* // Replace the user search UI component */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search User</label>
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      placeholder="Search by mobile number (min 4 digits)..."
                      value={userSearchTerm}
                      onChange={handleSearchInputChange}
                      className="w-full"
                      type="tel" // Use tel input type for better mobile keyboard on touch devices
                      inputMode="numeric" // Suggest numeric keyboard
                      pattern="[0-9]*" // Only allow numbers
                    />
                    {isSearching && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                  {userSearchTerm.trim().length > 0 && userSearchTerm.trim().length < 4 && (
                    <p className="text-xs text-amber-600">Please enter at least 4 characters to search</p>
                  )}

                  {users.length > 0 && (
                    <div className="border rounded-md overflow-hidden">
                      <Virtuoso
                        style={{ height: "200px", width: "100%" }}
                        totalCount={users.length}
                        itemContent={(index) => {
                          const user = users[index];
                          return (
                            <div
                              key={user.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-0"
                              onClick={() => handleUserSelect(user)}
                            >
                              <div className="flex flex-col">
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-gray-500 flex justify-between">
                                  <span>ID: {user.sampleid || user.displayId || user.id}</span>
                                  <span>Mobile: {user.mobile}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }}
                        endReached={() => loadMoreResults()}
                        components={{
                          Footer: () =>
                            hasMoreResults ? (
                              <div className="p-2 text-center">
                                {isLoadingMore ? (
                                  <div className="flex justify-center items-center p-2">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span className="text-xs">Loading more...</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">Scroll for more results</span>
                                )}
                              </div>
                            ) : users.length > 0 ? (
                              <div className="p-2 text-center">
                                <span className="text-xs text-gray-500">End of results</span>
                              </div>
                            ) : null
                        }}
                      />
                    </div>
                  )}

                  {/* And in the selected user display */}
                  {userId !== null && selectedUser && (
                    <div className="p-2 bg-blue-50 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Selected User</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUserId(null);
                            setSelectedUser(null);
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="mt-1 text-sm">
                        <div><strong>Name:</strong> {selectedUser.name}</div>
                        <div><strong>ID:</strong> {selectedUser.displayId || selectedUser.id}</div>
                        <div><strong>Mobile:</strong> {selectedUser.mobile}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>





              {/* Provider Search and Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Provider</label>

                {/* Provider Search Input */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search providers by name, company, or phone..."
                    value={providerSearchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setProviderSearchTerm(value);

                      // Debounce search
                      if (window.providerSearchTimeout) {
                        clearTimeout(window.providerSearchTimeout);
                      }

                      window.providerSearchTimeout = setTimeout(() => {
                        handleProviderSearch(value);
                      }, 500);
                    }}
                    className="bg-white border-gray-200"
                  />
                  {isLoadingProviders && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Provider Results */}
                {providers.length > 0 && (
                  <div className="border border-gray-200 rounded-md bg-white max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs text-gray-500 mb-2">
                        {providers.length} provider{providers.length !== 1 ? 's' : ''} found
                      </div>

                      {providers.map((provider) => (
                        <div
                          key={provider.id}
                          className={`p-2 rounded cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                            providerId === provider.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => setProviderId(provider.id)}
                        >
                          <div className="font-medium text-sm">{provider.name}</div>
                          <div className="text-xs text-gray-500">ID: {provider.sampleid}</div>
                        </div>
                      ))}

                      {/* Load More Button */}
                      {hasMoreProviders && (
                        <div className="pt-2 border-t border-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={loadMoreProviders}
                            disabled={isLoadingMoreProviders}
                            className="w-full"
                          >
                            {isLoadingMoreProviders ? (
                              <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading more...</span>
                              </div>
                            ) : (
                              <span>Load More Providers</span>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Selected Provider Display */}
                {providerId && (
                  <div className="p-2 bg-green-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">Selected Provider</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setProviderId(null)}
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="mt-1 text-sm">
                      <div><strong>Name:</strong> {providers.find(p => p.id === providerId)?.name}</div>
                      <div><strong>ID:</strong> {providers.find(p => p.id === providerId)?.sampleid}</div>
                    </div>
                  </div>
                )}
              </div>


              {userId && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Delivery Address</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add New Address
                    </Button>
                  </div>

                  {addresses.length > 0 ? (
                    <>
                      <Select
                        value={deliveryAddressId || ""}
                        onValueChange={(value) => setDeliveryAddressId(value || null)}
                      >
                        <SelectTrigger className="bg-white border-gray-200">
                          <SelectValue placeholder="Select Address" />
                        </SelectTrigger>
                        <SelectContent>
                          {addresses.map((address) => (
                            <SelectItem key={address.id} value={address.id}>
                              {address.full_address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {deliveryAddressId && (
                        <div className="mt-1 text-sm text-gray-600">
                          Selected Address ID: {addresses.find(a => a.id === deliveryAddressId)?.sampleid}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-md text-center">
                      <p className="text-sm text-gray-500 mb-2">No addresses found for this user</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddressModalOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Address
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Service Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Service Date</label>
                <Input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  required
                />
              </div>

              {/* Service Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Service Time</label>
                <Input
                  type="time"
                  value={serviceTime}
                  onChange={(e) => setServiceTime(e.target.value)}
                  required
                />
              </div>

              {/* Place to Supply */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Place to Supply</label>
                <Input
                  type="text"
                  placeholder="Enter supply location"
                  value={placeToSupply}
                  onChange={(e) => setPlaceToSupply(e.target.value)}
                  required
                />
              </div>

              {/* Place to Deliver */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Place to Deliver</label>
                <Input
                  type="text"
                  placeholder="Enter delivery location"
                  value={placeToDeliver}
                  onChange={(e) => setPlaceToDeliver(e.target.value)}
                  required
                />
              </div>

              {/* Razorpay Order ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Razorpay Order ID (Optional)</label>
                <Input
                  type="text"
                  placeholder="Enter Razorpay order ID (optional)"
                  value={razorpayOrderId}
                  onChange={(e) => setRazorpayOrderId(e.target.value)}
                />
              </div>

              {/* Invoice Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Invoice Number (Optional)</label>
                <Input
                  type="text"
                  placeholder="Enter invoice number (auto-generated if empty)"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>

              {/* Advance Receipt Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Advance Receipt Number (Optional)</label>
                <Input
                  type="text"
                  placeholder="Enter advance receipt number (auto-generated if empty)"
                  value={advanceReceiptNumber}
                  onChange={(e) => setAdvanceReceiptNumber(e.target.value)}
                />
              </div>

              {/* Transaction ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Transaction ID (Optional)</label>
                <Input
                  type="text"
                  placeholder="Enter transaction ID (optional)"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>

              <div className="flex space-x-3 pt-6">
                <Button className="w-100 flex-1 h-11 bg-primary" disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="loader" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <span>Save Rate Card</span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Address Modal */}
      {userId && (
        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          userId={userId}
          onAddressCreated={handleAddressCreated}
        />
      )}
    </div>
  );
};

export default AddBookingForm;
