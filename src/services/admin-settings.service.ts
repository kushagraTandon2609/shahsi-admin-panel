import { api } from '@/lib/admin-api';

type QueryParams = Record<string, any>;

export const adminSettingsService = {
  create: async (payload: any) => {
    const res = await api.post('/admin/settings', payload);
    return res.data;
  },

  list: async (params?: QueryParams) => {
    const res = await api.get('/admin/settings', { params });
    return res.data;
  },

  getByKey: async (key: string) => {
    const res = await api.get(`/admin/settings/${key}`);
    return res.data;
  },

  updateByKey: async (key: string, payload: any) => {
    const res = await api.patch(`/admin/settings/${key}`, payload);
    return res.data;
  },

  deleteByKey: async (key: string) => {
    const res = await api.delete(`/admin/settings/${key}`);
    return res.data;
  },

  currency: async () => {
    const res = await api.get('/admin/settings/currency');
    return res.data;
  },

  tax: async () => {
    const res = await api.get('/admin/settings/tax');
    return res.data;
  },

  upsertTax: async (payload: any) => {
    const res = await api.post('/admin/settings/tax', payload);
    return res.data;
  },

  upsertLocalization: async (payload: any) => {
    const res = await api.post('/admin/settings/localization', payload);
    return res.data;
  },
};