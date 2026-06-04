'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CheckCircle2,
  PackageX,
  RefreshCw,
} from 'lucide-react';
import { adminCatalogService } from '@/services/admin-catalog.service';
import { unwrapList, unwrapObject, getApiErrorMessage } from '@/lib/admin-response';
import { StatCard } from '@/components/admin/StatCard';
import { Card } from '@/components/admin/Card';
import { ApiError } from '@/components/admin/ApiError';
import { Button } from '@/components/admin/Button';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({});
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [outOfStock, setOutOfStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
function extractDashboardList(response: any) {
  const list = unwrapList(response);
  const objectData = unwrapObject(response);

  const items =
    list.length > 0
      ? list
      : objectData?.items ||
        objectData?.products ||
        objectData?.data ||
        objectData?.rows ||
        objectData?.records ||
        [];

  return Array.isArray(items) ? items : [];
}
  async function loadDashboard() {
    setLoading(true);
    setError('');

    try {
      const [statsRes, lowRes, outRes] = await Promise.allSettled([
        adminCatalogService.statsSummary(),
        adminCatalogService.lowStock(),
        adminCatalogService.outOfStock(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(unwrapObject(statsRes.value));
      if (lowRes.status === 'fulfilled') {
  setLowStock(extractDashboardList(lowRes.value));
}

if (outRes.status === 'fulfilled') {
  setOutOfStock(extractDashboardList(outRes.value));
}

      const failed = [statsRes, lowRes, outRes].filter(
        (item) => item.status === 'rejected',
      );

      if (failed.length > 0) {
        setError('Some dashboard APIs failed. Check CORS, token, or endpoint path.');
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalProducts = stats?.totalProducts || stats?.total || stats?.products || 0;
  const publishedProducts = stats?.publishedProducts || stats?.published || 0;

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
            <BarChart3 size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950">
              Dashboard
            </h1>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Connected with live Admin Catalog APIs. Monitor products, stock and publishing status.
            </p>
          </div>
        </div>

        <Button variant="secondary" onClick={loadDashboard} disabled={loading}>
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
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard title="Total Products" value={totalProducts} />
            <StatCard title="Published Products" value={publishedProducts} />
            <StatCard title="Low Stock" value={lowStock.length} />
            <StatCard title="Out of Stock" value={outOfStock.length} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-0">
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-700">
                    <AlertTriangle size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-gray-950">
                      Low Stock Products
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Products that may need restocking soon.
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-700">
                  {lowStock.length}
                </span>
              </div>

              <div className="p-5">
                {lowStock.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                    <CheckCircle2 size={26} className="text-green-600" />
                    <p className="mt-3 text-sm font-semibold text-gray-950">
                      No low stock products
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Inventory looks healthy right now.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lowStock.slice(0, 5).map((item: any, index) => (
                      <div
                        key={item.id || index}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3 text-sm shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-950">
                            {item.name || item.title || item.productName || 'Unnamed Product'}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            Stock: {item.stock || item.quantity || item.totalStock || '-'}
                          </p>
                        </div>

                        <span className="rounded-full bg-yellow-50 px-2 py-1 text-xs font-bold text-yellow-700">
                          Low
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-0">
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                    <PackageX size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-gray-950">
                      Out of Stock Products
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Products currently unavailable for customers.
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                  {outOfStock.length}
                </span>
              </div>

              <div className="p-5">
                {outOfStock.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                    <Boxes size={26} className="text-green-600" />
                    <p className="mt-3 text-sm font-semibold text-gray-950">
                      No out of stock products
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      All listed products have available inventory.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {outOfStock.slice(0, 5).map((item: any, index) => (
                      <div
                        key={item.id || index}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3 text-sm shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-950">
                            {item.name || item.title || item.productName || 'Unnamed Product'}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            Stock: {item.stock || item.quantity || item.totalStock || 0}
                          </p>
                        </div>

                        <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-700">
                          Empty
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}