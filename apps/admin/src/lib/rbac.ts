/**
 * Role-Based Access Control (RBAC) System for Electoral Commission Console
 */

export type AdminRole = 'SUPER_ADMIN' | 'COMMISSIONER' | 'AUDITOR' | 'OPERATOR';

export type AdminPermission =
  | 'VIEW_OVERVIEW'
  | 'VIEW_VOTERS'
  | 'REGISTER_VOTERS'
  | 'BULK_IMPORT_VOTERS'
  | 'VIEW_ELECTIONS'
  | 'MANAGE_ELECTIONS'
  | 'INITIATE_KEY_CEREMONY'
  | 'SUBMIT_KEY_SHARE'
  | 'VIEW_CANDIDATES'
  | 'MANAGE_CANDIDATES'
  | 'VIEW_RESULTS'
  | 'VIEW_AUDIT_LOGS'
  | 'VERIFY_AUDIT_CHAIN';

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    'VIEW_OVERVIEW',
    'VIEW_VOTERS',
    'REGISTER_VOTERS',
    'BULK_IMPORT_VOTERS',
    'VIEW_ELECTIONS',
    'MANAGE_ELECTIONS',
    'INITIATE_KEY_CEREMONY',
    'SUBMIT_KEY_SHARE',
    'VIEW_CANDIDATES',
    'MANAGE_CANDIDATES',
    'VIEW_RESULTS',
    'VIEW_AUDIT_LOGS',
    'VERIFY_AUDIT_CHAIN',
  ],
  COMMISSIONER: [
    'VIEW_OVERVIEW',
    'VIEW_VOTERS',
    'VIEW_ELECTIONS',
    'MANAGE_ELECTIONS',
    'INITIATE_KEY_CEREMONY',
    'SUBMIT_KEY_SHARE',
    'VIEW_CANDIDATES',
    'MANAGE_CANDIDATES',
    'VIEW_RESULTS',
    'VIEW_AUDIT_LOGS',
  ],
  AUDITOR: [
    'VIEW_OVERVIEW',
    'VIEW_ELECTIONS',
    'VIEW_RESULTS',
    'VIEW_AUDIT_LOGS',
    'VERIFY_AUDIT_CHAIN',
  ],
  OPERATOR: [
    'VIEW_OVERVIEW',
    'VIEW_VOTERS',
    'REGISTER_VOTERS',
    'BULK_IMPORT_VOTERS',
    'VIEW_CANDIDATES',
  ],
};

export function hasPermission(role: AdminRole | null | undefined, permission: AdminPermission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function getRoleBadgeStyle(role: AdminRole): { bg: string; text: string; border: string } {
  switch (role) {
    case 'SUPER_ADMIN':
      return { bg: 'bg-rose-100', text: 'text-rose-800 font-extrabold', border: 'border-rose-300' };
    case 'COMMISSIONER':
      return { bg: 'bg-amber-100', text: 'text-amber-900 font-extrabold', border: 'border-yellow-300' };
    case 'AUDITOR':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800 font-extrabold', border: 'border-emerald-300' };
    case 'OPERATOR':
      return { bg: 'bg-blue-100', text: 'text-blue-800 font-extrabold', border: 'border-blue-300' };
  }
}
