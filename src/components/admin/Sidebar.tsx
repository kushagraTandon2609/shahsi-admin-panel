'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { adminMenuConfig } from '@/config/admin-menu.config';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-gray-200 bg-white/95 shadow-sm backdrop-blur lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-gray-200 px-5 py-5">
          <Link href="/admin/dashboard" className="block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-sm font-bold text-white shadow-sm">
                S
              </div>

              <div>
                <h1 className="text-lg font-bold tracking-tight text-gray-950">
                  Shahsi Admin
                </h1>
                <p className="text-xs font-medium text-gray-500">
                  Commerce Back Office
                </p>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {adminMenuConfig.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.path || pathname.startsWith(`${item.path}/`);

            if (item.status === 'pending') {
              return (
                <div
                  key={item.path}
                  className="group flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-sm text-gray-400"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                      <Icon size={17} />
                    </span>

                    <span className="font-medium">{item.label}</span>
                  </span>

                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                href={item.path}
                className={clsx(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                  active
                    ? 'border border-gray-200 bg-gray-100 text-gray-950 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950',
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-black" />
                )}

                <span
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                    active
                      ? 'bg-white text-gray-950 shadow-sm'
                      : 'bg-gray-50 text-gray-500 group-hover:bg-white group-hover:text-gray-900',
                  )}
                >
                  <Icon size={17} />
                </span>

                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              API Server
            </p>

            <p className="mt-1 truncate text-xs text-gray-600">
              65.1.135.224:3001
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.15)]" />
              <span className="text-xs font-medium text-gray-600">
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}