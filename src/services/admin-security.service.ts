import { api } from '@/lib/admin-api';

type QueryParams = Record<string, any>;

export const adminSecurityService = {
  getSecurity: async (params?: QueryParams) => {
    const res = await api.get('/admin/security', { params });
    return res.data;
  },

  getIpRules: async (params?: QueryParams) => {
    const res = await api.get('/admin/security/ip-rules', { params });
    return res.data;
  },

  getSessionLogs: async (params?: QueryParams) => {
    const res = await api.get('/admin/security/session-logs', { params });
    return res.data;
  },

  getFraudRules: async (params?: QueryParams) => {
    const res = await api.get('/admin/security/fraud-rules', { params });
    return res.data;
  },

  getGdpr: async (params?: QueryParams) => {
    const res = await api.get('/admin/compliance/gdpr', { params });
    return res.data;
  },

  getPci: async (params?: QueryParams) => {
    const res = await api.get('/admin/compliance/pci', { params });
    return res.data;
  },
};