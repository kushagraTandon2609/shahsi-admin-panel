export const ADMIN_TOKEN_KEY = 'admin_access_token';

const LEGACY_TOKEN_KEYS = ['token', 'adminToken', 'accessToken'];

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function getAdminToken() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const primaryToken = storage.getItem(ADMIN_TOKEN_KEY);

    if (primaryToken) {
      return primaryToken;
    }

    for (const key of LEGACY_TOKEN_KEYS) {
      const token = storage.getItem(key);

      if (token) {
        return token;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function setAdminToken(token: string) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {
    // localStorage can fail in private mode or restricted browsers
  }
}

export function removeAdminToken() {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(ADMIN_TOKEN_KEY);

    LEGACY_TOKEN_KEYS.forEach((key) => {
      storage.removeItem(key);
    });
  } catch {
    // Ignore storage errors
  }
}

export function isAdminLoggedIn() {
  return Boolean(getAdminToken());
}

export function getAdminAuthHeader() {
  const token = getAdminToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}