type ClientErrorPayload = {
  type: string;
  message: string;
  status?: number;
  url?: string;
  page?: string;
  details?: any;
};

function sanitizeValue(value: any, depth = 0): any {
  if (depth > 4) return '[Max depth reached]';

  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    return value.length > 3000 ? `${value.slice(0, 3000)}...` : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (typeof File !== 'undefined' && value instanceof File) {
    return {
      fileName: value.name,
      fileType: value.type,
      fileSize: value.size,
    };
  }

  if (typeof FormData !== 'undefined' && value instanceof FormData) {
    const fields: Record<string, any[]> = {};

    value.forEach((fieldValue, key) => {
      if (!fields[key]) fields[key] = [];
      fields[key].push(sanitizeValue(fieldValue, depth + 1));
    });

    return {
      type: 'FormData',
      fields,
    };
  }

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitizeValue(item, depth + 1));
  }

  if (typeof value === 'object') {
    const output: Record<string, any> = {};
    const entries = Object.entries(value).slice(0, 80);

    for (const [key, item] of entries) {
      const lowerKey = key.toLowerCase();

      if (
        lowerKey.includes('password') ||
        lowerKey.includes('token') ||
        lowerKey.includes('authorization') ||
        lowerKey.includes('secret')
      ) {
        output[key] = '[REDACTED]';
      } else {
        output[key] = sanitizeValue(item, depth + 1);
      }
    }

    return output;
  }

  return String(value);
}

export async function logClientError(payload: ClientErrorPayload) {
  try {
    const safePayload = {
      ...payload,
      message: payload.message || 'Unknown client error',
      page:
        payload.page ||
        (typeof window !== 'undefined' ? window.location.pathname : ''),
      details: sanitizeValue(payload.details),
      time: new Date().toISOString(),
    };

    await fetch('/api/client-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(safePayload),
      keepalive: true,
    });
  } catch {
    // Avoid infinite logging loop
  }
}