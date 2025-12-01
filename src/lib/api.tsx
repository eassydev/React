import axios, { AxiosResponse } from 'axios';

// Access environment variables
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/admin-api';

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
      // Don't redirect here to avoid infinite loops or incorrect redirects
      // The interceptor will handle redirects for 401/403 responses
      return null;
    }
    return token;
  }
  return null;
};

// Define the structure of the Category object

// ✅ NEW: Analytics interfaces
export interface AnalyticsReportData {
  period: string;
  period_type: string;

  // App Downloads and Registrations
  downloads: number;
  registrations: number;
  b2b_registrations: number; // ✅ Added B2B registrations field

  // Orders Received
  orders_received_b2c: number;
  orders_received_b2b: number;
  orders_received_total: number;

  // Order Values
  orders_value_b2c: number;
  orders_value_b2b: number;
  orders_value_total: number;

  // Orders Executed (Completed)
  orders_executed_b2c: number;
  orders_executed_b2b: number;
  orders_executed_total: number;

  // Executed Order Values
  executed_value_b2c: number;
  executed_value_b2b: number;
  executed_value_total: number;

  // Invoices Raised
  invoices_raised_b2c: number;
  invoices_raised_b2b: number;
  invoices_raised_total: number;

  // Invoice Values
  invoice_value_b2c: number;
  invoice_value_b2b: number;
  invoice_value_total: number;

  // Collections (Paid Invoices)
  collected_b2c: number;
  collected_b2b: number;
  collected_total: number;

  // Collection Values
  collection_value_b2c: number;
  collection_value_b2b: number;
  collection_value_total: number;

  // Overdue Analysis
  overdue_invoices_b2c: number;
  overdue_invoices_b2b: number;
  overdue_invoices_total: number;

  overdue_value_b2c: number;
  overdue_value_b2b: number;
  overdue_value_total: number;

  avg_overdue_days_b2c: number;
  avg_overdue_days_b2b: number;
  avg_overdue_days_total: number;

  // Average Order Values
  avg_order_value_b2c: number;
  avg_order_value_b2b: number;
  avg_order_value_total: number;
}

export interface AnalyticsSummary {
  totals: {
    downloads: number;
    registrations: number;
    orders_received: number;
    orders_value: number;
    orders_executed: number;
    executed_value: number;
    invoices_raised: number;
    invoice_value: number;
    collected: number;
    collection_value: number;
    overdue_invoices: number;
    overdue_value: number;
  };
  averages: {
    downloads_per_period: number;
    registrations_per_period: number;
    orders_per_period: number;
    order_value_per_period: number;
    avg_order_value: number;
    collection_rate: number;
    overdue_rate: number;
  };
  growth_rates: {
    downloads: number;
    registrations: number;
    orders: number;
    revenue: number;
  };
}

export interface ComprehensiveAnalyticsResponse {
  success: boolean;
  data: {
    period: string;
    date_range: {
      start: string;
      end: string;
    };
    business_type: string;
    report: AnalyticsReportData[];
    summary: AnalyticsSummary;
    generated_at: string;
  };
}

export interface DashboardSummaryResponse {
  success: boolean;
  data: {
    current_month: {
      downloads: number;
      registrations: number;
      orders_received: number;
      orders_value: number;
      orders_executed: number;
      executed_value: number;
      collection_rate: number;
      overdue_rate: number;
    };
    growth_rates: {
      downloads: number;
      registrations: number;
      orders: number;
      revenue: number;
    };
    business_split: {
      b2c: {
        orders: number;
        value: number;
        percentage: number;
      };
      b2b: {
        orders: number;
        value: number;
        percentage: number;
      };
    };
  };
  generated_at: string;
}

export interface Category {
  id?: string; // Optional for editing
  name: string;
  image: File | null;
  locations: Location[];
  location_type: string;
  service_time?: string;
  exclude_heading?: string;
  exclude_description?: string;
  location_method: string;
  active: boolean;
  weight?: Number;
  is_home: boolean;
  attributes?: Attribute[];
  sac_code?: string | null; // SAC code
  service_type?: string; // ✅ NEW: Service type field ('b2c', 'b2b', 'both')
  excludeItems?: ExcludeItem[]; // Array of excluded items
  excludedImages?: ExcludeImage[]; // Array of excluded images
  includeItems?: IncludeItem[]; // Array of excluded items
}

// Define the structure of the Subcategory object
export interface Subcategory {
  id?: string; // Optional for editing
  name: string;
  image: File | null;
  category_id: string; // Associated category ID  // Field for SAC code
  service_time?: string;
  exclude_heading?: string;
  exclude_description?: string;
  active: boolean;
  weight?: Number;
  attributes?: Attribute[];
  sac_code?: string | null; // SAC code
  service_type?: string; // ✅ NEW: Service type field ('b2c', 'b2b', 'both')
  excludeItems?: ExcludeItem[]; // Array of excluded items
  excludedImages?: ExcludeImage[]; // Array of excluded images
  includeItems?: IncludeItem[]; // Array of excluded items
  meta_description?: string | null; // Field for meta description
  meta_keyword?: string | null; // Field for meta keywords
  sampleid?: string; // ✅ NEW: Decrypted ID for display
  category?: {
    id: string;
    name: string;
  };
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
  id?: string;
  name: string;
  title: string;
  type: string;
  weight?: number;
  options: AttributeOption[];
};

export interface AttributeOption {
  id?: string;
  value: string;
  title: string;
  weight?: number;
}

// export type ServiceDetail = {
//   id?: string;
//   title: string;
//   description: string;
// };

export interface ServiceDetail {
  id?: string; // Optional, as it might be generated by the backend
  segment_id?: string; // Foreign key linking to the service segment
  category_id: string; // Foreign key linking to the category
  subcategory_id?: string; // Foreign key linking to the subcategory
  serviceAttributes: {
    attribute_id: string;
    option_id: string;
  }[];
  serviceDescriptions: ServiceDescription[];
  active: boolean;
}

export interface ServiceDescription {
  id?: string; // Optional, as it might be generated by the backend
  service_detail_id?: string; // Foreign key linking to the service detail
  name: string; // Name of the service description
  description: string; // Detailed description of the service
  created_at?: number; // Unix timestamp for creation, optional for frontend
  updated_at?: number; // Unix timestamp for updates, optional for frontend
}

export interface ServiceSegment {
  id?: string;
  category_id?: string | null; // Allow null for category_id
  subcategory_id?: string | null; // Allow null for subcategory_id
  filter_attribute_id?: string | null; // Allow null for filter_attribute_id
  segment_name: string; // Make segment_name an array of strings
  is_active?: boolean; // is_active can be undefined
  sampleid?: string; // ✅ NEW: Decrypted ID for display
}
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

export interface RateCard {
  id?: string;
  category_id: string;
  subcategory_id?: string | null;
  segment_id?: string | null;
  provider_id?: string | null;
  name: string;
  price: number;
  weight?: Number;
  strike_price: number;
  active: boolean; // Added best_deal
  service_type?: string; // ✅ NEW: Service type field ('b2c', 'b2b', 'both')
  serviceDescriptions?: ServiceDetail[]; // Includes service details
  attributes: {
    attribute_id: string;
    option_id: string;
  }[]; // Dynamic filter attributes and options
  // Nested objects for API responses
  category?: {
    id: string;
    name: string;
    image?: string;
  };
  subcategory?: {
    id: string;
    name: string;
    category_id: string;
    image?: string;
  };
  segment?: {
    id: string;
    segment_name: string;
  };
  sampleid?: string; // ✅ NEW: Decrypted ID for display
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
  page_type?: 'privacy-policy' | 'terms-conditions' | 'faq' | 'about-us' | 'custom';
  target_audience?: 'customer' | 'provider' | 'both';
  is_active: boolean;
  created_at?: number; // UNIX timestamp
  updated_at?: number; // UNIX timestamp
}

export interface Donation {
  id?: string; // Optional for editing
  name: string;
  description?: string;
  logo_image?: File | null;
  image?: File | null;
  bank_id?: string;
  account_no: string;
  ifsc_code: string;
  bank_name?: string;
  branch_name?: string;
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
  image?: File | null; // Optional image upload
  active: number;
  rating?: number;
  country?: string;
  state?: string;
  city?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  linked_account_id?: string; // Razorpay linked account ID
  commission?: number; // Commission rate for the provider (percentage)
  // ✅ B2B PROVIDER FIELDS
  provider_type?: 'b2c' | 'b2b' | 'hybrid';
  b2b_approved?: number; // 0 = not approved, 1 = approved
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
  branch_name?: string;
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
  selection_id: string | null; // ID of the selected item (category, subcategory, etc.)
  is_active: boolean; // Banner active status
  media_type: 'image' | 'video'; // Type of media (image or video)
  display_order?: number; // Optional order of display
  media_name?: string; // Optional link for deeper navigation
  deep_link?: string; // Optional link for deeper navigation
  image?: File | null; // Optional file input for the banner image
  latitude?: number | null; // Latitude for geo-targeting
  longitude?: number | null; // Longitude for geo-targeting
  radius?: number | null; // Radius for targeting in kilometers
  start_date?: string; // Start date for banner visibility (ISO format: YYYY-MM-DD)
  end_date?: string; // End date for banner visibility (ISO format: YYYY-MM-DD)
  add_to_cart?: boolean; // Flag to indicate if the banner is for a cart item
  hub_ids?: string[]; // Array of hub IDs associated with the banner
  is_free: boolean;
  rate_card_id: string | null;
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
  type: 'splash' | 'onboarding'; // Enum type for splash or onboarding
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
// Update the SearchUserResult interface to match the API response
export interface SearchUserResult {
  id: string; // Encrypted ID for backend operations
  // API response fields
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile: string;
  created_at?: string;
  sampleid?: number; // Decrypted ID for display
  // Our formatted fields
  name?: string;
  displayId?: string;
}

// Address Interface
export interface Address {
  id?: string; // Optional for editing
  user_id: string; // Encrypted user ID
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
  created_at?: number;
  updated_at?: number;
}

export interface Booking {
  id?: string; // Optional for editing
  user_id: number;
  provider_id: number;
  order_number: string;
  booking_date: string;
  delivery_address_id: number;
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
  selection_type?: 'Category' | 'Package'; // Type of selection
  quantity: number;
  base_price: number;
  discount_amount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total_tax?: number;
  taxable_amount?: number;
  total_amount: number;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'; // Booking status
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'; // Payment status
  payment_method?: 'credit_card' | 'debit_card' | 'upi' | 'wallet' | 'net_banking' | 'cod'; // Payment method
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
  discount_type: 'flat' | 'percentage'; // Enum for discount type
  discount_value: number; // Required discount value
  min_order_value?: number | null; // Optional field for minimum order value
  start_date: string; // Required start date
  end_date: string; // Required end date
  status: 'active' | 'inactive' | 'expired'; // Enum for promocode status
  selection_type: string; // Specific selection type options (Category, Subcategory, etc.)
  selection_id: string | null; // ID of the selected item (category, subcategory, etc.)
  is_global: boolean; // Indicates if the promocode is global
  display_to_customer: boolean; // Indicates if the promocode is visible to customers
  is_active: boolean; // Indicates if the promocode is active
  provider_id: string; // ID of the associated provider
  image?: File; // Optional image file for the promocode
  is_free: boolean;
  rate_card_id: string | null;
  category_ids?: string[]; // Array of addon category IDs
  categories?: string[]; // Array of addon category IDs
}

// Woloo Interfaces
export interface WolooCategory {
  id?: string;
  sampleid?: string;
  name: string;
  service_time?: string;
  image?: File | null;
  active: boolean;
  provider_id?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WolooSubcategory {
  id?: string;
  name: string;
  category_id: string;
  service_time?: string;
  image?: File | null;
  active: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
  sampleid?: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface WolooAttribute {
  id?: string;
  category_id: string;
  subcategory_id?: string;
  name: string;
  type: string;
  required?: boolean;
  weight?: number;
  active: boolean;
  provider_id?: string;
  created_at?: string;
  updated_at?: string;
  sampleid?: string;
  options?: WolooAttributeOption[];
}

export interface WolooAttributeOption {
  id?: string;
  attribute_id?: string;
  name: string;
  price_modifier?: number;
  weight?: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  sampleid?: string;
}

export interface WolooRateCard {
  id?: string;
  raw_id?: number;
  category_id: string;
  subcategory_id?: string;
  segment_id?: number;
  user_id?: number;
  name: string;
  price: number;
  strike_price?: number;
  weight?: number;
  recommended?: boolean;
  best_deal?: boolean;
  active: boolean;
  provider_id?: number;
  category?: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
  attributes?: {
    attribute_id: string;
    option_id: string;
  }[];
  created_at?: string;
  updated_at?: string;
  sampleid?: string;
}

export interface WolooBooking {
  id?: string;
  woloo_order_id: string;

  // Customer Information
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  customer_address: string;
  pincode: string;

  // Service Information
  service_category: string;
  ratecard_id: string;
  rateCard?: {
    id: string;
    name: string;
    price: number;
    strike_price?: number;
  };

  // Booking Details
  booking_date: string;
  booking_time?: string;
  final_price: number;

  // Status Management
  status: 'accepted' | 'running' | 'rescheduled' | 'cancelled' | 'completed';

  // Internal Staff Assignment
  staff_id?: number;
  provider_id: number;
  provider_name?: string;
  provider_mobile?: string;

  // OTP System for Service Verification
  start_service_otp?: string;
  end_service_otp?: string;

  // Service Time Tracking
  start_service_time?: string;
  end_service_time?: string;

  // Webhook Tracking
  woloo_notified_at?: string;
  admin_notes?: string;

  // Additional fields (for compatibility)
  payment_status?: string;
  payment_method?: string;
  transaction_id?: string;
  service_address?: string;
  notes?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
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
  type: 'customer' | 'provider';
  redirect_screen?: string;
  category_id?: string;
  notification_type_id?: string;
  subcategory_id?: string;
  recipients?: { id: number; name: string }[];
  inner_image?: File | null;
  outer_image?: File | null;
  is_active: boolean;
  send_to_all: boolean;
}

export interface WalletOffer {
  id?: number;
  event_type: 'sign_up' | 'order' | 'referral' | 'sign_up_referral';
  es_cash: number;
  start_date: string; // Format: YYYY-MM-DD
  end_date: string; // Format: YYYY-MM-DD
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
  adhar_card_number: string;
  pan_number: string;
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
  city_id: string;
  hub_priority: string; // Priority as a string
  is_active: boolean;
}

export interface HubPincode {
  id?: number;
  hub_id: string;
  pincode: string;
  is_active?: boolean;
}

export interface SpHub {
  id?: number;
  hub_id: string;
  city_id: string;
  category_id?: string | null; // Allow null or undefined
  subcategory_id?: string;
  filter_attribute_id?: string;
  filter_option_id?: string;
  staff: number;
  weightage: number;
  is_active: boolean;
  provider_id?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface NotificationType {
  id?: string; // Optional for update
  title: string;
  message: string;
  type: 'timer' | 'image' | 'carousel' | 'normal' | 'sound';
  image_url?: File | string | null; // File upload or URL from the server
  sound_url?: File | string | null; // File upload or URL from the server
  carousel_data?: (File | { image_url: string })[]; // Array of files or API response objects
  timer_duration?: number | null; // Optional for timer notifications
  action_type: 'internal_link' | 'external_link' | 'order_related' | 'promo';
  action_data?: string | null; // Optional action URL or data
  isActive: boolean;
}

export interface ServiceVideo {
  id?: string;
  category_id?: string | null;
  subcategory_id?: string | null;
  video_url?: File | null; // Make video_url optional and nullable
  is_active?: boolean; // Add the image property
}

interface Campaign {
  campaign_name: string;
  provider_id?: string;
  rate_card_id?: string;
  category_id?: string;
  subcategory_id?: string;
  filter_attribute_id?: string;
  filter_option_id?: string;
  segment_id?: string;
  utm_url?: string;
  pincode?: string;
  latitude?: string;
  longitude?: string;
  utm_source?: string;
  utm_medium?: string;
  screen_redirect?: string;
  add_to_cart?: boolean;
  is_active?: boolean;
}

export interface PackageDetail {
  package_id: string;
  details: {
    position: 'Top' | 'Bottom';
    title: string;
    image?: File | null;
  }[];
}
export interface RatecardBogo {
  rate_card_id: string;
  bogo_rate_card_id: string;
  is_active: boolean;
}

export interface Course {
  id?: string; // Optional for editing (encrypted ID)
  title: string; // Course title
  description?: string; // Optional course description
  module_type: 'beginner' | 'advanced'; // Type of module
  video_url?: File | null; // Optional video file input for upload
  length_in_minutes: number; // Total course length in minutes
  category_id: string; // Encrypted category ID
  is_active?: boolean; // Optional: for admin control
  created_at?: string; // Optional: timestamp when created
  updated_at?: string; // Optional: timestamp when updated
}

export interface FAQItem {
  id?: string; // Optional for editing
  question: string; // FAQ question
  answer: string; // FAQ answer (can be rich text)
  sort_order?: number; // Display order
  is_active?: boolean; // Active status
}

export interface SEOContent {
  id?: string; // Optional for editing (encrypted ID)
  title: string; // SEO content title
  slug: string; // URL slug for the content
  meta_title?: string; // Meta title for SEO
  meta_description?: string; // Meta description for SEO
  description?: string; // Alternative description field from API
  meta_keywords?: string; // Meta keywords for SEO
  content: string; // Rich text content (HTML)
  category_id?: string; // Optional category association
  subcategory_id?: string; // Optional subcategory association
  service_type?: 'bathroom-cleaning' | 'home-cleaning' | 'sofa-cleaning' | 'general' | 'custom'; // Service type
  content_type?: 'service-page' | 'landing-page' | 'blog-post' | 'faq' | 'general'; // Content type
  target_audience?: 'customer' | 'provider' | 'both'; // Target audience
  featured_image?: File | null; // Optional featured image
  is_active: boolean; // Active status
  is_featured?: boolean; // Featured content flag
  sort_order?: number; // Sort order for display
  faq_items?: FAQItem[]; // FAQ questions and answers (for FAQ content type)
  created_at?: string | number; // Creation timestamp (string or Unix timestamp)
  updated_at?: string | number; // Update timestamp (string or Unix timestamp)
  deleted_at?: string | number | null; // Deletion timestamp
}

export interface Badge {
  id?: string; // Optional: encrypted ID for editing
  name: string; // Badge name
  image?: File | string | null; // Image file (for upload) or URL (from DB)
  total_course: number; // Number of courses required for this badge
  next_badge_time?: number | null; // Optional: Time/days until next badge
  is_active?: boolean; // Optional: Admin toggle
  created_at?: string; // Optional: Timestamp
  updated_at?: string; // Optional: Timestamp
}

export interface CourseQuizQuestion {
  id?: string;
  question_text: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_answer: 'option_1' | 'option_2' | 'option_3' | 'option_4';
}

export interface CourseQuiz {
  id?: string;
  category_id: string;
  course_id: string;
  quiz_text?: string;
  is_active?: boolean;
  questions: CourseQuizQuestion[];
}

// Define the structure of the API response
interface ApiResponse {
  status: boolean;
  message: string;
  data?: any;
  pagination?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

interface ApiPermissionResponse {
  data?: any;
  [key: string]: Permission[]; // Dynamic keys mapping to arrays of Permission
}

export const fetchCategories = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/category', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
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
    console.error('Error in fetchAllCategories:', error);
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
  formData.append('active', category.active ? '1' : '0');

  // Image
  if (category.image) {
    formData.append('image', category.image);
  }

  if (category.weight) {
    formData.append('weight', category.weight?.toString());
  }

  // Locations
  formData.append('locationType', category.location_type);
  formData.append('locationMethod', category.location_method);
  formData.append('locations', JSON.stringify(category.locations));

  if (category.service_time !== null && category.service_time !== undefined) {
    formData.append('service_time', category.service_time.toString());
  }
  if (category.exclude_heading !== null && category.exclude_heading !== undefined) {
    formData.append('exclude_heading', category.exclude_heading.toString());
  }
  if (category.exclude_description !== null && category.exclude_description !== undefined) {
    formData.append('exclude_description', category.exclude_description.toString());
  }
  if (category.sac_code) {
    formData.append('sac_code', category.sac_code);
  }
  if (category.service_type) {
    formData.append('service_type', category.service_type); // ✅ NEW: Add service_type to FormData
    console.log('Adding service_type to FormData:', category.service_type); // ✅ DEBUG: Log service_type
  }

  // Attributes and Options
  if (category.attributes && category.attributes.length > 0) {
    const attributes = category.attributes.map((attr) => ({
      attribute_title: attr.title,
      attribute_name: attr.name,
      attribute_type: attr.type,
      attribute_weight: attr.weight,
      options: attr.options,
    }));
    formData.append('attributes', JSON.stringify(attributes));
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
  formData.append('active', category.active ? '1' : '0');

  // Image
  if (category.image) {
    formData.append('image', category.image);
  }

  if (category.weight) {
    formData.append('weight', category.weight?.toString());
  }
  // Locations
  formData.append('locationType', category.location_type);
  formData.append('locationMethod', category.location_method);
  formData.append('locations', JSON.stringify(category.locations));

  if (category.service_time !== null && category.service_time !== undefined) {
    formData.append('service_time', category.service_time.toString());
  }
  if (category.exclude_heading !== null && category.exclude_heading !== undefined) {
    formData.append('exclude_heading', category.exclude_heading.toString());
  }
  if (category.exclude_description !== null && category.exclude_description !== undefined) {
    formData.append('exclude_description', category.exclude_description.toString());
  }

  if (category.sac_code) {
    formData.append('sac_code', category.sac_code);
  }
  if (category.service_type) {
    formData.append('service_type', category.service_type); // ✅ NEW: Add service_type to FormData
  }

  // Attributes and Options
  if (category.attributes && category.attributes.length > 0) {
    const attributes = category.attributes.map((attr) => ({
      id: attr.id,
      attribute_title: attr.title,
      attribute_name: attr.name,
      attribute_type: attr.type,
      attribute_weight: attr.weight,
      options: attr.options,
    }));
    formData.append('attributes', JSON.stringify(attributes));
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
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/category/${id}`, {
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
  formData.append('active', subcategory.active ? '1' : '0');

  // Add optional image field
  if (subcategory.image) {
    formData.append('image', subcategory.image);
  }
  if (subcategory.weight) {
    formData.append('weight', subcategory.weight?.toString());
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
  if (subcategory.sac_code) {
    formData.append('sac_code', subcategory.sac_code);
  }
  if (subcategory.service_type) {
    formData.append('service_type', subcategory.service_type); // ✅ NEW: Add service_type to FormData
  }

  // Attributes and Options
  if (subcategory.attributes && subcategory.attributes.length > 0) {
    const attributes = subcategory.attributes.map((attr) => ({
      attribute_title: attr.title,
      attribute_name: attr.name,
      attribute_type: attr.type,
      attribute_weight: attr.weight,
      options: attr.options,
    }));
    formData.append('attributes', JSON.stringify(attributes));
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

// Adjust the fetchSubcategories API function to support pagination, filtering, and search
export const fetchSubcategories = async (
  page: number = 1,
  size: number = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.active = status; // Assuming your backend expects 'active' parameter
    }

    // Include search term if provided
    if (search && search.trim() !== '') {
      params.search = search.trim();
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
export const fetchSubCategoriesByCategoryId = async (
  categoryId: string
): Promise<Subcategory[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(
      `/sub-category/category/${categoryId}`,
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );

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
export const updateSubcategory = async (
  id: string,
  subcategory: Subcategory
): Promise<ApiResponse> => {
  const formData = new FormData();

  // Add required fields
  formData.append('name', subcategory.name);
  formData.append('category_id', subcategory.category_id.toString());
  formData.append('active', subcategory.active ? '1' : '0');

  if (subcategory.image) {
    formData.append('image', subcategory.image);
  }
  if (subcategory.weight) {
    formData.append('weight', subcategory.weight?.toString());
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

  if (subcategory.sac_code) {
    formData.append('sac_code', subcategory.sac_code);
  }
  if (subcategory.service_type) {
    formData.append('service_type', subcategory.service_type); // ✅ NEW: Add service_type to FormData
  }

  // Attributes and Options
  if (subcategory.attributes && subcategory.attributes.length > 0) {
    const attributes = subcategory.attributes.map((attr) => ({
      id: attr.id,
      attribute_title: attr.title,
      attribute_name: attr.name,
      attribute_type: attr.type,
      attribute_weight: attr.weight,
      options: attr.options,
    }));
    formData.append('attributes', JSON.stringify(attributes));
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
    const response: AxiosResponse<ApiResponse> = await apiClient.put(
      `/sub-category/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'admin-auth-token': token || '',
        },
      }
    );
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

export const createRateCard = async (rateCard: RateCard): Promise<ApiResponse> => {
  const payload = {
    name: rateCard.name,
    category_id: rateCard.category_id,
    provider_id: rateCard.provider_id ?? null,
    segment_id: rateCard.segment_id ?? null,
    price: rateCard.price,
    weight: rateCard.weight,
    strike_price: rateCard.strike_price,
    active: rateCard.active ? 1 : 0,
    subcategory_id: rateCard.subcategory_id ?? null, // Added recommended
    service_type: rateCard.service_type ?? 'both', // ✅ NEW: Add service_type to payload
    filter_attributes: rateCard.attributes.map((attr) => ({
      attribute_id: attr.attribute_id,
      option_id: attr.option_id,
    })), // Include dynamic filter attributes // Include service descriptions
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
// Enhanced interface for rate card filters
interface RateCardFilters {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
  category_id?: string;
  subcategory_id?: string;
  provider_id?: string;
  segment_id?: string;
  min_price?: number;
  max_price?: number;
  recommended?: boolean;
  best_deal?: boolean;
  attribute_id?: string;
  option_id?: string;
}

// Overloaded function for backward compatibility
export const fetchRateCards = async (
  filtersOrPage?: RateCardFilters | number,
  size?: number,
  status?: string,
  search?: string
) => {
  let filters: RateCardFilters = {};

  // Handle backward compatibility
  if (typeof filtersOrPage === 'number') {
    // Old signature: (page, size, status, search)
    filters = {
      page: filtersOrPage,
      size,
      status,
      search,
    };
  } else if (filtersOrPage && typeof filtersOrPage === 'object') {
    // New signature: (filters)
    filters = filtersOrPage;
  }
  try {
    const token = getToken();

    // Prepare query parameters with defaults
    const params: Record<string, any> = {
      page: filters.page || 1,
      size: filters.size || 10,
    };

    // Include status filter only if it's not 'all'
    if (filters.status && filters.status !== 'all') {
      params.status = filters.status;
    }

    // Include search term if provided
    if (filters.search && filters.search.trim() !== '') {
      params.search = filters.search.trim();
    }

    // Include advanced filters if provided
    if (filters.category_id) params.category_id = filters.category_id;
    if (filters.subcategory_id) params.subcategory_id = filters.subcategory_id;
    if (filters.provider_id) params.provider_id = filters.provider_id;
    if (filters.segment_id) params.segment_id = filters.segment_id;
    if (filters.min_price !== undefined) params.min_price = filters.min_price;
    if (filters.max_price !== undefined) params.max_price = filters.max_price;
    if (filters.recommended !== undefined) params.recommended = filters.recommended;
    if (filters.best_deal !== undefined) params.best_deal = filters.best_deal;
    if (filters.attribute_id) params.attribute_id = filters.attribute_id;
    if (filters.option_id) params.option_id = filters.option_id;

    const response: AxiosResponse = await apiClient.get('/rate-card', {
      params,
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

export const fetchRateCardsByProvider = async (providerId: string): Promise<RateCard[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(
      `/rate-card/provider/${providerId}`,
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch provider rate cards');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch provider rate cards');
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

export const updateRateCard = async (id: string, rateCard: RateCard): Promise<ApiResponse> => {
  // Build the JSON payload
  const payload = {
    name: rateCard.name,
    category_id: rateCard.category_id,
    provider_id: rateCard.provider_id ?? null,
    segment_id: rateCard.segment_id ?? null,
    price: rateCard.price,
    strike_price: rateCard.strike_price,
    active: rateCard.active ? 1 : 0,
    subcategory_id: rateCard.subcategory_id ?? null,
    service_type: rateCard.service_type ?? 'both', // ✅ NEW: Add service_type to payload
    filter_attributes: rateCard.attributes.map((attr) => ({
      attribute_id: attr.attribute_id,
      option_id: attr.option_id,
    })), // Include dynamic filter attributes
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
    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      `/rate-card/${id}/restore`,
      {},
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to restore rate card.');
  }
};

// Fetch filter attributes by category and/or subcategory ID
export const fetchFilterAttributes = async (
  categoryId: string | null,
  subcategoryId: string | null
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

export const createNestedFilter = async (nested: any): Promise<ApiResponse> => {
  const payload = {
    category_id: nested.category_id,
    subcategory_id: nested.subcategory_id ?? '',
    first_level_attribute_id: nested.first_level_attribute_id ?? '',
    first_level_option_id: nested.first_level_option_id ?? '',
    second_level_attribute_id: nested.second_level_attribute_id ?? '',
    second_level_option_ids: nested.second_level_option_ids ?? '',
  };
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      '/filter/nested-attribute',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create rate card.');
  }
};

export const fetchServiceSegments = async (
  categoryId: string | null,
  subcategoryId: string | null,
  filter_attribute_id?: string | null
): Promise<ServiceSegment[]> => {
  try {
    const token = getToken();
    const params: any = {};
    if (categoryId) params.category_id = categoryId;
    if (subcategoryId) params.subcategory_id = subcategoryId;
    if (filter_attribute_id) params.filter_attribute_id = filter_attribute_id;

    const response: AxiosResponse<ApiResponse> = await apiClient.get('/booking/service-segments', {
      params,
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      // ✅ Return the data array, or empty array if no segments found
      return response.data.data || [];
    } else {
      // ✅ Don't throw error for "no segments found" - return empty array instead
      console.log('No service segments found:', response.data.message);
      return [];
    }
  } catch (error: any) {
    // ✅ Handle API errors more gracefully - return empty array instead of throwing
    console.error('Error fetching service segments:', error.response?.data?.message || error.message);
    return [];
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
  if (pkg.validity_period)
    formData.append('validity_period', pkg.validity_period?.toString() || '');
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
    pkg.addon_category_ids.forEach((categoryId) =>
      formData.append('addon_category_ids[]', categoryId)
    );
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
  if (pkg.validity_period)
    formData.append('validity_period', pkg.validity_period?.toString() || '');
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
    pkg.addon_category_ids.forEach((categoryId) =>
      formData.append('addon_category_ids[]', categoryId)
    );
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

export const fetchPackages = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/package', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
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
      page_type: page.page_type || 'custom',
      target_audience: page.target_audience || 'both',
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
export const fetchPages = async (
  page = 1,
  size = 10,
  page_type?: string,
  target_audience?: string
) => {
  try {
    const token = getToken();
    const params: any = { page, size };
    if (page_type) params.page_type = page_type;
    if (target_audience) params.target_audience = target_audience;

    const response = await apiClient.get('/page', {
      params,
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
    page_type: page.page_type,
    target_audience: page.target_audience,
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
    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      `/page/${id}/restore`,
      {},
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to restore page.');
  }
};

// Function to fetch CMS page types with counts
export const fetchCMSPageTypes = async (): Promise<any> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/page/cms/types', {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch CMS page types.');
  }
};

// Function to fetch pages by type and audience
export const fetchPagesByTypeAndAudience = async (
  page_type: string,
  target_audience: string
): Promise<any> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(
      `/page/cms/${page_type}/${target_audience}`,
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch pages by type and audience.');
  }
};

// Fetch all users with optional pagination

export const fetchAllUsers = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/user', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

export const fetchAllUsersWithouPagination = async (
  searchTerm?: string
): Promise<User[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/user/all?search=${searchTerm}`, {
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

// Search users by mobile number with pagination
export const searchUser = async (searchTerm: string, page = 1, size = 10): Promise<any> => {
  try {
    const token = getToken();

    // Build query parameters
    const params = new URLSearchParams({
      search: searchTerm,
      page: page.toString(),
      size: size.toString(),
    });

    const response: AxiosResponse = await apiClient.get(`/user/search?${params.toString()}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    // Check if the response has the expected structure
    if (response.data && response.data.status) {
      // Return both the data and metadata for pagination
      return {
        data: response.data.data || [],
        meta: response.data.meta || {
          totalItems: 0,
          totalPages: 0,
          currentPage: page,
          pageSize: size,
        },
      };
    } else {
      // Return empty data with default metadata
      return {
        data: [],
        meta: {
          totalItems: 0,
          totalPages: 0,
          currentPage: page,
          pageSize: size,
        },
      };
    }
  } catch (error: any) {
    console.error('Error searching users:', error);
    throw new Error(error.response?.data?.message || 'Failed to search users.');
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
    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      `/user/${id}/restore`,
      {},
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to restore user.');
  }
};

export const fetchProvidersByFilters = async (
  categoryId?: any,
  subcategoryId?: any,
  filterAttributeId?: any,
  filterOptionId?: any,
  page: number = 1,
  size: number = 50,
  search?: string
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
        page,
        size,
        search,
      },
    });
    if (response.data.status) {
      return response.data; // Return full response including meta
    } else {
      throw new Error(response.data.message || 'Failed to fetch providers.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch providers.');
  }
};

// ✅ NEW: Fetch all B2B providers without category/subcategory filtering
export const fetchAllB2BProviders = async (
  page: number = 1,
  limit: number = 50,
  search?: string
) => {
  try {
    const token = getToken();
    const response = await apiClient.get('/b2b/providers', {
      headers: {
        'admin-auth-token': token || '',
      },
      params: {
        page,
        limit,
        search,
      },
    });
    if (response.data.success) {
      return response.data; // Return full response including pagination
    } else {
      throw new Error(response.data.message || 'Failed to fetch B2B providers.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch B2B providers.');
  }
};

export const fetchAllProviders = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/provider', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

// Function to fetch all banks
// export const fetchAllProvidersWithoutpagination = async (): Promise<Provider[]> => {
//   try {
//     const token = getToken();
//     const response: AxiosResponse<ApiResponse> = await apiClient.get('/provider/all', {
//       headers: {
//         'admin-auth-token': token || '',
//       },
//     });
//     if (response.data.status) {
//       return response.data.data;
//     } else {
//       throw new Error(response.data.message || 'Failed to fetch banks.');
//     }
//   } catch (error: any) {
//     throw new Error(error.response?.data?.message || 'Failed to fetch banks.');
//   }
// };

export const fetchProviders = async (): Promise<Provider[]> => {
  try {
    const token = getToken(); // Assume getToken() retrieves the auth token

    const response: AxiosResponse<ApiResponse> = await apiClient.get('/provider/all', {
      headers: {
        'admin-auth-token': token || '',
      },
      params: {
        // Number of providers per request
      },
    });

    if (response.data.status) {
      return response.data.data; // Return the paginated array of providers
    } else {
      throw new Error(response.data.message || 'Failed to fetch providers.');
    }
  } catch (error: any) {
    console.error('Error fetching providers:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch providers.');
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
export const approvedProvider = async (id: string, is_approved: number): Promise<Provider> => {
  try {
    const token = getToken();

    const response: AxiosResponse<ApiResponse> = await apiClient.put(
      `/provider/update-approval/${id}`,
      { is_approved },
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to approve provider.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to approve provider.');
  }
};

// Function to fetch all banks
// Create a new provider
export const createProvider = async (provider: Provider): Promise<ApiResponse> => {
  const formData = new FormData();

  // Append individual fields to the FormData object
  formData.append('first_name', provider.first_name);
  formData.append('last_name', provider.last_name);
  formData.append('gender', provider.gender || '');
  formData.append('email', provider.email);
  formData.append('phone', provider.phone);
  formData.append('company_name', provider.company_name ?? '');
  formData.append('gst_number', provider.gst_number ?? '');
  formData.append('pan_number', provider.pan_number ?? '');
  formData.append('active', provider.active ? '1' : '0');
  formData.append('rating', provider.rating!.toString() ?? '');
  formData.append('country', provider.country ?? '');
  formData.append('state', provider.state ?? '');
  formData.append('city', provider.city ?? '');
  formData.append('postal_code', provider.postal_code ?? '');

  // ✅ B2B PROVIDER FIELDS
  formData.append('provider_type', provider.provider_type ?? 'b2c');
  formData.append('b2b_approved', (provider.b2b_approved ?? 0).toString());

  // Append optional fields only if they exist
  if (provider.image) {
    formData.append('image', provider.image);
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/provider', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
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
  const formData = new FormData();

  // Append individual fields to the FormData object
  formData.append('first_name', provider.first_name);
  formData.append('last_name', provider.last_name);
  formData.append('gender', provider.gender || '');
  formData.append('email', provider.email);
  formData.append('phone', provider.phone);
  formData.append('company_name', provider.company_name ?? '');
  formData.append('gst_number', provider.gst_number ?? '');
  formData.append('pan_number', provider.pan_number ?? '');
  formData.append('linked_account_id', provider.linked_account_id ?? '');
  formData.append('active', provider.active ? '1' : '0');
  formData.append('rating', provider.rating!.toString() ?? '');
  formData.append('country', provider.country ?? '');
  formData.append('state', provider.state ?? '');
  formData.append('city', provider.city ?? '');
  formData.append('postal_code', provider.postal_code ?? '');

  // ✅ B2B PROVIDER FIELDS
  formData.append('provider_type', provider.provider_type ?? 'b2c');
  formData.append('b2b_approved', (provider.b2b_approved ?? 0).toString());

  // Append optional fields only if they exist
  if (provider.image) {
    formData.append('image', provider.image);
  }
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/provider/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
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
    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      `/provider/${id}/restore`,
      {},
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to restore provider.');
  }
};

// ✅ PROVIDER DOCUMENT MANAGEMENT FUNCTIONS

// Interface for provider document
export interface ProviderDocument {
  id?: string;
  provider_id: string;
  document_type: 'adhaarCardFront' | 'adhaarCardBack' | 'panCard' | 'gstCertificate';
  document_name?: string;
  document_number?: string;
  document_url?: string;
  status?: 'pending' | 'approved' | 'rejected';
  uploaded_at?: number;
  verified_at?: number;
  created_at?: string;
  updated_at?: string;
}

// Get provider documents
export const getProviderDocuments = async (providerId: string): Promise<ProviderDocument[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<{ status: boolean; documents: ProviderDocument[] }> = await apiClient.get(
      `/provider/${providerId}/documents`,
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );

    if (response.data.status) {
      return response.data.documents;
    } else {
      throw new Error('Failed to fetch provider documents.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch provider documents.');
  }
};

// Upload provider documents
export const uploadProviderDocuments = async (
  providerId: string,
  documents: {
    adhaarCardFront?: File;
    adhaarCardBack?: File;
    panCard?: File;
    gstCertificate?: File;
  },
  documentNumbers?: {
    adhaarCardFront_document_number?: string;
    adhaarCardBack_document_number?: string;
    panCard_document_number?: string;
    gstCertificate_document_number?: string;
  }
): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const formData = new FormData();

    // Append files if they exist
    if (documents.adhaarCardFront) {
      formData.append('adhaarCardFront', documents.adhaarCardFront);
    }
    if (documents.adhaarCardBack) {
      formData.append('adhaarCardBack', documents.adhaarCardBack);
    }
    if (documents.panCard) {
      formData.append('panCard', documents.panCard);
    }
    if (documents.gstCertificate) {
      formData.append('gstCertificate', documents.gstCertificate);
    }

    // Append document numbers if provided
    if (documentNumbers) {
      Object.entries(documentNumbers).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });
    }

    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      `/provider/${providerId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'admin-auth-token': token || '',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to upload provider documents.');
  }
};

// Update document status (approve/reject)
export const updateProviderDocumentStatus = async (
  documentId: string,
  status: 'approved' | 'rejected' | 'pending'
): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(
      `/provider/document/${documentId}/status`,
      { status },
      {
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token || '',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update document status.');
  }
};

// ✅ B2B PROVIDER MANAGEMENT FUNCTIONS

// Update provider type (B2C, B2B, Hybrid)
export const updateProviderType = async (
  id: string,
  provider_type: 'b2c' | 'b2b' | 'hybrid',
  b2b_approved?: number
): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(
      `/provider/${id}/type`,
      {
        provider_type,
        b2b_approved: b2b_approved || 0
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update provider type.');
  }
};

// ✅ NEW: Update provider active status
export const updateProviderActiveStatus = async (
  id: string,
  active: number
): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(
      `/provider/${id}/active-status`,
      { active },
      {
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update provider active status.');
  }
};

// Get all B2B providers with filtering
export const fetchB2BProviders = async (
  page: number = 1,
  size: number = 10,
  provider_type: string = 'all',
  b2b_approved: string = 'all'
): Promise<{ providers: Provider[]; totalPages: number; totalProviders: number }> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/provider/b2b/list', {
      params: { page, size, provider_type, b2b_approved },
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return {
        providers: response.data.data.providers,
        totalPages: response.data.data.pagination.total_pages,
        totalProviders: response.data.data.pagination.total_providers,
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch B2B providers.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch B2B providers.');
  }
};

// Function to fetch all providers
export const fetchAllProvidersWithoutpagination = async (): Promise<Provider[]> => {
  try {
    const token = getAdminToken();
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

// Function to search providers with pagination
export const searchProviders = async (
  search: string = '',
  page: number = 1,
  size: number = 20
): Promise<{
  providers: Provider[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_prev: boolean;
  };
}> => {
  try {
    const token = getAdminToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/provider', {
      headers: {
        'admin-auth-token': token || '',
      },
      params: {
        search,
        page,
        size,
        status: 'all'
      }
    });

    if (response.data.status) {
      return {
        providers: response.data.data,
        pagination: response.data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_count: response.data.data?.length || 0,
          has_next: false,
          has_prev: false
        }
      };
    } else {
      throw new Error(response.data.message || 'Failed to search providers.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to search providers.');
  }
};

// Function to create a new VIP plan
export const createVIPPlan = async (vipPlan: VIPPlan): Promise<ApiResponse> => {
  const formData = new FormData();

  formData.append('plan_name', vipPlan.plan_name);
  formData.append('price', vipPlan.price.toString());

  // Optional discount price
  if (vipPlan.discount_price !== undefined) {
    formData.append('discount_price', vipPlan.discount_price.toString());
  }

  formData.append('description', vipPlan.description);
  formData.append('validity_period', vipPlan.validity_period.toString());
  formData.append('status', vipPlan.status ? '0' : '1');

  // New fields
  formData.append('platform_fees', vipPlan.platform_fees ? '1' : '0');
  formData.append('no_of_bookings', vipPlan.no_of_bookings.toString());

  // Add image file if available
  if (vipPlan.image) {
    formData.append('image', vipPlan.image);
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/vip', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create VIP plan.');
  }
};

// Function to fetch all VIP plans with optional pagination
export const fetchVIPPlans = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/vip', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch providers.');
  }
};

// Function to fetch a single VIP plan by ID
export const fetchVIPPlanById = async (id: string): Promise<VIPPlan> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/vip/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch VIP plan.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch VIP plan.');
  }
};

// Function to update an existing VIP plan
export const updateVIPPlan = async (id: string, vipPlan: VIPPlan): Promise<ApiResponse> => {
  const formData = new FormData();

  formData.append('plan_name', vipPlan.plan_name);
  formData.append('price', vipPlan.price.toString());

  // Optional discount price
  if (vipPlan.discount_price !== undefined) {
    formData.append('discount_price', vipPlan.discount_price.toString());
  }

  formData.append('description', vipPlan.description);
  formData.append('validity_period', vipPlan.validity_period.toString());
  formData.append('status', vipPlan.status ? '0' : '1');

  // New fields
  formData.append('platform_fees', vipPlan.platform_fees ? '1' : '0');
  formData.append('no_of_bookings', vipPlan.no_of_bookings.toString());

  // Add image file if available
  if (vipPlan.image) {
    formData.append('image', vipPlan.image);
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/vip/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update VIP plan.');
  }
};

// Function to delete a VIP plan
export const deleteVIPPlan = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/vip/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete VIP plan.');
  }
};

// Function to restore a soft-deleted VIP plan
export const restoreVIPPlan = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      `/vip/${id}/restore`,
      {},
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to restore VIP plan.');
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
export const fetchAllBanks = async (search?: string): Promise<Bank[]> => {
  try {
    const token = getToken();
    const params = search ? { search } : {};
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/bank/all', {
      params,
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

// Function to create a new bank
export const createBank = async (bankData: { name: string; is_active?: number }): Promise<Bank> => {
  console.log('🔄 createBank API called with:', bankData); // Debug log
  try {
    const token = getToken();
    console.log('🔑 Token:', token ? 'Present' : 'Missing'); // Debug log

    const response: AxiosResponse<ApiResponse> = await apiClient.post('/bank', bankData, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    console.log('📡 API Response:', response.data); // Debug log

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to create bank.');
    }
  } catch (error: any) {
    console.error('❌ API Error:', error); // Debug log
    throw new Error(error.response?.data?.message || 'Failed to create bank.');
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

// Function to bulk insert banks
export const bulkInsertBanks = async (): Promise<{ totalBanks: number; inserted: number; existing: number }> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/bank/bulk-insert', {}, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to bulk insert banks.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to bulk insert banks.');
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
export const createProviderBankDetail = async (
  detail: ProviderBankDetail
): Promise<ApiResponse> => {
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
    const response: AxiosResponse<ApiResponse> = await apiClient.put(
      `/provider-bank/${id}`,
      detail,
      {
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token || '',
        },
      }
    );
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

// SP Payout API functions
export const fetchPayoutsDetailed = async (page = 1, size = 10): Promise<any> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/payouts/detailed', {
      params: { page, limit: size },
      headers: {
        'admin-auth-token': token || '',
      },
    });

    // Format the response to match our expected structure
    return {
      data: response.data.data.payouts,
      meta: {
        totalItems: response.data.data.pagination.total,
        totalPages: response.data.data.pagination.totalPages,
        currentPage: response.data.data.pagination.page,
        pageSize: response.data.data.pagination.limit,
      },
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch payout details.');
  }
};

// Fetch detailed payout by ID
export const fetchPayoutById = async (id: string): Promise<any> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/payouts/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch payout details.');
  }
};

// Update payout details
export const updatePayout = async (id: string, data: any): Promise<any> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.patch(`/payouts/${id}`, data, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to update payout details.');
  }
};

// Payment Control API functions
export const getPaymentStats = async (): Promise<any> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/payment-control/stats', {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data.stats;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch payment stats.');
  }
};

export const searchPayouts = async (filters: any, page = 1, limit = 50): Promise<any> => {
  try {
    const token = getToken();
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response: AxiosResponse = await apiClient.get(`/payment-control/search?${params}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to search payouts.');
  }
};

export const bulkPaymentAction = async (action: string, paymentIds?: string[], filters?: any): Promise<any> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/payment-control/bulk-action', {
      action,
      payment_ids: paymentIds,
      filters
    }, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Bulk action failed.');
  }
};

export const singlePaymentAction = async (action: string, paymentId: string): Promise<any> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/payment-control/single-action', {
      action,
      payment_id: paymentId
    }, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Payment action failed.');
  }
};

// Export payouts to Excel
// export const exportPayoutsToExcel = async (): Promise<void> => {
//   try {
//     const token = getToken();

//     const response: AxiosResponse = await apiClient.get('/payouts/export', {
//       headers: {
//         'admin-auth-token': token || '',
//       },
//       responseType: 'blob', // Treat the response as a binary file
//     });

//     // Create a URL for the blob
//     const url = window.URL.createObjectURL(new Blob([response.data]));

//     // Create a temporary link element
//     const link = document.createElement('a');
//     link.href = url;

//     // Set the filename from the Content-Disposition header or use a default
//     const contentDisposition = response.headers['content-disposition'];
//     const filename = contentDisposition
//       ? contentDisposition.split('filename=')[1].replace(/"/g, '')
//       : 'payouts-export.xlsx';

//     link.setAttribute('download', filename);

//     // Append to the document, click it, and remove it
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);

//     // Clean up the URL object
//     window.URL.revokeObjectURL(url);
//   } catch (error: any) {
//     throw new Error(error.response?.data?.error || 'Failed to export payouts.');
//   }
// };

// UTR Management API functions
export const fetchUTRs = async (limit = 50, dryRun = false): Promise<any> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/payouts/fetch-utrs', {
      params: { limit, dryRun },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch UTRs.');
  }
};

export const handleFailedTransactions = async (limit = 50, dryRun = false): Promise<any> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/payouts/handle-failed', {
      params: { limit, dryRun },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to handle failed transactions.');
  }
};

export const retryFailedPayout = async (payoutId: string, scheduledDate?: string): Promise<any> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post(`/payouts/${payoutId}/retry`,
      scheduledDate ? { scheduledDate } : {},
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to retry payout.');
  }
};

export const updatePayoutUTR = async (payoutId: string, utrNumber: string): Promise<any> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(`/payouts/${payoutId}/utr`,
      { utr_number: utrNumber },
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to update UTR.');
  }
};

// Payout Transactions API functions
export interface PayoutTransaction {
  id: string;
  sampleid: number; // Decrypted ID for display
  booking_id: number;
  provider_id: string;
  razorpay_transfer_id: string;
  amount: string;
  status: 'Success' | 'Failed';
  response_details: string;
  created_at: string;
  provider?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    linked_account_id?: string;
  };
  bookingItem?: {
    id: number;
    order_id: string;
    rate_card_id: number;
    booking_date: string;
    booking_time_from: string;
    booking_time_to: string;
    status: string;
    rateCard?: {
      id: number;
      name: string;
      price: string;
      category_id: number;
      subcategory_id: number;
      category?: {
        id: number;
        name: string;
      };
      subcategory?: {
        id: number;
        name: string;
      };
    };
  };
}

// Fetch all payout transactions with pagination
export const fetchPayoutTransactions = async (page = 1, size = 10): Promise<any> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/transactions', {
      params: { page, limit: size },
      headers: {
        'admin-auth-token': token || '',
      },
    });

    // Format the response to match our expected structure
    return {
      data: response.data.data.transactions,
      meta: {
        totalItems: response.data.data.pagination.total,
        totalPages: response.data.data.pagination.totalPages,
        currentPage: response.data.data.pagination.page,
        pageSize: response.data.data.pagination.limit,
      },
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch transaction details.');
  }
};

// Fetch detailed transaction by ID
export const fetchTransactionById = async (id: string): Promise<PayoutTransaction> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/transactions/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch transaction details.');
  }
};

// Function to fetch a specific banner by ID
export const getBanner = async (id: string | number): Promise<Banner> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/banner/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data.data; // Assuming banner data is under `data` key
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch banner.');
  }
};

// Add banner
export const createBanner = async (bannerData: Banner) => {
  const formData = new FormData();
  formData.append('title', bannerData.title);
  formData.append('description', bannerData.description);
  formData.append('is_active', bannerData.is_active ? '1' : '0');

  if (bannerData.media_type) {
    formData.append('media_type', bannerData.media_type as 'image' | 'video');
  }

  if (bannerData.display_order !== undefined) {
    formData.append('display_order', bannerData.display_order.toString());
  }

  if (bannerData.deep_link) {
    formData.append('deep_link', bannerData.deep_link);
  }

  if (bannerData.selection_type) {
    formData.append('selection_type', bannerData.selection_type);
  }

  if (bannerData.selection_id) {
    formData.append('selection_id', bannerData.selection_id.toString());
  }

  if (bannerData.latitude !== undefined) {
    formData.append('latitude', bannerData.latitude!.toString());
  }

  if (bannerData.longitude !== undefined) {
    formData.append('longitude', bannerData.longitude!.toString());
  }

  if (bannerData.radius !== undefined) {
    formData.append('radius', bannerData.radius!.toString());
  }

  if (bannerData.start_date) {
    formData.append('start_date', bannerData.start_date);
  }

  if (bannerData.end_date) {
    formData.append('end_date', bannerData.end_date);
  }

  formData.append('is_free', bannerData.is_free ? '1' : '0');
  formData.append('rate_card_id', bannerData.rate_card_id?.toString() || '');

  if (bannerData.add_to_cart !== undefined) {
    formData.append('add_to_cart', bannerData.add_to_cart ? '1' : '0');
  }

  if (bannerData.hub_ids && bannerData.hub_ids.length > 0) {
    formData.append('hub_ids', JSON.stringify(bannerData.hub_ids)); // Send hub_ids as JSON array
  }

  if (bannerData.image) {
    formData.append('media_file', bannerData.image); // The image file
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post(`/banner`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create banner.');
  }
};

// Update a specific banner by ID
export const updateBanner = async (
  id: string | number,
  bannerData: Banner
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('title', bannerData.title);
  formData.append('description', bannerData.description);
  formData.append('is_active', bannerData.is_active ? '1' : '0');
  formData.append('media_type', bannerData.media_type);

  if (bannerData.display_order !== undefined) {
    formData.append('display_order', bannerData.display_order.toString());
  }

  if (bannerData.deep_link) {
    formData.append('deep_link', bannerData.deep_link);
  }

  if (bannerData.selection_type) {
    formData.append('selection_type', bannerData.selection_type);
  }

  if (bannerData.selection_id) {
    formData.append('selection_id', bannerData.selection_id.toString());
  }

  if (bannerData.latitude !== undefined) {
    formData.append('latitude', bannerData.latitude!.toString());
  }

  if (bannerData.longitude !== undefined) {
    formData.append('longitude', bannerData.longitude!.toString());
  }

  if (bannerData.radius !== undefined) {
    formData.append('radius', bannerData.radius!.toString());
  }

  if (bannerData.start_date) {
    formData.append('start_date', bannerData.start_date);
  }

  if (bannerData.end_date) {
    formData.append('end_date', bannerData.end_date);
  }

  formData.append('is_free', bannerData.is_free ? '1' : '0');
  formData.append('rate_card_id', bannerData.rate_card_id?.toString() || '');

  if (bannerData.add_to_cart !== undefined) {
    formData.append('add_to_cart', bannerData.add_to_cart ? '1' : '0');
  }

  if (bannerData.hub_ids && bannerData.hub_ids.length > 0) {
    formData.append('hub_ids', JSON.stringify(bannerData.hub_ids)); // Send hub_ids as JSON array
  }

  if (bannerData.image) {
    formData.append('media_file', bannerData.image);
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/banner/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update banner.');
  }
};

export const fetchBanners = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/banner', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
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
    const response = await apiClient.get('/onboarding', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch onboarding entries.');
  }
};

// Fetch all onboarding entries without pagination
export const fetchAllOnboardings = async (): Promise<Onboarding[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/onboarding/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch onboarding entries.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch onboarding entries.');
  }
};

// Fetch a single onboarding entry by ID
export const fetchOnboardingById = async (id: string): Promise<Onboarding> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/onboarding/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch onboarding entry.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch onboarding entry.');
  }
};

// Create a new onboarding entry
export const createOnboarding = async (onboarding: Onboarding): Promise<ApiResponse> => {
  const formData = new FormData();

  formData.append('title', onboarding.title);
  formData.append('description', onboarding.description);

  if (onboarding.image) {
    formData.append('image', onboarding.image);
  }
  if (onboarding.type) {
    formData.append('type', onboarding.type);
  }
  // Add the active status field
  formData.append('is_active', onboarding.is_active ? '1' : '0');

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/onboarding', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create onboarding entry.');
  }
};

// Update an existing onboarding entry
export const updateOnboarding = async (
  id: string,
  onboarding: Onboarding
): Promise<ApiResponse> => {
  const formData = new FormData();

  formData.append('title', onboarding.title);
  formData.append('description', onboarding.description);

  if (onboarding.image) {
    formData.append('image', onboarding.image);
  }
  if (onboarding.type) {
    formData.append('type', onboarding.type);
  }
  // Add the active status field
  formData.append('is_active', onboarding.is_active ? '1' : '0');

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(
      `/onboarding/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'admin-auth-token': token || '',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update onboarding entry.');
  }
};

// Delete an onboarding entry
export const deleteOnboarding = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/onboarding/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete onboarding entry.');
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
    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      `/gst-rate/${id}/restore`,
      {},
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to restore G ST rate.');
  }
};

// Function to fetch delivery addresses by user ID
export const fetchUserAddresses = async (
  userId: string
): Promise<{ id: string; sampleid: number; full_address: string }[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`user/${userId}/addresses`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response?.data?.status && Array.isArray(response.data.data)) {
      return response.data.data.map((address: any) => {
        const { id, sampleid, street_address, city, state, postal_code } = address;
        return {
          id, // Encrypted ID
          sampleid, // Decrypted ID for selection
          full_address:
            `${street_address || ''}, ${city || ''}, ${state || ''}, ${postal_code || ''}`.replace(
              /,\s*$/,
              ''
            ),
        };
      });
    } else {
      throw new Error(response?.data?.message || 'No addresses found for the specified user.');
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error.message || 'Failed to fetch delivery addresses.';
    throw new Error(errorMessage);
  }
};

// Function to create a new address for a user
export const createUserAddress = async (
  address: Address
): Promise<{ id: string; sampleid: number; full_address: string }> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      `/user/${address.user_id}/addresses`,
      {
        street_address: address.street_address,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country || 'India',
        is_default: address.is_default || false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token || '',
        },
      }
    );

    if (response?.data?.status && response.data.data) {
      const newAddress = response.data.data;
      return {
        id: newAddress.id, // Encrypted ID
        sampleid: newAddress.sampleid, // Decrypted ID for selection
        full_address:
          `${newAddress.street_address || ''}, ${newAddress.city || ''}, ${newAddress.state || ''}, ${newAddress.postal_code || ''}`.replace(
            /,\s*$/,
            ''
          ),
      };
    } else {
      throw new Error(response?.data?.message || 'Failed to create address.');
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error.message || 'Failed to create address.';
    throw new Error(errorMessage);
  }
};

export const createBooking = async (booking: Booking): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/booking', booking, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create booking.');
  }
};

export const fetchBookings = async (
  page = 1,
  size = 10,
  filters: {
    status?: string;
    search?: string;
    pincode?: string;
    bookingDate?: string;
    serviceDate?: string;
    today?: boolean;
    tomorrow?: boolean;
    yesterday?: boolean;
    initiated?: boolean;
    past?: boolean;
  } = {}
) => {
  try {
    const token = getToken(); // Retrieve the token

    const params: Record<string, any> = {
      page,
      size,
    };

    // Add filters if provided
    if (filters.status && filters.status !== 'all') {
      params.status = filters.status;
    }

    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }

    if (filters.pincode?.trim()) {
      params.pincode = filters.pincode.trim();
    }

    if (filters.bookingDate?.trim()) {
      params.bookingDate = filters.bookingDate.trim();
    }

    if (filters.serviceDate?.trim()) {
      params.serviceDate = filters.serviceDate.trim();
    }

    if (filters.today) {
      params.today = true;
    }
    if (filters.tomorrow) {
      params.tomorrow = true;
    }

    if (filters.yesterday) {
      params.yesterday = true;
    }

    if (filters.initiated) {
      params.initiated = true;
    }

    if (filters.past) {
      params.past = true;
    }

    const response: AxiosResponse = await apiClient.get('/booking', {
      params,
      headers: {
        'admin-auth-token': token || '',
      },
    });

    // Transform response to match expected structure
    return {
      data: response.data.data || [],
      meta: {
        totalPages: response.data.totalPages || 0,
        totalItems: response.data.totalItems || 0,
        currentPage: response.data.currentPage || 1,
        pageSize: response.data.pageSize || size,
      },
    };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw new Error('Failed to fetch bookings');
  }
};

export const fetchBookingById = async (id: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/booking/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch booking.');
  }
};
export const updateBooking = async (id: string, booking: Booking): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/booking/${id}`, booking, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update booking.');
  }
};
export const deleteBooking = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/booking/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete booking.');
  }
};

// Add Promocode API
export const createPromocode = async (promocode: Promocode): Promise<ApiResponse> => {
  const formData = new FormData();

  formData.append('code', promocode.code);
  if (promocode.description) formData.append('description', promocode.description);
  formData.append('discount_type', promocode.discount_type);
  formData.append('discount_value', promocode.discount_value.toString());
  const minOrderValue =
    promocode.min_order_value !== null && promocode.min_order_value !== undefined
      ? promocode.min_order_value
      : null;

  // In your insert logic
  formData.append('min_order_value', minOrderValue ? minOrderValue.toString() : '0.0');
  formData.append('start_date', promocode.start_date);
  formData.append('end_date', promocode.end_date);
  formData.append('status', promocode.status);
  formData.append('selection_type', promocode.selection_type);
  formData.append('selection_id', promocode.selection_id?.toString() || '');
  formData.append('is_global', promocode.is_global ? '1' : '0');
  formData.append('display_to_customer', promocode.display_to_customer ? '1' : '0');
  formData.append('is_active', promocode.is_active ? '1' : '0');
  formData.append('provider_id', promocode.provider_id);
  formData.append('is_free', promocode.is_free ? '1' : '0');
  formData.append('rate_card_id', promocode.rate_card_id?.toString() || '');

  // Add image if provided
  if (promocode.image) {
    formData.append('image', promocode.image);
  }
  if (promocode.category_ids) {
    promocode.category_ids.forEach((categoryId) => formData.append('category_ids[]', categoryId));
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/promocode', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create promocode.');
  }
};

// Fetch a single promocode by ID
export const fetchPromocodeById = async (id: string): Promise<Promocode> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/promocode/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch promocode.');
  }
};

// Update an existing promocode
export const updatePromocode = async (id: string, promocode: Promocode): Promise<ApiResponse> => {
  const formData = new FormData();

  formData.append('code', promocode.code);
  if (promocode.description) formData.append('description', promocode.description);
  formData.append('discount_type', promocode.discount_type);
  formData.append('discount_value', promocode.discount_value.toString());
  const minOrderValue =
    promocode.min_order_value !== null && promocode.min_order_value !== undefined
      ? promocode.min_order_value
      : null;

  // In your insert logic
  formData.append('min_order_value', minOrderValue ? minOrderValue.toString() : '0.0');
  formData.append('start_date', promocode.start_date);
  formData.append('end_date', promocode.end_date);
  formData.append('status', promocode.status);
  formData.append('selection_type', promocode.selection_type);
  formData.append('selection_id', promocode.selection_id?.toString() || '');
  formData.append('is_global', promocode.is_global ? '1' : '0');
  formData.append('display_to_customer', promocode.display_to_customer ? '1' : '0');
  formData.append('is_active', promocode.is_active ? '1' : '0');
  formData.append('provider_id', promocode.provider_id);
  formData.append('is_free', promocode.is_free ? '1' : '0');
  formData.append('rate_card_id', promocode.rate_card_id?.toString() || '');

  // Add image if provided
  if (promocode.image) {
    formData.append('image', promocode.image);
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/promocode/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update promocode.');
  }
};

export const fetchPromocodes = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/promocode', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

// Delete a promocode
export const deletePromocode = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/promocode/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete promocode.');
  }
};

// Restore a soft-deleted promocode
export const restorePromocode = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      `/promocode/${id}/restore`,
      {},
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to restore promocode.');
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
      'admin-auth-token': token || '',
    },
  });
  return response.data.data;
};

// Update a blog
export const updateBlog = async (id: number, blog: Blog): Promise<ApiResponse> => {
  const formData = new FormData();

  // Append fields
  formData.append('title', blog.title);
  formData.append('slug', blog.slug);
  formData.append('description', blog.description);
  formData.append('is_active', blog.is_active ? '1' : '0');

  if (blog.image) {
    formData.append('image', blog.image);
  }

  const token = getToken();
  const response: AxiosResponse<ApiResponse> = await apiClient.put(`/blog/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'admin-auth-token': token || '',
    },
  });

  return response.data;
};

export const createNotification = async (notification: Notification) => {
  const formData = new FormData();

  formData.append('title', notification.title);
  formData.append('message', notification.message);
  formData.append('type', notification.type);
  if (notification.redirect_screen)
    formData.append('redirect_screen', notification.redirect_screen);
  if (notification.category_id) formData.append('category_id', notification.category_id.toString());
  if (notification.subcategory_id)
    formData.append('subcategory_id', notification.subcategory_id.toString());
  if (notification.inner_image) formData.append('inner_image', notification.inner_image);
  if (notification.outer_image) formData.append('outer_image', notification.outer_image);
  formData.append('is_active', notification.is_active ? '1' : '0');
  formData.append('send_to_all', notification.send_to_all ? '1' : '0');
  if (notification.recipients)
    formData.append('recipients', JSON.stringify(notification.recipients));
  if (notification.notification_type_id)
    formData.append('notification_type_id', notification.notification_type_id.toString());

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
    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      '/wallet-offer',
      walletOffer,
      {
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create wallet offer.');
  }
};

// Update an existing wallet offer
export const updateWalletOffer = async (
  id: number,
  walletOffer: WalletOffer
): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(
      `/wallet-offer/${id}`,
      walletOffer,
      {
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token || '',
        },
      }
    );
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
    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      `/wallet-offer/${id}/restore`,
      {},
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to restore wallet offer.');
  }
};

// Fetch options for a specific filter attribute
export const fetchFilterOptionsByAttributeId = async (
  attributeId: string
): Promise<AttributeOption[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(
      `/filter/attribute-options/${attributeId}`,
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );

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
export const updatePermission = async (
  id: string,
  permission: Permission
): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(
      `/permission/${id}`,
      permission,
      {
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token || '',
        },
      }
    );

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

// ✅ ENHANCED: Admin creation interface
export interface CreateAdminRequest {
  full_name?: string;
  fname?: string;
  lname?: string;
  username?: string;
  email: string;
  mobile?: string;
  password: string;
  role_id: string;
  active?: number;
}

export interface AdminUser {
  id: string;
  full_name: string;
  fname?: string;
  lname?: string;
  username: string;
  email: string;
  mobile?: string;
  role_id: string;
  active: number;
  created?: string;
  role?: {
    id: string;
    role_name: string;
  };
}

// Create Admin API
export const createAdmin = async (adminData: CreateAdminRequest): Promise<ApiResponse> => {
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

export const fetchAdmins = async (page = 1, size = 10, status: string = 'all', search?: string) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/admin', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
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
  } catch (error: any) { }
};

// ============= B2B API FUNCTIONS =============

// B2B Customers
export const fetchB2BCustomers = async (page = 1, limit = 10, status = 'all', search = '') => {
  try {
    const token = getToken();
    const params: Record<string, any> = { page, limit };

    if (status !== 'all') params.status = status;
    if (search.trim()) params.search = search.trim();

    const response: AxiosResponse = await apiClient.get('/b2b/customers', {
      headers: { 'admin-auth-token': token || '' },
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching B2B customers:', error);
    throw new Error('Failed to fetch B2B customers.');
  }
};

export const createB2BCustomer = async (customerData: any) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/b2b/customers', customerData, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create B2B customer.');
  }
};

export const fetchB2BCustomerById = async (id: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/b2b/customers/${id}`, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch B2B customer.');
  }
};

export const updateB2BCustomer = async (id: string, customerData: any) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(`/b2b/customers/${id}`, customerData, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update B2B customer.');
  }
};

export const deleteB2BCustomer = async (id: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.delete(`/b2b/customers/${id}`, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete B2B customer.');
  }
};

// ✅ NEW: Get all B2B customers for dropdown selection (no pagination)
export const getAllB2BCustomers = async () => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/b2b/customers', {
      headers: { 'admin-auth-token': token || '' },
      params: {
        page: 1,
        limit: 1000, // Get a large number to include all customers
        status: 'active' // Only active customers
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all B2B customers:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch B2B customers.');
  }
};

// B2B Orders
export const fetchB2BOrders = async (
  page = 1,
  limit = 10,
  status = 'all',
  paymentStatus = 'all',
  search = '',
  dateFilter = 'all',
  dateFrom = '',
  dateTo = '',
  receivedDateFrom = '', // NEW: Separate filter for booking received date
  receivedDateTo = ''    // NEW: Separate filter for booking received date
) => {
  try {
    const token = getToken();
    const params: Record<string, any> = { page, limit };

    if (status !== 'all') params.status = status;
    if (paymentStatus !== 'all') params.payment_status = paymentStatus;
    if (search.trim()) params.search = search.trim();

    // Support both old dateFilter and new date range (SERVICE DATE)
    if (dateFilter !== 'all') {
      params.date_filter = dateFilter;
    } else {
      // Use custom date range if provided (SERVICE DATE)
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
    }

    // NEW: Separate filter for BOOKING RECEIVED DATE
    if (receivedDateFrom) params.received_date_from = receivedDateFrom;
    if (receivedDateTo) params.received_date_to = receivedDateTo;

    const response: AxiosResponse = await apiClient.get('/b2b/orders', {
      headers: { 'admin-auth-token': token || '' },
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching B2B orders:', error);
    throw new Error('Failed to fetch B2B orders.');
  }
};

export const createB2BOrder = async (orderData: any) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/b2b/orders', orderData, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create B2B order.');
  }
};

export const fetchB2BOrderById = async (id: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/b2b/orders/${id}`, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch B2B order.');
  }
};

export const updateB2BOrderEditableFields = async (id: string, fieldsData: any) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(`/b2b/orders/${id}/editable-fields`, fieldsData, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update editable fields.');
  }
};

// ✅ NEW: Update B2B order status and payment status
export const updateB2BOrderStatus = async (id: string, statusData: { status?: string; payment_status?: string; notes?: string }) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.patch(`/b2b/orders/${id}/status`, statusData, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update B2B order status.');
  }
};

export const fetchEditableFieldsTemplate = async (clientType = 'mobile_stores') => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/b2b/editable-fields/template', {
      headers: { 'admin-auth-token': token || '' },
      params: { client_type: clientType },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch editable fields template.');
  }
};

export const generateB2BInvoice = async (orderId: string, invoiceItems: any[] = []) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post(`/b2b/orders/${orderId}/invoice`,
      { invoice_items: invoiceItems },
      {
        headers: { 'admin-auth-token': token || '' },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to generate invoice.');
  }
};

export const downloadB2BInvoice = async (invoiceId: string) => {
  try {
    const token = getToken();

    console.log('🔽 Starting download for invoice:', invoiceId);

    // ✅ OPTIMIZED: Use authenticated request (no query token needed)
    const response: AxiosResponse = await apiClient.get(`/b2b/invoices/${invoiceId}/download`, {
      headers: { 'admin-auth-token': token || '' },
      responseType: 'blob', // Handle both PDF and HTML responses
      timeout: 30000
    });

    console.log('📄 Response received:', {
      status: response.status,
      contentType: response.headers['content-type'],
      dataSize: response.data?.size || 'unknown'
    });

    // Check if it's a PDF or HTML response
    const contentType = response.headers['content-type'];

    if (contentType?.includes('application/pdf')) {
      // ✅ PDF Response: Download directly
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('✅ PDF downloaded successfully');
    } else if (contentType?.includes('text/html')) {
      // ✅ HTML Response: Open in new tab
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      console.log('✅ HTML invoice opened in new tab');
    } else {
      // ✅ Redirect Response: Open URL directly
      const downloadUrl = `/admin-api/b2b/invoices/${invoiceId}/download`;
      window.open(downloadUrl, '_blank');
      console.log('✅ Redirect download initiated');
    }

    return { success: true, message: 'Download initiated' };
  } catch (error: any) {
    console.error('❌ Download error:', error);
    throw new Error(error.response?.data?.message || 'Failed to download invoice.');
  }
};

// ✅ Simplified invoice generation and download (PDF)
export const downloadB2BInvoiceSimple = async (orderId: string) => {
  try {
    const token = getToken();

    console.log('📄 Starting invoice download for order:', orderId);

    // ✅ Try to download PDF directly
    const response: AxiosResponse = await apiClient.get(`/b2b/orders/${orderId}/invoice/simple`, {
      headers: { 'admin-auth-token': token || '' },
      responseType: 'blob', // ✅ For PDF download
      timeout: 30000, // 30 second timeout
    });

    console.log('📄 Response received:', {
      status: response.status,
      contentType: response.headers['content-type'],
      dataSize: response.data?.size || 'unknown'
    });

    // ✅ Check if response is actually a PDF
    const contentType = response.headers['content-type'];

    if (contentType && contentType.includes('application/pdf')) {
      // ✅ Handle PDF response
      const blob = new Blob([response.data], { type: 'application/pdf' });

      console.log('📄 PDF blob created, size:', blob.size);

      // ✅ Check if blob is actually a PDF (not empty)
      if (blob.size === 0) {
        throw new Error('Generated PDF is empty');
      }

      // ✅ Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-B2B-${orderId}-${Date.now()}.pdf`;

      // ✅ Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // ✅ Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      console.log('✅ PDF download triggered successfully');
      return { success: true, message: 'Invoice PDF downloaded successfully' };

    } else if (contentType && contentType.includes('application/json')) {
      // ✅ Handle JSON error response
      const text = await response.data.text();
      const jsonData = JSON.parse(text);

      console.log('📄 JSON response received:', jsonData);

      if (jsonData.success === false && jsonData.data) {
        // ✅ Show invoice data in alert if PDF generation failed
        alert(`PDF Generation Failed!\n\nInvoice Data:\nNumber: ${jsonData.data.invoice_number}\nCustomer: ${jsonData.data.customer}\nService: ${jsonData.data.service}\nSubtotal: ₹${jsonData.data.subtotal}\nGST: ₹${jsonData.data.gst_amount}\nTotal: ₹${jsonData.data.total_amount}\n\nError: ${jsonData.error}`);
        return { success: true, message: 'Invoice data displayed (PDF generation failed)' };
      }

      throw new Error(jsonData.message || 'Unexpected JSON response');
    } else {
      throw new Error(`Unexpected content type: ${contentType}`);
    }

  } catch (error: any) {
    console.error('❌ Invoice download error:', error);

    // ✅ Handle different types of errors
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;

      if (status === 404) {
        alert('Invoice Error: Booking not found');
      } else if (status === 500) {
        alert('Invoice Error: Server error occurred while generating PDF');
      } else {
        alert(`Invoice Error: ${status} ${statusText}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      alert('Invoice Error: Request timeout - PDF generation took too long');
    } else {
      alert(`Invoice Error: ${error.message}`);
    }

    throw new Error(error.response?.data?.message || error.message || 'Failed to download invoice.');
  }
};

// ✅ NEW: Export B2B Orders with Filters
export const exportB2BOrders = async (filters: {
  date_from?: string;
  date_to?: string;
  status?: string;
  payment_status?: string;
  invoice_status?: string;
  customer_id?: string;
  provider_id?: string;
  category_id?: string;
  spoc_id?: string;
  format?: 'xlsx' | 'csv';
} = {}): Promise<void> => {
  try {
    const token = getToken();
    const params: Record<string, any> = {};

    // Add filters to params
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (filters.status) params.status = filters.status;
    if (filters.payment_status) params.payment_status = filters.payment_status;
    if (filters.invoice_status) params.invoice_status = filters.invoice_status;
    if (filters.customer_id) params.customer_id = filters.customer_id;
    if (filters.provider_id) params.provider_id = filters.provider_id;
    if (filters.category_id) params.category_id = filters.category_id;
    if (filters.spoc_id) params.spoc_id = filters.spoc_id;
    if (filters.format) params.format = filters.format;

    console.log('📊 Exporting B2B orders with filters:', params);

    const response: AxiosResponse = await apiClient.get('/b2b/dashboard/export-orders', {
      headers: { 'admin-auth-token': token || '' },
      params,
      responseType: 'blob', // Important for file download
    });

    // Determine file extension from format or content-type
    const format = filters.format || 'xlsx';
    const extension = format === 'csv' ? 'csv' : 'xlsx';

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const filename = `B2B_Orders_Export_${timestamp}.${extension}`;

    // Create blob and download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('✅ B2B orders exported successfully:', filename);
  } catch (error: any) {
    console.error('❌ Error exporting B2B orders:', error);
    throw new Error(error.response?.data?.message || 'Failed to export B2B orders');
  }
};

// B2B Invoices
export const fetchB2BInvoices = async (page = 1, limit = 10, paymentStatus = 'all', dateFrom = '', dateTo = '', search = '') => {
  try {
    const token = getToken();
    const params: Record<string, any> = { page, limit };

    if (paymentStatus !== 'all') params.payment_status = paymentStatus;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (search.trim()) params.search = search.trim();

    const response: AxiosResponse = await apiClient.get('/b2b/invoices', {
      headers: { 'admin-auth-token': token || '' },
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching B2B invoices:', error);
    throw new Error('Failed to fetch B2B invoices.');
  }
};

export const fetchB2BInvoiceById = async (id: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/b2b/invoices/${id}`, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch B2B invoice.');
  }
};

// ✅ PAYMENT REMINDER API FUNCTIONS
export const sendManualPaymentReminder = async (invoiceId: string, reminderData: { reminder_type?: string; custom_message?: string }) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post(`/b2b/invoices/${invoiceId}/send-reminder`, reminderData, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to send payment reminder.');
  }
};

export const sendBulkPaymentReminders = async (reminderData: { invoice_ids: string[]; reminder_type?: string; custom_message?: string }) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/b2b/invoices/bulk-reminders', reminderData, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to send bulk payment reminders.');
  }
};

export const fetchPaymentReminderHistory = async (page = 1, limit = 20, invoiceId?: string) => {
  try {
    const token = getToken();
    const params: Record<string, any> = { page, limit };
    if (invoiceId) params.invoice_id = invoiceId;

    const response: AxiosResponse = await apiClient.get('/b2b/invoices/reminder-history', {
      headers: { 'admin-auth-token': token || '' },
      params,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch payment reminder history.');
  }
};

export const fetchOverdueInvoices = async (page = 1, limit = 20) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/b2b/invoices/overdue', {
      headers: { 'admin-auth-token': token || '' },
      params: {
        page,
        limit,
        _t: Date.now() // Cache-busting parameter
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch overdue invoices.');
  }
};

export const updateInvoicePaymentStatus = async (invoiceId: string, paymentData: { payment_status: string; payment_date?: string; payment_amount?: number; payment_notes?: string }) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(`/b2b/invoices/${invoiceId}/payment-status`, paymentData, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update payment status.');
  }
};

// ✅ NEW: Status Options API Types
export interface StatusOption {
  value: string;
  label: string;
  color: string;
}

export interface StatusOptionsResponse {
  success: boolean;
  data: {
    status_options: StatusOption[];
    payment_status_options: StatusOption[];
    invoice_status_options: StatusOption[];
  };
}

export interface ProviderSearchResult {
  id: string;
  value: string;
  label: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  location: string;
  is_verified: boolean;
  is_active: boolean;
  profile_image?: string;
}

export interface ProviderSearchResponse {
  success: boolean;
  message: string;
  data: {
    providers: ProviderSearchResult[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      per_page: number;
      has_next: boolean;
      has_prev: boolean;
    };
    search_query: string;
  };
}

// ✅ NEW: Get B2B Status Options
export const fetchB2BStatusOptions = async (): Promise<StatusOptionsResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/b2b/status-options', {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch status options.');
  }
};

// ✅ NEW: Bulk update B2B order status
export const bulkUpdateB2BOrderStatus = async (data: {
  order_ids: string[];
  status?: string;
  payment_status?: string;
  notes?: string;
}): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/b2b/orders/bulk-update-status', data, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to bulk update order status.');
  }
};

// ✅ NEW: Update B2B Order Remarks (CRM/OPS)
export const updateB2BOrderRemarks = async (
  orderId: string,
  data: {
    crm_remarks?: string;
    ops_remarks?: string;
  }
): Promise<{
  success: boolean;
  message: string;
  data?: {
    id: string;
    crm_remarks: string;
    ops_remarks: string;
  };
}> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.patch(`/b2b/orders/${orderId}/remarks`, data, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update order remarks.');
  }
};

// ✅ NEW: Search Providers for Assignment
export const searchProvidersForAssignment = async (
  search: string = '',
  page: number = 1,
  limit: number = 20
): Promise<ProviderSearchResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/b2b/providers/search', {
      headers: { 'admin-auth-token': token || '' },
      params: { search, page, limit },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to search providers.');
  }
};

// ✅ CHECKLIST MANAGEMENT API FUNCTIONS

// Checklist interfaces
export interface ChecklistQuestion {
  id: string;
  question_id: string;
  question_text: string;
  question_type: string;
  answer: 'yes' | 'no' | 'na' | 'pending';
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface ChecklistCategory {
  category_id: string;
  category_name: string;
  questions: ChecklistQuestion[];
}

export interface ChecklistProvider {
  id: string;
  company_name: string;
  phone: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface ChecklistStats {
  totalQuestions: number;
  answeredQuestions: number;
  pendingQuestions: number;
  completionPercentage: number;
  isCompleted: boolean;
  categoriesCount: number;
}

export interface ChecklistItem {
  id: string;
  checklist_type: string;
  created_at: string;
  updated_at: string;
  provider: ChecklistProvider;
  stats: ChecklistStats;
}

export interface ChecklistQuestionDetail {
  id: string;
  answer: 'yes' | 'no' | 'na' | 'pending';
  remarks?: string;
  created_at: string;
  updated_at: string;
  question: {
    id: string;
    question_text: string;
    type: string;
    category: {
      id: string;
      name: string;
    };
  };
}

export interface ChecklistDetail {
  id: string;
  checklist_type: string;
  created_at: string;
  updated_at: string;
  provider: ChecklistProvider;
  checklistQuestions: ChecklistQuestionDetail[];
  categories?: Record<string, ChecklistCategory>;
  stats: ChecklistStats;
}

export interface Question {
  id: string;
  question_text: string;
  type: 'pre' | 'post' | 'both';
  category: {
    id: string;
    name: string;
  };
}

export interface ChecklistAnalytics {
  totalChecklists: number;
  completedChecklists: number;
  pendingChecklists: number;
  totalQuestions: number;
  averageCompletionRate: number;
  providerStats: {
    totalProviders: number;
    activeProviders: number;
    completedProviders: number;
  };
}

// Helper function to get admin token
const getAdminToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Fetch all checklists with pagination and filtering
export const fetchChecklists = async (
  page: number = 1,
  limit: number = 10,
  checklist_type?: string,
  user_id?: string,
  status?: string
): Promise<{ checklists: ChecklistItem[]; totalPages: number; totalChecklists: number }> => {
  try {
    const token = getAdminToken();
    const params: Record<string, any> = { page, limit };

    if (checklist_type) params.checklist_type = checklist_type;
    if (user_id) params.user_id = user_id;
    if (status) params.status = status;

    const response: AxiosResponse<ApiResponse> = await apiClient.get('/checklist', {
      params,
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return {
        checklists: response.data.data.checklists || response.data.data,
        totalPages: response.data.data.pagination?.total_pages || Math.ceil((response.data.data.total || 0) / limit),
        totalChecklists: response.data.data.pagination?.total || response.data.data.total || 0,
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch checklists');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch checklists');
  }
};

// Fetch checklist by ID
export const fetchChecklistById = async (id: string): Promise<ChecklistDetail> => {
  try {
    const token = getAdminToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/checklist/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch checklist');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch checklist');
  }
};

// Create checklist
export const createChecklist = async (data: {
  checklist_type: string;
  user_ids: string[];
  questions_id: string[];
}): Promise<ApiResponse> => {
  try {
    const token = getAdminToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/checklist', data, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create checklist');
  }
};

// Fetch all questions with pagination and filtering
export const fetchQuestions = async (
  page: number = 1,
  limit: number = 10,
  category_id?: string,
  type?: string,
  search?: string
): Promise<{ questions: Question[]; totalPages: number; totalQuestions: number }> => {
  try {
    const token = getAdminToken();
    const params: Record<string, any> = { page, limit };

    if (category_id) params.category_id = category_id;
    if (type) params.type = type;
    if (search) params.search = search;

    const response: AxiosResponse<ApiResponse> = await apiClient.get('/checklist/questions', {
      params,
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return {
        questions: response.data.data.questions || response.data.data,
        totalPages: response.data.data.pagination?.total_pages || Math.ceil((response.data.data.total || 0) / limit),
        totalQuestions: response.data.data.pagination?.total || response.data.data.total || 0,
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch questions');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch questions');
  }
};

// Create question
export const createQuestion = async (data: {
  question_text: string;
  category_id: string;
  type: 'pre' | 'post' | 'both';
}): Promise<ApiResponse> => {
  try {
    const token = getAdminToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/checklist/questions', data, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create question');
  }
};

// Fetch single question by ID
export const fetchQuestionById = async (id: string): Promise<Question> => {
  try {
    const token = getAdminToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/checklist/questions/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch question');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch question');
  }
};

// Update question
export const updateQuestion = async (id: string, data: {
  question_text: string;
  category_id: string;
  type: 'pre' | 'post' | 'both';
}): Promise<ApiResponse> => {
  try {
    const token = getAdminToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/checklist/questions/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update question');
  }
};

// Delete question
export const deleteQuestion = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getAdminToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/checklist/questions/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete question');
  }
};

// Fetch checklist analytics
export const fetchChecklistAnalytics = async (): Promise<ChecklistAnalytics> => {
  try {
    const token = getAdminToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/checklist/analytics', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch analytics');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
  }
};

// Fetch Categories for Checklist Questions
export const fetchChecklistCategories = async () => {
  try {
    const token = getAdminToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/checklist/categories', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch categories');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch categories');
  }
};

// ✅ ADVANCED PROVIDER SEARCH & ASSIGNMENT API FUNCTIONS
export const getAdvancedProviderSearch = async (filters: {
  category_id?: string;
  subcategory_id?: string;
  city_id?: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  min_rating?: number;
  max_rating?: number;
  service_date?: string;
  service_time?: string;
  max_daily_bookings?: number;
  exclude_overloaded?: boolean;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/b2b/providers/advanced-search', {
      headers: { 'admin-auth-token': token || '' },
      params: filters,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to perform advanced provider search.');
  }
};

export const bulkAssignProviders = async (assignments: Array<{
  order_id: string;
  provider_id: string;
  assignment_notes?: string;
}>) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/b2b/orders/bulk-assign-providers',
      { assignments },
      {
        headers: { 'admin-auth-token': token || '' },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to bulk assign providers.');
  }
};

// ✅ B2B Service Address Management
export const fetchB2BServiceAddresses = async (customerId: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/b2b/customers/${customerId}/addresses`, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch service addresses.');
  }
};

export const createB2BServiceAddress = async (customerId: string, addressData: any) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post(`/b2b/customers/${customerId}/addresses`, addressData, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create service address.');
  }
};

// ✅ Rate Card Integration for B2B
export const fetchRateCardsForB2B = async (categoryId?: string, subcategoryId?: string, segmentId?: string) => {
  try {
    const token = getToken();
    const params: Record<string, any> = {};
    if (categoryId) params.category_id = categoryId;
    if (subcategoryId) params.subcategory_id = subcategoryId;
    if (segmentId) params.segment_id = segmentId;

    const response: AxiosResponse = await apiClient.get('/b2b/rate-cards', {
      headers: { 'admin-auth-token': token || '' },
      params,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch rate cards.');
  }
};

// ✅ Provider Integration for B2B
export const fetchProvidersForB2B = async (categoryId?: string, subcategoryId?: string, pincode?: string, serviceDate?: string) => {
  try {
    const token = getToken();
    const params: Record<string, any> = {};
    if (categoryId) params.category_id = categoryId;
    if (subcategoryId) params.subcategory_id = subcategoryId;
    if (pincode) params.pincode = pincode;
    if (serviceDate) params.service_date = serviceDate;

    const response: AxiosResponse = await apiClient.get('/b2b/providers', {
      headers: { 'admin-auth-token': token || '' },
      params,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch providers.');
  }
};

// ✅ Price Calculation for B2B (uses same API as admin booking)
export const calculateServicePriceForB2B = async (params: {
  category_id?: string;
  subcategory_id?: string;
  provider_id?: string;
  segment_id?: string;
  filter_attribute_id?: string;
  filter_option_id?: string;
  quantity?: number;
}) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/booking/calculate-price', params, {
      headers: { 'admin-auth-token': token || '' },
    });

    if (response.data.status) {
      return {
        success: true,
        data: {
          base_price: response.data.basePrice,
          final_price: response.data.finalAmount,
          rate_card: {
            id: response.data.rateCardId,
            price: response.data.basePrice,
            service_name: 'Service', // This would come from rate card details
            base_price: response.data.basePrice,
            final_price: response.data.finalAmount
          },
          breakdown: response.data.breakdown
        }
      };
    } else {
      throw new Error(response.data.message || 'Failed to calculate price');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to calculate service price');
  }
};

// ✅ ========================================
// ✅ B2B CLIENT SCENARIO PRICING API - NEW
// ✅ ========================================

// ✅ NEW: Client Scenario-Based Pricing Calculation for B2B
console.log('🔍 API: calculateB2BPricing function is being defined');
export const calculateB2BPricing = async (params: {
  client_scenario: string;
  service_area_sqft?: number;
  service_type?: string;
  store_name?: string;
  store_code?: string;
  quantity?: number;
  custom_fields?: object;
  custom_price?: number;
}) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/b2b/pricing/calculate', params, {
      headers: { 'admin-auth-token': token || '' },
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        available_scenarios: response.data.available_scenarios
      };
    } else {
      throw new Error(response.data.message || 'Failed to calculate pricing');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to calculate B2B pricing');
  }
};

// ✅ NEW: Get Pricing Rules for B2B Scenarios
export const getB2BPricingRules = async (scenario?: string) => {
  try {
    const token = getToken();
    const endpoint = scenario ? `/b2b/pricing/rules/${scenario}` : '/b2b/pricing/rules';
    const response: AxiosResponse = await apiClient.get(endpoint, {
      headers: { 'admin-auth-token': token || '' },
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      throw new Error(response.data.message || 'Failed to get pricing rules');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get B2B pricing rules');
  }
};

// ✅ ========================================
// ✅ B2B QUOTATION MANAGEMENT API - NEW
// ✅ ========================================

// B2B Quotation interfaces
export interface B2BQuotationItem {
  service: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface B2BQuotation {
  id?: string;
  quotation_number?: string;
  b2b_booking_id?: string | null; // ✅ UPDATED: Optional for standalone quotations
  b2b_customer_id: string; // ✅ NEW: Required for all quotations
  service_name: string; // ✅ NEW: Service name for standalone quotations
  service_description?: string; // ✅ NEW: Service description for standalone quotations
  quotation_type: 'booking_linked' | 'standalone'; // ✅ NEW: Quotation type
  initial_amount: number;
  negotiated_amount?: number;
  final_amount?: number;
  gst_amount?: number;
  total_amount?: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'negotiating' | 'expired';
  version?: number;
  quotation_items?: B2BQuotationItem[];
  terms_and_conditions?: string;
  validity_days?: number;

  // ✅ NEW: Relationship fields for customer information
  booking?: {
    customer?: {
      id: string;
      company_name: string;
      contact_person: string;
      email: string;
      phone: string;
      address?: string;
    };
  };
  customer?: {
    id: string;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    address?: string;
  };
  valid_until?: string;
  sp_notes?: string;
  admin_notes?: string;
  client_notes?: string;
  rejection_reason?: string;
  sent_at?: string;
  sent_via?: 'whatsapp' | 'email' | 'both' | 'manual';
  viewed_at?: string;
  responded_at?: string;
  approved_by?: string;
  approved_at?: string;
  pdf_file_path?: string;
  attachments?: any[];
  created_at?: string;
  created_by_type?: string;
  created_by_provider?: {
    id: string,
    first_name: string,
    last_name: string,
    phone: number,
    email: string
  }
  created_by_admin?: {
    id: string,
    full_name: string,
    username: string,
    email: string
  }
  updated_at?: string;
  // ✅ NEW: Helper properties
  is_standalone?: boolean;
  admin_approval_status?: string;
}

// ✅ NEW: Customer selection for standalone quotations
export interface B2BCustomerOption {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  display_name: string;
  // ✅ ENHANCED: Payment terms for customer-level management
  credit_days?: number;
  payment_terms?: string;
  payment_method_preference?: 'bank_transfer' | 'cheque' | 'online' | 'cash' | 'any';
  late_payment_fee_percentage?: number;
  credit_limit?: number;
}

// ✅ NEW: Quotation creation request
export interface CreateQuotationRequest {
  // For booking-linked quotations
  b2b_booking_id?: string;
  orderId?: string;

  // For standalone quotations
  b2b_customer_id?: string;
  service_name?: string;
  service_description?: string;

  // Common fields
  initial_amount: number;
  quotation_items?: B2BQuotationItem[];
  terms_and_conditions?: string;
  validity_days?: number;
  sp_notes?: string;
  admin_notes?: string;
}

// ✅ B2B Additional Cost Interface
export interface B2BAdditionalCost {
  id?: string;
  b2b_booking_id?: string | null;
  b2b_quotation_id?: string | null;
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  added_by?: string;
  approved_by?: string | null;
  added_at?: string;
  approved_at?: string | null;
  is_active?: number;
  addedBy?: {
    id: string;
    full_name?: string;
    username?: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    full_name?: string;
    username?: string;
    email: string;
  };
}

// Create new quotation
export const createB2BQuotation = async (quotationData: Partial<B2BQuotation>) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/b2b/quotations', quotationData, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create quotation.');
  }
};

// Create quotation for specific order
export const createB2BQuotationForOrder = async (orderId: string, quotationData: Partial<B2BQuotation>) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post(`/b2b/orders/${orderId}/quotations`, quotationData, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create quotation for order.');
  }
};

// Get all quotations with filtering
export const fetchB2BQuotations = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  b2b_booking_id?: string;
  search?: string;
  sort_by?: string;
  created_by_type?: string;
  admin_approval_status?: string;
  sort_order?: 'ASC' | 'DESC';
} = {}) => {
  try {
    const token = getToken();
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      sort_by: params.sort_by || 'created_at',
      sort_order: params.sort_order || 'DESC',
      ...params
    };

    const response: AxiosResponse = await apiClient.get('/b2b/quotations', {
      headers: { 'admin-auth-token': token || '' },
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching B2B quotations:', error);
    throw new Error('Failed to fetch quotations.');
  }
};

// Get quotations for specific order
export const fetchB2BQuotationsForOrder = async (orderId: string, params: {
  page?: number;
  limit?: number;
  status?: string;
} = {}) => {
  try {
    const token = getToken();
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      ...params
    };

    const response: AxiosResponse = await apiClient.get(`/b2b/orders/${orderId}/quotations`, {
      headers: { 'admin-auth-token': token || '' },
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching quotations for order:', error);
    throw new Error('Failed to fetch quotations for order.');
  }
};

// Get quotation by ID
export const fetchB2BQuotationById = async (id: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/b2b/quotations/${id}`, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch quotation.');
  }
};

// Update quotation
export const updateB2BQuotation = async (id: string, quotationData: Partial<B2BQuotation>) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(`/b2b/quotations/${id}`, quotationData, {
      headers: { 'admin-auth-token': token || '' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update quotation.');
  }
};

// Send quotation to client
export const sendB2BQuotation = async (id: string, sendVia: 'whatsapp' | 'email' | 'both' = 'both') => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post(`/b2b/quotations/${id}/send`,
      { send_via: sendVia },
      {
        headers: { 'admin-auth-token': token || '' },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to send quotation.');
  }
};

// Approve quotation
export const approveB2BQuotation = async (id: string, adminNotes?: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post(`/b2b/quotations/${id}/approve`,
      { admin_notes: adminNotes },
      {
        headers: { 'admin-auth-token': token || '' },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to approve quotation.');
  }
};


// Approve SP quotation (provider-created quotation)
export const approveSpQuotation = async (id: string, approval_notes?: string, send_to_client?: boolean) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post(`/b2b/sp-quotations/${id}/approve`,
      {
        approval_notes: approval_notes,
        send_to_client: send_to_client || false
      },
      {
        headers: { 'admin-auth-token': token || '' },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to approve SP quotation.');
  }
};

// Reject SP quotation (provider-created quotation)
export const rejectSpQuotation = async (id: string, rejectionReason: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post(`/b2b/sp-quotations/${id}/reject`,
      {
        rejection_reason: rejectionReason
      },
      {
        headers: { 'admin-auth-token': token || '' },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to reject SP quotation.');
  }
};

// Reject quotation (admin-created quotation)
export const rejectB2BQuotation = async (id: string, rejectionReason: string, adminNotes?: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post(`/b2b/quotations/${id}/reject`,
      {
        rejection_reason: rejectionReason,
        admin_notes: adminNotes
      },
      {
        headers: { 'admin-auth-token': token || '' },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to reject quotation.');
  }
};

// Generate/Download quotation PDF
export const downloadB2BQuotationPDF = async (id: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/b2b/quotations/${id}/pdf`, {
      headers: { 'admin-auth-token': token || '' },
      responseType: 'blob', // For PDF download
    });

    // Create blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Quotation-${id}-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'PDF downloaded successfully' };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to download quotation PDF.');
  }
};

// ✅ B2B EXCEL UPLOAD FUNCTIONS

// Download B2B Excel template with mode support
export const downloadB2BExcelTemplate = async (format: 'xlsx' | 'csv' = 'xlsx', mode: 'create_customers' | 'customer_id' = 'create_customers'): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/b2b/orders/excel-template-enhanced', {
      headers: { 'admin-auth-token': token || '' },
      params: { format, mode },
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const templateName = mode === 'customer_id' ? 'B2B_Orders_CustomerID_Template' : 'B2B_Orders_Template';
    link.download = `${templateName}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('Error downloading B2B Excel template:', error);
    throw new Error(error.response?.data?.message || 'Failed to download template');
  }
};

// Preview B2B Excel upload
export const previewB2BExcelUpload = async (file: File): Promise<any> => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('excel_file', file);

    const response: AxiosResponse = await apiClient.post('/b2b/orders/excel-preview', formData, {
      headers: {
        'admin-auth-token': token || '',
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error previewing B2B Excel upload:', error);
    throw new Error(error.response?.data?.message || 'Failed to preview file');
  }
};

// Import B2B Excel data
export const importB2BExcelData = async (file: File, options: {
  skip_invalid?: boolean;
  create_customers?: boolean;
  import_mode?: 'create_customers' | 'customer_id';
} = {}): Promise<any> => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('excel_file', file);
    formData.append('skip_invalid', (options.skip_invalid ?? true).toString());
    formData.append('create_customers', (options.create_customers ?? true).toString());
    formData.append('import_mode', options.import_mode || 'create_customers');

    const response: AxiosResponse = await apiClient.post('/b2b/orders/excel-import-enhanced', formData, {
      headers: {
        'admin-auth-token': token || '',
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error importing B2B Excel data:', error);
    throw new Error(error.response?.data?.message || 'Failed to import data');
  }
};

// ========================================
// B2B Additional Costs API Functions
// ========================================

/**
 * Fetch additional costs for a B2B order
 */
export const fetchAdditionalCostsForOrder = async (orderId: string) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get(`/b2b/orders/${orderId}/additional-costs`, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching additional costs for order:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch additional costs');
  }
};

/**
 * Fetch additional costs for a B2B quotation
 */
export const fetchAdditionalCostsForQuotation = async (quotationId: string) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get(`/b2b/quotations/${quotationId}/additional-costs`, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching additional costs for quotation:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch additional costs');
  }
};

/**
 * Add additional cost to a B2B order
 */
export const addAdditionalCostToOrder = async (orderId: string, costData: Partial<B2BAdditionalCost>) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.post(`/b2b/orders/${orderId}/additional-costs`, costData, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error adding additional cost to order:', error);
    throw new Error(error.response?.data?.message || 'Failed to add additional cost');
  }
};

/**
 * Add additional cost to a B2B quotation
 */
export const addAdditionalCostToQuotation = async (quotationId: string, costData: Partial<B2BAdditionalCost>) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.post(`/b2b/quotations/${quotationId}/additional-costs`, costData, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error adding additional cost to quotation:', error);
    throw new Error(error.response?.data?.message || 'Failed to add additional cost');
  }
};

/**
 * Update an additional cost
 */
export const updateAdditionalCost = async (costId: string, costData: Partial<B2BAdditionalCost>) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.put(`/b2b/additional-costs/${costId}`, costData, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating additional cost:', error);
    throw new Error(error.response?.data?.message || 'Failed to update additional cost');
  }
};

/**
 * Delete an additional cost
 */
export const deleteAdditionalCost = async (costId: string) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.delete(`/b2b/additional-costs/${costId}`, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error deleting additional cost:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete additional cost');
  }
};

export const generateUniqueFilename = (prefix: string, extension: string): string => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-T:.Z]/g, ''); // Format as YYYYMMDDHHMMSS

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
    const token = getToken();

    const response: AxiosResponse = await apiClient.get('/cart/export', {
      headers: {
        'admin-auth-token': token || '',
      },
      params: { startDate, endDate },
      responseType: 'blob',
      validateStatus: (status) => true, // Accept all status codes so we can handle them manually
    });

    if (response.status === 200) {
      const uniqueFilename = generateUniqueFilename('live_cart', 'xlsx');

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', uniqueFilename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } else if (response.status === 404) {
      throw new Error('No live cart data found for the selected date range.');
    } else {
      throw new Error('Failed to export live cart. Please try again later.');
    }
  } catch (error: any) {
    console.error('Error exporting live cart:', error);
    throw new Error(error.message || 'Unexpected error occurred while exporting.');
  }
};

export const exportUsers = async (
  startDate: string,
  endDate: string,
  pincode: string
): Promise<void> => {
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
export const fetchAllStaff = async (
  providerId: string,
  page = 1,
  size = 10,
  status: string = 'all'
) => {
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
    const response: AxiosResponse<{ message: string }> = await apiClient.post(
      '/rate-card/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'admin-auth-token': token || '',
        },
      }
    );

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

export const importSubcatgeory = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken();
    const response: AxiosResponse<{ message: string }> = await apiClient.post(
      '/sub-category/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'admin-auth-token': token || '',
        },
      }
    );

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

export const downloadCategorySampleCSV = async (): Promise<void> => {
  try {
    const token = getToken(); // Retrieve the admin-auth-token

    const response: AxiosResponse = await apiClient.get('/category/sample', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob', // Treat the response as a binary file
    });

    // Generate a unique filename for the sample file
    const uniqueFilename = generateUniqueFilename('rate_card_sample', 'csv');

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
    const uniqueFilename = generateUniqueFilename('ratecrad_sample', 'csv');

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

export const downloadSampleSucategoryCSV = async (): Promise<void> => {
  try {
    const token = getToken(); // Retrieve the admin-auth-token

    const response: AxiosResponse = await apiClient.get('/sub-category/sample', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob', // Treat the response as a binary file
    });

    // Generate a unique filename for the sample file
    const uniqueFilename = generateUniqueFilename('subcategory_sample', 'csv');

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
    const response: AxiosResponse<{ message: string }> = await apiClient.post(
      '/rate-card/update',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'admin-auth-token': token || '',
        },
      }
    );

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

export const fetchAllCountries = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/countries', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
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

    const response: AxiosResponse<{ message: string }> = await apiClient.post(
      '/countries/import/csv',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'admin-auth-token': token || '',
        },
      }
    );

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

export const fetchAllStates = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/states', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
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

    const response: AxiosResponse<{ message: string }> = await apiClient.post(
      '/states/import/csv',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'admin-auth-token': token || '',
        },
      }
    );

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

export const fetchAllCities = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/cities', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

// Fetch all cities without pagination
export const fetchAllCitiesWithoutPagination = async (): Promise<City[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/cities/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch cities.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch cities.');
  }
};

// Fetch a specific city by ID
export const fetchCityById = async (id: string): Promise<City> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/cities/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch city.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch city.');
  }
};

// Create a new city
export const createCity = async (city: City): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/cities', city, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create city.');
  }
};

// Update an existing city
export const updateCity = async (id: string, city: City): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/cities/${id}`, city, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update city.');
  }
};

// Delete (soft-delete) a city by ID
export const deleteCity = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/cities/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete city.');
  }
};

// Export cities to an Excel file
export const exportCitiesToXLS = async (): Promise<void> => {
  try {
    const token = getToken();

    const response: AxiosResponse = await apiClient.get('/cities/export/xls', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob',
    });

    const uniqueFilename = generateUniqueFilename('cities', 'xlsx');

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting cities:', error);
    throw new Error('Failed to export cities');
  }
};

// Import cities from a CSV file
export const importCitiesFromCSV = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken();

    const response: AxiosResponse<{ message: string }> = await apiClient.post(
      '/cities/import/csv',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'admin-auth-token': token || '',
        },
      }
    );

    if (response.status === 200) {
      console.log(response.data.message || 'Cities imported successfully.');
    } else {
      throw new Error(response.data.message || 'Failed to import cities.');
    }
  } catch (error: any) {
    console.error('Error importing cities:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to import cities.');
  }
};

// Download sample CSV for cities
export const downloadSampleCityExcel = async (): Promise<void> => {
  try {
    const token = getToken();

    const response: AxiosResponse = await apiClient.get('/cities/sample/excel', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob',
    });

    const uniqueFilename = generateUniqueFilename('cities_sample', 'csv');

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

export const fetchAllHubs = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/hubs', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

// Fetch all cities without pagination
export const fetchAllHubsWithoutPagination = async (): Promise<Hub[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/hubs/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch hubs.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch hubs.');
  }
};

// Create a new hub
export const createHub = async (hub: Hub): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/hubs', hub, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create hub.');
  }
};

// Fetch a specific city by ID
export const fetchHubById = async (id: string): Promise<Hub> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/hubs/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch hub.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch hub.');
  }
};
// Update an existing hub
export const updateHub = async (id: string, hub: Hub): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/hubs/${id}`, hub, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update hub.');
  }
};

// Delete (soft-delete) a hub by ID
export const deleteHub = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/hubs/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete hub.');
  }
};

// Export hubs to an Excel file
export const exportHubsToXLS = async (): Promise<void> => {
  try {
    const token = getToken();

    const response: AxiosResponse = await apiClient.get('/hubs/export/xls', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob',
    });

    const uniqueFilename = generateUniqueFilename('hubs', 'xlsx');

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting hubs:', error);
    throw new Error('Failed to export hubs');
  }
};

// Import hubs from a CSV file
export const importHubsFromCSV = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken();

    const response: AxiosResponse<{ message: string }> = await apiClient.post(
      '/hubs/import/csv',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'admin-auth-token': token || '',
        },
      }
    );

    if (response.status === 200) {
      console.log(response.data.message || 'Hubs imported successfully.');
    } else {
      throw new Error(response.data.message || 'Failed to import hubs.');
    }
  } catch (error: any) {
    console.error('Error importing hubs:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to import hubs.');
  }
};

// Download sample CSV for hubs
export const downloadSampleHubExcel = async (): Promise<void> => {
  try {
    const token = getToken();

    const response: AxiosResponse = await apiClient.get('/hubs/sample/excel', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob',
    });

    const uniqueFilename = generateUniqueFilename('hubs_sample', 'csv');

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

export const fetchAllHubPincodes = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/hub-pincodes', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

// Fetch all hub pincodes without pagination
export const fetchAllHubPincodesWithoutPagination = async (): Promise<HubPincode[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/hub-pincodes/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch hub pincodes.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch hub pincodes.');
  }
};

// Fetch a specific hub pincode by ID
export const fetchHubPincodeById = async (id: string): Promise<HubPincode> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/hub-pincodes/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch hub pincode.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch hub pincode.');
  }
};

// Create a new hub pincode
export const createHubPincode = async (hubPincode: HubPincode): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/hub-pincodes', hubPincode, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (!response.data.status) {
      throw new Error(response.data.message || 'Failed to create hub pincode.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create hub pincode.');
  }
};

// Update an existing hub pincode
export const updateHubPincode = async (id: string, hubPincode: HubPincode): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(`/hub-pincodes/${id}`, hubPincode, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (!response.data.status) {
      throw new Error(response.data.message || 'Failed to update hub pincode.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update hub pincode.');
  }
};

// Delete a hub pincode by ID
export const deleteHubPincode = async (id: string): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.delete(`/hub-pincodes/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (!response.data.status) {
      throw new Error(response.data.message || 'Failed to delete hub pincode.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete hub pincode.');
  }
};

// Export hub pincodes to an Excel file
export const exportHubPincodesToXLS = async (): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/hub-pincodes/export/xls', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob',
    });

    const uniqueFilename = generateUniqueFilename('hub_pincodes', 'xlsx');

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uniqueFilename);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting hub pincodes:', error);
    throw new Error('Failed to export hub pincodes');
  }
};

// Import hub pincodes from a CSV file
export const importHubPincodesFromCSV = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken();

    const response: AxiosResponse = await apiClient.post('/hub-pincodes/import/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });

    if (!response.data.status) {
      throw new Error(response.data.message || 'Failed to import hub pincodes.');
    }
  } catch (error: any) {
    console.error('Error importing hub pincodes:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to import hub pincodes.');
  }
};

// Download sample CSV for hub pincodes
export const downloadSampleHubPincodeExcel = async (): Promise<void> => {
  try {
    const token = getToken();

    const response: AxiosResponse = await apiClient.get('/hub-pincodes/sample/excel', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob',
    });

    const uniqueFilename = generateUniqueFilename('hub_pincodes_sample', 'csv');

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

export const fetchAllSpHubs = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/sp-hubs', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    // Transform response to match expected structure
    return {
      data: response.data.data || [],
      meta: {
        totalPages: response.data.meta?.totalPages || 0,
        totalItems: response.data.meta?.totalItems || 0,
        currentPage: response.data.meta?.currentPage || 1,
        pageSize: response.data.meta?.pageSize || size,
      },
    };
  } catch (error) {
    console.error('Error fetching SP Hubs:', error);
    throw new Error('Failed to fetch SP Hubs');
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

    const uniqueFilename = generateUniqueFilename('sp_hubs_sample', 'xlsx');

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

export const getNotifications = async (page = 1, size = 10) => {
  try {
    const token = getToken(); // Retrieve the token
    const params: Record<string, any> = {
      page,
      size,
    };
    const response: AxiosResponse = await apiClient.get('/notification-type', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });
    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

// Fetch All Notifications
// export const getAllNotifications = async (): Promise<ApiResponse> => {
//   try {
//     const token = getToken();
//     const response: AxiosResponse<ApiResponse> = await apiClient.get('/notification-type', {
//       headers: {
//         'admin-auth-token': token || '',
//       },
//     });
//     return response.data.data;
//   } catch (error: any) {
//     throw new Error(error.response?.data?.message || 'Failed to fetch notifications.');
//   }
// };

// Function to fetch categories with attributes
export const getAllNotifications = async (): Promise<NotificationType[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/notification-type/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch notification.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notification.');
  }
};
// Fetch Notification by ID
export const getNotificationById = async (id: string): Promise<NotificationType> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/notification-type/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notification details.');
  }
};

// Create a NotificationType
export const createNotificationType = async (
  notification: NotificationType
): Promise<ApiResponse> => {
  const formData = new FormData();

  // Basic Notification Details
  formData.append('title', notification.title);
  formData.append('message', notification.message);
  formData.append('type', notification.type);
  formData.append('action_type', notification.action_type);
  formData.append('is_active', notification.isActive ? '1' : '0');

  if (notification.action_data) {
    formData.append('action_data', notification.action_data);
  }

  // Timer Duration
  if (notification.timer_duration !== null && notification.timer_duration !== undefined) {
    formData.append('timer_duration', notification.timer_duration.toString());
  }

  // Image
  if (notification.image_url instanceof File) {
    formData.append('image', notification.image_url);
  }

  // Sound
  if (notification.sound_url instanceof File) {
    formData.append('sound', notification.sound_url);
  }

  // Append carousel images
  if (notification.carousel_data && notification.carousel_data.length > 0) {
    notification.carousel_data.forEach((image) => {
      if (image instanceof File) {
        formData.append(`carouselImages`, image);
      } else if (typeof image === 'object' && 'image_url' in image) {
        console.log(`Skipping existing image URL: ${image.image_url}`);
      }
    });
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      '/notification-type',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create notification.');
  }
};

// Update a NotificationType
export const updateNotificationType = async (
  id: string,
  notification: NotificationType
): Promise<ApiResponse> => {
  const formData = new FormData();

  // Basic Notification Details
  formData.append('title', notification.title);
  formData.append('message', notification.message);
  formData.append('type', notification.type);
  formData.append('action_type', notification.action_type);
  formData.append('is_active', notification.isActive ? '1' : '0');

  if (notification.action_data) {
    formData.append('action_data', notification.action_data);
  }

  // Timer Duration
  if (notification.timer_duration !== null && notification.timer_duration !== undefined) {
    formData.append('timer_duration', notification.timer_duration.toString());
  }

  // Image
  if (notification.image_url instanceof File) {
    formData.append('image', notification.image_url);
  }

  // Sound
  if (notification.sound_url instanceof File) {
    formData.append('sound', notification.sound_url);
  }

  // Append carousel images
  if (notification.carousel_data && notification.carousel_data.length > 0) {
    notification.carousel_data.forEach((image) => {
      if (image instanceof File) {
        formData.append(`carouselImages`, image);
      } else if (typeof image === 'object' && 'image_url' in image) {
        console.log(`Skipping existing image URL: ${image.image_url}`);
      }
    });
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(
      `/notification-type/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update notification.');
  }
};

// Delete a NotificationType
export const deleteNotificationType = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(
      `/notification-type/${id}`,
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete notification.');
  }
};

export const updateBookingStatus = async (id: string, status: string): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(
      `/booking/${id}/status`,
      { status },
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );

    if (!response.data.status) {
      throw new Error(response.data.message || 'Failed to update status.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update status.');
  }
};

export const updateBookingProvider = async (id: string, provider_id: string): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(
      `/booking/${id}/provider`,
      { provider_id },
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );

    if (!response.data.status) {
      throw new Error(response.data.message || 'Failed to update provider.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update provider.');
  }
};

export const initiateRefund = async (id: string): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post(
      `/booking/${id}/refund`,
      {},
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );

    if (!response.data.status) {
      throw new Error(response.data.message || 'Failed to initiate refund.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to initiate refund.');
  }
};

export const createServiceDetail = async (serviceDetail: ServiceDetail): Promise<ApiResponse> => {
  const payload = {
    category_id: serviceDetail.category_id,
    subcategory_id: serviceDetail.subcategory_id ?? '',
    segment_id: serviceDetail.segment_id ?? '',
    filter_attributes: serviceDetail.serviceAttributes.map((attr) => ({
      attribute_id: attr.attribute_id,
      option_id: attr.option_id,
    })),
    serviceDescription: serviceDetail.serviceDescriptions!.map((desc) => ({
      name: desc.name,
      description: desc.description,
    })), // Include service descriptions
    active: serviceDetail.active ?? 0,
  };

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/service-detail', payload, {
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

export const fetchServiceDetails = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/service-detail', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

// export const fetchAllRatecard = async (): Promise<RateCard[]> => {
//   try {
//     const token = getToken();
//     const response: AxiosResponse<ApiResponse> = await apiClient.get('/rate-card/all', {
//       headers: {
//         'admin-auth-token': token || '',
//       },
//     });

//     if (response.data.status) {
//       return response.data.data;
//     } else {
//       throw new Error(response.data.message || 'Failed to fetch categories.');
//     }
//   } catch (error: any) {
//     throw new Error(error.response?.data?.message || 'Failed to fetch categories.');
//   }
// };

// Function to fetch a specific rate card by ID
export const fetchServiceDetailById = async (id: string): Promise<ServiceDetail> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/service-detail/${id}`, {
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

export const updateServiceDetail = async (
  id: string,
  serviceDetail: ServiceDetail
): Promise<ApiResponse> => {
  // Build the JSON payload
  const payload = {
    category_id: serviceDetail.category_id,
    subcategory_id: serviceDetail.subcategory_id ?? '',
    segment_id: serviceDetail.segment_id ?? '',
    filter_attributes: serviceDetail.serviceAttributes.map((attr) => ({
      attribute_id: attr.attribute_id,
      option_id: attr.option_id,
    })),
    serviceDescription: serviceDetail.serviceDescriptions!.map((desc) => ({
      name: desc.name,
      description: desc.description,
    })), // Include service descriptions
    active: serviceDetail.active ?? 0,
  };

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(
      `/service-detail/${id}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update rate card.');
  }
};

// // Function to delete a rate card
export const deleteServiceDetail = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/service-detail/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete rate card.');
  }
};

// Function to create a new donation
export const createDonation = async (donation: Donation): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const formData = new FormData();

    formData.append('name', donation.name);
    if (donation.description) formData.append('description', donation.description);
    if (donation.logo_image) formData.append('logo_image', donation.logo_image);
    if (donation.image) formData.append('image', donation.image);
    if (donation.bank_id) formData.append('bank_id', donation.bank_id);
    formData.append('account_no', donation.account_no);
    formData.append('ifsc_code', donation.ifsc_code);
    if (donation.bank_name) formData.append('bank_name', donation.bank_name);
    if (donation.branch_name) formData.append('branch_name', donation.branch_name);
    formData.append('is_active', donation.is_active.toString());

    const response: AxiosResponse<ApiResponse> = await apiClient.post('/donation', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create donation.');
  }
};

// Function to fetch all donations with pagination
export const fetchDonations = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response = await apiClient.get('/donation', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch donations.');
  }
};

// Function to fetch a specific donation by ID
export const fetchDonationById = async (id: string): Promise<Donation> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/donation/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch donation.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch donation.');
  }
};

// Function to update an existing donation
export const updateDonation = async (id: string, donation: Donation): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const formData = new FormData();

    formData.append('name', donation.name);
    if (donation.description) formData.append('description', donation.description);
    if (donation.logo_image) formData.append('logo_image', donation.logo_image);
    if (donation.image) formData.append('image', donation.image);
    if (donation.bank_id) formData.append('bank_id', donation.bank_id);
    formData.append('account_no', donation.account_no);
    formData.append('ifsc_code', donation.ifsc_code);
    if (donation.bank_name) formData.append('bank_name', donation.bank_name);
    if (donation.branch_name) formData.append('branch_name', donation.branch_name);
    formData.append('is_active', donation.is_active.toString());

    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/donation/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update donation.');
  }
};

export const fetchServiceSegmentsAll = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/service-segment', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

// Fetch all service segments without pagination
export const fetchAllServiceSegments = async () => {
  try {
    const token = getToken();
    const response = await apiClient.get('/service-segment/all', {
      // Correct route
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch all service segments.');
  }
};

// Fetch a single service segment by ID
export const fetchServiceSegmentById = async (id: string): Promise<ServiceSegment> => {
  try {
    const token = getToken();
    const response: AxiosResponse<{ status: boolean; data: ServiceSegment }> = await apiClient.get(
      `/service-segment/${id}`,
      {
        // Correct route
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch service segment.');
  }
};

// Create a new service segment
export const createServiceSegment = async (serviceSegment: ServiceSegment) => {
  try {
    const token = getToken();
    const response = await apiClient.post('/service-segment', serviceSegment, {
      // Correct route
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create service segment.');
  }
};

// Update an existing service segment
export const updateServiceSegment = async (id: string, serviceSegment: ServiceSegment) => {
  try {
    const token = getToken();
    const response = await apiClient.put(`/service-segment/${id}`, serviceSegment, {
      // Correct route
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update service segment.');
  }
};

// Delete a service segment
export const deleteServiceSegment = async (id: string) => {
  try {
    const token = getToken();
    const response = await apiClient.delete(`/service-segment/${id}`, {
      // Correct route
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete service segment.');
  }
};

export const fetchServiceVideosAll = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/service-video', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

// Fetch all service videos (without pagination)
export const fetchAllServiceVideos = async (): Promise<any> => {
  try {
    const token = getToken();
    const response = await apiClient.get('/service-video/all', {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch all service videos.');
  }
};

// Fetch a single service video by ID
export const fetchServiceVideoById = async (id: string): Promise<ServiceVideo> => {
  try {
    const token = getToken();
    const response: AxiosResponse<{ status: boolean; data: ServiceVideo }> = await apiClient.get(
      `/service-video/${id}`,
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch service video.');
  }
};

// Create a new service video (handles video and image upload)
export const createServiceVideo = async (
  serviceVideo: Omit<ServiceVideo, 'video_url'>,
  videoFile: File | null
): Promise<any> => {
  try {
    const token = getToken();
    const formData = new FormData();

    // Append other service video data
    for (const key in serviceVideo) {
      if (serviceVideo.hasOwnProperty(key)) {
        formData.append(
          key,
          serviceVideo[key as keyof Omit<ServiceVideo, 'video_url' | 'image_url'>] as string
        );
      }
    }

    if (videoFile) {
      formData.append('video_file', videoFile);
    }

    const response = await apiClient.post('/service-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create service video.');
  }
};

// Update an existing service video (handles video and image upload)
export const updateServiceVideo = async (
  id: string,
  serviceVideo: Omit<ServiceVideo, 'video_url'>,
  videoFile: File | null
): Promise<any> => {
  try {
    const token = getToken();
    const formData = new FormData();

    // Append other service video data
    for (const key in serviceVideo) {
      if (serviceVideo.hasOwnProperty(key)) {
        formData.append(
          key,
          serviceVideo[key as keyof Omit<ServiceVideo, 'video_url' | 'image_url'>] as string
        );
      }
    }

    if (videoFile) {
      formData.append('video_file', videoFile);
    }

    const response = await apiClient.put(`/service-video/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update service video.');
  }
};

// Delete a service video
export const deleteServiceVideo = async (id: string): Promise<any> => {
  try {
    const token = getToken();
    const response = await apiClient.delete(`/service-video/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete service video.');
  }
};

// **Create a new Ratecard BOGO**
export const createRatecardBogo = async (ratecardBogo: RatecardBogo): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      '/ratecard-bogo',
      ratecardBogo,
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error creating Ratecard BOGO:', error);
    throw new Error(error.response?.data?.message || 'Failed to create Ratecard BOGO.');
  }
};

// **Fetch all Ratecard BOGO entries (with pagination)**
export const fetchRatecardBogo = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response = await apiClient.get('/ratecard-bogo', {
      params: { page, size },
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch Ratecard BOGO.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch Ratecard BOGO.');
  }
};

// **Fetch a single Ratecard BOGO by ID**
export const getRatecardBogoById = async (id: string): Promise<RatecardBogo> => {
  const token = getToken();
  const response: AxiosResponse<ApiResponse> = await apiClient.get(`/ratecard-bogo/${id}`, {
    headers: {
      'admin-auth-token': token || '',
    },
  });

  return response.data.data;
};

// **Update a Ratecard BOGO**
export const updateRatecardBogo = async (
  id: string,
  ratecardBogo: RatecardBogo
): Promise<ApiResponse> => {
  const token = getToken();
  const response: AxiosResponse<ApiResponse> = await apiClient.put(
    `/ratecard-bogo/${id}`,
    ratecardBogo,
    {
      headers: {
        'admin-auth-token': token || '',
      },
    }
  );

  return response.data;
};

// **Delete a Ratecard BOGO by ID**
export const deleteRatecardBogo = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/ratecard-bogo/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to delete Ratecard BOGO.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete Ratecard BOGO.');
  }
};

export const deleteCampaign = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/campaign/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to delete Ratecard BOGO.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete Ratecard BOGO.');
  }
};

export const fetchCampaign = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/campaign', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

// **API Call for Creating a Campaign**
export const createCampaign = async (campaign: Campaign): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/campaign', campaign, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    throw new Error(error.response?.data?.message || 'Failed to create campaign.');
  }
};

export const createPackageDetail = async (packageDetail: PackageDetail) => {
  try {
    const token = getToken();
    const formData = new FormData();

    formData.append('package_id', packageDetail.package_id);

    packageDetail.details.forEach((detail, index) => {
      formData.append(`details[${index}][position]`, detail.position);
      formData.append(`details[${index}][title]`, detail.title);
      if (detail.image) {
        formData.append(`details[${index}][image]`, detail.image);
      }
    });

    const response = await apiClient.post('/package-details', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create campaign.');
  }
};

export const exportBookings = async (startDate: string, endDate: string): Promise<void> => {
  try {
    const token = getToken(); // Retrieve the admin-auth-token

    const response: AxiosResponse = await apiClient.get('/booking/export', {
      headers: {
        'admin-auth-token': token || '',
      },
      params: { startDate, endDate }, // Pass start and end date as query params
      responseType: 'blob', // Treat the response as a binary file
    });

    // Generate a unique filename
    const uniqueFilename = generateUniqueFilename('booking', 'xlsx');

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

// SP Payout API functions
// export const fetchPayoutsDetailed = async (page = 1, size = 10): Promise<any> => {
//   try {
//     const token = getToken();
//     const response: AxiosResponse = await apiClient.get('/payouts/detailed', {
//       params: { page, limit: size },
//       headers: {
//         'admin-auth-token': token || '',
//       },
//     });

//     // Format the response to match our expected structure
//     return {
//       data: response.data.data.payouts,
//       meta: {
//         totalItems: response.data.data.pagination.total,
//         totalPages: response.data.data.pagination.totalPages,
//         currentPage: response.data.data.pagination.page,
//         pageSize: response.data.data.pagination.limit
//       }
//     };
//   } catch (error: any) {
//     throw new Error(error.response?.data?.error || 'Failed to fetch payout details.');
//   }
// };

// // Fetch detailed payout by ID
// export const fetchPayoutById = async (id: string): Promise<any> => {
//   try {
//     const token = getToken();
//     const response: AxiosResponse = await apiClient.get(`/payouts/${id}`, {
//       headers: {
//         'admin-auth-token': token || '',
//       },
//     });

//     return response.data.data;
//   } catch (error: any) {
//     throw new Error(error.response?.data?.error || 'Failed to fetch payout details.');
//   }
// };

// // Update payout details
// export const updatePayout = async (id: string, data: any): Promise<any> => {
//   try {
//     const token = getToken();
//     const response: AxiosResponse = await apiClient.patch(`/payouts/${id}`, data, {
//       headers: {
//         'admin-auth-token': token || '',
//       },
//     });

//     return response.data;
//   } catch (error: any) {
//     throw new Error(error.response?.data?.error || 'Failed to update payout details.');
//   }
// };

// ===== FEEDBACK/BOOKING EXPERIENCE API FUNCTIONS =====

export interface BookingFeedback {
  id: string;
  sampleid: string;
  user_id: string;
  booking_id: string;
  provider_id: string;
  category_id: string;
  subcategory_id: string;
  package_id: string;
  app: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  created_at_formatted: string;
  updated_at_formatted: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
    country_code: string;
  };
  booking?: {
    id: string;
    order_id: string;
    booking_date: string;
    status: string;
    total_amount: number;
  };
  provider?: {
    id: string;
    first_name: string;
    last_name: string;
    mobile: string;
  };
  category?: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
  package?: {
    id: string;
    name: string;
  };
}

export interface BookingFeedbackResponse {
  status: boolean;
  data: BookingFeedback[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  filters: {
    search: string;
    rating: string;
    startDate: string;
    endDate: string;
  };
}

// Fetch all booking feedback with pagination and filters
export const fetchBookingFeedback = async (
  page = 1,
  size = 10,
  filters: {
    search?: string;
    rating?: string;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<BookingFeedbackResponse> => {
  try {
    const token = getToken();

    const params: Record<string, any> = {
      page,
      size,
    };

    // Add filters if provided
    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }

    if (filters.rating && filters.rating !== 'all') {
      params.rating = filters.rating;
    }

    if (filters.startDate?.trim()) {
      params.startDate = filters.startDate.trim();
    }

    if (filters.endDate?.trim()) {
      params.endDate = filters.endDate.trim();
    }

    const response: AxiosResponse<BookingFeedbackResponse> = await apiClient.get('/feedback', {
      params,
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching booking feedback:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch booking feedback');
  }
};

// Fetch a single booking feedback by ID
export const fetchBookingFeedbackById = async (id: string): Promise<BookingFeedback> => {
  try {
    const token = getToken();
    const response: AxiosResponse<{ status: boolean; data: BookingFeedback }> = await apiClient.get(
      `/feedback/${id}`,
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error('Failed to fetch booking feedback.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch booking feedback.');
  }
};

// Delete booking feedback
export const deleteBookingFeedback = async (id: string): Promise<void> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.delete(`/feedback/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (!response.data.status) {
      throw new Error(response.data.message || 'Failed to delete booking feedback.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete booking feedback.');
  }
};

// Export booking feedback to Excel
export const exportBookingFeedback = async (
  startDate?: string,
  endDate?: string
): Promise<void> => {
  try {
    const token = getToken();

    const params: Record<string, any> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response: AxiosResponse = await apiClient.get('/feedback/export', {
      headers: {
        'admin-auth-token': token || '',
      },
      params,
      responseType: 'blob', // Treat the response as a binary file
    });

    // Create a blob URL and trigger download
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `booking_feedback_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to export booking feedback.');
  }
};

// Fetch single course
export const getCourse = async (id: string | number): Promise<Course> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/course/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch course.');
  }
};

export const fetchCourses = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken(); // Retrieve the token

    // Prepare query parameters
    const params: Record<string, any> = {
      page,
      size,
    };

    // Include status filter only if it's not 'all'
    if (status !== 'all') {
      params.status = status;
    }

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    // Make API call
    const response: AxiosResponse = await apiClient.get('/course', {
      params, // Query params (page, size, status)
      headers: {
        'admin-auth-token': token || '', // Add the token to the request headers
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

// SEO Content API Functions

// Create SEO Content
export const createSEOContent = async (seoContent: SEOContent): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const formData = new FormData();

    // Append basic fields
    formData.append('title', seoContent.title);
    formData.append('slug', seoContent.slug);
    formData.append('content', seoContent.content);
    formData.append('is_active', seoContent.is_active ? '1' : '0');

    // Append optional fields
    if (seoContent.meta_title) formData.append('meta_title', seoContent.meta_title);
    if (seoContent.meta_description) formData.append('meta_description', seoContent.meta_description);
    if (seoContent.meta_keywords) formData.append('meta_keywords', seoContent.meta_keywords);
    if (seoContent.category_id) formData.append('category_id', seoContent.category_id);
    if (seoContent.subcategory_id) formData.append('subcategory_id', seoContent.subcategory_id);
    if (seoContent.service_type) formData.append('service_type', seoContent.service_type);
    if (seoContent.content_type) formData.append('content_type', seoContent.content_type);
    if (seoContent.target_audience) formData.append('target_audience', seoContent.target_audience);
    if (seoContent.is_featured !== undefined) formData.append('is_featured', seoContent.is_featured ? '1' : '0');
    if (seoContent.sort_order !== undefined) formData.append('sort_order', seoContent.sort_order.toString());

    // Append featured image if provided
    if (seoContent.featured_image) {
      formData.append('featured_image', seoContent.featured_image);
    }

    // Append FAQ items if provided
    if (seoContent.faq_items && seoContent.faq_items.length > 0) {
      formData.append('faq_items', JSON.stringify(seoContent.faq_items));
    }

    const response: AxiosResponse<ApiResponse> = await apiClient.post('/seo/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create SEO content.');
  }
};

// Fetch SEO Content with pagination and filters
export const fetchSEOContent = async (
  page = 1,
  size = 100,
  service_type?: string,
  content_type?: string,
  is_active?: boolean,
  search?: string
) => {
  try {
    const token = getToken();
    const params: any = { page, size };

    if (service_type && service_type !== 'all') params.service_type = service_type;
    if (content_type && content_type !== 'all') params.content_type = content_type;
    if (is_active !== undefined) params.is_active = is_active;
    if (search && search.trim() !== '') params.search = search.trim();

    const response = await apiClient.get('/seo/content', {
      params,
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch SEO content.');
  }
};

// Fetch SEO Content by ID
export const fetchSEOContentById = async (id: string) => {
  try {
    const token = getToken();
    const response = await apiClient.get(`/seo/content/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch SEO content.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch SEO content.');
  }
};

// Update SEO Content
export const updateSEOContent = async (id: string, seoContent: SEOContent): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const formData = new FormData();

    // Append basic fields
    formData.append('title', seoContent.title);
    formData.append('slug', seoContent.slug);
    formData.append('content', seoContent.content);
    formData.append('is_active', seoContent.is_active ? '1' : '0');

    // Append optional fields
    if (seoContent.meta_title) formData.append('meta_title', seoContent.meta_title);
    if (seoContent.meta_description) formData.append('meta_description', seoContent.meta_description);
    if (seoContent.meta_keywords) formData.append('meta_keywords', seoContent.meta_keywords);
    if (seoContent.category_id) formData.append('category_id', seoContent.category_id);
    if (seoContent.subcategory_id) formData.append('subcategory_id', seoContent.subcategory_id);
    if (seoContent.service_type) formData.append('service_type', seoContent.service_type);
    if (seoContent.content_type) formData.append('content_type', seoContent.content_type);
    if (seoContent.target_audience) formData.append('target_audience', seoContent.target_audience);
    if (seoContent.is_featured !== undefined) formData.append('is_featured', seoContent.is_featured ? '1' : '0');
    if (seoContent.sort_order !== undefined) formData.append('sort_order', seoContent.sort_order.toString());

    // Append featured image if provided
    if (seoContent.featured_image) {
      formData.append('featured_image', seoContent.featured_image);
    }

    // Append FAQ items if provided
    if (seoContent.faq_items && seoContent.faq_items.length > 0) {
      formData.append('faq_items', JSON.stringify(seoContent.faq_items));
    }

    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/seo/content/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update SEO content.');
  }
};

// Delete SEO Content
export const deleteSEOContent = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/seo/content/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete SEO content.');
  }
};

// Create course
export const createCourse = async (courseData: Course) => {
  const formData = new FormData();
  formData.append('title', courseData.title);
  formData.append('description', courseData.description || '');
  formData.append('module_type', courseData.module_type);
  formData.append('length_in_minutes', courseData.length_in_minutes.toString());
  formData.append('category_id', courseData.category_id.toString());
  formData.append('is_active', courseData.is_active ? '1' : '0');

  if (courseData.video_url) {
    formData.append('video_url', courseData.video_url);
  }

  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/course', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create course.');
  }
};

// Update course
export const updateCourse = async (id: string | number, courseData: Course) => {
  const formData = new FormData();
  formData.append('title', courseData.title);
  formData.append('description', courseData.description || '');
  formData.append('module_type', courseData.module_type);
  formData.append('length_in_minutes', courseData.length_in_minutes.toString());
  formData.append('category_id', courseData.category_id.toString());
  formData.append('is_active', courseData.is_active ? '1' : '0');

  if (courseData.video_url) {
    formData.append('video_url', courseData.video_url);
  }

  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(`/course/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update course.');
  }
};

export const fetchCoursesByCategory = async (categoryId: string): Promise<Course[]> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(
      `/course/byCategory?category_id=${categoryId}`,
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch categories.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch Course.');
  }
};

// Delete course
export const deleteCourse = async (id: string | number) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.delete(`/course/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete course.');
  }
};

export const getCourseById = async (id: string | number): Promise<Course> => {
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/course/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data.data; // Assuming banner data is under `data` key
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch Course.');
  }
};

export const createCourseQuiz = async (quizData: CourseQuiz) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/course-quizzes', quizData, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create course quiz.');
  }
};

export const updateCourseQuiz = async (id: string, quizData: CourseQuiz) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(`/course-quizzes/${id}`, quizData, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update course quiz.');
  }
};

export const getCourseQuizById = async (id: string | number): Promise<CourseQuiz> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/course-quizzes/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.response?.data?.message || 'Failed to fetch course quiz.');
  }
};

// Fetch all quizzes with pagination, status filter, and search
export const fetchCourseQuizzes = async (
  page = 1,
  size = 10,
  status: string = 'all',
  search?: string
) => {
  try {
    const token = getToken();
    const params: Record<string, any> = { page, size };

    if (status !== 'all') {
      params.status = status;
    }

    if (search?.trim()) {
      params.search = search.trim();
    }

    const response: AxiosResponse = await apiClient.get('/course-quizzes', {
      params,
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch course quizzes.');
  }
};

export const deleteCourseQuiz = async (id: string | number) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.delete(`/course-quizzes/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete course quiz.');
  }
};

// Fetch single badge
export const getBadge = async (id: string | number): Promise<Badge> => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/badge/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch badge.');
  }
};

// Fetch badges (with pagination, status, search)
export const fetchBadges = async (page = 1, size = 10, status: string = 'all', search?: string) => {
  try {
    const token = getToken();

    const params: Record<string, any> = { page, size };
    if (status !== 'all') params.status = status;
    if (search?.trim()) params.search = search.trim();

    const response: AxiosResponse = await apiClient.get('/badge', {
      params,
      headers: {
        'admin-auth-token': token || '',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching badges:', error);
    throw new Error('Failed to fetch badges.');
  }
};

// Create badge
export const createBadge = async (badgeData: Badge) => {
  const formData = new FormData();
  formData.append('name', badgeData.name);
  formData.append('total_course', badgeData.total_course.toString());
  if (badgeData.next_badge_time !== undefined && badgeData.next_badge_time !== null) {
    formData.append('next_badge_time', badgeData.next_badge_time.toString());
  }
  if (badgeData.image instanceof File) {
    formData.append('image', badgeData.image);
  }
  formData.append('is_active', badgeData.is_active ? '1' : '0');

  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/badge', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create badge.');
  }
};

// Update badge
export const updateBadge = async (id: string | number, badgeData: Badge) => {
  const formData = new FormData();
  formData.append('name', badgeData.name);
  formData.append('total_course', badgeData.total_course.toString());
  if (badgeData.next_badge_time !== undefined && badgeData.next_badge_time !== null) {
    formData.append('next_badge_time', badgeData.next_badge_time.toString());
  }
  if (badgeData.image instanceof File) {
    formData.append('image', badgeData.image);
  }

  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(`/badge/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update badge.');
  }
};

// Delete badge
export const deleteBadge = async (id: string | number) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.delete(`/badge/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete badge.');
  }
};

// ============= WOLOO API FUNCTIONS =============

// Woloo Categories
export const fetchWolooCategories = async (page = 1, size = 50, status = 'all', search = '') => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/woloo/categories', {
      headers: {
        'admin-auth-token': token || '',
      },
      params: { page, size, status, search },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Woloo categories:', error);
    throw new Error('Failed to fetch Woloo categories.');
  }
};

export const createWolooCategory = async (categoryData: WolooCategory) => {
  const formData = new FormData();
  formData.append('name', categoryData.name);
  if (categoryData.service_time) formData.append('service_time', categoryData.service_time);
  if (categoryData.description) formData.append('description', categoryData.description);
  if (categoryData.image instanceof File) formData.append('image', categoryData.image);
  formData.append('active', categoryData.active ? '1' : '0');

  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/woloo/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create Woloo category.');
  }
};

export const updateWolooCategory = async (id: string, categoryData: WolooCategory) => {
  const formData = new FormData();
  formData.append('name', categoryData.name);
  if (categoryData.service_time) formData.append('service_time', categoryData.service_time);
  if (categoryData.description) formData.append('description', categoryData.description);
  if (categoryData.image instanceof File) formData.append('image', categoryData.image);
  formData.append('active', categoryData.active ? '1' : '0');

  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(`/woloo/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update Woloo category.');
  }
};

export const deleteWolooCategory = async (id: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.delete(`/woloo/categories/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete Woloo category.');
  }
};

export const bulkUploadWolooCategories = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post(
      '/woloo/categories/bulk-upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to bulk upload Woloo categories.');
  }
};

// Woloo Subcategories
export const fetchWolooSubcategories = async (
  page = 1,
  size = 50,
  status = 'all',
  search = '',
  categoryId = ''
) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/woloo/subcategories', {
      headers: {
        'admin-auth-token': token || '',
      },
      params: { page, size, status, search, category_id: categoryId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Woloo subcategories:', error);
    throw new Error('Failed to fetch Woloo subcategories.');
  }
};

export const createWolooSubcategory = async (subcategoryData: WolooSubcategory) => {
  const formData = new FormData();
  formData.append('name', subcategoryData.name);
  formData.append('category_id', subcategoryData.category_id);
  if (subcategoryData.service_time) formData.append('service_time', subcategoryData.service_time);
  if (subcategoryData.description) formData.append('description', subcategoryData.description);
  if (subcategoryData.image instanceof File) formData.append('image', subcategoryData.image);
  formData.append('active', subcategoryData.active ? '1' : '0');

  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/woloo/subcategories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create Woloo subcategory.');
  }
};

export const updateWolooSubcategory = async (id: string, subcategoryData: WolooSubcategory) => {
  const formData = new FormData();
  formData.append('name', subcategoryData.name);
  formData.append('category_id', subcategoryData.category_id);
  if (subcategoryData.service_time) formData.append('service_time', subcategoryData.service_time);
  if (subcategoryData.description) formData.append('description', subcategoryData.description);
  if (subcategoryData.image instanceof File) formData.append('image', subcategoryData.image);
  formData.append('active', subcategoryData.active ? '1' : '0');

  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(`/woloo/subcategories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update Woloo subcategory.');
  }
};

export const deleteWolooSubcategory = async (id: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.delete(`/woloo/subcategories/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete Woloo subcategory.');
  }
};

export const bulkUploadWolooSubcategories = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post(
      '/woloo/subcategories/bulk-upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to bulk upload Woloo subcategories.');
  }
};

// Woloo Attributes
export const fetchWolooAttributes = async (page = 1, size = 50, status = 'all', search = '') => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/woloo/attributes', {
      headers: {
        'admin-auth-token': token || '',
      },
      params: { page, size, status, search },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Woloo attributes:', error);
    throw new Error('Failed to fetch Woloo attributes.');
  }
};

export const createWolooAttribute = async (attributeData: WolooAttribute) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/woloo/attributes', attributeData, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create Woloo attribute.');
  }
};

export const fetchWolooAttributeById = async (id: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/woloo/attributes/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch Woloo attribute.');
  }
};

export const updateWolooAttribute = async (id: string, attributeData: WolooAttribute) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(`/woloo/attributes/${id}`, attributeData, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update Woloo attribute.');
  }
};

export const deleteWolooAttribute = async (id: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.delete(`/woloo/attributes/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete Woloo attribute.');
  }
};

// Woloo Attribute Options API functions
export const fetchWolooAttributeOptions = async (attributeId: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(
      `/woloo/attributes/${attributeId}/options`,
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch Woloo attribute options.');
  }
};

export const createWolooAttributeOption = async (
  attributeId: string,
  optionData: WolooAttributeOption
) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post(
      `/woloo/attributes/${attributeId}/options`,
      optionData,
      {
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create Woloo attribute option.');
  }
};

export const updateWolooAttributeOption = async (
  attributeId: string,
  optionId: string,
  optionData: WolooAttributeOption
) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(
      `/woloo/attributes/${attributeId}/options/${optionId}`,
      optionData,
      {
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update Woloo attribute option.');
  }
};

export const deleteWolooAttributeOption = async (attributeId: string, optionId: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.delete(
      `/woloo/attributes/${attributeId}/options/${optionId}`,
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete Woloo attribute option.');
  }
};

// CSV Upload and Export functions for Woloo Attributes
export const downloadWolooAttributeSampleCSV = async () => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/woloo/attributes/sample-csv', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'woloo_attributes_sample.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { status: true, message: 'Sample CSV downloaded successfully' };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to download sample CSV.');
  }
};

export const bulkUploadWolooAttributes = async (file: File) => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse = await apiClient.post(
      '/woloo/attributes/bulk-upload',
      formData,
      {
        headers: {
          'admin-auth-token': token || '',
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to upload attributes CSV.');
  }
};

export const exportWolooAttributes = async (format: 'excel' | 'csv' = 'excel') => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/woloo/attributes/export', {
      headers: {
        'admin-auth-token': token || '',
      },
      params: { format },
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const filename =
      format === 'csv' ? 'woloo_attributes_export.csv' : 'woloo_attributes_export.xlsx';
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { status: true, message: `Attributes exported as ${format.toUpperCase()} successfully` };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to export attributes.');
  }
};

// Get category and subcategory IDs for CSV reference
export const fetchWolooCategorySubcategoryIds = async () => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(
      '/woloo/attributes/category-subcategory-ids',
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch category/subcategory IDs.');
  }
};

// Woloo Rate Cards
export const fetchWolooRateCards = async (
  page = 1,
  size = 50,
  status = 'all',
  search = '',
  categoryId = '',
  subcategoryId = ''
) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/woloo/rate-cards', {
      headers: {
        'admin-auth-token': token || '',
      },
      params: {
        page,
        size,
        status,
        search,
        category_id: categoryId,
        subcategory_id: subcategoryId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Woloo rate cards:', error);
    throw new Error('Failed to fetch Woloo rate cards.');
  }
};

export const createWolooRateCard = async (rateCardData: WolooRateCard) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post('/woloo/rate-cards', rateCardData, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create Woloo rate card.');
  }
};

export const fetchWolooRateCardById = async (id: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/woloo/rate-cards/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch Woloo rate card.');
  }
};

export const updateWolooRateCard = async (id: string, rateCardData: WolooRateCard) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(`/woloo/rate-cards/${id}`, rateCardData, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update Woloo rate card.');
  }
};

export const deleteWolooRateCard = async (id: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.delete(`/woloo/rate-cards/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete Woloo rate card.');
  }
};

export const exportWolooRateCards = async (format: 'excel' | 'csv' = 'excel') => {
  try {
    const token = getToken();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/woloo/rate-cards/export?format=${format}`,
      {
        headers: {
          'admin-auth-token': token || '',
        },
      }
    );

    if (response.ok) {
      return await response.blob();
    } else {
      throw new Error('Export failed');
    }
  } catch (error: any) {
    console.error('Error exporting Woloo rate cards:', error);
    throw error;
  }
};

export const bulkUploadWolooRateCards = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.post(
      '/woloo/rate-cards/bulk-upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to bulk upload Woloo rate cards.');
  }
};

// Woloo Bookings
export const fetchWolooBookings = async (
  page = 1,
  size = 50,
  status = '',
  search = '',
  dateFrom = '',
  dateTo = ''
) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/woloo/bookings', {
      headers: {
        'admin-auth-token': token || '',
      },
      params: { page, size, status, search, date_from: dateFrom, date_to: dateTo },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Woloo bookings:', error);
    throw new Error('Failed to fetch Woloo bookings.');
  }
};

export const fetchWolooBookingById = async (id: string) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get(`/woloo/bookings/${id}`, {
      headers: {
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Woloo booking by ID:', error);
    throw new Error('Failed to fetch Woloo booking details.');
  }
};

export const updateWolooBookingStatus = async (
  id: string,
  statusData: { status: string; reason?: string; notes?: string }
) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(
      `/woloo/bookings/${id}/status`,
      statusData,
      {
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update Woloo booking status.');
  }
};

export const assignWolooBookingProvider = async (
  id: string,
  providerData: { provider_id: string; assignment_notes?: string; notify_provider?: boolean }
) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(
      `/woloo/bookings/${id}/provider`,
      providerData,
      {
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to assign provider to Woloo booking.');
  }
};

export const rescheduleWolooBooking = async (
  id: string,
  rescheduleData: {
    booking_date: string;
    start_service_time: string;
    end_service_time: string;
    reschedule_reason?: string;
    notify_customer?: boolean;
  }
) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(
      `/woloo/bookings/${id}/reschedule`,
      rescheduleData,
      {
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to reschedule Woloo booking.');
  }
};

export const assignWolooBookingStaff = async (
  id: string,
  staffData: {
    staff_assignments: Array<{ staff_id: string; role: string; name: string }>;
    assignment_notes?: string;
  }
) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.put(`/woloo/bookings/${id}/staff`, staffData, {
      headers: {
        'Content-Type': 'application/json',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to assign staff to Woloo booking.');
  }
};

// CSV Template Downloads
export const downloadWolooCategorySampleCSV = async () => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/woloo/categories/sample-csv', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'woloo_categories_sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to download Woloo category sample CSV.'
    );
  }
};

export const downloadWolooSubcategorySampleCSV = async () => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/woloo/subcategories/sample-csv', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'woloo_subcategories_sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to download Woloo subcategory sample CSV.'
    );
  }
};

export const downloadWolooRateCardSampleCSV = async () => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/woloo/rate-cards/sample-csv', {
      headers: {
        'admin-auth-token': token || '',
      },
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'woloo_rate_cards_sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to download Woloo rate card sample CSV.'
    );
  }
};

// Contact Form API - Submit contact form from public contact us page
export const submitContactForm = async (contactData: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<ApiResponse> => {
  try {
    console.log('📞 Submitting contact form via admin API...');

    // No token required for public contact form submission
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/contact', contactData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Contact form submitted successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error submitting contact form:', error);
    throw error;
  }
};

// ===== B2B SERVICE ATTACHMENTS API =====

export interface ServiceAttachment {
  id: string;
  type: 'before_image' | 'after_image' | 'before_video' | 'after_video';
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  isArchived: boolean;
  downloadUrl: string;
  uploadedBy?: {
    id: string;
    companyName: string;
    contactPerson: string;
  };
}

export interface ServiceAttachmentsResponse {
  success: boolean;
  data: {
    attachments: ServiceAttachment[];
    total: number;
  };
  message?: string;
}

export interface AttachmentDownloadResponse {
  success: boolean;
  data: {
    downloadUrl: string;
    expiresAt: string;
  };
  message?: string;
}

// Get service attachments for a B2B booking
export const fetchB2BBookingAttachments = async (bookingId: string): Promise<ServiceAttachmentsResponse> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    console.log(`📸 Fetching service attachments for booking: ${bookingId}`);

    const response: AxiosResponse<ServiceAttachmentsResponse> = await apiClient.get(
      `/b2b/bookings/${bookingId}/attachments`,
      {
        headers: {
          'admin-auth-token': token,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Service attachments fetched successfully:', response.data);

    // Ensure the response has the expected structure
    if (!response.data || typeof response.data !== 'object') {
      console.warn('⚠️  Invalid response structure:', response.data);
      return {
        success: false,
        data: { attachments: [], total: 0 },
        message: 'Invalid response structure'
      };
    }

    // Ensure attachments is an array
    if (!Array.isArray(response.data.data?.attachments)) {
      console.warn('⚠️  Attachments is not an array:', response.data.data?.attachments);
      return {
        success: response.data.success || false,
        data: {
          attachments: [],
          total: 0
        },
        message: response.data.message || 'No attachments found'
      };
    }

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching service attachments:', error);
    // Return a safe fallback structure
    return {
      success: false,
      data: { attachments: [], total: 0 },
      message: error instanceof Error ? error.message : 'Failed to fetch attachments'
    };
  }
};

// Get download URL for a specific attachment
export const fetchAttachmentDownloadUrl = async (attachmentId: string): Promise<AttachmentDownloadResponse> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    console.log(`📥 Getting download URL for attachment: ${attachmentId}`);

    const response: AxiosResponse<AttachmentDownloadResponse> = await apiClient.get(
      `/b2b/attachments/${attachmentId}/download`,
      {
        headers: {
          'admin-auth-token': token,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Download URL fetched successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching download URL:', error);
    throw error;
  }
};

// Get all service attachments with filtering and pagination
export const fetchAllServiceAttachments = async (params?: {
  page?: number;
  limit?: number;
  type?: string;
  providerId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}): Promise<ServiceAttachmentsResponse> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    console.log('📸 Fetching all service attachments with filters:', params);

    const response: AxiosResponse<ServiceAttachmentsResponse> = await apiClient.get(
      '/b2b/attachments',
      {
        headers: {
          'admin-auth-token': token,
          'Content-Type': 'application/json',
        },
        params,
      }
    );

    console.log('✅ All service attachments fetched successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching all service attachments:', error);
    throw error;
  }
};

// ✅ NEW: Analytics API Functions

/**
 * Get comprehensive analytics report
 */
export const fetchComprehensiveAnalytics = async (
  startDate?: string,
  endDate?: string,
  period: 'monthly' | 'weekly' | 'daily' = 'monthly',
  businessType: 'b2b' | 'b2c' | 'both' = 'both'
): Promise<ComprehensiveAnalyticsResponse> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('period', period);
    params.append('business_type', businessType);

    const response: AxiosResponse<ComprehensiveAnalyticsResponse> = await apiClient.get(
      `/analytics/comprehensive-report?${params.toString()}`,
      {
        headers: {
          'admin-auth-token': token,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching comprehensive analytics:', error);
    throw error;
  }
};

/**
 * Get Month-to-Date analytics report
 */
export const fetchMTDAnalytics = async (
  businessType: 'b2b' | 'b2c' | 'both' = 'both'
): Promise<{
  success: boolean;
  data: {
    period: string;
    business_type: string;
    report: AnalyticsReportData;
    generated_at: string;
  }
}> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get(
      `/analytics/mtd-report?business_type=${businessType}`,
      {
        headers: {
          'admin-auth-token': token,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching MTD analytics:', error);
    throw error;
  }
};

/**
 * Get Life-to-Date analytics report
 */
export const fetchLTDAnalytics = async (
  businessType: 'b2b' | 'b2c' | 'both' = 'both'
): Promise<{
  success: boolean;
  data: {
    period: string;
    business_type: string;
    report: AnalyticsReportData;
    generated_at: string;
  }
}> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get(
      `/analytics/ltd-report?business_type=${businessType}`,
      {
        headers: {
          'admin-auth-token': token,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching LTD analytics:', error);
    throw error;
  }
};

/**
 * Get dashboard summary metrics
 */
export const fetchDashboardSummary = async (): Promise<DashboardSummaryResponse> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response: AxiosResponse<DashboardSummaryResponse> = await apiClient.get(
      '/analytics/dashboard-summary',
      {
        headers: {
          'admin-auth-token': token,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching dashboard summary:', error);
    throw error;
  }
};

/**
 * Format number with commas for display
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

/**
 * Get detailed tabular analytics report
 */
export const fetchDetailedReport = async (
  businessType: 'b2b' | 'b2c' | 'both' = 'both'
): Promise<{
  success: boolean;
  data: {
    title: string;
    periods: Array<{
      period: string;
      period_type: string;
      downloads: number;
      registrations: number;
      orders_received: number;
      gov: number;
      aov: number;
      orders_executed: number;
      executed_value: number;
      invoices_raised: number;
      invoice_value: number;
      collections: number;
      collection_value: number;
      overdue: number;
      overdue_value: number;
    }>;
    columns: string[];
    generated_at: string;
  };
}> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get('/analytics/detailed-report', {
      params: {
        business_type: businessType,
      },
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching detailed report:', error);
    throw error;
  }
};

/**
 * Get Financial Year analytics report
 */
export const fetchFYAnalytics = async (): Promise<{
  success: boolean;
  data: {
    current_fy: string;
    report: Array<AnalyticsReportData>;
    generated_at: string;
  };
}> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get('/analytics/fy-report', {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching FY analytics:', error);
    throw error;
  }
};

/**
 * Export detailed analytics report as CSV
 */
export const exportDetailedReportCSV = async (
  businessType: 'b2b' | 'b2c' | 'both' = 'both'
): Promise<void> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get('/analytics/export-detailed-report', {
      params: {
        business_type: businessType,
      },
      headers: {
        'admin-auth-token': token,
      },
      responseType: 'blob', // Important for file download
    });

    // Create blob and download
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Generate filename
    const filename = `analytics-report-${businessType}-${new Date().toISOString().split('T')[0]}.csv`;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('❌ Error exporting detailed report:', error);
    throw error;
  }
};

// ✅ SP INVOICE MANAGEMENT API FUNCTIONS

export interface SPInvoice {
  id: string;
  booking: {
    id: string;
    order_number: string;
    service_name: string;
    customer: {
      company_name: string;
      contact_person: string;
    };
  };
  provider: {
    name: string;
    company_name: string;
  };
  invoice_number?: string;
  invoice_amount?: number;
  approval_status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  uploaded_at: string;
  approved_at?: string;
  admin_notes?: string;
  sp_notes?: string;
  file_url?: string;
}

export interface SPInvoiceStats {
  status_summary: {
    pending: number;
    approved: number;
    rejected: number;
    needs_revision: number;
  };
  financial_summary: {
    total_pending_amount: number;
    total_approved_amount: number;
    avg_invoice_amount: number;
  };
}

export interface SPInvoiceFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Fetch all SP invoices with filters
export const fetchSPInvoices = async (filters: SPInvoiceFilters = {}) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get('/b2b/sp-invoices', {
      params: filters,
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching SP invoices:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch SP invoices');
  }
};

// Fetch SP invoice statistics
export const fetchSPInvoiceStats = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get('/b2b/sp-invoices/statistics', {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching SP invoice statistics:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch SP invoice statistics');
  }
};

// Fetch single SP invoice by ID
export const fetchSPInvoiceById = async (id: string) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get(`/b2b/sp-invoices/${id}`, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching SP invoice details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch SP invoice details');
  }
};

// Approve SP invoice
export const approveSPInvoice = async (id: string, data: { admin_notes?: string; generate_b2b_invoice?: boolean }) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.post(`/b2b/sp-invoices/${id}/approve`, data, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error approving SP invoice:', error);
    throw new Error(error.response?.data?.message || 'Failed to approve SP invoice');
  }
};

// Reject SP invoice
export const rejectSPInvoice = async (id: string, data: { reason: string; admin_notes?: string }) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.post(`/b2b/sp-invoices/${id}/reject`, data, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error rejecting SP invoice:', error);
    throw new Error(error.response?.data?.message || 'Failed to reject SP invoice');
  }
};

// Request revision for SP invoice
export const requestSPInvoiceRevision = async (id: string, data: { revision_reason: string; admin_notes?: string }) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.post(`/b2b/sp-invoices/${id}/request-revision`, data, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error requesting SP invoice revision:', error);
    throw new Error(error.response?.data?.message || 'Failed to request SP invoice revision');
  }
};

// ============================================================================
// SPOC MANAGEMENT API FUNCTIONS
// ============================================================================

/**
 * Fetch SPOC assignments with optional filters
 */
export const fetchSPOCAssignments = async (params: {
  client_id?: string;
  spoc_type?: string;
  active_only?: boolean;
  page?: number;
  limit?: number;
} = {}) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get('/b2b/spoc/assignments', {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        ...params
      },
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching SPOC assignments:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch SPOC assignments');
  }
};

/**
 * Fetch SPOC users available for assignment
 */
export const fetchSPOCUsers = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get('/b2b/spoc/users', {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching SPOC users:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch SPOC users');
  }
};

/**
 * Fetch SPOC workload statistics
 */
export const fetchSPOCWorkload = async (spocUserId?: string) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = spocUserId ? `/b2b/spoc/workload/${spocUserId}` : '/b2b/spoc/workload';

    const response = await apiClient.get(url, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching SPOC workload:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch SPOC workload');
  }
};

/**
 * Create a new SPOC assignment
 */
export const createSPOCAssignment = async (assignmentData: any) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.post('/b2b/spoc/assignments', assignmentData, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating SPOC assignment:', error);
    throw new Error(error.response?.data?.message || 'Failed to create SPOC assignment');
  }
};

/**
 * Update an existing SPOC assignment
 */
export const updateSPOCAssignment = async (assignmentId: string, assignmentData: any) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.put(`/b2b/spoc/assignments/${assignmentId}`, assignmentData, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating SPOC assignment:', error);
    throw new Error(error.response?.data?.message || 'Failed to update SPOC assignment');
  }
};

/**
 * Deactivate a SPOC assignment
 */
export const deactivateSPOCAssignment = async (assignmentId: string, reason: string) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.delete(`/b2b/spoc/assignments/${assignmentId}`, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
      data: { reason }
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error deactivating SPOC assignment:', error);
    throw new Error(error.response?.data?.message || 'Failed to deactivate SPOC assignment');
  }
};

/**
 * Fetch B2B client details (for SPOC form)
 */
export const fetchB2BClientById = async (clientId: string) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get(`/b2b/clients/${clientId}`, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching B2B client:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch B2B client');
  }
};

// ============================================================================
// B2B INVOICE GENERATION API FUNCTIONS
// ============================================================================

/**
 * Check if invoice exists for a B2B order
 */
export const checkB2BInvoiceExists = async (orderId: string) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get(`/b2b/orders/${orderId}/invoice-check`, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error checking invoice existence:', error);
    throw new Error(error.response?.data?.message || 'Failed to check invoice existence');
  }
};

/**
 * Generate invoice for a B2B order
 */
export const generateB2BOrderInvoice = async (orderId: string, invoiceData: {
  subtotal?: number;
  payment_terms?: string;
  notes?: string;
  due_days?: number;
  invoice_items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
  }>;
}) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.post(`/b2b/orders/${orderId}/generate-invoice`, invoiceData, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error generating invoice:', error);
    throw new Error(error.response?.data?.message || 'Failed to generate invoice');
  }
};

/**
 * ✅ NEW: Get temporary invoice data for editing (without creating invoice record)
 */
export const getTemporaryInvoiceData = async (orderId: string) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get(`/b2b/orders/${orderId}/temporary-invoice-data`, {
      headers: {
        'admin-auth-token': token,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching temporary invoice data:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch temporary invoice data');
  }
};

/**
 * ✅ UPDATED: Create invoice from temporary invoice data (creates actual invoice record)
 */
export const generateTemporaryInvoice = async (orderId: string, invoiceData: any) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.post(`/b2b/orders/${orderId}/temporary-invoice`, invoiceData, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
      // ✅ CHANGED: Now expects JSON response, not PDF blob
    });

    return response.data; // Returns { success, message, data: { invoice_id, invoice_number, ... } }
  } catch (error: any) {
    console.error('❌ Error creating invoice from temporary data:', error);
    throw new Error(error.response?.data?.message || 'Failed to create invoice from temporary data');
  }
};

/**
 * Regenerate PDF for a B2B invoice
 */
export const regenerateB2BInvoicePDF = async (invoiceId: string) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.post(`/b2b/invoices/${invoiceId}/regenerate-pdf`, {}, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error regenerating invoice PDF:', error);
    throw new Error(error.response?.data?.message || 'Failed to regenerate invoice PDF');
  }
};


export const deleteB2BInvoice = async (invoiceId: string) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.delete(`/b2b/invoices/${invoiceId}/delete-invoice`, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error deleting invoice:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete invoice');
  }
};

/**
 * Get invoice file path for a B2B order (lightweight endpoint for downloads)
 */
export const getB2BOrderInvoicePath = async (orderId: string) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get(`/b2b/orders/${orderId}/invoice-path`, {
      headers: {
        'admin-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error getting invoice path:', error);
    throw new Error(error.response?.data?.message || 'Failed to get invoice path');
  }
};

// ========================================
// B2B ANALYTICS API FUNCTIONS
// ========================================
// Version: 1.0.0 - Updated 2025-10-17

/**
 * B2B Analytics Dashboard Data Interface
 */
export interface B2BDashboardData {
  overall_metrics: {
    customers: {
      total: number;
      active: number;
      inactive: number;
    };
    orders_received: {
      count: number;
      total_value: number;
    };
    orders_completed: {
      count: number;
      total_value: number;
    };
    revenue: number;
    profit: {
      total: number;
      avg_margin_percentage: string;
    };
    outstanding_orders: {
      count: number;
      total_value: number;
    };
    payment_collection: {
      paid: number;
      pending: number;
      overdue: number;
      partial: number;
    };
  };
  top_performers: {
    by_revenue: Array<{
      id: string;
      company_name: string;
      total_value: number;
      profit_margin_percentage: string;
    }>;
    by_profit: Array<{
      id: string;
      company_name: string;
      profit: number;
      profit_margin_percentage: string;
    }>;
    by_orders: Array<{
      id: string;
      company_name: string;
      orders: number;
      total_value: number;
    }>;
  };
}

/**
 * B2B Customer Analytics Data Interface
 */
export interface B2BCustomerAnalyticsData {
  customer_info: {
    id: string;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    credit_limit: number;
    credit_days: number;
    status: string;
  };
  core_metrics: {
    orders_received: {
      count: number;
      total_value: number;
    };
    orders_completed: {
      count: number;
      total_value: number;
    };
    revenue_generated: number;
    profit_generated: number;
    outstanding_orders: {
      count: number;
      total_value: number;
    };
    payment_collection: {
      paid: number;
      pending: number;
      overdue: number;
      partial: number;
    };
  };
  financial_health: {
    avg_order_value: number;
    outstanding_invoice_amount: number;
    profit_margin_percentage: string;
  };
  relationship_metrics: {
    customer_tenure: {
      months: number;
      years: number;
      first_order_date: string;
    };
    last_order_date: string | null;
    total_orders_lifetime: number;
  };
  operational_metrics: {
    order_frequency: {
      orders_per_month: number;
      total_months: number;
      frequency_label: string;
    };
    service_mix: {
      by_category: Array<{
        id: number;
        category_name: string;
        order_count: number;
        total_value: number;
      }>;
      by_subcategory: Array<{
        id: number;
        subcategory_name: string;
        category_name: string;
        order_count: number;
        total_value: number;
      }>;
      top_category: any;
      top_subcategory: any;
    };
    fulfillment_time: {
      avg_days: number;
      avg_hours: number;
      fastest_days: number;
      slowest_days: number;
    };
    cancellation_rate: {
      cancelled_count: number;
      total_count: number;
      cancellation_rate_percentage: number;
    };
  };
  date_range: {
    start: string;
    end: string;
  } | null;
  generated_at: string;
}

/**
 * B2B Customer Trends Data Interface
 */
export interface B2BCustomerTrendsData {
  customer_info: {
    id: string;
    company_name: string;
  };
  trends: Array<{
    month: string;
    order_count: number;
    revenue: number;
    profit: number;
    completed_count: number;
    cancelled_count: number;
    completion_rate: number;
  }>;
  summary: {
    total_revenue: number;
    total_profit: number;
    total_orders: number;
    avg_monthly_revenue: number;
    avg_monthly_orders: number;
    revenue_growth_rate_percentage: number;
    period_months: number;
  };
  generated_at: string;
}

/**
 * Get B2B Analytics Dashboard
 * @param startDate - Optional start date for filtering (YYYY-MM-DD)
 * @param endDate - Optional end date for filtering (YYYY-MM-DD)
 */
export const getB2BAnalyticsDashboard = async (
  startDate?: string,
  endDate?: string
): Promise<B2BDashboardData> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    let url = '/b2b/analytics/dashboard';

    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }

    const response = await apiClient.get(url, {
      headers: {
        'admin-auth-token': token
      }
    });

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error fetching B2B analytics dashboard:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
  }
};

/**
 * Get B2B Customer Analytics
 * @param customerId - Encrypted customer ID
 * @param startDate - Optional start date for filtering (YYYY-MM-DD)
 * @param endDate - Optional end date for filtering (YYYY-MM-DD)
 */
export const getB2BCustomerAnalytics = async (
  customerId: string,
  startDate?: string,
  endDate?: string
): Promise<B2BCustomerAnalyticsData> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    let url = `/b2b/customers/${customerId}/analytics`;

    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }

    const response = await apiClient.get(url, {
      headers: {
        'admin-auth-token': token
      }
    });

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error fetching customer analytics:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch customer analytics');
  }
};

/**
 * Get B2B Customer Trends
 * @param customerId - Encrypted customer ID
 * @param months - Number of months to look back (default: 12)
 */
export const getB2BCustomerTrends = async (
  customerId: string,
  months: number = 12
): Promise<B2BCustomerTrendsData> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await apiClient.get(
      `/b2b/customers/${customerId}/trends?months=${months}`,
      {
        headers: {
          'admin-auth-token': token
        }
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error fetching customer trends:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch customer trends');
  }
};




// ========================================
// DAILY OPERATIONS DASHBOARD
// ========================================

/**
 * TypeScript Interfaces for Daily Operations Dashboard
 */
export interface B2BDailyOrder {
  id: number;
  order_id: string;
  customer_name: string;
  service_category: string;
  service_subcategory: string;
  service_name: string;
  service_date: string;
  service_time: string | null;
  service_address: string;
  status: string;
  spoc_name: string;
  provider_name: string | null;
  final_amount: number;
  // cancel_reason: string | null;
  // reschedule_reason: string | null;
}

export interface OrderMetric {
  count: number;
  date: string;
  orders: B2BDailyOrder[];
  showing?: number;
  hasMore?: boolean;
}

export interface DailyOperationsData {
  ordersCompletedYesterday: OrderMetric;
  ordersRescheduledYesterday: OrderMetric;
  ordersScheduledToday: OrderMetric;
  ordersScheduledTomorrow: OrderMetric;
  ordersPendingPastServiceDate: OrderMetric;
  metadata: {
    role: string;
    filteredByCustomers: boolean;
    maxOrdersPerMetric?: number;
    generatedAt: string;
  };
}

/**
 * Get Daily Operations Dashboard
 * Fetches all 4 metrics in one call
 */
export const getDailyOperationsDashboard = async (): Promise<DailyOperationsData> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await apiClient.get('/b2b/dashboard/daily-operations', {
      headers: {
        'admin-auth-token': token
      }
    });

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error fetching daily operations dashboard:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch daily operations dashboard');
  }
};

/**
 * Get Orders Completed Yesterday
 */
export const getOrdersCompletedYesterday = async (): Promise<OrderMetric> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await apiClient.get('/b2b/dashboard/orders-completed-yesterday', {
      headers: {
        'admin-auth-token': token
      }
    });

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error fetching orders completed yesterday:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch orders completed yesterday');
  }
};

/**
 * Get Orders Rescheduled Yesterday
 */
export const getOrdersRescheduledYesterday = async (): Promise<OrderMetric> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await apiClient.get('/b2b/dashboard/orders-rescheduled-yesterday', {
      headers: {
        'admin-auth-token': token
      }
    });

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error fetching orders rescheduled yesterday:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch orders rescheduled yesterday');
  }
};

/**
 * Get Orders Scheduled Today
 */
export const getOrdersScheduledToday = async (): Promise<OrderMetric> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await apiClient.get('/b2b/dashboard/orders-scheduled-today', {
      headers: {
        'admin-auth-token': token
      }
    });

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error fetching orders scheduled today:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch orders scheduled today');
  }
};

/**
 * Get Orders Scheduled Tomorrow
 */
export const getOrdersScheduledTomorrow = async (): Promise<OrderMetric> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await apiClient.get('/b2b/dashboard/orders-scheduled-tomorrow', {
      headers: {
        'admin-auth-token': token
      }
    });

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error fetching orders scheduled tomorrow:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch orders scheduled tomorrow');
  }
};

/**
 * Send Today's Schedule Emails (Manual Trigger)
 * Only accessible by super_admin and manager
 */
export const sendTodayScheduleEmails = async (): Promise<{ success: boolean; message: string; data: any }> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await apiClient.post('/b2b/dashboard/send-today-schedule-emails', {}, {
      headers: {
        'admin-auth-token': token
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error sending today\'s schedule emails:', error);
    throw new Error(error.response?.data?.message || 'Failed to send today\'s schedule emails');
  }
};

/**
 * Send Tomorrow's Schedule Emails (Manual Trigger)
 * Only accessible by super_admin and manager
 */
export const sendTomorrowScheduleEmails = async (): Promise<{ success: boolean; message: string; data: any }> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await apiClient.post('/b2b/dashboard/send-tomorrow-schedule-emails', {}, {
      headers: {
        'admin-auth-token': token
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error sending tomorrow\'s schedule emails:', error);
    throw new Error(error.response?.data?.message || 'Failed to send tomorrow\'s schedule emails');
  }
};

/**
 * Send Admin Daily Summary Email (Manual Trigger)
 * Only accessible by super_admin and manager
 */
export const sendAdminDailySummary = async (): Promise<{ success: boolean; message: string; data: any }> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await apiClient.post('/b2b/dashboard/send-admin-daily-summary', {}, {
      headers: {
        'admin-auth-token': token
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error sending admin daily summary email:', error);
    throw new Error(error.response?.data?.message || 'Failed to send admin daily summary email');
  }
};

/**
 * Export Customer-wise Analytics (Excel)
 * Downloads Excel file directly
 * @param filters - Optional filters for date range and filter type
 */
export const exportCustomerWiseAnalytics = async (filters?: {
  date_from?: string;
  date_to?: string;
  date_filter_type?: 'service' | 'received';
}): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await apiClient.get('/b2b/analytics/export/customer-wise', {
      headers: {
        'admin-auth-token': token
      },
      params: filters,
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `B2B_Customer_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('❌ Error exporting customer-wise analytics:', error);
    throw new Error(error.response?.data?.message || 'Failed to export customer-wise analytics');
  }
};

/**
 * Export SPOC-wise Analytics (Excel)
 * Only accessible by super_admin and manager
 * @param filters - Optional filters for date range and filter type
 */
export const exportSPOCWiseAnalytics = async (filters?: {
  date_from?: string;
  date_to?: string;
  date_filter_type?: 'service' | 'received';
}): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await apiClient.get('/b2b/analytics/export/spoc-wise', {
      headers: {
        'admin-auth-token': token
      },
      params: filters,
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `B2B_SPOC_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('❌ Error exporting SPOC-wise analytics:', error);
    throw new Error(error.response?.data?.message || 'Failed to export SPOC-wise analytics');
  }
};

/**
 * Export SP-wise Analytics (Excel)
 * @param filters - Optional filters for date range and filter type
 */
export const exportSPWiseAnalytics = async (filters?: {
  date_from?: string;
  date_to?: string;
  date_filter_type?: 'service' | 'received';
}): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await apiClient.get('/b2b/analytics/export/sp-wise', {
      headers: {
        'admin-auth-token': token
      },
      params: filters,
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `B2B_SP_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('❌ Error exporting SP-wise analytics:', error);
    throw new Error(error.response?.data?.message || 'Failed to export SP-wise analytics');
  }
};

/**
 * Get Monthly Report - Returns JSON data or downloads Excel based on format parameter
 * @param filters - Optional filters for year, month, and customer
 * @param format - 'json' for data return, 'excel' for file download (default: 'excel')
 */
export const getMonthlyReport = async (
  filters?: {
    year?: number;
    month?: number;
    customer_id?: string;
    date_from?: string;
    date_to?: string;
    date_filter_type?: 'service' | 'received';
  },
  format: 'json' | 'excel' = 'excel'
): Promise<any> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    console.log('🔧 API: getMonthlyReport called with format:', format, 'filters:', filters);

    // Build query parameters
    const params: any = {};
    if (filters?.year) params.year = filters.year;
    if (filters?.month) params.month = filters.month;
    if (filters?.customer_id) params.customer_id = filters.customer_id;
    if (filters?.date_from) params.date_from = filters.date_from;
    if (filters?.date_to) params.date_to = filters.date_to;
    if (filters?.date_filter_type) params.date_filter_type = filters.date_filter_type;

    // Add format parameter for JSON requests
    if (format === 'json') {
      params.format = 'json';
    }

    console.log('📤 API: Sending request with params:', params, 'format:', format);

    const response = await apiClient.get('/b2b/analytics/export/monthly-report', {
      headers: {
        'admin-auth-token': token,
        ...(format === 'json' && { 'Accept': 'application/json' })
      },
      params,
      ...(format === 'excel' && { responseType: 'blob' })
    });

    console.log('📥 API: Received response, format:', format, 'response type:', typeof response.data);

    // If JSON format, return the data
    if (format === 'json') {
      console.log('✅ API: Returning JSON data:', response.data);
      return response.data;
    }

    // If Excel format, trigger download
    console.log('📥 API: Downloading Excel file');
    const monthName = filters?.month
      ? new Date(2000, filters.month - 1).toLocaleString('default', { month: 'long' })
      : 'All';
    const yearStr = filters?.year || new Date().getFullYear();
    const filename = `B2B_Monthly_Report_${monthName}_${yearStr}_${new Date().toISOString().split('T')[0]}.xlsx`;

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'File downloaded successfully' };
  } catch (error: any) {
    console.error('❌ API Error with monthly report:', error);
    console.error('❌ API Error response:', error.response);
    throw new Error(error.response?.data?.message || `Failed to ${format === 'json' ? 'fetch' : 'download'} monthly report`);
  }
};

// ✅ Backward compatibility - Keep old function names as aliases
export const exportMonthlyReport = async (filters?: {
  year?: number;
  month?: number;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  date_filter_type?: 'service' | 'received';
}): Promise<void> => {
  await getMonthlyReport(filters, 'excel');
};

export const getMonthlyReportData = async (filters?: {
  year?: number;
  month?: number;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  date_filter_type?: 'service' | 'received';
}): Promise<any> => {
  return await getMonthlyReport(filters, 'json');
};