import { api } from '@/lib/admin-api';

type CategoryTreeParams = {
  includeInactive?: boolean;
  showProductCount?: boolean;
  showEmpty?: boolean;
  maxDepth?: number;
};

export type AdminCategoryPayload = {
  name: string;
  slug: string;
  parentId?: string;
  parentSlug?: string;
  collectionSlug?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoSlug?: string;
  imageName?: string;
  imageAltText?: string;
  themeTemplate?: string;
  metafields?: Record<string, any>;
  faqSection?: Record<string, any>;
  faqs?: {
    question: string;
    answer: string;
  }[];
};

export type AssignCategoryProductsPayload = {
  productIds: string[];
  sortOrder?: {
    productId: string;
    position: number;
  }[];
};

export type SearchCatalogProductsParams = {
  page?: number;
  limit?: number;
  q?: string;
  searchBy?: 'all' | 'title' | 'productId' | 'sku' | 'barcode';
  category?: string;
  collection?: string;
  type?: string;
  tags?: string;
  vendor?: string;
  status?: string;
  stockStatus?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export type CategoryProductsParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

function cleanCategoryPayload(payload: any) {
  const { status, ...rest } = payload || {};

  return Object.fromEntries(
    Object.entries(rest).filter(([, value]) => {
      return value !== undefined && value !== null && value !== '';
    }),
  );
}

function cleanParams(params: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== undefined && value !== null && value !== '';
    }),
  );
}

function boolToYesNo(value?: boolean) {
  return value ? 'yes' : 'no';
}

function isFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function buildCategoryProductsPayload(
  payload: AssignCategoryProductsPayload,
): AssignCategoryProductsPayload {
  const productIds = Array.from(new Set(payload.productIds || []));

  const sortOrder =
    payload.sortOrder && payload.sortOrder.length > 0
      ? payload.sortOrder
          .filter((item) => item?.productId)
          .map((item, index) => ({
            productId: item.productId,
            position:
              typeof item.position === 'number' && Number.isFinite(item.position)
                ? item.position
                : index,
          }))
      : productIds.map((productId, index) => ({
          productId,
          position: index,
        }));

  return {
    productIds,
    sortOrder,
  };
}

export const adminCategoriesService = {
  tree: async (params?: CategoryTreeParams) => {
    const res = await api.get('/admin/catalog/categories/tree', {
      params: {
        includeInactive: boolToYesNo(params?.includeInactive ?? true),
        showProductCount: boolToYesNo(params?.showProductCount ?? true),
        showEmpty: boolToYesNo(params?.showEmpty ?? true),
        maxDepth: String(params?.maxDepth ?? 20),
      },
    });

    return res.data;
  },

  createCategory: async (payload: AdminCategoryPayload) => {
    const res = await api.post(
      '/admin/catalog/categories',
      cleanCategoryPayload({
        ...payload,
        parentId: payload.parentId || undefined,
        parentSlug: payload.parentSlug || undefined,
        collectionSlug: undefined,
      }),
    );

    return res.data;
  },

  updateCategory: async (payload: AdminCategoryPayload) => {
    const res = await api.post(
      '/admin/catalog/categories',
      cleanCategoryPayload({
        ...payload,
        parentId: payload.parentId || undefined,
        parentSlug: payload.parentSlug || undefined,
        collectionSlug: undefined,
      }),
    );

    return res.data;
  },

  toggleCategoryActive: async (
    category: AdminCategoryPayload,
    isActive: boolean,
  ) => {
    const res = await api.post(
      '/admin/catalog/categories',
      cleanCategoryPayload({
        ...category,
        isActive,
        parentId: category.parentId || undefined,
        parentSlug: category.parentSlug || undefined,
        collectionSlug: undefined,
      }),
    );

    return res.data;
  },

  saveCategory: async (payload: AdminCategoryPayload) => {
    const res = await api.post(
      '/admin/catalog/categories',
      cleanCategoryPayload({
        ...payload,
        parentId: payload.parentId || undefined,
        parentSlug: payload.parentSlug || undefined,
        collectionSlug: undefined,
      }),
    );

    return res.data;
  },

  deleteCategory: async (slug: string) => {
    const res = await api.delete(
      `/admin/catalog/categories/${encodeURIComponent(slug)}`,
    );

    return res.data;
  },

  uploadCategoryImage: async (
    slug: string,
    payload: {
      file?: File | null;
      name?: string;
      altText?: string;
    },
  ) => {
    if (!payload.file || !isFile(payload.file)) {
      throw new Error('Please select a valid image file before uploading.');
    }

    const formData = new FormData();

    // Backend category image upload expects actual binary image file.
    // Do not pass previewUrl/blob URL/string here.
    formData.append('image', payload.file);

    // Sending both naming styles keeps compatibility with backend DTO.
    formData.append('imageName', payload.name || payload.file.name || '');
    formData.append('imageAltText', payload.altText || '');
    formData.append('name', payload.name || payload.file.name || '');
    formData.append('altText', payload.altText || '');

    const res = await api.post(
      `/admin/catalog/categories/${encodeURIComponent(slug)}/image`,
      formData,
    );

    return res.data;
  },

  searchCatalogProducts: async (params?: SearchCatalogProductsParams) => {
    const res = await api.get('/admin/catalog/products/search', {
      params: cleanParams({
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        q: params?.q,
        searchBy: params?.searchBy ?? 'all',
        category: params?.category,
        collection: params?.collection,
        type: params?.type,
        tags: params?.tags,
        vendor: params?.vendor,
        status: params?.status,
        stockStatus: params?.stockStatus,
        sortBy: params?.sortBy ?? 'createdAt',
        sortDirection: params?.sortDirection ?? 'desc',
      }),
    });

    return res.data;
  },

  getCategoryProducts: async (
    slug: string,
    params?: CategoryProductsParams,
  ) => {
    const res = await api.get(
      `/admin/catalog/categories/${encodeURIComponent(slug)}/products`,
      {
        params: cleanParams({
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          sortBy: params?.sortBy ?? 'manual',
          sortDirection: params?.sortDirection ?? 'asc',
        }),
      },
    );

    return res.data;
  },

  updateCategoryProducts: async (
    slug: string,
    payload: AssignCategoryProductsPayload,
  ) => {
    const res = await api.patch(
      `/admin/catalog/categories/${encodeURIComponent(slug)}/products`,
      buildCategoryProductsPayload(payload),
    );

    return res.data;
  },

  removeCategoryProduct: async (slug: string, productId: string) => {
    const res = await api.delete(
      `/admin/catalog/categories/${encodeURIComponent(
        slug,
      )}/products/${encodeURIComponent(productId)}`,
    );

    return res.data;
  },

  seedDefaultTree: async (payload?: {
    clearExisting?: boolean;
    nodes?: any[];
  }) => {
    const res = await api.post('/admin/catalog/categories/ecommerce-tree/seed', {
      clearExisting: payload?.clearExisting ?? false,
      nodes: payload?.nodes || [],
    });

    return res.data;
  },

  createRootCollection: async (payload: AdminCategoryPayload) => {
    const res = await api.post(
      '/admin/catalog/categories',
      cleanCategoryPayload({
        ...payload,
        parentId: undefined,
        parentSlug: undefined,
        collectionSlug: undefined,
      }),
    );

    return res.data;
  },

  updateRootCollection: async (payload: AdminCategoryPayload) => {
    const res = await api.post(
      '/admin/catalog/categories',
      cleanCategoryPayload({
        ...payload,
        parentId: undefined,
        parentSlug: undefined,
        collectionSlug: undefined,
      }),
    );

    return res.data;
  },

  createChildCategory: async (payload: {
    name: string;
    slug: string;
    description?: string;
    parentSlug: string;
    isActive?: boolean;
    sortOrder?: number;
    seoTitle?: string;
    seoDescription?: string;
    seoSlug?: string;
    imageName?: string;
    imageAltText?: string;
    themeTemplate?: string;
    metafields?: Record<string, any>;
    faqs?: {
      question: string;
      answer: string;
    }[];
  }) => {
    const res = await api.post(
      '/admin/catalog/categories',
      cleanCategoryPayload({
        name: payload.name,
        slug: payload.slug,
        description: payload.description || '',
        parentSlug: payload.parentSlug,
        collectionSlug: undefined,
        isActive: payload.isActive ?? true,
        sortOrder: payload.sortOrder ?? 1,
        seoTitle: payload.seoTitle,
        seoDescription: payload.seoDescription,
        seoSlug: payload.seoSlug,
        imageName: payload.imageName,
        imageAltText: payload.imageAltText,
        themeTemplate: payload.themeTemplate,
        metafields: payload.metafields,
        faqs: payload.faqs,
      }),
    );

    return res.data;
  },

  updateChildCategory: async (payload: AdminCategoryPayload) => {
    const res = await api.post(
      '/admin/catalog/categories',
      cleanCategoryPayload({
        ...payload,
        parentId: payload.parentId || undefined,
        parentSlug: payload.parentSlug || undefined,
        collectionSlug: undefined,
      }),
    );

    return res.data;
  },

  deleteCollection: async (slug: string) => {
    const res = await api.delete(
      `/admin/catalog/categories/${encodeURIComponent(slug)}`,
    );

    return res.data;
  },

  getCollectionProducts: async (slug: string) => {
    const res = await api.get(
      `/admin/catalog/categories/${encodeURIComponent(slug)}/products`,
      {
        params: {
          page: 1,
          limit: 20,
          sortBy: 'manual',
          sortDirection: 'asc',
        },
      },
    );

    return res.data;
  },

  updateCollectionProducts: async (
    slug: string,
    payload: AssignCategoryProductsPayload,
  ) => {
    const res = await api.patch(
      `/admin/catalog/categories/${encodeURIComponent(slug)}/products`,
      buildCategoryProductsPayload(payload),
    );

    return res.data;
  },

  removeCollectionProduct: async (slug: string, productId: string) => {
    const res = await api.delete(
      `/admin/catalog/categories/${encodeURIComponent(
        slug,
      )}/products/${encodeURIComponent(productId)}`,
    );

    return res.data;
  },
};