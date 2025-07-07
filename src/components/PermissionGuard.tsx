import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import usePermissions from '@/hooks/usePermissions';

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  fallback = null,
  redirectTo = '/unauthorized',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    let access = false;

    // If no specific permission required, allow access
    if (!requiredPermission && requiredPermissions.length === 0) {
      access = true;
    }
    // Check single permission
    else if (requiredPermission) {
      access = hasPermission(requiredPermission);
    }
    // Check multiple permissions
    else if (requiredPermissions.length > 0) {
      if (requireAll) {
        access = hasAllPermissions(requiredPermissions);
      } else {
        access = hasAnyPermission(requiredPermissions);
      }
    }
    // Default: check current pathname
    else {
      access = hasPermission(pathname);
    }

    setHasAccess(access);

    // Redirect if no access
    if (!access && redirectTo) {
      router.push(redirectTo);
    }
  }, [
    loading,
    requiredPermission,
    requiredPermissions,
    requireAll,
    pathname,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    router,
    redirectTo,
  ]);

  // Show loading state
  if (loading || hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show fallback if no access and no redirect
  if (!hasAccess && !redirectTo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {fallback || (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        )}
      </div>
    );
  }

  // Render children if access granted
  if (hasAccess) {
    return <>{children}</>;
  }

  // Default: don't render anything (redirect in progress)
  return null;
};

export default PermissionGuard;

// Higher-order component version
export const withPermissionGuard = (
  Component: React.ComponentType<any>,
  guardProps: Omit<PermissionGuardProps, 'children'>
) => {
  return function PermissionGuardedComponent(props: any) {
    return (
      <PermissionGuard {...guardProps}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
};

// Hook for conditional rendering based on permissions
export const usePermissionGuard = (
  requiredPermission?: string,
  requiredPermissions?: string[],
  requireAll = false
) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    let access = false;

    if (requiredPermission) {
      access = hasPermission(requiredPermission);
    } else if (requiredPermissions && requiredPermissions.length > 0) {
      if (requireAll) {
        access = hasAllPermissions(requiredPermissions);
      } else {
        access = hasAnyPermission(requiredPermissions);
      }
    } else {
      access = true; // No specific permission required
    }

    setHasAccess(access);
  }, [
    loading,
    requiredPermission,
    requiredPermissions,
    requireAll,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  ]);

  return {
    hasAccess,
    loading,
  };
};
