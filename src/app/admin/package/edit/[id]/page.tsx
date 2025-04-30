"use client";
import React, { useState, useEffect, FormEvent, ChangeEvent, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, ImageIcon, FileText, ChevronDown,Globe2 } from 'lucide-react';
import { fetchRateCardsByProvider, fetchAllCategories, fetchPackageById, updatePackage, Package,Provider,fetchProviders,fetchProviderById } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Virtuoso } from "react-virtuoso";

// Import React-Quill dynamically
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Quill modules
const quillModules = {
  toolbar: [
    [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
    [{ 'size': [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

const PackageEditForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [packageImage, setPackageImage] = useState<File | null>(null);
  const [description, setDescription] = useState<string>('');
  const [packageName, setPackageName] = useState<string>('');
  const [packageType, setPackageType] = useState<string>('regular');
  const [createdBy, setCreatedBy] = useState<string>('admin');
const [providers, setProviders] = useState<Provider[]>([]);
  const [providerId, setProviderId] = useState<string>("");
    const [discountType, setDiscountType] = useState<string>('flat');
  const [discountValue, setDiscountValue] = useState<number| null>(0);
  const [validityPeriod, setValidityPeriod] = useState<number | null>(null);
  const [renewalOptions, setRenewalOptions] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [rateCards, setRateCards] = useState<any[]>([]);
  const [selectedRateCards, setSelectedRateCards] = useState<string[]>([]);
  const [isRateCardDropdownOpen, setIsRateCardDropdownOpen] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // **Selected Addon Categories**
  const [categories, setCategories] = useState<any[]>([]); // **Addon Categories**
  const [discountError, setDiscountError] = useState<string | null>(null); // State for error message
// Provider-related state
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
   const [selectedProviderName, setSelectedProviderName] = useState<string>("Select an option");
 
  const [noService, setNoService] = useState<number | null>(null);
  const [isAddonDropdownOpen, setIsAddonDropdownOpen] = useState<boolean>(false); // **Addon Dropdown Toggle**
  const [searchQuery, setSearchQuery] = useState("");
  const [providerSearchTerm, setProviderSearchTerm] = useState("");
  const [rateCardSearchTerm, setRateCardSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Extract the ID from the URL path
  const id = pathname?.split('/').pop();

  // Fetch rate cards and addon categories on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoryResponse] = await Promise.all([
          fetchAllCategories(),
        ]);
        setCategories(categoryResponse || []);
      } catch (error) {
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Failed to load data.',
        });
      }
    };
    fetchInitialData();
  }, []);


  const filteredProviders = useMemo(() => {
    return providers.filter(provider => 
      `${provider.first_name} ${provider.last_name || ''}`
        .toLowerCase()
        .includes(providerSearchTerm.toLowerCase())
    );
  }, [providers, providerSearchTerm]);

  // Filter rate cards based on search term and provider
  const filteredRateCards = useMemo(() => {
    return rateCards.filter(rateCard => {
      const text = `${rateCard.category?.name || ''} | ${rateCard.subcategory?.name || ''} | ${rateCard.attributes
        ?.map((attr: any) => `${attr.filterAttribute?.name || ''}: ${attr.filterOption?.value || ''}`)
        .join(", ") || "N/A"}`
        .toLowerCase();
      
      return text.includes(rateCardSearchTerm.toLowerCase());
    });
  }, [rateCards, rateCardSearchTerm]);

  // Update provider selection and fetch their rate cards
  const handleProviderChange = async (providerId: string) => {
    const selectedProvider = providers.find(p => p.id?.toString() === providerId);
    if (selectedProvider) {
      setSelectedProviderId(providerId);
      setSelectedProviderName(`${selectedProvider.first_name} ${selectedProvider.last_name || ''}`);
      
      try {
        const providerRateCards = await fetchRateCardsByProvider(providerId);
        setRateCards(providerRateCards || []);
      } catch (error) {
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to load rate cards for this provider",
        });
        setRateCards([]);
      }
    } else {
      setSelectedProviderId("");
      setSelectedProviderName("Select an option");
      setRateCards([]);
    }
  };
  // Fetch existing package data
  useEffect(() => {
    const loadPackageData = async () => {
      if (!id) return;
      try {
         const fetchedProviders = await fetchProviders();
            setProviders(fetchedProviders);
        const packageData = await fetchPackageById(id.toString());

        // Set package details
        setPackageName(packageData.name);
        setDescription(packageData.description || '');
        setPackageType(packageData.package_type);
       // setCreatedBy(packageData.created_by);
       
        setSelectedProviderId(packageData.provider_id ? packageData.provider_id.toString() : '');
        if (packageData.provider_id) {
          await loadProviders(packageData.provider_id);
         
        }
        setDiscountType(packageData.discount_type);
        setDiscountValue(Number(packageData.discount_value));
        setValidityPeriod(packageData.validity_period || null);
        setRenewalOptions(Boolean(packageData.renewal_options));
        setIsActive(Boolean(packageData.is_active));
        setNoService(packageData.no_of_service || null);
        // Pre-select rate cards based on the response
        const preSelectedRateCards = packageData.rateCards?.map((rc: any) => rc.rate_card_id);
        setSelectedRateCards(preSelectedRateCards ?? []);
        const preSelectedAddons = packageData.addons?.map((addon: any) => addon.category_id.toString());
        setSelectedCategories(preSelectedAddons ?? []);

        if (packageData.image) setImagePreview(`${packageData.image}`);
      } catch (error) {
        console.log('Failed to load package details.', error);
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Failed to load package details.',
        });
      }
    };
    loadPackageData();
  }, [id]);

  // Handle image upload
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPackageImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };


 const loadProviders = async (providerid:string) => {
     try {
       const fetchedProviders = await fetchProviders();
       setProviders(fetchedProviders);
       const selectedProvider = fetchedProviders.find((provider) => provider.id?.toString() === providerid);
 
         setSelectedProviderName(`${selectedProvider?.first_name} ${selectedProvider?.last_name}`);
         console.log("tSelectedProviderName",selectedProviderId)
         const rateCardResponse = await fetchRateCardsByProvider(providerid); // Pass provider ID
                 setRateCards(rateCardResponse || []);
     } catch (error) {
      setProviders([]);
     }
   };


   const handleValueChange = (value: string) => {
    const selectedProvider = providers.find((provider) => provider.id?.toString() === value);
    if (selectedProvider) {
      setSelectedProviderId(value);
      setSelectedProviderName(`${selectedProvider.first_name} ${selectedProvider.last_name}`);
    } else {
      setSelectedProviderName("Select an option");
    }
  };
  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!packageName || !discountType || !discountValue) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Please fill all the required fields.',
      });
      setIsSubmitting(false);
      return;
    }

    // Construct the Package object
    const packageData: Package = {
      id: id ? id.toString() : '', // Correct way to assign id as a string
      name: packageName,
      description: description || '', // Ensure description is not null
      image: packageImage || null,
      package_type: packageType,
      created_by: createdBy,
      provider_id: selectedProviderId,
      discount_type: discountType,
      discount_value: discountValue,
      validity_period: packageType === 'amc' ? validityPeriod : null,
      renewal_options: renewalOptions,
      is_active: isActive,
      rate_card_ids: selectedRateCards,
      addon_category_ids: selectedCategories, // **Addon Categories**
      no_of_service: noService,
    };

    try {
      await updatePackage(id ? id.toString() : '', packageData);
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Package updated successfully.',
      });
      setIsSubmitting(false);

      router.push('/admin/package'); // Redirect to the packages list after success
    } catch (error: any) {
      console.log("error.messag",error.messag)
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to update package.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
        const loadProvider = async () => {
          try {
             const fetchedProviders = await fetchProviders();
                  setProviders(fetchedProviders);
          } catch {
            toast({
              variant: "error",
              title: "Error",
              description: "Failed to load provider.",
            });
          }
        };
        loadProvider();
      }, []);
  // Handle rate card selection
  const handleRateCardSelection = (rateCardId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedRateCards((prev) => [...prev, rateCardId]);
    } else {
      setSelectedRateCards((prev) => prev.filter((id) => id !== rateCardId));
    }
  };

  const sortedRateCards = [...filteredRateCards].sort((a, b) => {
    const aSelected = selectedRateCards.includes(a.id.toString());
    const bSelected = selectedRateCards.includes(b.id.toString());
  
    // Put selected cards first
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Package Management</h1>
          <p className="text-gray-500">Edit package details</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">Edit Package</CardTitle>
                <CardDescription className="text-gray-500">
                  Update the package details below
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Package Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Package Name</label>
                <Input
                  placeholder="Enter package name"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              {/* Description Field with React-Quill */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  theme="snow"
                  modules={quillModules}
                  style={{ height: "200px" }}
                />
              </div>

              {/* Package Image Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Package Image</label>
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="h-11" />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Package Preview" className="h-32 w-32 object-cover rounded-md" />
                  </div>
                )}
              </div>

              {/* Package Type Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Package Type</label>
                <Select value={packageType} onValueChange={setPackageType}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select package type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="amc">AMC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

             

             <div className="space-y-2 w-full">
               <label className="text-sm font-medium text-gray-700">Select Provider</label>
               <Select value={selectedProviderId || ""} onValueChange={handleValueChange}>
                 <SelectTrigger className="w-full">
                   {selectedProviderName || "Select an option"}
                 </SelectTrigger>
                 <SelectContent className="w-full p-0">
                   {/* Search input */}
                   <div className="sticky top-0 z-10 bg-background p-2 border-b">
                     <Input
                       placeholder="Search providers..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full"
                       autoFocus
                     />
                   </div>
                   
                   {/* Filtered provider list */}
                   {providers.filter(provider => 
                     `${provider.first_name} ${provider.last_name || ''}`
                       .toLowerCase()
                       .includes(searchTerm.toLowerCase())
                   ).length > 0 ? (
                     <Virtuoso
                       style={{ height: "200px", width: "100%" }}
                       totalCount={providers.filter(provider => 
                         `${provider.first_name} ${provider.last_name || ''}`
                           .toLowerCase()
                           .includes(searchTerm.toLowerCase())
                       ).length}
                       itemContent={(index) => {
                         const filteredProviders = providers.filter(provider => 
                           `${provider.first_name} ${provider.last_name || ''}`
                             .toLowerCase()
                             .includes(searchTerm.toLowerCase())
                         );
                         const provider = filteredProviders[index];
                         return (
                           <SelectItem 
                             key={provider.id} 
                             value={provider.id?.toString() ?? ''}
                           >
                             {provider.first_name} {provider.last_name || ""}
                           </SelectItem>
                         );
                       }}
                     />
                   ) : (
                     <div className="py-6 text-center text-sm text-muted-foreground">
                       No providers found
                     </div>
                   )}
                 </SelectContent>
               </Select>
             </div>


             
             {/* Rate Card Dropdown with Virtualized List */}
             <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700">Select Rate Cards</label>
               <div className="relative">
                 <button
                   type="button"
                   className="flex items-center justify-between w-full p-2 bg-white border border-gray-200 rounded"
                   onClick={() => setIsRateCardDropdownOpen(!isRateCardDropdownOpen)}
                 >
                   {selectedRateCards.length > 0 ? `Selected (${selectedRateCards.length})` : 'Select rate cards'}
                   <ChevronDown className="w-4 h-4" />
                 </button>
                 
                 {isRateCardDropdownOpen && (
               <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-hidden">
                 {/* Search Input */}
                 <input
                   type="text"
                   placeholder="Search..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full p-2 border-b border-gray-300 focus:outline-none"
                 />
             
                 <Virtuoso
                   style={{ height: "240px", width: "100%" }}
                   totalCount={sortedRateCards.length}
itemContent={(index) => {
  const rateCard = sortedRateCards[index];
                     return (
                       <div key={rateCard.id} className="flex items-center p-2">
                         <Checkbox
                           checked={selectedRateCards.includes(rateCard.id.toString())}
                           onCheckedChange={(checked: any) =>
                             handleRateCardSelection(rateCard.id.toString(), checked)
                           }
                           id={`rateCard-${rateCard.id}`}
                         />
                         <label htmlFor={`rateCard-${rateCard.id}`} className="ml-2">
                         {rateCard.category?.name} | {rateCard.subcategory?.name} |{rateCard.price} |{" "}
              <p>
                {rateCard.attributes
                  ?.map((attr:any) => `${attr.filterAttribute?.name}: ${attr.filterOption?.value || ''}`)
                  .join(", ") || "N/A"}
              </p>
              {rateCard.provider?.first_name}
                         </label>
                       </div>
                     );
                   }}
                 />
               </div>
             )}
               </div>
             </div>
             


              {/* Addon Categories Dropdown with Checkbox Selection */}
              {/* <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Addon Categories</label>
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center justify-between w-full p-2 bg-white border border-gray-200 rounded"
                    onClick={() => setIsAddonDropdownOpen(!isAddonDropdownOpen)}
                  >
                    {selectedCategories.length > 0 ? `Selected (${selectedCategories.length})` : 'Select addon categories'}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isAddonDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-auto">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center p-2">
                          <Checkbox
                            checked={selectedCategories.includes(category.id.toString())}
                            onCheckedChange={(checked: any) =>
                              handleCategorySelection(category.id.toString(), checked)
                            }
                            id={`category-${category.id}`}
                          />
                          <label htmlFor={`category-${category.id}`} className="ml-2">
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div> */}

              {/* Discount Fields */}
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Discount Type</label>
                  <Select value={discountType} onValueChange={setDiscountType}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

               <div className="flex-1 space-y-2">
                       <label className="text-sm font-medium text-gray-700">Discount Value</label>
                       <Input
                         type="number"
                         value={discountValue ?? ""}
                         onChange={(e) => {
                           const value = Number(e.target.value);
                           if (value < 0) {
                             setDiscountError("Discount value cannot be negative.");
                             setDiscountValue(value || null); // Set value
                           } else {
                             setDiscountError(null); // Clear error
                             setDiscountValue(value || null); // Set value
                           }
                         }}
                         placeholder="Enter discount value"
                         required
                       />
                       {discountError && (
                         <span className="text-red-500 text-sm">{discountError}</span>
                       )}
                     </div>
              </div>

              {/* Validity Period (for AMC only) */}
              {packageType === "amc" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Validity Period (months)</label>
                  <Input
                    type="number"
                    value={validityPeriod?.toString() || ''}
                    onChange={(e) => setValidityPeriod(parseInt(e.target.value))}
                    placeholder="Enter validity period"
                  />
                </div>
              )}

              {packageType === "amc" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">No of Service</label>
                  <Input
                    type="number"
                    value={noService?.toString() || ''}
                    onChange={(e) => setNoService(parseInt(e.target.value))}
                    placeholder="Enter No of service"
                  />
                </div>
              )}


              {/* Renewal Options */}
              <div className="flex items-center space-x-2">
                <Switch checked={renewalOptions} onCheckedChange={setRenewalOptions} />
                <span className="text-sm text-gray-700">Enable Renewal Options</span>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-sm text-gray-700">Active</span>
              </div>

              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Update Package</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t border-gray-100 mt-6" />
        </Card>
      </div>
    </div>
  );
};

export default PackageEditForm;
