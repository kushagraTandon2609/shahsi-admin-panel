'use client';

import { useEffect } from 'react';
import { logClientError } from '@/lib/client-logger';

const recentErrors = new Set<string>();

function getSafeReason(reason: unknown) {
  if (reason instanceof Error) {
    return {
      name: reason.name,
      message: reason.message,
      stack: reason.stack,
    };
  }

  if (typeof reason === 'object' && reason !== null) {
    try {
      return JSON.parse(JSON.stringify(reason));
    } catch {
      return String(reason);
    }
  }

  return String(reason || '');
}

function shouldLogError(key: string) {
  if (recentErrors.has(key)) return false;

  recentErrors.add(key);

  window.setTimeout(() => {
    recentErrors.delete(key);
  }, 3000);

  return true;
}

function safeLogClientError(payload: Parameters<typeof logClientError>[0]) {
  try {
    void logClientError(payload).catch(() => {
      // Logging errors should not create another browser error loop.
    });
  } catch {
    // Ignore logging errors.
  }
}

export function ClientErrorLogger() {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      const message = event.message || 'Browser error';
      const page = window.location.pathname;

      const errorKey = `BROWSER_ERROR:${page}:${message}:${event.filename}:${event.lineno}:${event.colno}`;

      if (!shouldLogError(errorKey)) return;

      safeLogClientError({
        type: 'BROWSER_ERROR',
        message,
        page,
        details: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        },
      });
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const message =
        reason?.message ||
        String(reason) ||
        'Unhandled promise rejection';

      const page = window.location.pathname;
      const errorKey = `UNHANDLED_PROMISE_REJECTION:${page}:${message}`;

      if (!shouldLogError(errorKey)) return;

      safeLogClientError({
        type: 'UNHANDLED_PROMISE_REJECTION',
        message,
        page,
        details: {
          reason: getSafeReason(reason),
          stack: reason?.stack,
        },
      });
    }

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}