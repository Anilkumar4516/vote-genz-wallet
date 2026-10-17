'use client';

import React from 'react';
import { useAdminAuthStore } from '../store/admin-auth.store';
import { AdminPermission, AdminRole } from '../lib/rbac';

interface RoleGateProps {
  permission?: AdminPermission;
  roles?: AdminRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({
  permission,
  roles,
  children,
  fallback = null,
}) => {
  const { user, hasPermission } = useAdminAuthStore();

  if (!user) return <>{fallback}</>;

  if (roles && !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
