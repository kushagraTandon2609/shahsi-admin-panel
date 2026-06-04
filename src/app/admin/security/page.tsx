'use client';

import { useEffect, useState } from 'react';
import {
  Fingerprint,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react';
import { adminSecurityService } from '@/services/admin-security.service';
import { unwrapList } from '@/lib/admin-response';
import { Card } from '@/components/admin/Card';
import { StatCard } from '@/components/admin/StatCard';
import { ApiError } from '@/components/admin/ApiError';
import { Button } from '@/components/admin/Button';

export default function AdminSecurityPage() {
  const [security, setSecurity] = useState<any>(null);
  const [ipRules, setIpRules] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [fraudRules, setFraudRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadSecurity() {
    setLoading(true);
    setError('');

    const [securityRes, ipRes, sessionsRes, fraudRes] = await Promise.allSettled([
      adminSecurityService.getSecurity(),
      adminSecurityService.getIpRules(),
      adminSecurityService.getSessionLogs(),
      adminSecurityService.getFraudRules(),
    ]);

    if (securityRes.status === 'fulfilled') setSecurity(securityRes.value);
    if (ipRes.status === 'fulfilled') setIpRules(unwrapList(ipRes.value));
    if (sessionsRes.status === 'fulfilled') setSessions(unwrapList(sessionsRes.value));
    if (fraudRes.status === 'fulfilled') setFraudRules(unwrapList(fraudRes.value));

    const failed = [securityRes, ipRes, sessionsRes, fraudRes].filter(
      (item) => item.status === 'rejected',
    );

    if (failed.length > 0) {
      setError('Some security APIs failed.');
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSecurity();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950">
              Security Compliance
            </h1>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Monitor security configuration, IP rules, session logs and fraud controls.
            </p>
          </div>
        </div>

        <Button variant="secondary" onClick={loadSecurity} disabled={loading}>
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
        <div className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>

          <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <StatCard title="IP Rules" value={ipRules.length} />
          <StatCard title="Session Logs" value={sessions.length} />
          <StatCard title="Fraud Rules" value={fraudRules.length} />

          <Card className="p-0 lg:col-span-3">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-700">
                  <TerminalSquare size={18} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-gray-950">
                    Security Raw Response
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Full backend security response for debugging and verification.
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                Live
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm font-bold text-gray-950">
                        Fraud Rules
                      </p>
                      <p className="text-xs text-gray-500">
                        {fraudRules.length} configured
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <Fingerprint size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm font-bold text-gray-950">
                        Sessions
                      </p>
                      <p className="text-xs text-gray-500">
                        {sessions.length} logs found
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm font-bold text-gray-950">
                        IP Rules
                      </p>
                      <p className="text-xs text-gray-500">
                        {ipRules.length} rules active
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <pre className="max-h-[520px] overflow-auto rounded-2xl border border-gray-200 bg-gray-950 p-4 text-xs leading-6 text-green-300 shadow-inner">
                {JSON.stringify(security, null, 2)}
              </pre>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}