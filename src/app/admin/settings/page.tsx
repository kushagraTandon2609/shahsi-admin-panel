'use client';

import { FormEvent, useEffect, useState } from 'react';
import { RefreshCw, Settings, SlidersHorizontal } from 'lucide-react';
import { adminSettingsService } from '@/services/admin-settings.service';
import { unwrapList, getApiErrorMessage } from '@/lib/admin-response';
import { Card } from '@/components/admin/Card';
import { Input } from '@/components/admin/Input';
import { Button } from '@/components/admin/Button';
import { ApiError } from '@/components/admin/ApiError';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadSettings() {
    setLoading(true);
    setError('');

    try {
      const res = await adminSettingsService.list();
      setSettings(unwrapList(res));
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function createSetting(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await adminSettingsService.create({ key, value });
      setKey('');
      setValue('');
      await loadSettings();
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
            <Settings size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950">
              Admin Settings
            </h1>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Manage key-value configuration used by the admin panel and backend.
            </p>
          </div>
        </div>

        <Button variant="secondary" onClick={loadSettings} disabled={loading}>
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
                <SlidersHorizontal size={18} />
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Create Setting
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Add a new configuration key and value.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={createSetting} className="space-y-4 px-5 py-5">
            <Input
              label="Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="example_key"
            />

            <Input
              label="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="example value"
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={saving || !key || !value}>
                {saving ? 'Saving...' : 'Save Setting'}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-gray-950">
                Settings List
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {settings.length} settings available
              </p>
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
            ) : settings.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-14 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
                  <Settings size={24} />
                </div>

                <p className="mt-4 text-sm font-semibold text-gray-950">
                  No settings found
                </p>

                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  Create your first admin setting using the form on the left.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {settings.map((setting: any, index) => (
                  <div
                    key={setting.id || setting.key || index}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-950">
                          {setting.key || setting.name || '-'}
                        </p>

                        <p className="mt-1 break-words text-sm leading-6 text-gray-500">
                          {String(setting.value || setting.data || '-')}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                        Config
                      </span>
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