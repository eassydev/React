import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface PermissionCheckResponse {
  status: boolean;
  hasAccess: boolean;
  url: string;
}

interface AdminPermissions {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [adminInfo, setAdminInfo] = useState<AdminPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get admin info from localStorage or token
  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      setLoading(false);
      return;
    }

    // Try to get admin info from localStorage first
    const storedAdminInfo = localStorage.getItem('adminInfo');
    console.log('🔍 usePermissions - storedAdminInfo:', storedAdminInfo);

    if (storedAdminInfo) {
      try {
        const adminData = JSON.parse(storedAdminInfo);
        console.log('🔍 usePermissions - parsed adminData:', adminData);

        setAdminInfo(adminData);
        setPermissions(adminData.permissions || []);
        setLoading(false);

        console.log('🔍 usePermissions - set role:', adminData.role);
        console.log('🔍 usePermissions - set permissions:', adminData.permissions);
      } catch (error) {
        console.error('❌ Error parsing stored admin info:', error);
        localStorage.removeItem('adminInfo');
      }
    } else {
      console.log('🔍 usePermissions - no adminInfo in localStorage');
      setLoading(false);
    }
  }, []);

  /**
   * Check if admin has permission for a specific frontend URL
   */
  const hasPermission = useCallback(
    (url: string): boolean => {
      if (!permissions || permissions.length === 0) {
        return false;
      }

      return permissions.some((permission) => {
        // Exact match
        if (permission === url) {
          return true;
        }

        // Wildcard matching
        if (permission.includes('*')) {
          const pattern = permission.replace(/\*/g, '.*');
          const regex = new RegExp(`^${pattern}$`);
          return regex.test(url);
        }

        // Base path matching
        if (url.startsWith(permission + '/') || url === permission) {
          return true;
        }

        return false;
      });
    },
    [permissions]
  );

  /**
   * Check permission via API call (for real-time verification)
   */
  const checkPermissionAPI = useCallback(async (url: string): Promise<boolean> => {
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        return false;
      }

      const response = await fetch('/admin-api/permission/check-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin-auth-token': token,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        return false;
      }

      const data: PermissionCheckResponse = await response.json();
      return data.status && data.hasAccess;
    } catch (error) {
      console.error('Permission check API error:', error);
      return false;
    }
  }, []);

  /**
   * Check if admin has any of the specified permissions
   */
  const hasAnyPermission = useCallback(
    (urls: string[]): boolean => {
      return urls.some((url) => hasPermission(url));
    },
    [hasPermission]
  );

  /**
   * Check if admin has all of the specified permissions
   */
  const hasAllPermissions = useCallback(
    (urls: string[]): boolean => {
      return urls.every((url) => hasPermission(url));
    },
    [hasPermission]
  );

  /**
   * Redirect to unauthorized page if no permission
   */
  const requirePermission = useCallback(
    (url: string) => {
      if (!hasPermission(url)) {
        router.push('/unauthorized');
        return false;
      }
      return true;
    },
    [hasPermission, router]
  );

  /**
   * Check if user is super admin
   */
  const isSuperAdmin = useCallback((): boolean => {
    return adminInfo?.role === 'Super Admin';
  }, [adminInfo]);

  /**
   * Check if user has admin role (any admin level)
   */
  const isAdmin = useCallback((): boolean => {
    return adminInfo?.role?.includes('Admin') || false;
  }, [adminInfo]);

  /**
   * Get current user role
   */
  const getRole = useCallback((): string | null => {
    return adminInfo?.role || null;
  }, [adminInfo]);

  /**
   * Get all user permissions
   */
  const getAllPermissions = useCallback((): string[] => {
    return permissions;
  }, [permissions]);

  /**
   * Refresh permissions from server
   */
  const refreshPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        setLoading(false);
        return;
      }

      // You can implement an API endpoint to get fresh admin info
      // For now, we'll rely on the stored info
      const storedAdminInfo = localStorage.getItem('adminInfo');
      if (storedAdminInfo) {
        const adminData = JSON.parse(storedAdminInfo);
        setAdminInfo(adminData);
        setPermissions(adminData.permissions || []);
      }
    } catch (error) {
      console.error('Error refreshing permissions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    permissions,
    adminInfo,
    loading,

    // Permission checking functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermissionAPI,
    requirePermission,

    // Role checking functions
    isSuperAdmin,
    isAdmin,
    getRole,

    // Utility functions
    getAllPermissions,
    refreshPermissions,
  };
};

export default usePermissions;
