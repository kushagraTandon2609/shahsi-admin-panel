import { api } from '@/lib/admin-api';

type QueryParams = Record<string, any>;

export const adminRolesService = {
  createRole: async (payload: any) => {
    const res = await api.post('/admin/roles', payload);
    return res.data;
  },

  listRoles: async (params?: QueryParams) => {
    const res = await api.get('/admin/roles', { params });
    return res.data;
  },

  updateRole: async (id: string, payload: any) => {
    const res = await api.patch(`/admin/roles/${id}`, payload);
    return res.data;
  },

  updatePermissions: async (id: string, payload: any) => {
    const res = await api.patch(`/admin/roles/${id}/permissions`, payload);
    return res.data;
  },
};