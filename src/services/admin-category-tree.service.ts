import { api } from '@/lib/admin-api';

export type CategoryTreeLayout = 'tree_indented' | 'accordion' | 'flat';
export type CategoryTreeIconStyle = 'plus_minus' | 'arrow' | 'folder' | 'custom';

export type CategoryTreeSettingsPayload = {
  layout: CategoryTreeLayout;
  enableExpandCollapse: boolean;
  expandAllByDefault: boolean;
  showProductCount: boolean;
  showEmptyCategories: boolean;
  maximumTreeDepth: number;
  treeIconStyle: CategoryTreeIconStyle;
};

export type CategoryTreeQueryParams = {
  includeInactive?: boolean;
  showProductCount?: boolean;
  showEmpty?: boolean;
  maxDepth?: number;
};

function boolToYesNo(value?: boolean) {
  return value ? 'yes' : 'no';
}

export const adminCategoryTreeService = {
  getSettings: async () => {
    const res = await api.get('/admin/settings/category-tree-display');
    return res.data;
  },

  createSettings: async (payload: CategoryTreeSettingsPayload) => {
    const res = await api.post('/admin/settings/category-tree-display', payload);
    return res.data;
  },

  updateSettings: async (payload: CategoryTreeSettingsPayload) => {
    const res = await api.patch('/admin/settings/category-tree-display', payload);
    return res.data;
  },

  getAdminCategoryTree: async (params: CategoryTreeQueryParams = {}) => {
    const res = await api.get('/admin/catalog/categories/tree', {
      params: {
        includeInactive: boolToYesNo(params.includeInactive ?? true),
        showProductCount: boolToYesNo(params.showProductCount ?? true),
        showEmpty: boolToYesNo(params.showEmpty ?? true),
        maxDepth: String(params.maxDepth || 20),
      },
    });

    return res.data;
  },

  getPublicCategoryTree: async (
    params: Omit<CategoryTreeQueryParams, 'includeInactive'> = {},
  ) => {
    const res = await api.get('/catalog/categories/tree', {
      params: {
        showProductCount: boolToYesNo(params.showProductCount ?? true),
        showEmpty: boolToYesNo(params.showEmpty ?? true),
        maxDepth: String(params.maxDepth || 20),
      },
    });

    return res.data;
  },
};