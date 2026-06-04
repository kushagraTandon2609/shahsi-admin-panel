'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuthService } from '@/services/admin-auth.service';
import { setAdminToken } from '@/lib/admin-auth';
import { extractToken, getApiErrorMessage } from '@/lib/admin-response';
import { Button } from '@/components/admin/Button';
import { Input } from '@/components/admin/Input';
import { Card } from '@/components/admin/Card';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('seller@gownloop.com');
  const [password, setPassword] = useState('Seller@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await adminAuthService.login({ email, password });
      const token = extractToken(data);

      if (!token) {
        throw new Error('Token response me nahi mila. Backend login response check karo.');
      }

      setAdminToken(token);

      try {
        await adminAuthService.checkAdmin();
      } catch {
        console.warn('Admin check failed, but token saved.');
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Shahsi Admin Login</h1>
        <p className="mt-1 text-sm text-gray-500">
          Live backend se admin data fetch hoga.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  );
}