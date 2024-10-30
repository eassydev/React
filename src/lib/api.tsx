import axios, { AxiosResponse } from 'axios';

// Set the base URL for your API
const BASE_URL = 'http://localhost:5000/admin';

// Initialize Axios instance with base URL
const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Get the token from localStorage at the time of making a request
const getToken = (): string | null => {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
};

// Define the structure of the Category object


// Define the structure of the Location object
export interface Category {
  id?: string; // Optional for editing
  name: string;
  description: string;
  image: File | null;
  locations: Location[];
  location_type: string;
  location_method: string;
  active: boolean;
  filterattributes?: Attribute[];
  tax?: number | null;        // New field for tax percentage
  igst_tax?: number | null;   // New field for IGST percentage
  sac_code?: string | null;   // New field for SAC code
}

// Define the structure of the Subcategory object
export interface Subcategory {
  id?: string; // Optional for editing
  name: string;
  description: string;
  image: File | null;
  category_id: number; // Associated category ID
  active: boolean;
  filterattributes?: Attribute[];
  tax?: number | null;       // Field for tax percentage
  igst_tax?: number | null;  // Field for IGST percentage
  sac_code?: string | null;  // Field for SAC code
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

// Define the structure of the Attribute object
export interface Attribute {
  id?: number;
  attribute_name: string;
  attribute_value: string;
  attribute_type: string;
}



// Define the structure of the RateCard object
export interface RateCard {
  id?: string;
  category_id: number;
  subcategory_id: number | null; // Adjusted to use subcategory_id
  filter_attribute_id: number | null; // Adjusted to use subcategory_id
  name: string;
  description?: string;
  price: number;
  active: boolean;
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
  renewal_options: boolean;
  is_active: boolean;
  rate_card_ids?: string[]; // Array of rate card IDs
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


// Define the structure of the API response
interface ApiResponse {
  status: boolean;
  message: string;
  data?: any;
}

// Function to create a new category with attributes
export const createCategory = async (category: Category): Promise<ApiResponse> => {
  const formData = new FormData();

  formData.append('name', category.name);
  formData.append('description', category.description);
  formData.append('active', category.active ? '1' : '0');

  if (category.image) {
    formData.append('image', category.image);
  }
  formData.append('locationType', category.location_type);
  formData.append('locationMethod', category.location_method);
  formData.append('locations', JSON.stringify(category.locations));

  if (category.filterattributes && category.filterattributes.length > 0) {
    formData.append('attributes', JSON.stringify(category.filterattributes));
  }

  // Add new fields for tax, IGST, and SAC code
  if (category.tax !== null && category.tax !== undefined) {
    formData.append('tax', category.tax.toString());
  }
  if (category.igst_tax !== null && category.igst_tax !== undefined) {
    formData.append('igst_tax', category.igst_tax.toString());
  }
  if (category.sac_code) {
    formData.append('sac_code', category.sac_code);
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


export const fetchCategories = async (page = 1, size = 10) => {
  try {
    const token = getToken(); // Retrieve the token

    const response: AxiosResponse = await apiClient.get('/category', {
      params: { page, size },
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

// Function to update an existing category with attributes
export const updateCategory = async (id: string, category: Category): Promise<ApiResponse> => {
  const formData = new FormData();

  formData.append('name', category.name);
  formData.append('description', category.description);
  formData.append('active', category.active ? '1' : '0');

  if (category.image) {
    formData.append('image', category.image);
  }
  formData.append('locationType', category.location_type);
  formData.append('locationMethod', category.location_method);
  formData.append('locations', JSON.stringify(category.locations));

  if (category.filterattributes && category.filterattributes.length > 0) {
    formData.append('attributes', JSON.stringify(category.filterattributes));
  }

  // Add new fields for tax, IGST, and SAC code
  if (category.tax !== null && category.tax !== undefined) {
    formData.append('tax', category.tax.toString());
  }
  if (category.igst_tax !== null && category.igst_tax !== undefined) {
    formData.append('igst_tax', category.igst_tax.toString());
  }
  if (category.sac_code) {
    formData.append('sac_code', category.sac_code);
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
  formData.append('description', subcategory.description);
  formData.append('category_id', subcategory.category_id.toString());
  formData.append('active', subcategory.active ? '1' : '0');

  // Add optional image field
  if (subcategory.image) {
    formData.append('image', subcategory.image);
  }

  // Add filter attributes if present
  if (subcategory.filterattributes && subcategory.filterattributes.length > 0) {
    formData.append('attributes', JSON.stringify(subcategory.filterattributes));
  }

  // Add tax, IGST, and SAC code fields
  if (subcategory.tax !== null && subcategory.tax !== undefined) {
    formData.append('tax', subcategory.tax.toString());
  }
  if (subcategory.igst_tax !== null && subcategory.igst_tax !== undefined) {
    formData.append('igst_tax', subcategory.igst_tax.toString());
  }
  if (subcategory.sac_code) {
    formData.append('sac_code', subcategory.sac_code);
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


// Adjust the fetchSubcategories API function to support pagination
export const fetchSubcategories = async (page = 1, size = 10) => {
  try {
    const token = getToken(); // Retrieve the token

    const response: AxiosResponse = await apiClient.get('/sub-category', {
      params: { page, size },
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
  formData.append('description', subcategory.description);
  formData.append('category_id', subcategory.category_id.toString());
  formData.append('active', subcategory.active ? '1' : '0');

  // Add optional image field
  if (subcategory.image) {
    formData.append('image', subcategory.image);
  }

  // Add filter attributes if present
  if (subcategory.filterattributes && subcategory.filterattributes.length > 0) {
    formData.append('attributes', JSON.stringify(subcategory.filterattributes));
  }

  // Add tax, IGST, and SAC code fields
  if (subcategory.tax !== null && subcategory.tax !== undefined) {
    formData.append('tax', subcategory.tax.toString());
  }
  if (subcategory.igst_tax !== null && subcategory.igst_tax !== undefined) {
    formData.append('igst_tax', subcategory.igst_tax.toString());
  }
  if (subcategory.sac_code) {
    formData.append('sac_code', subcategory.sac_code);
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
  const formData = new FormData();

  formData.append('name', rateCard.name);
  formData.append('category_id', rateCard.category_id.toString());
  formData.append('price', rateCard.price.toString());
  formData.append('active', rateCard.active ? '1' : '0');

  if (rateCard.subcategory_id) {
    formData.append('subcategory_id', rateCard.subcategory_id?.toString() || ''); // Adjusted for subcategory
  }
  if (rateCard.filter_attribute_id) {
    formData.append('filter_attribute_id', rateCard.filter_attribute_id?.toString() || ''); // Adjusted for subcategory
  }
  if (rateCard.description) {
    formData.append('description', rateCard.description);
  }
 
  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/rate-card', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'admin-auth-token': token || '',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create rate card.');
  }
};

// Function to fetch all rate cards with pagination
export const fetchRateCards = async (page = 1, size = 10) => {
  try {
    const token = getToken();
    const response: AxiosResponse = await apiClient.get('/rate-card', {
      params: { page, size },
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
  const formData = new FormData();

  formData.append('name', rateCard.name);
  formData.append('category_id', rateCard.category_id.toString());
  formData.append('price', rateCard.price.toString());
  formData.append('active', rateCard.active ? '1' : '0');

  if (rateCard.subcategory_id) {
    formData.append('subcategory_id', rateCard.subcategory_id?.toString() || ''); // Adjusted for subcategory
  }
  if (rateCard.filter_attribute_id) {
    formData.append('filter_attribute_id', rateCard.filter_attribute_id?.toString() || ''); // Adjusted for subcategory
  }
  if (rateCard.description) {
    formData.append('description', rateCard.description);
  }

  try {
    const token = getToken();
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/rate-card/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
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