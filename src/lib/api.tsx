import axios, { AxiosResponse } from 'axios';
import dotenv from "dotenv";
dotenv.config();

// Access environment variables
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Set the base URL for your API
// const BASE_URL = 'http://localhost:5001/admin';

// Initialize Axios instance with base URL
const apiClient = axios.create({
  baseURL: BASE_URL,
});


// Add Axios interceptor to handle expired tokens or unauthenticated responses
apiClient.interceptors.response.use(
  (response) => {
    // Return the response if it's successful
    return response;
  },
  (error) => {
    // Check for token expiration or missing token errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear localStorage or cookies to remove invalid token
      localStorage.removeItem('token');

      // Redirect to the login page
      window.location.href = '/auth/login'; // Adjust the login page URL if needed
    }
    // Propagate the error for further handling
    return Promise.reject(error);
  }
);
// Get the token from localStorage at the time of making a request
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/auth/login'; // Redirect to login
      return null;
    }
    return token;
  }
  return null;
};


// Define the structure of the Category object


export interface Category {
  id?: string; // Optional for editing
  name: string;
  image: File | null;
  locations: Location[];
  location_type: string;
  service_time?: string;
  optional_heading?: string;
  exclude_heading?: string;
  exclude_description?: string;
  location_method: string;
  active: boolean;
  attributes?: Attribute[];
  serviceDetails?: ServiceDetail[]; // Includes service details
  igst_tax?: number | null;   // IGST percentage
  sgst_tax?: number | null;   // SGST percentage
  cgst_tax?: number | null;   // CGST percentage
  sac_code?: string | null;   // SAC code
  excludeItems?: ExcludeItem[]; // Array of excluded items
  excludedImages?: ExcludeImage[]; // Array of excluded images
  includeItems?: IncludeItem[]; // Array of excluded items

}


// Define the structure of the Subcategory object
export interface Subcategory {
  id?: string; // Optional for editing
  name: string;
  image: File | null;
  category_id: number; // Associated category ID  // Field for SAC code
  service_time?: string;
  optional_heading?: string;
  exclude_heading?: string;
  exclude_description?: string;
  active: boolean;
  attributes?: Attribute[];
  serviceDetails?: ServiceDetail[]; // Includes service details
  igst_tax?: number | null;   // IGST percentage
  sgst_tax?: number | null;   // SGST percentage
  cgst_tax?: number | null;   // CGST percentage
  sac_code?: string | null;   // SAC code
  excludeItems?: ExcludeItem[]; // Array of excluded items
  excludedImages?: ExcludeImage[]; // Array of excluded images
  includeItems?: IncludeItem[]; // Array of excluded items
  meta_description?: string | null; // Field for meta description
  meta_keyword?: string | null;     // Field for meta keywords
}


export interface Location {
  country: string;
  state: string;
  city: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  source_type: string;
}




export type Attribute = {
  id?: number;
  name: string;
  type: string;
  options: AttributeOption[];
};


export interface AttributeOption {
  id?: number;
  value: string;
}

export type ServiceDetail = {
  id?: number;
  title: string;
  description: string;
};

export interface ExcludeItem {
  id?: number; // Auto-incremented primary key
  category_id?: number | null; // Foreign key for the category, nullable
  subcategory_id?: number | null; // Foreign key for the subcategory, nullable
  item: string; // The excluded item's name or identifier
  created_at?: number; // UNIX timestamp for creation
  updated_at?: number; // UNIX timestamp for last update
}


export type IncludeItem = {
  id?: string; // Optional for existing images
  title: string;
  description: string;
};

export interface ExcludeImage {
  id?: string; // Optional for existing images
  image_path: File; // Image file for the exclude section
}

// Define the structure of the RateCard object
export interface RateCard {
  id?: string;
  category_id: number;
  subcategory_id: number | null;
  filter_attribute_id: number | null;
  filter_option_id: number | null;
  provider_id: number | null; // Change here to allow null values
  name: string;
  description?: string;
  price: number;
  active: boolean;
}

export interface Addon {
  id?: string;
  package_id: number;
  category_id: number;
}

// Define the structure of the Package object
export interface Package {
  id?: string;
  name: string;
  description?: string;
  image?: File | null;
  package_type: string;
  created_by: string;
  provider_id?: string | null;
  discount_type: string;
  discount_value: number;
  final_price?: number;
  validity_period?: number | null;
  no_of_service?: number | null;
  renewal_options: boolean;
  is_active: boolean;
  rate_card_ids?: string[]; // Array of rate card IDs
  addon_category_ids?: string[]; // Array of addon category IDs
  addons?: Addon[]; // Detailed rate card information
  rateCards?: RateCard[]; // Detailed rate card information
}


export interface Page {
  id?: string; // Optional for editing
  title: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at?: number; // UNIX timestamp
  updated_at?: number; // UNIX timestamp
}


// Define the structure of the Provider object
export interface Provider {
  id?: string;
  first_name: string;
  last_name: string;
  gender?: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  company_name?: string;
  gst_number?: string;
  pan_number?: string;
  active: number;
  rating?: number;
  country?: string;
  state?: string;
  city?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
}


// Define the structure of the Bank object
export interface Bank {
  id?: string; // Optional for editing
  name: string;
  is_active: boolean;
  created_at?: number; // UNIX timestamp
  updated_at?: number; // UNIX timestamp
}

// Define the structure of the Provider Bank Detail object
export interface ProviderBankDetail {
  id?: string;
  provider_id: string;
  bank_id: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  account_type: 'savings' | 'current' | 'business';
  status?: 'pending' | 'verified' | 'rejected';
  created_at?: number;
  updated_at?: number;
  deleted_at?: number | null;
  primary?: boolean; // New field for marking primary account
}

// Define the structure of the User object
export interface User {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  signup_method?: 'email' | 'google' | 'facebook' | 'apple';
  social_id?: string;
  app_login_token?: string;
  referral_code?: string;
  vip_subscription_status?: 'active' | 'inactive';
  vip_subscription_start?: number;
  vip_subscription_expiry?: number;
  birthdate?: string;
  anniversary?: string;
  signup_location?: string;
  is_active: boolean;
  created_at?: number;
  updated_at?: number;
  deleted_at?: number | null;
}


export interface VIPPlan {
  id?: string; // Optional for editing
  plan_name: string;
  price: number;
  discount_price?: number; // Optional field for discount
  description: string;
  validity_period: number;
  status: boolean;
  image?: File | null; // Optional for image upload
  platform_fees: boolean; // Boolean for platform fees
  no_of_bookings: number; // Number of bookings included in the plan
}


export interface Banner {
  id?: string; // Optional for editing
  title: string; // Banner title
  description: string; // Banner description
  selection_type: string; // Specific selection type options
  selection_id: number | null; // ID of the selected item (category, subcategory, etc.)
  is_active: boolean; // Banner active status
  media_type: "image" | "video"; // Type of media (image or video)
  display_order?: number; // Optional order of display
  deep_link?: string; // Optional link for deeper navigation
  image?: File | null; // Optional file input for the banner image
  latitude?: number | null; // Latitude for geo-targeting
  longitude?: number | null; // Longitude for geo-targeting
  radius?: number | null; // Radius for targeting in kilometers
  start_date?: string; // Start date for banner visibility (ISO format: YYYY-MM-DD)
  end_date?: string; // End date for banner visibility (ISO format: YYYY-MM-DD)
}


export interface FAQ {
  id?: string; // Optional for editing
  question: string;
  answer: string;
  status: 'active' | 'inactive'; // Enum for status
  created_at?: number; // UNIX timestamp
  updated_at?: number; // UNIX timestamp
}



export interface Onboarding {
  id?: string; // Optional for editing
  title: string;
  description: string;
  is_active: boolean;
  image?: File | null; // Optional image upload
  created_at?: number; // UNIX timestamp
  updated_at?: number; // UNIX timestamp
}


export interface GstRate {
  id?: string; // Optional for editing
  CGST: number;
  SGST: number;
  IGST: number;
  is_active: boolean;
  created_at?: number; // UNIX timestamp
  updated_at?: number; // UNIX timestamp
  deleted_at?: number | null; // UNIX timestamp for soft-delete
}
export interface Booking {
  id?: string; // Optional for editing
  user_id: number;
  provider_id: number;
  order_number: string;
  booking_date: string;
  delivery_address_id:number;
  service_date?: string; // Added field for service date
  service_time?: string; // Added field for service time
  place_to_supply?: string; // Added field for supply location
  place_to_deliver?: string; // Added field for delivery location
  razorpay_order_id?: string; // Added field for Razorpay order ID
  invoice_number?: string; // Added field for invoice number
  advance_receipt_number?: string; // Added field for advance receipt number
  transaction_id?: string; // Transaction ID
  category_id?: number; // Category ID
  subcategory_id?: number; // Subcategory ID
  package_id?: number; // Package ID
  filter_attribute_id?: number; // Filter attribute ID
  filter_option_id?: number; // Filter option ID
  selection_type?: "Category" | "Package"; // Type of selection
  quantity: number;
  base_price: number;
  discount_amount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total_tax?: number;
  taxable_amount?: number;
  total_amount: number;
  status?: "pending" | "confirmed" | "completed" | "cancelled"; // Booking status
  payment_status?: "pending" | "paid" | "failed" | "refunded"; // Payment status
  payment_method?: "credit_card" | "debit_card" | "upi" | "wallet" | "net_banking" | "cod"; // Payment method
  address_id: number; // Address ID
  description?: string; // Additional details about the booking
  start_otp?: string; // OTP for starting the service
  end_otp?: string; // OTP for completing the service
  created_at?: number; // Created timestamp
  updated_at?: number; // Updated timestamp
  deleted_at?: number; // Soft delete timestamp
}




export interface Promocode {
  id?: string; // Optional for editing
  code: string; // Required promocode
  description?: string; // Optional description
  discount_type: "flat" | "percentage"; // Enum for discount type
  discount_value: number; // Required discount value
  min_order_value?: number | null; // Optional field for minimum order value
  start_date: string; // Required start date
  end_date: string; // Required end date
  status: "active" | "inactive" | "expired"; // Enum for promocode status
  selection_type: string; // Specific selection type options (Category, Subcategory, etc.)
  selection_id: number | null; // ID of the selected item (category, subcategory, etc.)
  is_global: boolean; // Indicates if the promocode is global
  display_to_customer: boolean; // Indicates if the promocode is visible to customers
  is_active: boolean; // Indicates if the promocode is active
  provider_id: string; // ID of the associated provider
  image?: File; // Optional image file for the promocode
}


export interface Blog {
  title: string;
  slug: string;
  description: string;
  image: File | null;
  is_active: boolean; // Replaced active with is_active
}


export interface Notification {
  title: string;
  message: string;
  type: "customer" | "provider";
  redirect_screen?:string;
  category_id?: number;
  subcategory_id?: number;
  recipients?: { id: number; name: string }[];
  inner_image?: File | null;
  outer_image?: File | null;
  is_active: boolean;
  send_to_all: boolean;
}



export interface WalletOffer {
  id?: number;
  event_type: "sign_up" | "order" | "referral" | "sign_up_referral";
  es_cash: number;
  start_date: string; // Format: YYYY-MM-DD
  end_date: string;   // Format: YYYY-MM-DD
  is_active: boolean;
  order_amount?: number | null; // Optional
}

// Role Interface
// Permission Interface
export interface Permission {
  id?: string; // Unique identifier for the permission
  permission_name: string; // Name of the permission group or type
  route: string; // Specific route or action associated with the permission
  created_at?: string; // Optional: Creation timestamp
  updated_at?: string; // Optional: Last update timestamp
}

// Role Interface
export interface Role {
  id?: string; // Optional for editing or database reference
  role_name: string; // Descriptive name of the role (e.g., Admin, Editor)
  active: boolean; // Indicates if the role is active
  permissions?: { id: string }[]; // Permission IDs to link permissions to roles
  created_at?: string; // Optional: Creation timestamp
  updated_at?: string; // Optional: Last update timestamp
}


export interface Setting {
  id?: string; // Optional for editing
  attribute_name: string; // Name of the attribute
  attribute_value: string; // Value of the attribute
  created_at?: number; // UNIX timestamp for creation
  updated_at?: number; // UNIX timestamp for update
}

export interface QuickService {
  id?: string; // Optional for editing
  image: File | null; // The image file
  active: boolean; // Indicates if the role is active
  category_ids: string[]; // Array of category IDs
}


// Define the structure of the Staff object
export interface Staff {
  id?: string; // Auto-incremented primary key
  parent_id: string; // Foreign key referencing the Provider
  first_name: string; // First name of the staff
  last_name?: string; // Optional last name of the staff
  gender?: 'male' | 'female' | 'other'; // Enum for gender
  email?: string; // Optional email address of the staff
  phone: string; // Required phone number
  adhaar_card_front?: File | null; // Aadhaar card front image
  adhar_card_number:string;
  pan_number:string;
  adhaar_card_back?: File | null; // Aadhaar card back image
  pan_card?: File | null; // PAN card image
  designation?: string; // Designation or role of the staff member
  active: boolean; // Indicates if the staff is active
  created_at?: number; // UNIX timestamp for creation
  updated_at?: number; // UNIX timestamp for last update
  deleted_at?: number | null; // UNIX timestamp for soft delete
}



// Country Interface
export interface Country {
  id?: string;
  name: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}


// State interface
export type State = {
  id?: string; // Optional because it may not be present during creation
  name: string;
  country_id: string;
  is_active: boolean;
  created_at?: string; // Optional, set automatically by the backend
  updated_at?: string; // Optional, set automatically by the backend
};


export interface City {
  id?: string;
  name: string;
  state_id: string;
  is_active?: boolean;
}


export interface Hub {
  id?: string;
  hub_name: string;
  hub_priority: string; // Priority as a string
  is_active: boolean;
}


export interface HubPincode {
  id?: number;
  hub_id: number;
  pincode: string;
  is_active?: boolean;
}


export interface SpHub {
  id?: number;
  hub_id: number;
  city_id: number;
  category_id?: number | null; // Allow null or undefined
  subcategory_id?: number;
  filter_attribute_id?: number;
  filter_option_id?: number;
  staff: number;
  weightage: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Define the structure of the API response
interface ApiResponse {
  status: boolean;
  message: string;
  data?: any;
}


interface ApiPermissionResponse {
  data?: any;
  [key: string]: Permission[]; // Dynamic keys mapping to arrays of Permission
}




export const fetchCategories = async (page = 1, size = 10, status: string = "all") => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== "all") {
      params.status = status;
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get("/category", {
      params, // Query params (page, size, status)
      headers: {
        "admin-auth-token": token || "", // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
};

// Function to fetch categories with attributes
export const fetchAllCategories = async (): Promise<Category[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/category/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch categories.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch categories.');
  }
};

// Function to fetch a specific category by ID
export const fetchCategoryById = async (id: string): Promise<Category> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/category/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch category.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch category.');
  }
};

export const createCategory = async (category: Category): Promise<ApiResponse> => {
  const formData = new FormData();

  // Basic Category Details
  formData.append('name', category.name);
  formData.append('active', category.active ? '0' : '1');

  // Image
  if (category.image) {
    formData.append('image', category.image);
  }

  // Locations
  formData.append('locationType', category.location_type);
  formData.append('locationMethod', category.location_method);
  formData.append('locations', JSON.stringify(category.locations));
  if (category.optional_heading !== null && category.optional_heading !== undefined) {
    formData.append('optional_heading', category.optional_heading.toString());
  }
  if (category.service_time !== null && category.service_time !== undefined) {
    formData.append('service_time', category.service_time.toString());
  }
  if (category.exclude_heading !== null && category.exclude_heading !== undefined) {
    formData.append('exclude_heading', category.exclude_heading.toString());
  }
  if (category.exclude_description !== null && category.exclude_description !== undefined) {
    formData.append('exclude_description', category.exclude_description.toString());
  }
  // GST and SAC Code
  if (category.sgst_tax !== null && category.sgst_tax !== undefined) {
    formData.append('sgst_tax', category.sgst_tax.toString());
  }
  if (category.cgst_tax !== null && category.cgst_tax !== undefined) {
    formData.append('cgst_tax', category.cgst_tax.toString());
  }
  if (category.igst_tax !== null && category.igst_tax !== undefined) {
    formData.append('igst_tax', category.igst_tax.toString());
  }
  if (category.sac_code) {
    formData.append('sac_code', category.sac_code);
  }

  // Attributes and Options
  if (category.attributes && category.attributes.length > 0) {
    const attributes = category.attributes.map((attr) => ({
      attribute_name: attr.name,
      attribute_type: attr.type,
      options: attr.options,
    }));
    formData.append('attributes', JSON.stringify(attributes));
  }

  // Service Details
  if (category.serviceDetails && category.serviceDetails.length > 0) {
    formData.append('serviceDetails', JSON.stringify(category.serviceDetails));
  }

  // Exclude Items
  if (category.excludeItems && category.excludeItems.length > 0) {
    const excludeItems = category.excludeItems.map((item) => ({
      item: item.item, // Use only the item field
    }));
    formData.append('excludeItems', JSON.stringify(excludeItems));
  }


  if (category.includeItems && category.includeItems.length > 0) {
    const includeItems = category.includeItems.map((item) => ({
      title: item.title,
      description: item.description,
    }));
    formData.append('includeItems', JSON.stringify(includeItems));
  }
 // Exclude Images
 if (category.excludedImages) {
  category.excludedImages.forEach((excludeImage, index) => {
    if (excludeImage.image_path instanceof File) {
      console.log(`Appending Excluded Image ${index}:`, excludeImage.image_path);
      formData.append('excludedImages', excludeImage.image_path); // Append the File object
    } else {
      console.warn(`Invalid image at index ${index}:`, excludeImage.image_path);
    }
  });
}



  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/category', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create category.');
  }
};



export const updateCategory = async (id: string, category: Category): Promise<ApiResponse> => {
  const formData = new FormData();

  // Basic Category Details
  formData.append('name', category.name);
  formData.append('active', category.active ? '0' : '1');

  // Image
  if (category.image) {
    formData.append('image', category.image);
  }

  // Locations
  formData.append('locationType', category.location_type);
  formData.append('locationMethod', category.location_method);
  formData.append('locations', JSON.stringify(category.locations));
  if (category.optional_heading !== null && category.optional_heading !== undefined) {
    formData.append('optional_heading', category.optional_heading.toString());
  }
  if (category.service_time !== null && category.service_time !== undefined) {
    formData.append('service_time', category.service_time.toString());
  }
  if (category.exclude_heading !== null && category.exclude_heading !== undefined) {
    formData.append('exclude_heading', category.exclude_heading.toString());
  }
  if (category.exclude_description !== null && category.exclude_description !== undefined) {
    formData.append('exclude_description', category.exclude_description.toString());
  }
  // GST and SAC Code
  if (category.sgst_tax !== null && category.sgst_tax !== undefined) {
    formData.append('sgst_tax', category.sgst_tax.toString());
  }
  if (category.cgst_tax !== null && category.cgst_tax !== undefined) {
    formData.append('cgst_tax', category.cgst_tax.toString());
  }
  if (category.igst_tax !== null && category.igst_tax !== undefined) {
    formData.append('igst_tax', category.igst_tax.toString());
  }
  if (category.sac_code) {
    formData.append('sac_code', category.sac_code);
  }

  // Attributes and Options
  if (category.attributes && category.attributes.length > 0) {
    const attributes = category.attributes.map((attr) => ({
      attribute_name: attr.name,
      attribute_type: attr.type,
      options: attr.options,
    }));
    formData.append('attributes', JSON.stringify(attributes));
  }

  // Service Details
  if (category.serviceDetails && category.serviceDetails.length > 0) {
    formData.append('serviceDetails', JSON.stringify(category.serviceDetails));
  }

  // Exclude Items
  if (category.excludeItems && category.excludeItems.length > 0) {
    const excludeItems = category.excludeItems.map((item) => ({
      item: item.item, // Use only the item field
    }));
    formData.append('excludeItems', JSON.stringify(excludeItems));
  }


  if (category.includeItems && category.includeItems.length > 0) {
    const includeItems = category.includeItems.map((item) => ({
      title: item.title,
      description: item.description,
    }));
    formData.append('includeItems', JSON.stringify(includeItems));
  }
 // Exclude Images
 if (category.excludedImages) {
  category.excludedImages.forEach((excludeImage, index) => {
    if (excludeImage.image_path instanceof File) {
      console.log(`Appending Excluded Image ${index}:`, excludeImage.image_path);
      formData.append('excludedImages', excludeImage.image_path); // Append the File object
    } else {
      console.warn(`Invalid image at index ${index}:`, excludeImage.image_path);
    }
  });
}

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/category/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update category.');
  }
};




export const deleteCategory = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/category/${id}`,  {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update category.');
  }
};



// Function to create a new subcategory with attributes
export const createSubcategory = async (subcategory: Subcategory): Promise<ApiResponse> => {
  const formData = new FormData();

  // Add required fields
  formData.append('name', subcategory.name);
  formData.append('category_id', subcategory.category_id.toString());
  formData.append('active', subcategory.active ? '0' : '1');

  // Add optional image field
  if (subcategory.image) {
    formData.append('image', subcategory.image);
  }

  if (subcategory.optional_heading !== null && subcategory.optional_heading !== undefined) {
    formData.append('optional_heading', subcategory.optional_heading.toString());
  }
  if (subcategory.service_time !== null && subcategory.service_time !== undefined) {
    formData.append('service_time', subcategory.service_time.toString());
  }
  if (subcategory.exclude_heading !== null && subcategory.exclude_heading !== undefined) {
    formData.append('exclude_heading', subcategory.exclude_heading.toString());
  }
  if (subcategory.exclude_description !== null && subcategory.exclude_description !== undefined) {
    formData.append('exclude_description', subcategory.exclude_description.toString());
  }
  // GST and SAC Code
  if (subcategory.sgst_tax !== null && subcategory.sgst_tax !== undefined) {
    formData.append('sgst_tax', subcategory.sgst_tax.toString());
  }
  if (subcategory.cgst_tax !== null && subcategory.cgst_tax !== undefined) {
    formData.append('cgst_tax', subcategory.cgst_tax.toString());
  }
  if (subcategory.igst_tax !== null && subcategory.igst_tax !== undefined) {
    formData.append('igst_tax', subcategory.igst_tax.toString());
  }
  if (subcategory.sac_code) {
    formData.append('sac_code', subcategory.sac_code);
  }

  // Attributes and Options
  if (subcategory.attributes && subcategory.attributes.length > 0) {
    const attributes = subcategory.attributes.map((attr) => ({
      attribute_name: attr.name,
      attribute_type: attr.type,
      options: attr.options,
    }));
    formData.append('attributes', JSON.stringify(attributes));
  }

  // Service Details
  if (subcategory.serviceDetails && subcategory.serviceDetails.length > 0) {
    formData.append('serviceDetails', JSON.stringify(subcategory.serviceDetails));
  }

  // Exclude Items
  if (subcategory.excludeItems && subcategory.excludeItems.length > 0) {
    const excludeItems = subcategory.excludeItems.map((item) => ({
      item: item.item, // Use only the item field
    }));
    formData.append('excludeItems', JSON.stringify(excludeItems));
  }


  if (subcategory.includeItems && subcategory.includeItems.length > 0) {
    const includeItems = subcategory.includeItems.map((item) => ({
      title: item.title,
      description: item.description,
    }));
    formData.append('includeItems', JSON.stringify(includeItems));
  }
 // Exclude Images
 if (subcategory.excludedImages) {
  subcategory.excludedImages.forEach((excludeImage, index) => {
    if (excludeImage.image_path instanceof File) {
      console.log(`Appending Excluded Image ${index}:`, excludeImage.image_path);
      formData.append('excludedImages', excludeImage.image_path); // Append the File object
    } else {
      console.warn(`Invalid image at index ${index}:`, excludeImage.image_path);
    }
  });
}


  // Add meta description and meta keywords fields
  if (subcategory.meta_description) {
    formData.append('meta_description', subcategory.meta_description);
  }
  if (subcategory.meta_keyword) {
    formData.append('meta_keyword', subcategory.meta_keyword);
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/sub-category', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create subcategory.');
  }
};


// Function to fetch categories with attributes
export const fetchAllSubCategories = async (): Promise<Subcategory[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/sub-category/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch sub  categories.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch categories.');
  }
};

// Adjust the fetchSubcategories API function to support pagination
export const fetchSubcategories = async (page = 1, size = 10,status: string = "all") => {
  try {
    const token = getToken(); // Retrieve the token
 // Prepare query parameters
 const params: Record<string, any> = {
  page,
  size,
};

// Include status filter only if it's not 'all'
if (status !== "all") {
  params.status = status;
}
    const response: AxiosResponse = await apiClient.get('/sub-category', {
      params,
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch subcategories');
  }
};


// Function to fetch categories with attributes
export const fetchSubCategoriesByCategoryId = async (categoryId: number): Promise<Subcategory[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/sub-category/category/${categoryId}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status && response.data.data) {
      return response.data.data; // Return the array of subcategories
    } else {
      throw new Error(response.data.message || 'Failed to fetch subcategories.');
    }
  } catch (error: any) {
    // Handle errors with proper checks
    const errorMessage = error.response?.data?.message || 'Failed to fetch subcategories.';
    throw new Error(errorMessage);
  }
};


// Function to fetch a specific subcategory by ID
export const fetchSubcategoryById = async (id: string): Promise<Subcategory> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/sub-category/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch subcategory.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch subcategory.');
  }
};

/// Function to update an existing subcategory with attributes
export const updateSubcategory = async (id: string, subcategory: Subcategory): Promise<ApiResponse> => {
  const formData = new FormData();

  
  // Add required fields
  formData.append('name', subcategory.name);
  formData.append('category_id', subcategory.category_id.toString());
  formData.append('active', subcategory.active ? '0' : '1');

  // Add optional image field
  if (subcategory.image) {
    formData.append('image', subcategory.image);
  }

  if (subcategory.optional_heading !== null && subcategory.optional_heading !== undefined) {
    formData.append('optional_heading', subcategory.optional_heading.toString());
  }
  if (subcategory.service_time !== null && subcategory.service_time !== undefined) {
    formData.append('service_time', subcategory.service_time.toString());
  }
  if (subcategory.exclude_heading !== null && subcategory.exclude_heading !== undefined) {
    formData.append('exclude_heading', subcategory.exclude_heading.toString());
  }
  if (subcategory.exclude_description !== null && subcategory.exclude_description !== undefined) {
    formData.append('exclude_description', subcategory.exclude_description.toString());
  }
  // GST and SAC Code
  if (subcategory.sgst_tax !== null && subcategory.sgst_tax !== undefined) {
    formData.append('sgst_tax', subcategory.sgst_tax.toString());
  }
  if (subcategory.cgst_tax !== null && subcategory.cgst_tax !== undefined) {
    formData.append('cgst_tax', subcategory.cgst_tax.toString());
  }
  if (subcategory.igst_tax !== null && subcategory.igst_tax !== undefined) {
    formData.append('igst_tax', subcategory.igst_tax.toString());
  }
  if (subcategory.sac_code) {
    formData.append('sac_code', subcategory.sac_code);
  }

  // Attributes and Options
  if (subcategory.attributes && subcategory.attributes.length > 0) {
    const attributes = subcategory.attributes.map((attr) => ({
      attribute_name: attr.name,
      attribute_type: attr.type,
      options: attr.options,
    }));
    formData.append('attributes', JSON.stringify(attributes));
  }

  // Service Details
  if (subcategory.serviceDetails && subcategory.serviceDetails.length > 0) {
    formData.append('serviceDetails', JSON.stringify(subcategory.serviceDetails));
  }

  // Exclude Items
  if (subcategory.excludeItems && subcategory.excludeItems.length > 0) {
    const excludeItems = subcategory.excludeItems.map((item) => ({
      item: item.item, // Use only the item field
    }));
    formData.append('excludeItems', JSON.stringify(excludeItems));
  }


  if (subcategory.includeItems && subcategory.includeItems.length > 0) {
    const includeItems = subcategory.includeItems.map((item) => ({
      title: item.title,
      description: item.description,
    }));
    formData.append('includeItems', JSON.stringify(includeItems));
  }
 // Exclude Images
 if (subcategory.excludedImages) {
  subcategory.excludedImages.forEach((excludeImage, index) => {
    if (excludeImage.image_path instanceof File) {
      console.log(`Appending Excluded Image ${index}:`, excludeImage.image_path);
      formData.append('excludedImages', excludeImage.image_path); // Append the File object
    } else {
      console.warn(`Invalid image at index ${index}:`, excludeImage.image_path);
    }
  });
}


  // Add meta description and meta keywords fields
  if (subcategory.meta_description) {
    formData.append('meta_description', subcategory.meta_description);
  }
  if (subcategory.meta_keyword) {
    formData.append('meta_keyword', subcategory.meta_keyword);
  }
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/sub-category/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update subcategory.');
  }
};

// Function to delete a subcategory
export const deleteSubcategory = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/sub-category/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete subcategory.');
  }
};



// Function to create a new rate card
export const createRateCard = async (rateCard: RateCard): Promise<ApiResponse> => {

  const payload = {
    name: rateCard.name,
    category_id: rateCard.category_id,
    provider_id: rateCard.provider_id || null,
    price: rateCard.price,
    active: rateCard.active ? 0 : 1,
    subcategory_id: rateCard.subcategory_id || null,
    filter_attribute_id: rateCard.filter_attribute_id || null,
    filter_option_id: rateCard.filter_option_id || null,
    description: rateCard.description || '',
  };
  
 
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/rate-card', payload, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create rate card.');
  }
};

// Function to fetch all rate cards with pagination
export const fetchRateCards = async (page = 1, size = 10,  status: string = "all") => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/rate-card', {
      params: { page, size, status },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch rate cards');
  }
};

export const fetchAllRatecard = async (): Promise<RateCard[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/rate-card/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch categories.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch categories.');
  }
};

// Function to fetch a specific rate card by ID
export const fetchRateCardById = async (id: string): Promise<RateCard> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/rate-card/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch rate card.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch rate card.');
  }
};

// Function to update an existing rate card
export const updateRateCard = async (id: string, rateCard: RateCard): Promise<ApiResponse> => {
  // Build the JSON payload
  const payload = {
    name: rateCard.name,
    category_id: rateCard.category_id,
    provider_id: rateCard.provider_id || null,
    price: rateCard.price,
    active: rateCard.active ? 0 : 1,
    subcategory_id: rateCard.subcategory_id || null,
    filter_attribute_id: rateCard.filter_attribute_id || null,
    filter_option_id: rateCard.filter_option_id || null,
    description: rateCard.description || '',
  };

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/rate-card/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update rate card.');
  }
};

// Function to delete a rate card
export const deleteRateCard = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/rate-card/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete rate card.');
  }
};

// Function to restore a soft-deleted rate card
export const restoreRateCard = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post(`/rate-card/${id}/restore`, {}, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to restore rate card.');
  }
};



// Fetch filter attributes by category and/or subcategory ID
export const fetchFilterAttributes = async (
  categoryId: number | null,
  subcategoryId: number | null
): Promise<Attribute[]> => {
  try {
    const token = getToken();
    const params: any = {};
    if (categoryId) params.category_id = categoryId;
    if (subcategoryId) params.subcategory_id = subcategoryId;

    const response: AxiosResponse<ApiResponse> = await apiClient.get('/filter/attributes', {
      params,
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch filter attributes.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch filter attributes.');
  }
};


// Function to create a new package with associated rate cards
export const createPackage = async (pkg: Package): Promise<ApiResponse> => {
  const formData = new FormData();

  formData.append('name', pkg.name);
  formData.append('description', pkg.description || '');
  formData.append('package_type', pkg.package_type);
  formData.append('created_by', pkg.created_by);
  if (pkg.provider_id) formData.append('provider_id', pkg.provider_id);
  formData.append('discount_type', pkg.discount_type);
  formData.append('discount_value', pkg.discount_value.toString());
  if (pkg.validity_period) formData.append('validity_period', pkg.validity_period?.toString() || '');
  if (pkg.no_of_service) formData.append('no_of_service', pkg.no_of_service?.toString() || '');
  formData.append('renewal_options', pkg.renewal_options ? '1' : '0');
  formData.append('is_active', pkg.is_active ? '1' : '0');

  // Add image if available
  if (pkg.image) {
    formData.append('image', pkg.image);
  }

  // Append rate card IDs
  if (pkg.rate_card_ids) {
    pkg.rate_card_ids.forEach((rateCardId) => formData.append('rate_card_ids[]', rateCardId));
  }

   // Append addon category IDs
   if (pkg.addon_category_ids) {
    pkg.addon_category_ids.forEach((categoryId) => formData.append('addon_category_ids[]', categoryId));
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/package', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create package.');
  }
};

// Function to update an existing package with associated rate cards
export const updatePackage = async (id: string, pkg: Package): Promise<ApiResponse> => {
  const formData = new FormData();

  formData.append('name', pkg.name);
  formData.append('description', pkg.description || '');
  formData.append('package_type', pkg.package_type);
  formData.append('created_by', pkg.created_by);
  if (pkg.provider_id) formData.append('provider_id', pkg.provider_id);
  formData.append('discount_type', pkg.discount_type);
  formData.append('discount_value', pkg.discount_value.toString());
  if (pkg.validity_period) formData.append('validity_period', pkg.validity_period?.toString() || '');
  if (pkg.no_of_service) formData.append('no_of_service', pkg.no_of_service?.toString() || '');

  formData.append('renewal_options', pkg.renewal_options ? '1' : '0');
  formData.append('is_active', pkg.is_active ? '1' : '0');

  // Add image if available
  if (pkg.image) {
    formData.append('image', pkg.image);
  }

  // Append rate card IDs
  if (pkg.rate_card_ids) {
    pkg.rate_card_ids.forEach((rateCardId) => formData.append('rate_card_ids[]', rateCardId));
  }

   // Append addon category IDs
   if (pkg.addon_category_ids) {
    pkg.addon_category_ids.forEach((categoryId) => formData.append('addon_category_ids[]', categoryId));
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/package/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update package.');
  }
};

// Function to fetch all packages with pagination
export const fetchPackages = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response= await apiClient.get('/package', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch packages');
  }
};

// Function to fetch a specific package by ID
export const fetchPackageById = async (id: string): Promise<Package> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/package/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch package.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch package.');
  }
};

// Function to delete a package
export const deletePackage = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/package/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete package.');
  }
};


export const fetchAllpackages = async (): Promise<Package[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/package/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch   packages.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch packages.');
  }
};

// Function to create a new page
export const createPage = async (page: Page): Promise<ApiResponse> => {
  try {
    const token = getToken();

    // Prepare raw JSON data
    const rawData = {
      title: page.title,
      slug: page.slug,
      description: page.description,
      is_active: page.is_active,
    };

    // Send request with raw JSON data
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/page', rawData, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create page.');
  }
};

// Function to fetch all pages with pagination
export const fetchPages = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response= await apiClient.get('/page', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch pages.');
  }
};

// Function to fetch a specific page by ID
export const fetchPageById = async (id: string): Promise<Page> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/page/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch page.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch page.');
  }
};

// Function to update an existing page
export const updatePage = async (id: string, page: Page): Promise<ApiResponse> => {
  const rawData = {
    title: page.title,
    slug: page.slug,
    description: page.description,
    is_active: page.is_active,
  };

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/page/${id}`, rawData, {
      headers: {
        'Content-Type': 'application/json', // Corrected to 'application/json'
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update page.');
  }
};

// Function to delete a page
export const deletePage = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/page/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete page.');
  }
};

// Function to restore a soft-deleted page
export const restorePage = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post(`/page/${id}/restore`, {}, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to restore page.');
  }
};

// Function to fetch all providers
export const fetchProviders = async (): Promise<Provider[]> => {
  try {
    const token = getToken(); // Assume getToken() retrieves the auth token

    const response: AxiosResponse<ApiResponse> = await apiClient.get('/provider/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data; // Return the array of providers
    } else {
      throw new Error(response.data.message || 'Failed to fetch providers.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch providers.');
  }
};


// Fetch all users with optional pagination

export const fetchAllUsers = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response= await apiClient.get('/user', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch users.');
  }
};




export const fetchAllUsersWithouPagination = async (): Promise<User[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/user/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch banks.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch banks.');
  }
};


// Fetch a single user by ID
export const fetchUserById = async (id: string): Promise<User> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/user/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch user.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user.');
  }
};

// Create a new user
export const createUser = async (user: User): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/user', user, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create user.');
  }
};

// Update an existing user
export const updateUser = async (id: string, user: User): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/user/${id}`, user, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update user.');
  }
};

// Delete (soft-delete) a user by ID
export const deleteUser = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/user/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete user.');
  }
};

// Restore a soft-deleted user by ID
export const restoreUser = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post(`/user/${id}/restore`, {}, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to restore user.');
  }
};



export const fetchProvidersByFilters = async (
  categoryId?: any,
  subcategoryId?: any,
  filterAttributeId?: any,
  filterOptionId?: any
) => {
  try {
    const token = getToken();
    const response = await apiClient.get('/rate-card/provider', {
      headers: {
        'admin-auth-token': token || '',
      },
      params: {
         categoryId,
         subcategoryId,
         filterAttributeId,
         filterOptionId,
      },
    });
    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch providers.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch providers.');
  }
};


// Fetch all providers with optional pagination
export const fetchAllProviders = async (page = 1, size = 10, status: string = "all") => {
  try {
    const token = getToken();
    const response = await apiClient.get('/provider', {
      params: { page, size , status},
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch providers.');
  }
};



// Function to fetch all banks
export const fetchAllProvidersWithoupagination = async (): Promise<Provider[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/provider/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch banks.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch banks.');
  }
};




// Fetch a specific provider by ID
export const fetchProviderById = async (id: string): Promise<Provider> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/provider/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch provider.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch provider.');
  }
};

// Create a new provider
export const createProvider = async (provider: Provider): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/provider', provider, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create provider.');
  }
};

// Update an existing provider
export const updateProvider = async (id: string, provider: Provider): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/provider/${id}`, provider, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update provider.');
  }
};

// Delete (soft-delete) a provider by ID
export const deleteProvider = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/provider/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete provider.');
  }
};

// Restore a soft-deleted provider by ID
export const restoreProvider = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post(`/provider/${id}/restore`, {}, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to restore provider.');
  }
};


// Function to create a new VIP plan
export const createVIPPlan = async (vipPlan: VIPPlan): Promise<ApiResponse> => {
  const formData = new FormData();
  
  formData.append("plan_name", vipPlan.plan_name);
  formData.append("price", vipPlan.price.toString());
  
  // Optional discount price
  if (vipPlan.discount_price !== undefined) {
    formData.append("discount_price", vipPlan.discount_price.toString());
  }
  
  formData.append("description", vipPlan.description);
  formData.append("validity_period", vipPlan.validity_period.toString());
  formData.append("status", vipPlan.status ? "0" : "1");
  
  // New fields
  formData.append("platform_fees", vipPlan.platform_fees ? "1" : "0");
  formData.append("no_of_bookings", vipPlan.no_of_bookings.toString());

  // Add image file if available
  if (vipPlan.image) {
    formData.append("image", vipPlan.image);
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post("/vip", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "admin-auth-token": token || "",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create VIP plan.");
  }
};

// Function to fetch all VIP plans with optional pagination
export const fetchVIPPlans = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get("/vip", {
      params: { page, size },
      headers: {
        "admin-auth-token": token || "",
      },
    });
    return response.data;
  } catch (error:any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch providers.');
  }
};



// Function to fetch a single VIP plan by ID
export const fetchVIPPlanById = async (id: string): Promise<VIPPlan> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/vip/${id}`, {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch VIP plan.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch VIP plan.");
  }
};

// Function to update an existing VIP plan
export const updateVIPPlan = async (id: string, vipPlan: VIPPlan): Promise<ApiResponse> => {
  const formData = new FormData();

  formData.append("plan_name", vipPlan.plan_name);
  formData.append("price", vipPlan.price.toString());
  
  // Optional discount price
  if (vipPlan.discount_price !== undefined) {
    formData.append("discount_price", vipPlan.discount_price.toString());
  }
  
  formData.append("description", vipPlan.description);
  formData.append("validity_period", vipPlan.validity_period.toString());
  formData.append("status", vipPlan.status ? "0" : "1");

  // New fields
  formData.append("platform_fees", vipPlan.platform_fees ? "1" : "0");
  formData.append("no_of_bookings", vipPlan.no_of_bookings.toString());

  // Add image file if available
  if (vipPlan.image) {
    formData.append("image", vipPlan.image);
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/vip/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "admin-auth-token": token || "",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update VIP plan.");
  }
};

// Function to delete a VIP plan
export const deleteVIPPlan = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/vip/${id}`, {
      headers: {
        "admin-auth-token": token || "",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete VIP plan.");
  }
};

// Function to restore a soft-deleted VIP plan
export const restoreVIPPlan = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post(`/vip/${id}/restore`, {}, {
      headers: {
        "admin-auth-token": token || "",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to restore VIP plan.");
  }
};



// Fetch all providers with optional pagination
export const fetchBanks = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response = await apiClient.get('/bank', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch bank.');
  }
};

// Function to fetch all banks
export const fetchAllBanks = async (): Promise<Bank[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/bank/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch banks.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch banks.');
  }
};

// Function to fetch a single bank by ID
export const fetchBankById = async (id: string): Promise<Bank> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/bank/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch bank.');
  }
};

// Function to create a new bank
export const createBank = async (bank: Bank): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/bank', bank, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create bank.');
  }
};

// Function to update an existing bank
export const updateBank = async (id: string, bank: Bank): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/bank/${id}`, bank, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update bank.');
  }
};



// Function to delete (soft-delete) a bank
export const deleteBank = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/bank/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete bank.');
  }
};

// Fetch all provider bank details with optional pagination
export const fetchProviderBankDetails = async (provider_id: string, page = 1, size = 10) => {
  try {
    const token = getToken();
    const response = await apiClient.get('/provider-bank', {
      params: { provider_id, page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch provider bank details.');
  }
};

// Function to fetch a single provider bank detail by ID
export const fetchProviderBankDetailById = async (id: string): Promise<ProviderBankDetail> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/provider-bank/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch provider bank detail.');
  }
};

// Function to create a new provider bank detail
export const createProviderBankDetail = async (detail: ProviderBankDetail): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/provider-bank', detail, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create provider bank detail.');
  }
};

// Function to update an existing provider bank detail
export const updateProviderBankDetail = async (
  id: string,
  detail: ProviderBankDetail
): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/provider-bank/${id}`, detail, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update provider bank detail.');
  }
};

// Function to delete (soft-delete) a provider bank detail
export const deleteProviderBankDetail = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/provider-bank/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete provider bank detail.');
  }
};







// Function to fetch a specific banner by ID
export const getBanner = async (id: string | number): Promise<Banner> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/banner/${id}`, {
      headers: {
        "admin-auth-token": token || "",
      },
    });
    return response.data.data; // Assuming banner data is under `data` key
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch banner.");
  }
};

// Add banner
export const createBanner = async (bannerData: Banner) => {
  const formData = new FormData();
  formData.append("title", bannerData.title);
  formData.append("description", bannerData.description);
  formData.append("is_active", bannerData.is_active ? "1" : "0");

  if (bannerData.media_type) {
    formData.append("media_type", bannerData.media_type as "image" | "video");
  }

  if (bannerData.display_order !== undefined) {
    formData.append("display_order", bannerData.display_order.toString());
  }

  if (bannerData.deep_link) {
    formData.append("deep_link", bannerData.deep_link);
  }

  if (bannerData.selection_type) {
    formData.append("selection_type", bannerData.selection_type);
  }

  if (bannerData.selection_id) {
    formData.append("selection_id", bannerData.selection_id.toString());
  }

  if (bannerData.latitude !== undefined) {
    formData.append("latitude", bannerData.latitude!.toString());
  }

  if (bannerData.longitude !== undefined) {
    formData.append("longitude", bannerData.longitude!.toString());
  }

  if (bannerData.radius !== undefined) {
    formData.append("radius", bannerData.radius!.toString());
  }

  if (bannerData.start_date) {
    formData.append("start_date", bannerData.start_date);
  }

  if (bannerData.end_date) {
    formData.append("end_date", bannerData.end_date);
  }

  if (bannerData.image) {
    formData.append("media_file", bannerData.image); // The image file
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post(`/banner`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "admin-auth-token": token || "",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create banner.");
  }
};



// Function to update a specific banner by ID
export const updateBanner = async (id: string | number, bannerData: Banner): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("title", bannerData.title);
  formData.append("description", bannerData.description);
  formData.append("is_active", bannerData.is_active ? "1" : "0");
  formData.append("media_type", bannerData.media_type);

  if (bannerData.display_order !== undefined) {
    formData.append("display_order", bannerData.display_order.toString());
  }

  if (bannerData.deep_link) {
    formData.append("deep_link", bannerData.deep_link);
  }

  if (bannerData.selection_type) {
    formData.append("selection_type", bannerData.selection_type);
  }

  if (bannerData.selection_id) {
    formData.append("selection_id", bannerData.selection_id.toString());
  }

  if (bannerData.latitude !== undefined) {
    formData.append("latitude", bannerData.latitude!.toString());
  }

  if (bannerData.longitude !== undefined) {
    formData.append("longitude", bannerData.longitude!.toString());
  }

  if (bannerData.radius !== undefined) {
    formData.append("radius", bannerData.radius!.toString());
  }

  if (bannerData.start_date) {
    formData.append("start_date", bannerData.start_date);
  }

  if (bannerData.end_date) {
    formData.append("end_date", bannerData.end_date);
  }

  if (bannerData.image) {
    formData.append("media_file", bannerData.image);
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/banner/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "admin-auth-token": token || "",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update banner.");
  }
};


// Fetch all providers with optional pagination
export const fetchBanners = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response = await apiClient.get('/banner', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch banner.');
  }
};

// Function to fetch all banks
export const fetchBannerPromo = async (): Promise<Banner[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/banner/promocode', {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch banner.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch banner.');
  }
};
// Function to delete (soft-delete) a bank
export const deleteBanner = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/banner/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete banner.');
  }
};


// Fetch all FAQs with optional pagination
export const fetchFAQs = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response = await apiClient.get('/faq', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch FAQs.');
  }
};

// Fetch a single FAQ by ID
export const fetchFAQById = async (id: string): Promise<FAQ> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/faq/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch FAQ.');
  }
};

// Create a new FAQ
export const createFAQ = async (faq: FAQ): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/faq', faq, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create FAQ.');
  }
};

// Update an existing FAQ
export const updateFAQ = async (id: string, faq: FAQ): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/faq/${id}`, faq, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update FAQ.');
  }
};

// Delete an FAQ
export const deleteFAQ = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/faq/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete FAQ.');
  }
};


// Fetch all carts with optional pagination
export const fetchCarts = async (page = 1, size = 10) => {
  try {
    const token = getToken(); // Retrieve the token
    const response = await apiClient.get('/cart', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch carts.');
  }
};

// Fetch a single cart by ID
export const fetchCartById = async (id: string) => {
  try {
    const token = getToken(); // Retrieve the token
    const response = await apiClient.get(`/cart/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch cart.');
  }
};

// Delete (soft-delete) a cart by ID
export const deleteCart = async (id: string) => {
  try {
    const token = getToken(); // Retrieve the token
    const response = await apiClient.delete(`/cart/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete cart.');
  }
};




// Fetch all onboarding entries with pagination
export const fetchOnboardings = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response = await apiClient.get("/onboarding", {
      params: { page, size },
      headers: {
        "admin-auth-token": token || "",
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch onboarding entries.");
  }
};

// Fetch all onboarding entries without pagination
export const fetchAllOnboardings = async (): Promise<Onboarding[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get("/onboarding/all", {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch onboarding entries.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch onboarding entries.");
  }
};

// Fetch a single onboarding entry by ID
export const fetchOnboardingById = async (id: string): Promise<Onboarding> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/onboarding/${id}`, {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch onboarding entry.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch onboarding entry.");
  }
};

// Create a new onboarding entry
export const createOnboarding = async (onboarding: Onboarding): Promise<ApiResponse> => {
  const formData = new FormData();

  formData.append("title", onboarding.title);
  formData.append("description", onboarding.description);

  if (onboarding.image) {
    formData.append("image", onboarding.image);
  }

  // Add the active status field
  formData.append("is_active", onboarding.is_active ? "1" : "0");

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post("/onboarding", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "admin-auth-token": token || "",
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create onboarding entry.");
  }
};

// Update an existing onboarding entry
export const updateOnboarding = async (id: string, onboarding: Onboarding): Promise<ApiResponse> => {
  const formData = new FormData();

  formData.append("title", onboarding.title);
  formData.append("description", onboarding.description);

  if (onboarding.image) {
    formData.append("image", onboarding.image);
  }

  // Add the active status field
  formData.append("is_active", onboarding.is_active ? "1" : "0");

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/onboarding/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "admin-auth-token": token || "",
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update onboarding entry.");
  }
};

// Delete an onboarding entry
export const deleteOnboarding = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/onboarding/${id}`, {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete onboarding entry.");
  }
};


// Fetch all GST rates with optional pagination
export const fetchGstRates = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response = await apiClient.get('/gst-rate', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch GST rates.');
  }
};

// Fetch all GST rates without pagination
export const fetchAllGstRates = async (): Promise<GstRate[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/gst-rate/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch GST rates.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch GST rates.');
  }
};

// Fetch a specific GST rate by ID
export const fetchGstRateById = async (id: string): Promise<GstRate> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/gst-rate/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch GST rate.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch GST rate.');
  }
};

// Create a new GST rate
export const createGstRate = async (gstRate: GstRate): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/gst-rate', gstRate, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create GST rate.');
  }
};

// Update an existing GST rate
export const updateGstRate = async (id: string, gstRate: GstRate): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/gst-rate/${id}`, gstRate, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update GST rate.');
  }
};

// Delete (soft-delete) a GST rate
export const deleteGstRate = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/gst-rate/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete GST rate.');
  }
};

// Restore a soft-deleted GST rate
export const restoreGstRate = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post(`/gst-rate/${id}/restore`, {}, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to restore GST rate.');
  }
};



// Function to fetch delivery addresses by user ID
export const fetchUserAddresses = async (userId: number): Promise<{ id: number; full_address: string }[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`user/${userId}/addresses`, {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    if (response?.data?.status && Array.isArray(response.data.data)) {
      return response.data.data.map((address: any) => {
        const { id, street_address, city, state, postal_code } = address;
        return {
          id,
          full_address: `${street_address || ""}, ${city || ""}, ${state || ""}, ${postal_code || ""}`.replace(/,\s*$/, ""),
        };
      });
    } else {
      throw new Error(response?.data?.message || "No addresses found for the specified user.");
    }
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error.message || "Failed to fetch delivery addresses.";
    throw new Error(errorMessage);
  }
};

export const createBooking = async (booking: Booking): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post("/booking", booking, {
      headers: {
        "Content-Type": "application/json",
        "admin-auth-token": token || "",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create booking.");
  }
};
export const fetchBookings = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response = await apiClient.get("/booking", {
      params: { page, size },
      headers: {
        "admin-auth-token": token || "",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch bookings.");
  }
};
export const fetchBookingById = async (id: string): Promise<Booking> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/booking/${id}`, {
      headers: {
        "admin-auth-token": token || "",
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch booking.");
  }
};
export const updateBooking = async (id: string, booking: Booking): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/booking/${id}`, booking, {
      headers: {
        "Content-Type": "application/json",
        "admin-auth-token": token || "",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update booking.");
  }
};
export const deleteBooking = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/booking/${id}`, {
      headers: {
        "admin-auth-token": token || "",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete booking.");
  }
};




// Add Promocode API
export const createPromocode = async (promocode: Promocode): Promise<ApiResponse> => {
  const formData = new FormData();

  formData.append("code", promocode.code);
  if (promocode.description) formData.append("description", promocode.description);
  formData.append("discount_type", promocode.discount_type);
  formData.append("discount_value", promocode.discount_value.toString());
  const minOrderValue = promocode.min_order_value !== null && promocode.min_order_value !== undefined
  ? promocode.min_order_value
  : null;

// In your insert logic
formData.append("min_order_value", minOrderValue ? minOrderValue.toString() : "0.0");
  formData.append("start_date", promocode.start_date);
  formData.append("end_date", promocode.end_date);
  formData.append("status", promocode.status);
  formData.append("selection_type", promocode.selection_type);
  formData.append("selection_id", promocode.selection_id?.toString() || "");
  formData.append("is_global", promocode.is_global ? "1" : "0");
  formData.append("display_to_customer", promocode.display_to_customer ? "1" : "0");
  formData.append("is_active", promocode.is_active ? "1" : "0");
  formData.append("provider_id", promocode.provider_id);

  // Add image if provided
  if (promocode.image) {
    formData.append("image", promocode.image);
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post("/promocode", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "admin-auth-token": token || "",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create promocode.");
  }
};

// Fetch a single promocode by ID
export const fetchPromocodeById = async (id: string): Promise<Promocode> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/promocode/${id}`, {
      headers: {
        "admin-auth-token": token || "",
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch promocode.");
  }
};

// Update an existing promocode
export const updatePromocode = async (id: string, promocode: Promocode): Promise<ApiResponse> => {
  const formData = new FormData();

  formData.append("code", promocode.code);
  if (promocode.description) formData.append("description", promocode.description);
  formData.append("discount_type", promocode.discount_type);
  formData.append("discount_value", promocode.discount_value.toString());
  const minOrderValue = promocode.min_order_value !== null && promocode.min_order_value !== undefined
  ? promocode.min_order_value
  : null;

// In your insert logic
formData.append("min_order_value", minOrderValue ? minOrderValue.toString() : "0.0");
  formData.append("start_date", promocode.start_date);
  formData.append("end_date", promocode.end_date);
  formData.append("status", promocode.status);
  formData.append("selection_type", promocode.selection_type);
  formData.append("selection_id", promocode.selection_id?.toString() || "");
  formData.append("is_global", promocode.is_global ? "1" : "0");
  formData.append("display_to_customer", promocode.display_to_customer ? "1" : "0");
  formData.append("is_active", promocode.is_active ? "1" : "0");
  formData.append("provider_id", promocode.provider_id);

  // Add image if provided
  if (promocode.image) {
    formData.append("image", promocode.image);
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/promocode/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "admin-auth-token": token || "",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update promocode.");
  }
};

// Fetch all promocodes with optional pagination
export const fetchPromocodes = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get("/promocode", {
      params: { page, size },
      headers: {
        "admin-auth-token": token || "",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch promocodes.");
  }
};

// Delete a promocode
export const deletePromocode = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/promocode/${id}`, {
      headers: {
        "admin-auth-token": token || "",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete promocode.");
  }
};

// Restore a soft-deleted promocode
export const restorePromocode = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post(`/promocode/${id}/restore`, {}, {
      headers: {
        "admin-auth-token": token || "",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to restore promocode.");
  }
};






export const createBlog = async (blog: Blog): Promise<ApiResponse> => {
  const formData = new FormData();

  // Append basic blog details
  formData.append('title', blog.title);
  formData.append('slug', blog.slug);
  formData.append('description', blog.description);
  formData.append('is_active', blog.is_active ? '1' : '0');

  // Append the image
  if (blog.image) {
    console.log('Appending image:', blog.image);
    formData.append('image', blog.image);
  }

  try {
    const token = getToken();

    const response: AxiosResponse<ApiResponse> = await apiClient.post('/blog', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error creating blog:', error);
    throw new Error(error.response?.data?.message || 'Failed to create blog.');
  }
};


export const fetchBlogs = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response = await apiClient.get('/blog', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data; // Return data and meta info
    } else {
      throw new Error(response.data.message || 'Failed to fetch blogs.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch blogs.');
  }
};

// **Delete a Blog by ID**
export const deleteBlog = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/blog/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data; // Return success response
    } else {
      throw new Error(response.data.message || 'Failed to delete blog.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete blog.');
  }
};
// Fetch a single blog
export const getBlogById = async (id: number): Promise<Blog> => {
  const token = getToken();
  const response: AxiosResponse<ApiResponse> = await apiClient.get(`/blog/${id}`, {
    headers: {
      "admin-auth-token": token || "",
    },
  });
  return response.data.data;
};

// Update a blog
export const updateBlog = async (id: number, blog: Blog): Promise<ApiResponse> => {
  const formData = new FormData();

  // Append fields
  formData.append("title", blog.title);
  formData.append("slug", blog.slug);
  formData.append("description", blog.description);
  formData.append("is_active", blog.is_active ? "1" : "0");

  if (blog.image) {
    formData.append("image", blog.image);
  }

  const token = getToken();
  const response: AxiosResponse<ApiResponse> = await apiClient.put(`/blog/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "admin-auth-token": token || "",
    },
  });

  return response.data;
};



export const createNotification = async (notification: Notification) => {
  const formData = new FormData();

  formData.append("title", notification.title);
  formData.append("message", notification.message);
  formData.append("type", notification.type);
  if (notification.redirect_screen) formData.append("redirect_screen", notification.redirect_screen);
  if (notification.category_id) formData.append("category_id", notification.category_id.toString());
  if (notification.subcategory_id) formData.append("subcategory_id", notification.subcategory_id.toString());
  if (notification.inner_image) formData.append("inner_image", notification.inner_image);
  if (notification.outer_image) formData.append("outer_image", notification.outer_image);
  formData.append("is_active", notification.is_active ? "1" : "0");
  formData.append("send_to_all", notification.send_to_all ? "1" : "0");
  if (notification.recipients) formData.append("recipients", JSON.stringify(notification.recipients));

  // const response = await apiClient.post("/notification", formData);
  const token = getToken();

  const response: AxiosResponse<ApiResponse> = await apiClient.post('/notification', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'admin-auth-token': token || '',
    },
  });

  return response.data;
};




export const fetchNotifications = async (page = 1, size = 10) => {
  try {
    const token = getToken(); // Retrieve the token

    const response: AxiosResponse = await apiClient.get('/notification', {
      params: { page, size }, // Pass pagination params
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data; // Return the data from the response
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications.');
  }
};


// Fetch all wallet offers with optional pagination
export const fetchWalletOffers = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response = await apiClient.get('/wallet-offer', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch wallet offers.');
  }
};

// Fetch a single wallet offer by ID
export const fetchWalletOfferById = async (id: number): Promise<WalletOffer> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/wallet-offer/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch wallet offer.');
  }
};

// Create a new wallet offer
export const createWalletOffer = async (walletOffer: WalletOffer): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/wallet-offer', walletOffer, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create wallet offer.');
  }
};

// Update an existing wallet offer
export const updateWalletOffer = async (id: number, walletOffer: WalletOffer): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/wallet-offer/${id}`, walletOffer, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update wallet offer.');
  }
};

// Soft-delete a wallet offer
export const deleteWalletOffer = async (id: number): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/wallet-offer/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete wallet offer.');
  }
};

// Restore a soft-deleted wallet offer
export const restoreWalletOffer = async (id: number): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post(`/wallet-offer/${id}/restore`, {}, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to restore wallet offer.');
  }
};



// Fetch options for a specific filter attribute
export const fetchFilterOptionsByAttributeId = async (attributeId: number): Promise<AttributeOption[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/filter/attribute-options/${attributeId}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data; // Return attribute options
    } else {
      throw new Error(response.data.message || 'Failed to fetch attribute options.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch attribute options.');
  }
};


// Fetch all roles
export const fetchRolesAll = async (): Promise<Role[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/role/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch roles.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch roles.');
  }
};


export const fetchRoles = async (page = 1, size = 10) => {
  try {
    const token = getToken(); // Retrieve the token

    const response: AxiosResponse = await apiClient.get('/role', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch role');
  }
};

// Fetch a specific role by ID
export const fetchRoleById = async (id: string): Promise<Role> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/role/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch role.');
  }
};

// Create a new role
export const createRole = async (role: Role): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/role', role, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create role.');
  }
};

// Update an existing role
export const updateRole = async (id: string, role: Role): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/role/${id}`, role, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update role.');
  }
};

// Delete a role
export const deleteRole = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/role/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete role.');
  }
};



export const fetchPermissions = async (page = 1, size = 10) => {
  try {
    const token = getToken(); // Retrieve the token

    const response: AxiosResponse = await apiClient.get('/permission', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch permission');
  }
};

export const fetchAllPermission = async (): Promise<ApiPermissionResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiPermissionResponse> = await apiClient.get('/permission/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data) {
      return response.data.data; // Return the full dynamic object
    } else {
      throw new Error('Failed to fetch permission.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch permission.');
  }
};

// Fetch a specific permission by ID
export const fetchPermissionById = async (id: string): Promise<Permission> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/permission/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch permission.');
  }
};

// Create a new permission
export const createPermission = async (permission: Permission): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/permission', permission, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create permission.');
  }
};

// Update an existing permission
export const updatePermission = async (id: string, permission: Permission): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/permission/${id}`, permission, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update permission.');
  }
};

// Delete a permission
export const deletePermission = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/permission/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete permission.');
  }
};


// Fetch all settings with pagination
export const fetchSettings = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response = await apiClient.get('/settings', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch settings.');
  }
};

// Fetch a specific setting by ID
export const fetchSettingById = async (id: string): Promise<Setting> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/settings/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch setting.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch setting.');
  }
};

// Create a new setting
export const createSetting = async (setting: Setting): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/settings', setting, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create setting.');
  }
};

// Update an existing setting
export const updateSetting = async (id: string, setting: Setting): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/settings/${id}`, setting, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update setting.');
  }
};

// Delete a setting (soft delete)
export const deleteSetting = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/settings/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete setting.');
  }
};

// Create Admin API
export const createAdmin = async (adminData: any): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/admin', adminData, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create admin.');
  }
};


// Fetch all admins with optional pagination
export const fetchAdmins = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response = await apiClient.get('/admin', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch admins.');
  }
};

// Fetch a single admin by ID
export const fetchAdminById = async (id: string): Promise<any> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/admin/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data.data; // Assuming `data` contains the admin details
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch admin.');
  }
};


// Update an existing admin by ID
export const updateAdmin = async (id: string, adminData: any): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/admin/${id}`, adminData, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update admin.');
  }
};


// Delete (soft-delete) an admin by ID
export const deleteAdmin = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/admin/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete admin.');
  }
};

// API to create or update Quick Service
export const createQuickService = async (data: QuickService): Promise<any> => {
  const formData = new FormData();

  // Append image file
  if (data.image) {
    formData.append('image', data.image);
  }

  // Append categories_ids as JSON string
  formData.append('category_ids', JSON.stringify(data.category_ids));
  if (data.active !== undefined) {
    formData.append('active', data.active ? '0' : '1');
  }
 
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/quick-service', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create or update Quick Service.');
  }
};

// API to fetch the first Quick Service entry
export const fetchFirstQuickService = async (): Promise<QuickService> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/quick-service/first', {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch Quick Service.');
  }
};


// Logout API
export const logout = async (): Promise<void> => {
  try {
    const token = getToken();
    await apiClient.post(
      '/login/logout',
      {},
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );

    // Clear localStorage
    localStorage.removeItem('token');
    // Redirect to login page
    window.location.href = '/auth/login';
  } catch (error: any) {
  }
};



export const generateUniqueFilename = (prefix: string, extension: string): string => {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-T:.Z]/g, ''); // Format as YYYYMMDDHHMMSS

  const randomValue = Math.floor(Math.random() * 1000); // Add a small random value

  return `${prefix}_${timestamp}_${randomValue}.${extension}`;
};


export const exportCategories = async (): Promise<void> => {
  try {
    const token = getToken(); // Retrieve the admin-auth-token

    const response: AxiosResponse = await apiClient.get('/category/export', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob', // Treat the response as a binary file
    });

    // Generate a unique filename
    const uniqueFilename = generateUniqueFilename('categories', 'xlsx');

    // Create a downloadable link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename); // Unique filename
    document.body.appendChild(link);
    link.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting categories:', error);
    throw new Error('Failed to export categories');
  }
};


export const exportSubcategories = async (): Promise<void> => {
  try {
    const token = getToken(); // Retrieve the admin-auth-token

    const response: AxiosResponse = await apiClient.get('/sub-category/export', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob', // Treat the response as a binary file
    });

    // Generate a unique filename
    const uniqueFilename = generateUniqueFilename('subcategories', 'xlsx');

    // Create a downloadable link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename); // Unique filename
    document.body.appendChild(link);
    link.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting subcategories:', error);
    throw new Error('Failed to export subcategories');
  }
};


export const exportLiveCart = async (startDate: string, endDate: string): Promise<void> => {
  try {
    const token = getToken(); // Retrieve the admin-auth-token

    const response: AxiosResponse = await apiClient.get('/cart/export', {
      headers: {
        'admin-auth-token': token || '',
      },
      params: { startDate, endDate }, // Pass start and end date as query params
      responseType: 'blob', // Treat the response as a binary file
    });

    // Generate a unique filename
    const uniqueFilename = generateUniqueFilename('live_cart', 'xlsx');

    // Create a downloadable link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename); // Unique filename
    document.body.appendChild(link);
    link.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting live cart:', error);
    throw new Error('Failed to export live cart');
  }
};



export const exportUsers = async (startDate: string, endDate: string, pincode:string): Promise<void> => {
  try {
    const token = getToken(); // Retrieve the admin-auth-token

    const response: AxiosResponse = await apiClient.get('/user/export', {
      headers: {
        'admin-auth-token': token || '',
      },
      params: { startDate, endDate, pincode }, // Pass start and end date as query params
      responseType: 'blob', // Treat the response as a binary file
    });

    // Generate a unique filename
    const uniqueFilename = generateUniqueFilename('customer', 'xlsx');

    // Create a downloadable link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename); // Unique filename
    document.body.appendChild(link);
    link.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting live cart:', error);
    throw new Error('Failed to export live cart');
  }
};



export const exportRatecard = async (): Promise<void> => {
  try {
    const token = getToken(); // Retrieve the admin-auth-token

    const response: AxiosResponse = await apiClient.get('/rate-card/export', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob', // Treat the response as a binary file
    });

    // Generate a unique filename
    const uniqueFilename = generateUniqueFilename('rate-card', 'xlsx');

    // Create a downloadable link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename); // Unique filename
    document.body.appendChild(link);
    link.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting categories:', error);
    throw new Error('Failed to export categories');
  }
};


export const exportProvider = async (): Promise<void> => {
  try {
    const token = getToken(); // Retrieve the admin-auth-token

    const response: AxiosResponse = await apiClient.get('/provider/export', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob', // Treat the response as a binary file
    });

    // Generate a unique filename
    const uniqueFilename = generateUniqueFilename('provider', 'xlsx');

    // Create a downloadable link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename); // Unique filename
    document.body.appendChild(link);
    link.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting categories:', error);
    throw new Error('Failed to export categories');
  }
};



export const exportStaff = async (): Promise<void> => {
  try {
    const token = getToken(); // Retrieve the admin-auth-token

    const response: AxiosResponse = await apiClient.get('/staff/export', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob', // Treat the response as a binary file
    });

    // Generate a unique filename
    const uniqueFilename = generateUniqueFilename('staff', 'xlsx');

    // Create a downloadable link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename); // Unique filename
    document.body.appendChild(link);
    link.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting staff:', error);
    throw new Error('Failed to export staff');
  }
};


// Fetch all staff with optional pagination
export const fetchAllStaff = async (providerId: string, page = 1, size = 10, status: string = "all") => {
  try {
    const token = getToken();
    const response = await apiClient.get('/staff', {
      params: { provider_id: providerId, page, size, status },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    if (response.data.status) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch staff.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch staff.');
  }
};

// Fetch all staff without pagination
export const fetchAllStaffWithoutPagination = async (providerId: string): Promise<Staff[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/staff/all', {
      params: { provider_id: providerId },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch staff.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch staff.');
  }
};

// Fetch a specific staff member by ID
export const fetchStaffById = async (id: string): Promise<Staff> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/staff/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch staff member.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch staff member.');
  }
};

// Create a new staff member
export const createStaff = async (staff: Staff): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const formData = new FormData();

    // Append fields dynamically
    formData.append('parent_id', staff.parent_id);

    formData.append('first_name', staff.first_name);
    if (staff.last_name) formData.append('last_name', staff.last_name);
    if (staff.gender) formData.append('gender', staff.gender);
    if (staff.email) formData.append('email', staff.email);
    formData.append('phone', staff.phone);
    if (staff.designation) formData.append('designation', staff.designation);
    if (staff.adhaar_card_front) formData.append('adhaarCardFront', staff.adhaar_card_front);
    if (staff.adhaar_card_back) formData.append('adhaarCardBack', staff.adhaar_card_back);
    if (staff.pan_card) formData.append('panCard', staff.pan_card);

    const response: AxiosResponse<ApiResponse> = await apiClient.post('/staff', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create staff member.');
  }
};

// Update an existing staff member
export const updateStaff = async (id: string, staff: Staff): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const formData = new FormData();

    // Append fields dynamically
    formData.append('first_name', staff.first_name);
    if (staff.last_name) formData.append('last_name', staff.last_name);
    if (staff.gender) formData.append('gender', staff.gender);
    if (staff.email) formData.append('email', staff.email);
    formData.append('phone', staff.phone);
    if (staff.designation) formData.append('designation', staff.designation);
    if (staff.adhaar_card_front) formData.append('adhaarCardFront', staff.adhaar_card_front);
    if (staff.adhaar_card_back) formData.append('adhaarCardBack', staff.adhaar_card_back);
    if (staff.pan_card) formData.append('panCard', staff.pan_card);

    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/staff/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update staff member.');
  }
};

// Delete (soft-delete) a staff member by ID
export const deleteStaff = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/staff/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete staff member.');
  }
};




// Import rate cards from a CSV or Excel file
export const importRateCards = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken();
    const response: AxiosResponse<{ message: string }> = await apiClient.post('/rate-card/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });

    if (response.status === 200) {
      console.log(response.data.message || 'Rate cards imported successfully.');
    } else {
      throw new Error(response.data.message || 'Failed to import rate cards.');
    }
  } catch (error: any) {
    console.error('Error importing rate cards:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to import rate cards.');
  }
};


export const downloadSampleCSV = async (): Promise<void> => {
  try {
    const token = getToken(); // Retrieve the admin-auth-token

    const response: AxiosResponse = await apiClient.get('/rate-card/sample', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob', // Treat the response as a binary file
    });

    // Generate a unique filename for the sample file
    const uniqueFilename = generateUniqueFilename('rate_card_sample', 'xlsx');

    // Create a downloadable link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename); // Unique filename
    document.body.appendChild(link);
    link.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading sample CSV:', error);
    throw new Error('Failed to download sample CSV');
  }
};



// Import rate cards from a CSV or Excel file
export const updateRateCardsCsv = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken();
    const response: AxiosResponse<{ message: string }> = await apiClient.post('/rate-card/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });

    if (response.status === 200) {
      console.log(response.data.message || 'Rate cards updated successfully.');
    } else {
      throw new Error(response.data.message || 'Failed to update rate cards.');
    }
  } catch (error: any) {
    console.error('Error update rate cards:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to update rate cards.');
  }
};

// Fetch all countries with optional pagination
export const fetchAllCountries = async (
  page: number = 1,
  size: number = 10
) => {
  try {
    const token = getToken();
    const response = await apiClient.get('/countries', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch countries.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch countries.');
  }
};

// Fetch all countries without pagination
export const fetchAllCountriesWithoutPagination = async (): Promise<Country[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/countries/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch countries.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch countries.');
  }
};

// Fetch a specific country by ID
export const fetchCountryById = async (id: string): Promise<Country> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/countries/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch country.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch country.');
  }
};

// Create a new country
export const createCountry = async (country: Country): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/countries', country, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create country.');
  }
};

// Update an existing country
export const updateCountry = async (id: string, country: Country): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/countries/${id}`, country, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update country.');
  }
};

// Delete (soft-delete) a country by ID
export const deleteCountry = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/countries/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete country.');
  }
};

// Export countries to an Excel file
export const exportCountriesToXLS = async (): Promise<void> => {
  try {
    const token = getToken(); // Retrieve the admin-auth-token

    const response: AxiosResponse = await apiClient.get('/countries/export/xls', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob', // Treat the response as a binary file
    });

    // Generate a unique filename for the exported file
    const uniqueFilename = generateUniqueFilename('countries', 'xlsx');

    // Create a downloadable link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename); // Unique filename
    document.body.appendChild(link);
    link.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting countries:', error);
    throw new Error('Failed to export countries');
  }
};

// Import countries from a CSV file
export const importCountriesFromCSV = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken();

    const response: AxiosResponse<{ message: string }> = await apiClient.post('/countries/import/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });

    if (response.status === 200) {
      console.log(response.data.message || 'Countries imported successfully.');
    } else {
      throw new Error(response.data.message || 'Failed to import countries.');
    }
  } catch (error: any) {
    console.error('Error importing countries:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to import countries.');
  }
};

// Download sample CSV for countries
export const downloadSampleExcel = async (): Promise<void> => {
  try {
    const token = getToken(); // Retrieve the admin-auth-token

    const response: AxiosResponse = await apiClient.get('/countries/sample/excel', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob', // Treat the response as a binary file
    });

    // Generate a unique filename for the sample file
    const uniqueFilename = generateUniqueFilename('countries_sample', 'xlsx');

    // Create a downloadable link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename); // Unique filename
    document.body.appendChild(link);
    link.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading sample CSV:', error);
    throw new Error('Failed to download sample CSV');
  }
};


// Fetch all states with optional pagination
export const fetchAllStates = async (
  page: number = 1,
  size: number = 10
) => {
  try {
    const token = getToken();
    const response = await apiClient.get('/states', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch states.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch states.');
  }
};

// Fetch all states without pagination
export const fetchAllStatesWithoutPagination = async (): Promise<State[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/states/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch states.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch states.');
  }
};

// Fetch a specific state by ID
export const fetchStateById = async (id: string): Promise<State> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/states/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch state.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch state.');
  }
};

// Create a new state
export const createState = async (state: State): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/states', state, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create state.');
  }
};

// Update an existing state
export const updateState = async (id: string, state: State): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/states/${id}`, state, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update state.');
  }
};

// Delete (soft-delete) a state by ID
export const deleteState = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/states/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete state.');
  }
};

// Export states to an Excel file
export const exportStatesToXLS = async (): Promise<void> => {
  try {
    const token = getToken();

    const response: AxiosResponse = await apiClient.get('/states/export/xls', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob',
    });

    const uniqueFilename = generateUniqueFilename('states', 'xlsx');

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting states:', error);
    throw new Error('Failed to export states');
  }
};

// Import states from a CSV file
export const importStatesFromCSV = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken();

    const response: AxiosResponse<{ message: string }> = await apiClient.post('/states/import/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });

    if (response.status === 200) {
      console.log(response.data.message || 'States imported successfully.');
    } else {
      throw new Error(response.data.message || 'Failed to import states.');
    }
  } catch (error: any) {
    console.error('Error importing states:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to import states.');
  }
};

// Download sample CSV for states
export const downloadSampleStateExcel = async (): Promise<void> => {
  try {
    const token = getToken();

    const response: AxiosResponse = await apiClient.get('/states/sample/excel', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob',
    });

    const uniqueFilename = generateUniqueFilename('states_sample', 'csv');

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading sample CSV:', error);
    throw new Error('Failed to download sample CSV');
  }
};


// Fetch all cities with optional pagination
export const fetchAllCities = async (page: number = 1, size: number = 10) => {
  try {
    const token = getToken();
    const response = await apiClient.get("/cities", {
      params: { page, size },
      headers: {
        "admin-auth-token": token || "",
      },
    });

    if (response.data.status) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch cities.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch cities.");
  }
};

// Fetch all cities without pagination
export const fetchAllCitiesWithoutPagination = async (): Promise<City[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get("/cities/all", {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch cities.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch cities.");
  }
};

// Fetch a specific city by ID
export const fetchCityById = async (id: string): Promise<City> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/cities/${id}`, {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch city.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch city.");
  }
};




// Create a new city
export const createCity = async (city: City): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post("/cities", city, {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create city.");
  }
};

// Update an existing city
export const updateCity = async (id: string, city: City): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/cities/${id}`, city, {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update city.");
  }
};

// Delete (soft-delete) a city by ID
export const deleteCity = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/cities/${id}`, {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete city.");
  }
};

// Export cities to an Excel file
export const exportCitiesToXLS = async (): Promise<void> => {
  try {
    const token = getToken();

    const response: AxiosResponse = await apiClient.get("/cities/export/xls", {
      headers: {
        "admin-auth-token": token || "",
      },
      responseType: "blob",
    });

    const uniqueFilename = generateUniqueFilename("cities", "xlsx");

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", uniqueFilename);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting cities:", error);
    throw new Error("Failed to export cities");
  }
};

// Import cities from a CSV file
export const importCitiesFromCSV = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();

    const response: AxiosResponse<{ message: string }> = await apiClient.post("/cities/import/csv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "admin-auth-token": token || "",
      },
    });

    if (response.status === 200) {
      console.log(response.data.message || "Cities imported successfully.");
    } else {
      throw new Error(response.data.message || "Failed to import cities.");
    }
  } catch (error: any) {
    console.error("Error importing cities:", error.message || error);
    throw new Error(error.response?.data?.message || "Failed to import cities.");
  }
};

// Download sample CSV for cities
export const downloadSampleCityExcel = async (): Promise<void> => {
  try {
    const token = getToken();

    const response: AxiosResponse = await apiClient.get("/cities/sample/excel", {
      headers: {
        "admin-auth-token": token || "",
      },
      responseType: "blob",
    });

    const uniqueFilename = generateUniqueFilename("cities_sample", "csv");

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", uniqueFilename);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading sample CSV:", error);
    throw new Error("Failed to download sample CSV");
  }
};


// Fetch all cities with optional pagination
export const fetchAllHubs = async (page: number = 1, size: number = 10) => {
  try {
    const token = getToken();
    const response = await apiClient.get("/hubs", {
      params: { page, size },
      headers: {
        "admin-auth-token": token || "",
      },
    });

    if (response.data.status) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch hubs.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch hubs.");
  }
};

// Fetch all cities without pagination
export const fetchAllHubsWithoutPagination = async (): Promise<Hub[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get("/hubs/all", {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch hubs.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch hubs.");
  }
};

// Create a new hub
export const createHub = async (hub: Hub): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post("/hubs", hub, {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create hub.");
  }
};


// Fetch a specific city by ID
export const fetchHubById = async (id: string): Promise<Hub> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/hubs/${id}`, {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch hub.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch hub.");
  }
};
// Update an existing hub
export const updateHub = async (id: string, hub: Hub): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/hubs/${id}`, hub, {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update hub.");
  }
};

// Delete (soft-delete) a hub by ID
export const deleteHub = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/hubs/${id}`, {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete hub.");
  }
};

// Export hubs to an Excel file
export const exportHubsToXLS = async (): Promise<void> => {
  try {
    const token = getToken();

    const response: AxiosResponse = await apiClient.get("/hubs/export/xls", {
      headers: {
        "admin-auth-token": token || "",
      },
      responseType: "blob",
    });

    const uniqueFilename = generateUniqueFilename("hubs", "xlsx");

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", uniqueFilename);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting hubs:", error);
    throw new Error("Failed to export hubs");
  }
};

// Import hubs from a CSV file
export const importHubsFromCSV = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();

    const response: AxiosResponse<{ message: string }> = await apiClient.post("/hubs/import/csv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "admin-auth-token": token || "",
      },
    });

    if (response.status === 200) {
      console.log(response.data.message || "Hubs imported successfully.");
    } else {
      throw new Error(response.data.message || "Failed to import hubs.");
    }
  } catch (error: any) {
    console.error("Error importing hubs:", error.message || error);
    throw new Error(error.response?.data?.message || "Failed to import hubs.");
  }
};

// Download sample CSV for hubs
export const downloadSampleHubExcel = async (): Promise<void> => {
  try {
    const token = getToken();

    const response: AxiosResponse = await apiClient.get("/hubs/sample/excel", {
      headers: {
        "admin-auth-token": token || "",
      },
      responseType: "blob",
    });

    const uniqueFilename = generateUniqueFilename("hubs_sample", "csv");

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", uniqueFilename);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading sample CSV:", error);
    throw new Error("Failed to download sample CSV");
  }
};


// Fetch all hub pincodes with optional pagination
export const fetchAllHubPincodes = async (
  page: number = 1,
  size: number = 10
): Promise<{ data: HubPincode[]; meta: { totalPages: number } }> => {
  try {
    const token = getToken();
    const response = await apiClient.get("/hub-pincodes", {
      params: { page, size },
      headers: {
        "admin-auth-token": token || "",
      },
    });

    if (response.data.status) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch hub pincodes.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch hub pincodes.");
  }
};

// Fetch all hub pincodes without pagination
export const fetchAllHubPincodesWithoutPagination = async (): Promise<HubPincode[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get("/hub-pincodes/all", {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch hub pincodes.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch hub pincodes.");
  }
};

// Fetch a specific hub pincode by ID
export const fetchHubPincodeById = async (id: string): Promise<HubPincode> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/hub-pincodes/${id}`, {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch hub pincode.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch hub pincode.");
  }
};

// Create a new hub pincode
export const createHubPincode = async (hubPincode: HubPincode): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post("/hub-pincodes", hubPincode, {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    if (!response.data.status) {
      throw new Error(response.data.message || "Failed to create hub pincode.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create hub pincode.");
  }
};

// Update an existing hub pincode
export const updateHubPincode = async (id: string, hubPincode: HubPincode): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(`/hub-pincodes/${id}`, hubPincode, {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    if (!response.data.status) {
      throw new Error(response.data.message || "Failed to update hub pincode.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update hub pincode.");
  }
};

// Delete a hub pincode by ID
export const deleteHubPincode = async (id: string): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.delete(`/hub-pincodes/${id}`, {
      headers: {
        "admin-auth-token": token || "",
      },
    });

    if (!response.data.status) {
      throw new Error(response.data.message || "Failed to delete hub pincode.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete hub pincode.");
  }
};

// Export hub pincodes to an Excel file
export const exportHubPincodesToXLS = async (): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get("/hub-pincodes/export/xls", {
      headers: {
        "admin-auth-token": token || "",
      },
      responseType: "blob",
    });

    const uniqueFilename = generateUniqueFilename("hub_pincodes", "xlsx");

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", uniqueFilename);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting hub pincodes:", error);
    throw new Error("Failed to export hub pincodes");
  }
};

// Import hub pincodes from a CSV file
export const importHubPincodesFromCSV = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();

    const response: AxiosResponse = await apiClient.post("/hub-pincodes/import/csv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "admin-auth-token": token || "",
      },
    });

    if (!response.data.status) {
      throw new Error(response.data.message || "Failed to import hub pincodes.");
    }
  } catch (error: any) {
    console.error("Error importing hub pincodes:", error.message || error);
    throw new Error(error.response?.data?.message || "Failed to import hub pincodes.");
  }
};

// Download sample CSV for hub pincodes
export const downloadSampleHubPincodeExcel = async (): Promise<void> => {
  try {
    const token = getToken();

    const response: AxiosResponse = await apiClient.get("/hub-pincodes/sample/excel", {
      headers: {
        "admin-auth-token": token || "",
      },
      responseType: "blob",
    });

    const uniqueFilename = generateUniqueFilename("hub_pincodes_sample", "csv");

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", uniqueFilename);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading sample CSV:", error);
    throw new Error("Failed to download sample CSV");
  }
};


// Fetch all SpHubs with optional pagination
export const fetchAllSpHubs = async (
  page: number = 1,
  size: number = 10
): Promise<{ data: SpHub[]; meta: { totalPages: number } }> => {
  try {
    const token = getToken();
    const response = await apiClient.get('/sp-hubs', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch SpHubs.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch SpHubs.');
  }
};

// Fetch all SpHubs without pagination
export const fetchAllSpHubsWithoutPagination = async (): Promise<SpHub[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/sp-hubs/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch SpHubs.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch SpHubs.');
  }
};

// Fetch a specific SpHub by ID
export const fetchSpHubById = async (id: string): Promise<SpHub> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/sp-hubs/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch SpHub.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch SpHub.');
  }
};

// Create a new SpHub
export const createSpHub = async (spHub: SpHub): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/sp-hubs', spHub, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (!response.data.status) {
      throw new Error(response.data.message || 'Failed to create SpHub.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create SpHub.');
  }
};

// Update an existing SpHub
export const updateSpHub = async (id: string, spHub: SpHub): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(`/sp-hubs/${id}`, spHub, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (!response.data.status) {
      throw new Error(response.data.message || 'Failed to update SpHub.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update SpHub.');
  }
};

// Delete a SpHub by ID
export const deleteSpHub = async (id: string): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.delete(`/sp-hubs/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (!response.data.status) {
      throw new Error(response.data.message || 'Failed to delete SpHub.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete SpHub.');
  }
};

// Export SpHubs to an Excel file
export const exportSpHubsToXLS = async (): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/sp-hubs/export/xls', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob',
    });

    const uniqueFilename = generateUniqueFilename('sp_hubs', 'xlsx');

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting SpHubs:', error);
    throw new Error('Failed to export SpHubs');
  }
};

// Import SpHubs from a CSV file
export const importSpHubsFromCSV = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken();

    const response: AxiosResponse = await apiClient.post('/sp-hubs/import/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });

    if (!response.data.status) {
      throw new Error(response.data.message || 'Failed to import SpHubs.');
    }
  } catch (error: any) {
    console.error('Error importing SpHubs:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to import SpHubs.');
  }
};

// Download sample CSV for SpHubs
export const downloadSampleSpHubExcel = async (): Promise<void> => {
  try {
    const token = getToken();

    const response: AxiosResponse = await apiClient.get('/sp-hubs/sample/csv', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob',
    });

    const uniqueFilename = generateUniqueFilename('sp_hubs_sample', 'csv');

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading sample CSV:', error);
    throw new Error('Failed to download sample CSV');
  }
};