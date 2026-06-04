import { api } from '@/lib/admin-api';

type QueryParams = Record<string, any>;

export const marketplaceService = {
  getResaleListings: async (params?: QueryParams) => {
    const res = await api.get('/marketplace/resale/listings', { params });
    return res.data;
  },

  getResaleListing: async (id: string) => {
    const res = await api.get(`/marketplace/resale/listings/${id}`);
    return res.data;
  },

  getReceivedOffers: async (params?: QueryParams) => {
    const res = await api.get('/marketplace/resale/offers/received', {
      params,
    });
    return res.data;
  },

  acceptOffer: async (offerId: string) => {
    const res = await api.patch(
      `/marketplace/resale/offers/${offerId}/accept`,
      {},
    );
    return res.data;
  },

  declineOffer: async (offerId: string) => {
    const res = await api.patch(
      `/marketplace/resale/offers/${offerId}/decline`,
      {},
    );
    return res.data;
  },
};