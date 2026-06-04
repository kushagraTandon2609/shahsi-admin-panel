'use client';

import { FormEvent, useState } from 'react';
import {
  ClipboardList,
  FileSearch,
  Loader2,
  Search,
  TerminalSquare,
} from 'lucide-react';
import { adminAuditService } from '@/services/admin-audit.service';
import { getApiErrorMessage } from '@/lib/admin-response';
import { Card } from '@/components/admin/Card';
import { Button } from '@/components/admin/Button';
import { Input } from '@/components/admin/Input';
import { ApiError } from '@/components/admin/ApiError';

export default function AdminAuditPage() {
  const [type, setType] = useState('PRODUCT');
  const [entityId, setEntityId] = useState('');
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function searchAudit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await adminAuditService.getEntityHistory(type, entityId);
      setHistory(res);
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
            <ClipboardList size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950">
              Audit Logs
            </h1>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Search audit history by entity type and entity ID.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ApiError message={error} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="p-0">
          <div className="border-b border-gray-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-700">
                <FileSearch size={18} />
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Search Entity History
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Enter entity type and ID to fetch audit history.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={searchAudit} className="space-y-4 px-5 py-5">
            <Input
              label="Entity Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="PRODUCT"
            />

            <Input
              label="Entity ID"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder="Product or order ID"
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !entityId}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search size={16} />
                    Search
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-700">
                <TerminalSquare size={18} />
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-950">Result</h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Raw audit response from backend.
                </p>
              </div>
            </div>

            {history && (
              <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                Loaded
              </span>
            )}
          </div>

          <div className="p-5">
            {history ? (
              <pre className="max-h-[560px] overflow-auto rounded-2xl border border-gray-200 bg-gray-950 p-4 text-xs leading-6 text-green-300 shadow-inner">
                {JSON.stringify(history, null, 2)}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
                  <ClipboardList size={24} />
                </div>

                <p className="mt-4 text-sm font-semibold text-gray-950">
                  No data searched yet
                </p>

                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  Search with an entity type and entity ID to view audit logs.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}