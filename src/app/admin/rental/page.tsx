'use client';

import { FormEvent, useEffect, useState } from 'react';
import { CalendarDays, RefreshCw, Sparkles, Truck } from 'lucide-react';
import { adminRentalService } from '@/services/admin-rental.service';
import { unwrapList, getApiErrorMessage } from '@/lib/admin-response';
import { Card } from '@/components/admin/Card';
import { Button } from '@/components/admin/Button';
import { Input } from '@/components/admin/Input';
import { ApiError } from '@/components/admin/ApiError';

export default function AdminRentalPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadPlans() {
    setLoading(true);
    setError('');

    try {
      const res = await adminRentalService.getSubscriptionPlans();
      setPlans(unwrapList(res));
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function createPlan(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await adminRentalService.createSubscriptionPlan({
        name,
        price: Number(price),
      });

      setName('');
      setPrice('');

      await loadPlans();
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
            <Truck size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950">
              Rental Admin
            </h1>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Connected with admin rental subscription plan APIs.
            </p>
          </div>
        </div>

        <Button variant="secondary" onClick={loadPlans} disabled={loading}>
          <span className="flex items-center gap-2">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </span>
        </Button>
      </div>

      <div className="mt-6">
        <ApiError message={error} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="p-0">
          <div className="border-b border-gray-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-700">
                <Sparkles size={18} />
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Create Subscription Plan
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Add a new rental plan with name and price.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={createPlan} className="space-y-4 px-5 py-5">
            <Input
              label="Plan Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Premium Bridal Rental"
            />

            <Input
              label="Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="999"
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={saving || !name || !price}>
                {saving ? 'Creating...' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-700">
                <CalendarDays size={18} />
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Subscription Plans
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  {plans.length} plans available
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-2xl bg-gray-100"
                  />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-14 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
                  <CalendarDays size={24} />
                </div>

                <p className="mt-4 text-sm font-semibold text-gray-950">
                  No plans found
                </p>

                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  Create your first rental subscription plan using the form on the left.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {plans.map((plan: any, index) => (
                  <div
                    key={plan.id || index}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-950">
                          {plan.name || plan.title || 'Plan'}
                        </p>

                        <p className="mt-1 text-lg font-bold text-gray-950">
                          ₹{plan.price || plan.amount || '-'}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                        Rental
                      </span>
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
                      Plan ID: {plan.id || plan.planId || '-'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}