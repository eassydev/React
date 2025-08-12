/**
 * Authentication Helper Utilities
 * Handles admin token validation and management
 */

export const AuthHelper = {
  /**
   * Get admin token from localStorage
   */
  getAdminToken(): string | null {
    try {
      return localStorage.getItem('adminToken');
    } catch (error) {
      console.error('Error getting admin token:', error);
      return null;
    }
  },

  /**
   * Check if admin token exists and is valid format
   */
  isValidToken(token: string | null): boolean {
    if (!token) {
      console.warn('No admin token found');
      return false;
    }

    // Basic JWT format check (should have 3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid token format - not a valid JWT');
      return false;
    }

    // Check if token is not empty
    if (token.trim().length === 0) {
      console.warn('Empty token');
      return false;
    }

    return true;
  },

  /**
   * Get valid admin token or return null
   */
  getValidAdminToken(): string | null {
    const token = this.getAdminToken();
    return this.isValidToken(token) ? token : null;
  },

  /**
   * Clear invalid token and redirect to login
   */
  handleInvalidToken(): void {
    console.warn('Invalid or missing admin token - clearing storage');
    localStorage.removeItem('adminToken');
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  },

  /**
   * Create authenticated headers for API calls
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getValidAdminToken();
    
    if (!token) {
      this.handleInvalidToken();
      throw new Error('No valid admin token available');
    }

    return {
      'Content-Type': 'application/json',
      'admin-auth-token': token
    };
  },

  /**
   * Make authenticated API call with proper error handling
   */
  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    try {
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });

      // Handle authentication errors
      if (response.status === 401) {
        console.error('Authentication failed - token may be expired');
        this.handleInvalidToken();
        throw new Error('Authentication failed');
      }

      return response;
    } catch (error) {
      console.error('Authenticated request failed:', error);
      throw error;
    }
  },

  /**
   * Debug token information
   */
  debugToken(): void {
    const token = this.getAdminToken();
    console.log('=== TOKEN DEBUG INFO ===');
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length || 0);
    console.log('Token preview:', token?.substring(0, 50) + '...');
    console.log('Is valid format:', this.isValidToken(token));
    
    if (token) {
      const parts = token.split('.');
      console.log('JWT parts count:', parts.length);
      console.log('Header length:', parts[0]?.length || 0);
      console.log('Payload length:', parts[1]?.length || 0);
      console.log('Signature length:', parts[2]?.length || 0);
    }
    console.log('========================');
  }
};
