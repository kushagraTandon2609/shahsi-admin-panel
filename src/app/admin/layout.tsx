'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { isAdminLoggedIn } from '@/lib/admin-auth';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checkingAuth, setCheckingAuth] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    if (!isAdminLoggedIn()) {
      setCheckingAuth(false);
      router.replace('/admin/login');
      return;
    }

    setCheckingAuth(false);
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return children;
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f3] px-4">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
          <p className="mt-4 text-sm font-semibold text-gray-900">
            Checking admin access
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Please wait while we verify your session.
          </p>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}