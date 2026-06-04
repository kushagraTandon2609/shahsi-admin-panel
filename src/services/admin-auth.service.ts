import { api } from '@/lib/admin-api';

export type AdminLoginPayload = {
  email: string;
  password: string;
};

export const adminAuthService = {
  login: async (payload: AdminLoginPayload) => {
    try {
      const res = await api.post('/auth/login', payload);
      return res.data;
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        throw error;
      }

      const res = await api.post('/admin/auth/login', payload);
      return res.data;
    }
  },

  me: async () => {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        throw error;
      }

      const res = await api.get('/admin/auth/me');
      return res.data;
    }
  },

  checkAdmin: async () => {
    try {
      const res = await api.get('/auth/admin');
      return res.data;
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        throw error;
      }

      const res = await api.get('/admin/auth/me');
      return res.data;
    }
  },
};