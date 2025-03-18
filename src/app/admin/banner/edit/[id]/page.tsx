"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import ReactSelect from "react-select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Save, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getBanner, updateBanner, Banner, Hub, fetchAllCategories, fetchAllSubCategories, fetchAllRatecard, fetchAllpackages, fetchAllHubsWithoutPagination } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { Virtuoso } from "react-virtuoso";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const quillModules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const EditBannerForm: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectionType, setSelectionType] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [deepLink, setDeepLink] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [latitude, setLatitude] = useState<string>("");
  const [mediaName, setMediaName] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [radius, setRadius] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addToCart, setAddToCart] = useState(false);
  const [hubOptions, setHubOptions] = useState<Hub[]>([]);
  const [hubIds, setHubIds] = useState<string[]>([]);
  const [displayOrderError, setDisplayOrderError] = useState<string>("");
  const [radiusError, setRadiusError] = useState<string>("");
   const [isFree, setIsFree] = useState<boolean>(false); // New state for is_free
      const [rateCardId, setRateCardId] = useState<string | null>(null); // New state for selected rate card ID
      const [rateCardOptions, setRateCardOptions] = useState<{ id: string; name: string }[]>([]); // Options for rate cards
  const [selectedOptionName, setSelectedOptionName] = useState<string>("Select an option");
      
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchBannerData = async () => {
      if (!id) return;
      try {
        const banner: Banner = await getBanner(id.toString());
        setTitle(banner.title);
        setDescription(banner.description);
        setSelectionType(banner.selection_type);
        setSelectedItemId(banner.selection_id);
        setMediaType(banner.media_type);
        setDisplayOrder(banner.display_order || 1);
        setDeepLink(banner.deep_link || "");
        setLatitude(banner.latitude?.toString() || "");
        setLongitude(banner.longitude?.toString() || "");
        setRadius(banner.radius || null);
        setStartDate(banner.start_date ? format(new Date(banner.start_date), "yyyy-MM-dd") : "");
        setEndDate(banner.end_date ? format(new Date(banner.end_date), "yyyy-MM-dd") : "");
        setIsActive(banner.is_active);
        setAddToCart(banner.add_to_cart || false);
        setHubIds(banner.hub_ids || []);
        setMediaName(banner.media_name || "");
        setIsFree(banner.is_free);
        setRateCardId(banner.rate_card_id?.toString() || null); // Ensure it's a string
      } catch (error) {
        toast({ variant: "error", title: "Error", description: "Failed to load banner data." });
      }
    };

    const loadHubs = async () => {
      try {
        const hubs = await fetchAllHubsWithoutPagination();
        setHubOptions(hubs);
      } catch (error) {
        toast({ variant: "error", title: "Error", description: "Failed to load hubs." });
      }
    };

    fetchBannerData();
    loadHubs();
  }, [id, toast]);


   useEffect(() => {
      const loadRateCards = async () => {
        try {
          const rateCards = await fetchAllRatecard(); // New API for fetching rate cards
          const options = rateCards.map((rateCard) => ({
            id: rateCard.id || '',
            name: rateCard.name || "Unnamed Ratecard",
          }));
          setRateCardOptions(options);
        } catch (error) {
          toast({
            variant: "error",
            title: "Error",
            description: "Failed to load rate cards for free promocode.",
          });
        }
      };
    
      if (isFree) loadRateCards(); // Fetch only if isFree is true
    }, [isFree, toast]);

    useEffect(() => {
      const loadOptions = async () => {
        try {
          let data: { id: string; name: string }[] = [];
    
          switch (selectionType) {
            case "Ratecard": {
              const ratecards = await fetchAllRatecard();
              data = ratecards.map((ratecard) => ({
                id: ratecard.id?.toString() || '',
                name: ratecard.name || "Unnamed Ratecard",
              }));
              break;
            }
            case "Package": {
              const packages = await fetchAllpackages();
              data = packages.map((pkg) => ({
                id: pkg.id?.toString() || '',
                name: pkg.name || "Unnamed Package",
              }));
              break;
            }
            default:
              setOptions([]);
              return;
          }
    
          setOptions(data);
    
          // Find selected option after setting options
          const selectedOption = data.find((option) => option.id === selectedItemId);
          setSelectedOptionName(selectedOption?.name || "Select an option");
    
        } catch (error) {
          toast({
            variant: "error",
            title: "Error",
            description: `Failed to load ${selectionType} options.`,
          });
        }
      };
    
      loadOptions();
    }, [selectionType, selectedItemId]); // Add dependencies
    
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };


  const handleValueChange = (value: string) => {
    const selectedOption = options.find((option) => option.id?.toString() === value);
    if (selectedOption) {
      setSelectedItemId(value.toString());
      setSelectedOptionName(`${selectedOption.name}`);
    } else {
      setSelectedOptionName("Select an option");
    }
  };
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("title", title)
    console.log("description", description)
    console.log("selectionType", selectionType)
    console.log("selectedItemId", selectedItemId)

    if (!title || !description || !selectionType || !selectedItemId) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const bannerData: Banner = {
        title,
        description,
        selection_type: selectionType,
        selection_id: selectedItemId,
        media_type: mediaType,
        display_order: displayOrder,
        deep_link: deepLink,
        latitude: Number(latitude),
        longitude: Number(longitude),
        radius,
        start_date: startDate,
        end_date: endDate,
        is_active: isActive,
        image,
        add_to_cart: addToCart,
        hub_ids: hubIds,
        is_free: isFree, // New field
        rate_card_id: isFree ? rateCardId : null,
      };

      await updateBanner(id!.toString(), bannerData);

      toast({
        variant: "success",
        title: "Success",
        description: "Banner updated successfully.",
      });
       router.push("/admin/banner");
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: `${error}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <form onSubmit={onSubmit} className="space-y-6">
            <CardHeader>
              <CardTitle>Edit Banner</CardTitle>
              <CardDescription>Update the details below to edit the banner</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Banner Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter banner title"
                  required
                />
              </div>

              <div className="space-y-2" style={{ height: "270px" }}>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-5 text-blue-500" />
                  <span>Description</span>
                </label>
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  theme="snow"
                  modules={quillModules}
                  style={{ height: "200px" }}
                />
              </div>

            

              <div className="space-x-2">
                <label className="text-sm font-medium text-gray-700">Selection Type</label>
                <Select value={selectionType} onValueChange={(value) => setSelectionType(value)}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="Category">Category</SelectItem>
                    <SelectItem value="Subcategory">Subcategory</SelectItem> */}
                    <SelectItem value="Ratecard">Ratecard</SelectItem>
                    <SelectItem value="Package">Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>

               {selectionType && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Select {selectionType}</label>
                                <Select value={String(selectedItemId)} onValueChange={handleValueChange}>
                                  <SelectTrigger className="bg-white border-gray-200">
                                  {selectedOptionName || "Select an option"}
                                  </SelectTrigger>
                                  <SelectContent>
                                  <Virtuoso
                                                style={{ height: "200px", width: "100%" }} // Full width and fixed height
                                                totalCount={options.length}
                                                itemContent={(index:any) => (
                                                  <SelectItem key={options[index].id} value={options[index].id?.toString() ?? ''}>
                                                    {options[index].name} {options[index].name || ""}
                                                  </SelectItem>
                                                )}
                                              />
                                    
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

              <div>
                <label className="text-sm font-medium text-gray-700">Display Order</label>
                <Input
                  type="number"
                  placeholder="Enter display order"
                  value={displayOrder || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (parseFloat(value) < 0) {
                      setDisplayOrderError("Display Order cannot be negative.");
                      setDisplayOrder(parseFloat(value));
                    } else {
                      setDisplayOrderError("");
                      setDisplayOrder(parseFloat(value));
                    }
                  }}
                  className="h-11"
                  required
                />
                {displayOrderError && <p className="text-red-500 text-sm">{displayOrderError}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Deep Link URL</label>
                <Input
                  value={deepLink}
                  onChange={(e) => setDeepLink(e.target.value)}
                  placeholder="Enter deep link URL"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Hubs</label>
                <ReactSelect
                  isMulti
                  options={hubOptions.map((hub) => ({
                    value: hub.id,
                    label: hub.hub_name || `Unnamed Hub (ID: ${hub.id})`,
                  }))}
                  value={hubIds.map((id) => {
                    const hub = hubOptions.find((hub) => hub.id === id);
                    return hub
                      ? { value: hub.id, label: hub.hub_name || `Unnamed Hub (ID: ${hub.id})` }
                      : null;
                  }).filter(Boolean)} // Filter out null values to avoid invalid entries
                  onChange={(selectedOptions) =>
                    setHubIds(selectedOptions.map((option) => option?.value!.toString() ?? ''))
                  }
                  placeholder="Select Hubs"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Add to Cart</label>
                <Switch checked={addToCart} onCheckedChange={setAddToCart} className="bg-primary" />
              </div>

              <div>
                <label>Latitude</label>
                <Input type="number" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
              </div>
              <div>
                <label>Longitude</label>
                <Input type="number" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Radius (in km)</label>
                <Input
                  type="number"
                  placeholder="Enter radius"
                  value={radius || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (parseFloat(value) < 0) {
                      setRadiusError("Radius cannot be negative.");
                      setRadius(parseFloat(value));
                    } else {
                      setRadiusError("");
                      setRadius(parseFloat(value));
                    }
                  }}
                  className="h-11"
                  required
                />
                {radiusError && <p className="text-red-500 text-sm">{radiusError}</p>}
              </div>
              <div>
                <label>Start Date</label>
                <Input type="date" value={startDate} min={today} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label>End Date</label>
                <Input type="date" value={endDate} min={startDate || today} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Media Type</label>
                <Select value={mediaType} onValueChange={(value) => setMediaType(value as "image" | "video")}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Media Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Upload Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Media Preview</label>
                {mediaType === "image" && mediaName && (
                  <img src={mediaName} alt="Banner Media" className="w-32 h-32 object-cover" />
                )}
                {mediaType === "video" && mediaName && (
                  <video controls className="w-32 h-32">
                    <source src={mediaName} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

                <div>
                <label className="text-sm font-medium text-gray-700">Is Free</label>
                <Switch checked={isFree} onCheckedChange={setIsFree} />
              </div>
              
              {isFree && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Select Ratecard</label>
                  <Select value={rateCardId || ""} onValueChange={(value) => setRateCardId(value)}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select Ratecard" />
                    </SelectTrigger>
                    <SelectContent>
                      {rateCardOptions.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} className="bg-primary" />
                <span>Active</span>
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Banner
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditBannerForm;
