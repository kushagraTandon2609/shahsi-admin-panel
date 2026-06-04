import {
  BarChart3,
  Boxes,
  ClipboardList,
  Home,
  KeyRound,
  ListTree,
  Lock,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from 'lucide-react';

export const adminMenuConfig = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: Home,
    status: 'active',
  },
  {
    label: 'Catalog',
    path: '/admin/catalog',
    icon: Boxes,
    status: 'active',
  },
  {
  label: 'Categories',
  path: '/admin/category-tree',
  icon: ListTree,
  status: 'active',
},
  {
    label: 'Orders',
    path: '/admin/orders',
    icon: ShoppingBag,
    status: 'pending',
  },
  {
    label: 'Marketplace',
    path: '/admin/marketplace',
    icon: Store,
    status: 'active',
  },
  {
    label: 'Rental',
    path: '/admin/rental',
    icon: Truck,
    status: 'active',
  },
  {
    label: 'Analytics',
    path: '/admin/analytics',
    icon: BarChart3,
    status: 'pending',
  },
  {
    label: 'Roles',
    path: '/admin/roles',
    icon: KeyRound,
    status: 'active',
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    icon: Settings,
    status: 'active',
  },

  {
    label: 'Security',
    path: '/admin/security',
    icon: ShieldCheck,
    status: 'active',
  },
  {
    label: 'Audit Logs',
    path: '/admin/audit',
    icon: ClipboardList,
    status: 'active',
  },
  {
    label: 'Permissions',
    path: '/admin/permissions',
    icon: Lock,
    status: 'pending',
  },
] as const;