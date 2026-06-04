import { api } from '@/lib/admin-api';

type AuditExportPayload = Record<string, any>;

export const adminAuditService = {
  getEntityHistory: async (type: string, id: string) => {
    const safeType = encodeURIComponent(type);
    const safeId = encodeURIComponent(id);

    const res = await api.get(`/admin/audit/entity/${safeType}/${safeId}`);
    return res.data;
  },

  exportAudit: async (payload: AuditExportPayload) => {
    const res = await api.post('/admin/audit/export', payload);
    return res.data;
  },
};