let accessToken: string | null = null;

export function setAccessToken(token: string) { accessToken = token; }
export function clearAccessToken() { accessToken = null; }
export function getAccessToken() { return accessToken; }

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options?.headers ?? {}),
    },
  });

  // Access token expired — attempt silent refresh via HttpOnly cookie
  if (res.status === 401 && accessToken) {
    const refreshed = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
    if (refreshed.ok) {
      const { accessToken: newToken } = await refreshed.json() as { accessToken: string };
      setAccessToken(newToken);
      return apiFetch(path, options);
    }
    clearAccessToken();
    window.location.href = '/admin/login';
    throw new Error('Session expired');
  }

  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  return res.json() as Promise<T>;
}
