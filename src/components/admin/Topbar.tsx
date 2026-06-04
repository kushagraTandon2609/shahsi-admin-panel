'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Menu, Server, ShieldCheck } from 'lucide-react';
import { removeAdminToken } from '@/lib/admin-auth';
import { API_BASE_URL } from '@/lib/admin-api';
import { Button } from './Button';

export function Topbar() {
  const router = useRouter();

  function logout() {
    removeAdminToken();

    try {
      window.localStorage.removeItem('admin_user');
    } catch {
      // Ignore storage errors
    }

    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-lg font-bold tracking-tight text-gray-950">
                Admin Panel
              </h2>

              <span className="hidden rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700 sm:inline-flex">
                Live
              </span>
            </div>

            <div className="mt-0.5 flex min-w-0 items-center gap-2 text-xs text-gray-500">
              <Server size={13} className="shrink-0" />
              <span className="truncate">API: {API_BASE_URL}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 md:flex">
            <ShieldCheck size={14} className="text-green-600" />
            Secure Admin
          </div>

          <Button variant="secondary" onClick={logout}>
            <span className="flex items-center gap-2">
              <LogOut size={16} />
              Logout
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}