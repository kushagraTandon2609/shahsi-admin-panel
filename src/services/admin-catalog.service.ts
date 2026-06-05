import { api } from '@/lib/admin-api';

type QueryParams = Record<string, any>;

type VariantStockPayload = {
  stock: number;
  isAvailable: boolean;
};

function makeFormData(
  fieldName: 'images' | 'video' | 'videos',
  input: FormData | File[] | FileList,
) {
  if (input instanceof FormData) {
    const formData = new FormData();

    input.forEach((value, key) => {
      if (value instanceof File) {
        formData.append(fieldName, value);
      } else {
        formData.append(key, value);
      }
    });

    return formData;
  }

  const formData = new FormData();

  Array.from(input).forEach((file) => {
    if (file instanceof File) {
      formData.append(fieldName, file);
    }
  });

  return formData;
}

function getFilesFromInput(input: FormData | File[] | FileList) {
  if (input instanceof FormData) {
    const files: File[] = [];

    input.forEach((value) => {
      if (value instanceof File) {
        files.push(value);
      }
    });

    return files;
  }

  return Array.from(input).filter((file): file is File => file instanceof File);
}

export const adminCatalogService = {
  // =====================================================
  // PUBLIC CATALOG APIs
  // =====================================================

  create: async (payload: any) => {
    const res = await api.post('/catalog', payload);
    return res.data;
  },

  publicList: async (params?: QueryParams) => {
    const res = await api.get('/catalog', { params });
    return res.data;
  },

  updateInventory: async (
    productId: string,
    payload: {
      stock: number;
    },
  ) => {
    const res = await api.patch(
      `/admin/catalog/${encodeURIComponent(productId)}/inventory`,
      payload,
    );

    return res.data;
  },

  filter: async (params?: QueryParams) => {
    const res = await api.get('/catalog/filter', { params });
    return res.data;
  },

  recommendations: async (params?: QueryParams) => {
    const res = await api.get('/catalog/recommendations', { params });
    return res.data;
  },

  getProductPicker: async (params?: any) => {
    const res = await api.get('/admin/catalog/products/picker', {
      params: {
        search: params?.search || undefined,
        searchBy: params?.searchBy || 'all',
        category: params?.category || undefined,
        collection: params?.collection || undefined,
        type: params?.type || undefined,
        tag: params?.tag || undefined,
        vendor: params?.vendor || undefined,
        status: params?.status || 'all',
        page: params?.page || 1,
        limit: params?.limit || 50,
      },
    });

    return res.data;
  },

  updateProductMetafields: async (productId: string, payload: any) => {
    const res = await api.patch(
      `/admin/catalog/${encodeURIComponent(productId)}/metafields`,
      payload,
    );

    return res.data;
  },

  getBySlug: async (slug: string) => {
    const res = await api.get(`/catalog/slug/${encodeURIComponent(slug)}`);
    return res.data;
  },

  publicDetail: async (id: string) => {
    const res = await api.get(`/catalog/${encodeURIComponent(id)}`);
    return res.data;
  },

  update: async (id: string, payload: any) => {
    const res = await api.patch(`/catalog/${encodeURIComponent(id)}`, payload);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/catalog/${encodeURIComponent(id)}`);
    return res.data;
  },

  // =====================================================
  // PUBLIC PRODUCT MEDIA UPLOAD APIs
  // Swagger:
  // POST /catalog/{id}/images
  // POST /catalog/{id}/video
  // =====================================================

  uploadImages: async (id: string, input: FormData | File[] | FileList) => {
    const formData = makeFormData('images', input);

    const res = await api.post(
      `/catalog/${encodeURIComponent(id)}/images`,
      formData,
    );

    return res.data;
  },

  uploadImage: async (id: string, input: FormData | File[] | FileList) => {
    const formData = makeFormData('images', input);

    const res = await api.post(
      `/catalog/${encodeURIComponent(id)}/images`,
      formData,
    );

    return res.data;
  },

  uploadVideo: async (id: string, input: FormData | File[] | FileList) => {
    const files = getFilesFromInput(input);

    if (files.length === 0) {
      const formData = makeFormData('video', input);

      const res = await api.post(
        `/catalog/${encodeURIComponent(id)}/video`,
        formData,
      );

      return res.data;
    }

    const results = [];

    for (const file of files) {
      const formData = new FormData();
     formData.append('file', file);

      const res = await api.post(
        `/catalog/${encodeURIComponent(id)}/video`,
        formData,
      );

      results.push(res.data);
    }

    return results.length === 1 ? results[0] : results;
  },

  uploadVideos: async (id: string, input: FormData | File[] | FileList) => {
  const files = getFilesFromInput(input);

  const formData = new FormData();

  if (files.length > 0) {
    for (const file of files) {
      // Backend Swagger ke according field name "videos" hai
      formData.append('videos', file);
    }
  } else if (input instanceof FormData) {
    input.forEach((value) => {
      if (value instanceof File) {
        formData.append('videos', value);
      }
    });
  }

  const res = await api.post(
    `/catalog/${encodeURIComponent(id)}/video`,
    formData,
  );

  return res.data;
},
  deleteImage: async (imageId: string) => {
    const res = await api.delete(
      `/catalog/images/${encodeURIComponent(imageId)}`,
    );
    return res.data;
  },

  fit: async (id: string, payload: any = {}) => {
    const res = await api.post(`/catalog/${encodeURIComponent(id)}/fit`, payload);
    return res.data;
  },

  publicCategoryTree: async (params?: {
    showProductCount?: boolean;
    showEmpty?: boolean;
    maxDepth?: number;
  }) => {
    const res = await api.get('/catalog/categories/tree', {
      params: {
        showProductCount: params?.showProductCount ?? true,
        showEmpty: params?.showEmpty ?? true,
        maxDepth: params?.maxDepth ?? 10,
      },
    });

    return res.data;
  },

  updateRelatedProducts: async (
    id: string,
    payload: {
      relatedProductIds: string[];
      similarStyleProductIds?: string[];
    },
  ) => {
    const res = await api.patch(
      `/admin/catalog/${encodeURIComponent(id)}/related-products`,
      payload,
    );
    return res.data;
  },

  // =====================================================
  // ADMIN CATALOG LISTING APIs
  // =====================================================

  list: async (params?: QueryParams) => {
    const res = await api.get('/admin/catalog', { params });
    return res.data;
  },

  listWithFallback: async (params?: QueryParams) => {
    try {
      const adminRes = await api.get('/admin/catalog', { params });
      return adminRes.data;
    } catch {
      const publicRes = await api.get('/catalog', { params });
      return publicRes.data;
    }
  },

  statsSummary: async () => {
    const res = await api.get('/admin/catalog/stats/summary');
    return res.data;
  },

  lowStock: async () => {
    const res = await api.get('/admin/catalog/low-stock');
    return res.data;
  },

  outOfStock: async () => {
    const res = await api.get('/admin/catalog/out-of-stock');
    return res.data;
  },

  validationErrors: async () => {
    const res = await api.get('/admin/catalog/validation-errors');
    return res.data;
  },

  // =====================================================
  // ADMIN PRODUCT DETAIL APIs
  // =====================================================

  detail: async (id: string) => {
    const res = await api.get(`/admin/catalog/${encodeURIComponent(id)}/detail`);
    return res.data;
  },

  media: async (id: string) => {
    const res = await api.get(`/admin/catalog/${encodeURIComponent(id)}/media`);
    return res.data;
  },

  statusHistory: async (id: string) => {
    const res = await api.get(
      `/admin/catalog/${encodeURIComponent(id)}/status-history`,
    );
    return res.data;
  },

  relations: async (id: string) => {
    const res = await api.get(
      `/admin/catalog/${encodeURIComponent(id)}/relations`,
    );
    return res.data;
  },

  // =====================================================
  // ADMIN PRODUCT SECTION UPDATE APIs
  // =====================================================

  updateBasicInfo: async (id: string, payload: any) => {
    const res = await api.patch(`/admin/catalog/${encodeURIComponent(id)}/basic-info`, {
      title: payload.title,
      name: payload.name,
      description: payload.description,
      shortDescription: payload.shortDescription,

      category: payload.category,

      productType: payload.productType,

      vendor: payload.vendor,

      color: payload.color,
      fabric: payload.fabric,
      occasion: payload.occasion,
      style: payload.style,
      print: payload.print,
      badge: payload.badge,

      metafields: payload.metafields,
      similarProductIds: payload.similarProductIds,
      relatedProductIds: payload.relatedProductIds,
    });

    return res.data;
  },

  updateCommerceSettings: async (id: string, payload: any) => {
    const res = await api.patch(
      `/admin/catalog/${encodeURIComponent(id)}/commerce-settings`,
      payload,
    );
    return res.data;
  },

  updatePricing: async (id: string, payload: any) => {
    const res = await api.patch(
      `/admin/catalog/${encodeURIComponent(id)}/pricing`,
      payload,
    );
    return res.data;
  },

  updateAvailability: async (id: string, payload: any) => {
    const res = await api.patch(
      `/admin/catalog/${encodeURIComponent(id)}/availability`,
      payload,
    );
    return res.data;
  },

  updateTags: async (id: string, payload: any) => {
    const res = await api.patch(
      `/admin/catalog/${encodeURIComponent(id)}/tags`,
      payload,
    );
    return res.data;
  },

  updateCollections: async (id: string, payload: any) => {
    const res = await api.patch(
      `/admin/catalog/${encodeURIComponent(id)}/collections`,
      payload,
    );
    return res.data;
  },

  updateSeo: async (id: string, payload: any) => {
    const res = await api.patch(
      `/admin/catalog/${encodeURIComponent(id)}/seo`,
      payload,
    );
    return res.data;
  },

  // =====================================================
  // STATUS / PUBLISH APIs
  // =====================================================

  updateStatus: async (id: string, payload: any) => {
    const res = await api.patch(
      `/admin/catalog/${encodeURIComponent(id)}/status`,
      payload,
    );
    return res.data;
  },

  publish: async (id: string, payload: any = {}) => {
    const res = await api.patch(
      `/admin/catalog/${encodeURIComponent(id)}/publish`,
      payload,
    );
    return res.data;
  },

  unpublish: async (id: string, payload: any = {}) => {
    const res = await api.patch(
      `/admin/catalog/${encodeURIComponent(id)}/unpublish`,
      payload,
    );
    return res.data;
  },

  duplicate: async (id: string) => {
    const res = await api.post(
      `/admin/catalog/${encodeURIComponent(id)}/duplicate`,
    );
    return res.data;
  },

  // =====================================================
  // IMAGE MANAGEMENT APIs
  // Swagger:
  // PATCH /admin/catalog/{id}/images/{imageId}
  // PATCH /admin/catalog/{id}/images/reorder
  // PATCH /admin/catalog/{id}/images/{imageId}/primary
  // =====================================================

  updateImage: async (imageId: string, payload: any) => {
  const res = await api.patch(
    `/admin/catalog/images/${encodeURIComponent(imageId)}`,
    payload,
  );

  return res.data;
},

reorderImages: async (id: string, imageIds: string[]) => {
  const cleanImageIds = imageIds
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  const res = await api.patch(
    `/admin/catalog/${encodeURIComponent(id)}/images/reorder`,
    {
      imageIds: cleanImageIds,
    },
  );

  return res.data;
},

  setPrimaryImage: async (id: string, imageId: string) => {
    const res = await api.patch(
      `/admin/catalog/${encodeURIComponent(id)}/images/${encodeURIComponent(
        imageId,
      )}/primary`,
      {},
    );

    return res.data;
  },

  // =====================================================
  // VARIANT APIs
  // =====================================================

  createVariant: async (productId: string, payload: any) => {
    const res = await api.post(
      `/admin/catalog/${encodeURIComponent(productId)}/variants`,
      payload,
    );
    return res.data;
  },

  getVariants: async (productId: string) => {
    const res = await api.get(
      `/admin/catalog/${encodeURIComponent(productId)}/variants`,
    );
    return res.data;
  },

  updateVariant: async (productId: string, variantId: string, payload: any) => {
    const res = await api.patch(
      `/admin/catalog/${encodeURIComponent(productId)}/variants/${encodeURIComponent(
        variantId,
      )}`,
      payload,
    );

    return res.data;
  },

  deleteVariant: async (productId: string, variantId: string) => {
    const res = await api.delete(
      `/admin/catalog/${encodeURIComponent(productId)}/variants/${encodeURIComponent(
        variantId,
      )}`,
    );

    return res.data;
  },

  updateVariantStock: async (
    productId: string,
    variantId: string,
    payload: VariantStockPayload,
  ) => {
    const res = await api.patch(
      `/admin/catalog/${encodeURIComponent(productId)}/variants/${encodeURIComponent(
        variantId,
      )}/stock`,
      payload,
    );

    return res.data;
  },

  // =====================================================
  // BULK APIs
  // =====================================================

  bulkStatus: async (payload: {
    ids: string[];
    status: string;
    publishedAt?: string;
  }) => {
    const res = await api.post('/admin/catalog/bulk/status', payload);
    return res.data;
  },

  bulkPublish: async (payload: { ids: string[] }) => {
    const res = await api.post('/admin/catalog/bulk/publish', payload);
    return res.data;
  },

  bulkUnpublish: async (payload: { ids: string[] }) => {
    const res = await api.post('/admin/catalog/bulk/unpublish', payload);
    return res.data;
  },

  bulkDelete: async (idsOrPayload: string[] | { ids: string[] }) => {
    const payload = Array.isArray(idsOrPayload)
      ? { ids: idsOrPayload }
      : idsOrPayload;

    const res = await api.delete('/admin/catalog/bulk', {
      data: payload,
    });

    return res.data;
  },

  bulkUpdate: async (payload: any) => {
    const res = await api.post('/admin/catalog/bulk-update', payload);
    return res.data;
  },

  bulkImport: async (input: FormData) => {
    const res = await api.post('/admin/catalog/bulk-import', input);
    return res.data;
  },

  bulkExport: async (payload: any) => {
    const res = await api.post('/admin/catalog/bulk-export', payload);
    return res.data;
  },

  // =====================================================
  // ADMIN CATEGORY TREE
  // =====================================================

  adminCategoryTree: async (params?: {
    includeInactive?: boolean;
    showProductCount?: boolean;
    showEmpty?: boolean;
    maxDepth?: number;
  }) => {
    const res = await api.get('/admin/catalog/categories/tree', {
      params: {
        includeInactive: params?.includeInactive ?? true,
        showProductCount: params?.showProductCount ?? true,
        showEmpty: params?.showEmpty ?? true,
        maxDepth: params?.maxDepth ?? 10,
      },
    });

    return res.data;
  },

  // =====================================================
  // ADMIN MASTER DATA APIs
  // =====================================================

  createOrUpdateCollection: async (payload: any) => {
    const res = await api.post('/admin/catalog/collections', payload);
    return res.data;
  },

  createOrUpdateCategory: async (payload: any) => {
    const res = await api.post('/admin/catalog/categories', payload);
    return res.data;
  },
};