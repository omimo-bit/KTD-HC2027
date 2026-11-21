import { GAS_WEB_APP_URL } from '@/lib/config';

type GasEnvelope<T> = { ok: boolean; data?: T; error?: string };

export class GasTransportError extends Error {
  constructor(message: string) { super(message); this.name = 'GasTransportError'; }
}
let callbackCounter = 0;

function endpoint(): string {
  if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.includes('PASTE_DEPLOYMENT_ID')) {
    throw new Error('Alamat Google Apps Script belum diatur. Isi GAS_WEB_APP_URL di lib/config.ts dengan URL Web App yang berakhir /exec.');
  }
  let parsed: URL;
  try { parsed = new URL(GAS_WEB_APP_URL); }
  catch { throw new Error('Alamat Google Apps Script tidak valid. Periksa lib/config.ts.'); }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'script.google.com' || !/\/macros\/s\/[^/]+\/exec$/.test(parsed.pathname)) {
    throw new Error('URL backend harus berupa Google Apps Script Web App yang berakhir /exec.');
  }
  return parsed.toString();
}

/** Calls the Apps Script JSONP bridge. Used because GitHub Pages has no server-side API proxy. */
export function requestGas<T>(body: Record<string, unknown>, timeoutMs = 25000): Promise<T> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Permintaan backend hanya dapat dijalankan dari browser.'));
  }

  let baseUrl: string;
  try { baseUrl = endpoint(); }
  catch (error) { return Promise.reject(error); }

  return new Promise<T>((resolve, reject) => {
    const callbackName = `__kd_gas_${Date.now().toString(36)}_${(++callbackCounter).toString(36)}`;
    const callback = (payload: GasEnvelope<T>) => {
      cleanup();
      if (!payload || payload.ok !== true) {
        reject(new Error(payload?.error || 'Backend menolak permintaan. Periksa deployment Apps Script dan hak akses akun.'));
        return;
      }
      resolve(payload.data as T);
    };
    const script = document.createElement('script');
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new GasTransportError('Backend tidak merespons dalam 25 detik. Periksa koneksi internet dan deployment Apps Script.'));
    }, timeoutMs);
    const cleanup = () => {
      window.clearTimeout(timer);
      script.onerror = null;
      script.remove();
      delete (window as unknown as Record<string, unknown>)[callbackName];
    };

    (window as unknown as Record<string, unknown>)[callbackName] = callback;
    const query = new URLSearchParams({
      callback: callbackName,
      payload: JSON.stringify(body),
      _: `${Date.now()}-${callbackCounter}`
    });
    const url = `${baseUrl}?${query.toString()}`;
    if (url.length > 7500) {
      cleanup();
      reject(new Error('Data terlalu besar untuk dikirim melalui koneksi GitHub Pages. Kurangi isi catatan atau gunakan upload dokumentasi.'));
      return;
    }
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.onerror = () => {
      cleanup();
      reject(new GasTransportError('Tidak dapat menghubungi Google Apps Script. Pastikan URL /exec aktif dan deployment dapat diakses.'));
    };
    script.src = url;
    document.head.appendChild(script);
  });
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + 0x8000, bytes.length)));
  }
  return btoa(binary);
}


/** Fire-and-forget transport for transient location pings and logout. */
export async function sendGasNoCors(body: Record<string, unknown>): Promise<void> {
  const url = endpoint();
  try {
    await fetch(url, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body), cache: 'no-store', redirect: 'follow'
    });
  } catch {
    throw new GasTransportError('Tidak dapat mengirim ke Google Apps Script. Periksa koneksi internet.');
  }
}

/** Submit a mutation as a simple POST, then confirm its idempotent result through the read-only status endpoint. */
export async function postGas<T>(body: Record<string, unknown>, timeoutMs = 25000): Promise<T> {
  const requestId = String(body.requestId || '');
  const token = String(body.token || '');
  if (!requestId || !token) throw new Error('Request ID dan token sesi wajib tersedia untuk menyimpan transaksi.');
  await sendGasNoCors(body);

  const started = Date.now();
  const waits = [500, 800, 1200, 1800, 2500, 3500, 4500, 5000];
  for (const delay of waits) {
    if (Date.now() - started + delay > timeoutMs) break;
    await new Promise(resolve => window.setTimeout(resolve, delay));
    try {
      const status = await requestGas<{ done: boolean; result?: GasEnvelope<T> }>({ action: 'requestStatus', token, requestId }, 15000);
      if (status.done && status.result) {
        if (!status.result.ok) throw new Error(status.result.error || 'Google Apps Script menolak transaksi.');
        return status.result.data as T;
      }
    } catch (error) {
      if (!(error instanceof GasTransportError)) throw error;
      // The POST may already have been accepted. Retry only the read-only status check.
    }
  }
  // Do not put an unconfirmed POST into the offline queue: its server-side result is ambiguous.
  throw new Error('Transaksi sudah dikirim, tetapi konfirmasinya belum diterima. Jangan input ulang. Refresh modul untuk memeriksa apakah data sudah tercatat.');
}
