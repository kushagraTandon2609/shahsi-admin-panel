import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAdminToken, removeAdminToken } from './admin-auth';
import { BACKEND_API_URL, getApiBaseUrl } from './backend-api-url';
import { logClientError } from './client-logger';

export { BACKEND_API_URL };
export const API_BASE_URL = BACKEND_API_URL;

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 120000,
  withCredentials: false,
  paramsSerializer: {
    indexes: null,
  },
});

function isFormData(data: unknown): data is FormData {
  return typeof FormData !== 'undefined' && data instanceof FormData;
}

function isFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function removeHeader(headers: any, key: string) {
  if (!headers) return;

  if (typeof headers.delete === 'function') {
    headers.delete(key);
    return;
  }

  delete headers[key];
  delete headers[key.toLowerCase()];
}

function setHeader(headers: any, key: string, value: string) {
  if (!headers) return;

  if (typeof headers.set === 'function') {
    headers.set(key, value);
    return;
  }

  headers[key] = value;
}

function sanitizeObject(value: any, depth = 0): any {
  if (depth > 4) return '[Max depth reached]';

  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    return value.length > 3000 ? `${value.slice(0, 3000)}...` : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value;

  if (isFile(value)) {
    return {
      fileName: value.name,
      fileType: value.type,
      fileSize: value.size,
    };
  }

  if (isFormData(value)) {
    const fields: Record<string, unknown[]> = {};

    value.forEach((fieldValue, key) => {
      if (!fields[key]) fields[key] = [];
      fields[key].push(sanitizeObject(fieldValue, depth + 1));
    });

    return {
      type: 'FormData',
      fields,
    };
  }

  if (Array.isArray(value)) {
    return value.slice(0, 60).map((item) => sanitizeObject(item, depth + 1));
  }

  if (typeof value === 'object') {
    const output: Record<string, any> = {};

    Object.entries(value)
      .slice(0, 100)
      .forEach(([key, item]) => {
        const lowerKey = key.toLowerCase();

        if (
          lowerKey.includes('password') ||
          lowerKey.includes('token') ||
          lowerKey.includes('authorization') ||
          lowerKey.includes('secret')
        ) {
          output[key] = '[REDACTED]';
        } else {
          output[key] = sanitizeObject(item, depth + 1);
        }
      });

    return output;
  }

  return String(value);
}

function getSafeRequestData(data: unknown) {
  try {
    if (typeof data === 'string') {
      return sanitizeObject(JSON.parse(data));
    }

    return sanitizeObject(data);
  } catch {
    return sanitizeObject(data);
  }
}

function getErrorMessage(error: AxiosError<any>) {
  const rawMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.details ||
    error?.response?.data?.errors ||
    error?.response?.data?.data?.message ||
    error?.response?.data?.data?.error ||
    error?.message ||
    'API request failed';

  if (Array.isArray(rawMessage)) {
    return rawMessage
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item?.message) return item.message;
        if (item?.error) return item.error;

        try {
          return JSON.stringify(item);
        } catch {
          return String(item);
        }
      })
      .join(', ');
  }

  if (typeof rawMessage === 'object' && rawMessage !== null) {
    try {
      return JSON.stringify(rawMessage);
    } catch {
      return 'API request failed';
    }
  }

  return String(rawMessage);
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAdminToken();

  config.headers = config.headers || {};

  if (token) {
    setHeader(config.headers, 'Authorization', `Bearer ${token}`);
  }

  setHeader(config.headers, 'Accept', 'application/json');

  if (isFormData(config.data)) {
    removeHeader(config.headers, 'Content-Type');
    removeHeader(config.headers, 'content-type');

    config.transformRequest = [
      (data) => {
        return data;
      },
    ];
  } else if (config.data !== undefined) {
    setHeader(config.headers, 'Content-Type', 'application/json');
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const status = error?.response?.status;
    const url = `${error?.config?.baseURL || ''}${error?.config?.url || ''}`;
    const message = getErrorMessage(error);

    try {
      await logClientError({
        type: 'API_ERROR',
        message,
        status,
        url,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        details: {
          method: error?.config?.method?.toUpperCase(),
          requestData: getSafeRequestData(error?.config?.data),
          responseData: sanitizeObject(error?.response?.data),
        },
      });
    } catch {
      // Client logging failure should never block the original API error.
    }

    if (
      typeof window !== 'undefined' &&
      status === 401 &&
      !window.location.pathname.includes('/admin/login')
    ) {
      removeAdminToken();
      window.location.href = '/admin/login';
    }

    return Promise.reject(error);
  },
);