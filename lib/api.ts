import type { ApiEnvelope, AuthSession, DashboardData, Booth, DriveDoc, InventoryItem } from '@/lib/types';
import { enqueueOfflineRequest } from '@/lib/offline-queue';

async function parse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  let payload: ApiEnvelope<T>;
  try {
    payload = JSON.parse(raw) as ApiEnvelope<T>;
  } catch {
    throw new Error(`Respons API bukan JSON (HTTP ${response.status}). Periksa endpoint /api/gas dan deployment Apps Script.`);
  }
  if (!response.ok || payload.ok !== true) {
    const diagnostic = (payload as ApiEnvelope<T> & { diagnostic?: { upstreamStatus?: number; contentType?: string } }).diagnostic;
    const suffix = diagnostic ? ` [GAS ${diagnostic.upstreamStatus ?? '-'}; ${diagnostic.contentType ?? 'content type tidak diketahui'}]` : '';
    throw new Error((payload.error || `Request failed (${response.status})`) + suffix);
  }
  return payload.data as T;
}

export async function apiGet<T>(action: string, token: string, params: Record<string, string> = {}): Promise<T> {
  // Read actions use POST so the short-lived session token is not exposed in URL query strings.
  const response = await fetch('/api/gas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, token, ...params }),
    cache: 'no-store'
  });
  return parse<T>(response);
}

const OFFLINE_QUEUEABLE = new Set([
  'visitorClick', 'recordSale', 'recordSampling', 'saveAttendance', 'saveInventory',
  'logMobileSale', 'saveClosingReport'
]);

function makeRequestId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `kd-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function apiPost<T>(action: string, token: string, values: Record<string, unknown> = {}): Promise<T> {
  const requestId = String(values.requestId || makeRequestId());
  const body = JSON.stringify({ action, token, ...values, requestId });
  let response: Response;
  try {
    response = await fetch('/api/gas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      cache: 'no-store'
    });
  } catch (error) {
    if (OFFLINE_QUEUEABLE.has(action) && typeof window !== 'undefined') {
      await enqueueOfflineRequest({ requestId, body, createdAt: Date.now() });
      window.dispatchEvent(new Event('kd-offline-queue-change'));
      throw new Error('Koneksi terputus. Data sudah disimpan sementara di perangkat dan akan dikirim otomatis saat internet kembali. Jangan input ulang transaksi yang sama.');
    }
    throw error;
  }
  return parse<T>(response);
}

export const login = async (username: string, pin: string): Promise<AuthSession> => {
  const response = await fetch('/api/gas', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', username, pin }),
    cache: 'no-store'
  });
  return parse<AuthSession>(response);
};

export const getDashboard = (token: string) => apiGet<DashboardData>('dashboard', token);
export const getBooths = (token: string) => apiGet<Booth[]>('booths', token);
export const getDocs = (token: string, venueId = '') => apiGet<DriveDoc[]>('docs', token, venueId ? { venueId } : {});
export const getInventory = (token: string) => apiGet<InventoryItem[]>('inventory', token);
export const getMySales = <T = unknown>(token: string) => apiGet<T>('mySales', token);
export const getVenueSales = <T = unknown>(token: string, venueId = '') => apiGet<T>('venueSales', token, venueId ? { venueId } : {});
export const getLiveLocations = <T = unknown>(token: string) => apiGet<T>('liveLocations', token);

export const getMobileActivity = <T = unknown>(token: string, venueId = '') => apiGet<T>('mobileActivity', token, venueId ? { venueId } : {});
export const getInventoryLogs = <T = unknown>(token: string, venueId = '') => apiGet<T>('inventoryLogs', token, venueId ? { venueId } : {});
export const getDailyClosings = <T = unknown>(token: string, venueId = '') => apiGet<T>('dailyClosings', token, venueId ? { venueId } : {});
