import React from 'react'

/**
 * Componente para controle de acesso baseado em role
 * Admin: acesso total
 * Manager: edição e visualização, sem delete
 * Employee: apenas visualização
 */
export default function RoleBasedAccess({ 
  children, 
  requiredRole = 'employee', // 'employee', 'manager', 'admin'
  fallback = null,
  currentUserRole = 'employee'
}) {
  const roleHierarchy = {
    'employee': 1,
    'manager': 2, 
    'admin': 3
  }

  const userLevel = roleHierarchy[currentUserRole] || 1
  const requiredLevel = roleHierarchy[requiredRole] || 1

  if (userLevel >= requiredLevel) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

/**
 * Hook para verificar permissões específicas
 */
export const usePermissions = (userRole = 'employee') => {
  const permissions = {
    // Permissões de Inventário
    canViewInventory: ['employee', 'manager', 'admin'].includes(userRole),
    canCreateInventory: ['manager', 'admin'].includes(userRole),
    canUpdateInventory: ['manager', 'admin'].includes(userRole),
    canDeleteInventory: userRole === 'admin',
    
    // Permissões de Allies
    canViewAllies: ['employee', 'manager', 'admin'].includes(userRole),
    canCreateAllies: ['manager', 'admin'].includes(userRole),
    canUpdateAllies: ['manager', 'admin'].includes(userRole),
    canDeleteAllies: userRole === 'admin',
    
    // Permissões de Dashboard
    canViewDashboard: ['employee', 'manager', 'admin'].includes(userRole),
    canViewMetrics: ['manager', 'admin'].includes(userRole),
    canManageSystem: userRole === 'admin'
  }

  return permissions
}
