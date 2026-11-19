import type { ApiEnvelope, AuthSession, DashboardData, Booth, DriveDoc, InventoryItem } from '@/lib/types';

async function parse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload.data as T;
}

export async function apiGet<T>(action: string, token: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ action, token, ...params });
  const response = await fetch(`/api/gas?${query.toString()}`, { method: 'GET', cache: 'no-store' });
  return parse<T>(response);
}

export async function apiPost<T>(action: string, token: string, values: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch('/api/gas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, token, ...values })
  });
  return parse<T>(response);
}

export const login = async (username: string, pin: string): Promise<AuthSession> => {
  const response = await fetch('/api/gas', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', username, pin })
  });
  return parse<AuthSession>(response);
};

export const getDashboard = (token: string) => apiGet<DashboardData>('dashboard', token);
export const getBooths = (token: string) => apiGet<Booth[]>('booths', token);
export const getDocs = (token: string, venueId = '') => apiGet<DriveDoc[]>('docs', token, venueId ? { venueId } : {});
export const getInventory = (token: string) => apiGet<InventoryItem[]>('inventory', token);

export const getMySales = <T = unknown>(token: string) => apiGet<T>('mySales', token);

export const getVenueSales = <T = unknown>(token: string, venueId = '') => apiGet<T>('venueSales', token, venueId ? { venueId } : {});
