'use client';

import { useEffect, useState } from 'react';
import {
  HandCoins,
  RefreshCw,
  ShoppingBag,
  Store,
  Tag,
} from 'lucide-react';
import { marketplaceService } from '@/services/marketplace.service';
import { unwrapList, getApiErrorMessage } from '@/lib/admin-response';
import { Card } from '@/components/admin/Card';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ApiError } from '@/components/admin/ApiError';
import { Button } from '@/components/admin/Button';

export default function AdminMarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadMarketplace() {
    setLoading(true);
    setError('');

    try {
      const [listingRes, offersRes] = await Promise.allSettled([
        marketplaceService.getResaleListings(),
        marketplaceService.getReceivedOffers(),
      ]);

      if (listingRes.status === 'fulfilled') {
        setListings(unwrapList(listingRes.value));
      }

      if (offersRes.status === 'fulfilled') {
        setOffers(unwrapList(offersRes.value));
      }

      const failed = [listingRes, offersRes].filter(
        (item) => item.status === 'rejected',
      );

      if (failed.length > 0) {
        setError('Some marketplace APIs failed.');
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarketplace();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
            <Store size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950">
              Marketplace / Resale
            </h1>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Connected with resale listings and received offers APIs.
            </p>
          </div>
        </div>

        <Button variant="secondary" onClick={loadMarketplace} disabled={loading}>
          <span className="flex items-center gap-2">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </span>
        </Button>
      </div>

      <div className="mt-6">
        <ApiError message={error} />
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-5">
          <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5">
          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-700">
                  <ShoppingBag size={18} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-gray-950">
                    Resale Listings
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {listings.length} listings available
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-600">
                Live
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {listings.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-14 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                            <Tag size={24} />
                          </div>

                          <p className="mt-4 text-sm font-semibold text-gray-950">
                            No resale listings found
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            Listings will appear here once sellers publish resale items.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    listings.map((item: any, index) => (
                      <tr
                        key={item.id || index}
                        className="border-b border-gray-100 transition hover:bg-gray-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400">
                              <Tag size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-950">
                                {item.title || item.name || '-'}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-500">
                                ID: {item.id || item.listingId || '-'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-medium text-gray-700">
                          {item.price || item.askingPrice || '-'}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={item.status || 'ACTIVE'} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-700">
                  <HandCoins size={18} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-gray-950">
                    Received Offers
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {offers.length} offers received
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              {offers.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-14 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
                    <HandCoins size={24} />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-gray-950">
                    No offers found
                  </p>

                  <p className="mt-1 max-w-sm text-sm text-gray-500">
                    Buyer offers will show here once they are received.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {offers.map((offer: any, index) => (
                    <div
                      key={offer.id || index}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                            Offer Amount
                          </p>

                          <p className="mt-1 text-lg font-bold text-gray-950">
                            {offer.amount || offer.offerAmount || '-'}
                          </p>
                        </div>

                        <StatusBadge status={offer.status || 'UNKNOWN'} />
                      </div>

                      <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
                        Offer ID: {offer.id || offer.offerId || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}