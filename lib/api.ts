import type { AuthSession, DashboardData, Booth, DriveDoc, InventoryItem } from '@/lib/types';
import { enqueueOfflineRequest } from '@/lib/offline-queue';
import { requestGas, postGas, sendGasNoCors, bytesToBase64, GasTransportError } from '@/lib/gas-jsonp';

export async function apiGet<T>(action: string, token: string, params: Record<string, string> = {}): Promise<T> {
  return requestGas<T>({ action, token, ...params });
}

const OFFLINE_QUEUEABLE = new Set([
  'visitorClick', 'recordSale', 'recordSampling', 'redeemPrize', 'saveAttendance',
  'saveInventory', 'logMobileSale', 'saveClosingReport', 'updateUser', 'createUser',
  'updateBooth', 'updateInventoryMaster'
]);

function makeRequestId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `kd-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}


export async function apiPost<T>(action: string, token: string, values: Record<string, unknown> = {}): Promise<T> {
  const transient = action === 'logout' || action === 'locationPing';
  const requestId = transient ? '' : String(values.requestId || makeRequestId());
  const body = { action, token, ...values, ...(requestId ? { requestId } : {}) };
  if (transient) { await sendGasNoCors(body); return { sent: true } as T; }
  try {
    if (action === 'uploadDoc') return await postGas<T>(body, 90000);
    return await postGas<T>(body, 25000);
  } catch (error) {
    if (error instanceof GasTransportError && OFFLINE_QUEUEABLE.has(action) && typeof window !== 'undefined') {
      await enqueueOfflineRequest({ requestId, body: JSON.stringify(body), createdAt: Date.now() });
      window.dispatchEvent(new Event('kd-offline-queue-change'));
      throw new Error('Koneksi terputus. Data disimpan sementara di perangkat dan akan dikirim otomatis saat internet kembali. Jangan input ulang transaksi yang sama.');
    }
    throw error;
  }
}

export const login = async (username: string, pin: string): Promise<AuthSession> => {
  if (!globalThis.crypto?.subtle) throw new Error('Browser ini tidak mendukung login aman. Buka aplikasi melalui HTTPS atau browser terbaru.');
  const normalizedUsername = username.trim();
  const challenge = await requestGas<{ salt: string; nonce: string }>({ action: 'loginChallenge', username: normalizedUsername });
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${challenge.salt}|${pin.trim()}`));
  const pinHash = bytesToBase64(new Uint8Array(digest));
  const key = await crypto.subtle.importKey('raw', encoder.encode(pinHash), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(challenge.nonce));
  const proof = bytesToBase64(new Uint8Array(signature));
  return requestGas<AuthSession>({ action: 'loginProof', username: normalizedUsername, nonce: challenge.nonce, proof });
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
