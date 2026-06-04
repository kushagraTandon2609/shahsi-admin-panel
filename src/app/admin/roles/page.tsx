'use client';

import { FormEvent, useEffect, useState } from 'react';
import { KeyRound, RefreshCw, ShieldCheck, UserCog } from 'lucide-react';
import { adminRolesService } from '@/services/admin-roles.service';
import { unwrapList, getApiErrorMessage } from '@/lib/admin-response';
import { Card } from '@/components/admin/Card';
import { Button } from '@/components/admin/Button';
import { Input } from '@/components/admin/Input';
import { ApiError } from '@/components/admin/ApiError';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadRoles() {
    setLoading(true);
    setError('');

    try {
      const res = await adminRolesService.listRoles();
      setRoles(unwrapList(res));
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function createRole(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await adminRolesService.createRole({ name });
      setName('');
      await loadRoles();
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
            <KeyRound size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950">
              Roles & Permissions
            </h1>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Manage admin roles and access control for back office users.
            </p>
          </div>
        </div>

        <Button variant="secondary" onClick={loadRoles} disabled={loading}>
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
                <UserCog size={18} />
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Create Role
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Add a new role for admin access management.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={createRole} className="space-y-4 px-5 py-5">
            <Input
              label="Role Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Catalog Manager"
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={saving || !name}>
                {saving ? 'Creating...' : 'Create Role'}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-700">
                <ShieldCheck size={18} />
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-950">Roles</h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  {roles.length} roles available
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
            ) : roles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-14 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
                  <ShieldCheck size={24} />
                </div>

                <p className="mt-4 text-sm font-semibold text-gray-950">
                  No roles found
                </p>

                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  Create your first role using the form on the left.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {roles.map((role: any, index) => (
                  <div
                    key={role.id || index}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-950">
                          {role.name || role.roleName || 'Role'}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Role ID: {role.id || role.roleId || '-'}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                        Role
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