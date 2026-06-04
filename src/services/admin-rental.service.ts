import { api } from '@/lib/admin-api';

type QueryParams = Record<string, any>;

export const adminRentalService = {
  createInventoryUnit: async (payload: any) => {
    const res = await api.post('/admin/rental/inventory-unit', payload);
    return res.data;
  },

  createPricingRule: async (payload: any) => {
    const res = await api.post('/admin/rental/pricing-rule', payload);
    return res.data;
  },

  createSubscriptionPlan: async (payload: any) => {
    const res = await api.post('/admin/rental/subscription-plan', payload);
    return res.data;
  },

  getSubscriptionPlans: async (params?: QueryParams) => {
    const res = await api.get('/admin/rental/subscription-plan', { params });
    return res.data;
  },

  markReturned: async (bookingId: string) => {
    const res = await api.patch(
      `/admin/rental/booking/${bookingId}/return`,
      {},
    );
    return res.data;
  },

  markCleaningComplete: async (bookingId: string) => {
    const res = await api.patch(
      `/admin/rental/booking/${bookingId}/cleaning-complete`,
      {},
    );
    return res.data;
  },
};