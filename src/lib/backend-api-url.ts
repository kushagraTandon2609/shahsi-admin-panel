const DEFAULT_BACKEND_API_URL = 'http://65.1.135.224:3001';

export const BACKEND_API_URL = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  DEFAULT_BACKEND_API_URL
).replace(/\/$/, '');

/** Browser calls same-origin proxy; server-side calls backend directly. */
export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    return '/api/backend';
  }

  return BACKEND_API_URL;
}
