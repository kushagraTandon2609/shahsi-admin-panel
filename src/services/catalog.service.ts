import { api } from '@/lib/admin-api';

export const catalogService = {
  create: async (payload: any) => {
    const res = await api.post('/catalog', payload);
    return res.data;
  },

  list: async () => {
    const res = await api.get('/catalog');
    return res.data;
  },

  filter: async (params: any) => {
    const res = await api.get('/catalog/filter', { params });
    return res.data;
  },

  recommendations: async (params: any) => {
    const res = await api.get('/catalog/recommendations', { params });
    return res.data;
  },

  getBySlug: async (slug: string) => {
    const res = await api.get(`/catalog/slug/${slug}`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/catalog/${id}`);
    return res.data;
  },

  update: async (id: string, payload: any) => {
    const res = await api.patch(`/catalog/${id}`, payload);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/catalog/${id}`);
    return res.data;
  },

  uploadImages: async (id: string, files: File[]) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('images', file);
    });

    const res = await api.post(`/catalog/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data;
  },

  uploadVideos: async (id: string, files: File[]) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('videos', file);
    });

    const res = await api.post(`/catalog/${id}/video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data;
  },

  deleteImage: async (imageId: string) => {
    const res = await api.delete(`/catalog/images/${imageId}`);
    return res.data;
  },

  fit: async (id: string, payload?: any) => {
    const res = await api.post(`/catalog/${id}/fit`, payload || {});
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
};