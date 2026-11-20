export type OfflineQueueItem = {
  requestId: string;
  body: string;
  createdAt: number;
};

const DB_NAME = 'kd-homecoming-2027';
const STORE_NAME = 'offline-outbox';
let syncInProgress = false;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB tidak tersedia di browser ini.'));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'requestId' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Tidak dapat membuka antrean offline.'));
  });
}

export async function enqueueOfflineRequest(item: OfflineQueueItem): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Gagal menyimpan transaksi offline.'));
  });
  db.close();
}

export async function refreshOfflineQueueToken(token: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      (request.result as OfflineQueueItem[]).forEach(item => {
        try {
          const body = JSON.parse(item.body) as Record<string, unknown>;
          body.token = token;
          store.put({ ...item, body: JSON.stringify(body) });
        } catch { /* leave any malformed item untouched for diagnosis */ }
      });
    };
    request.onerror = () => reject(request.error || new Error('Tidak dapat memperbarui token antrean.'));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Tidak dapat memperbarui token antrean.'));
  });
  db.close();
}

export async function getOfflineQueue(): Promise<OfflineQueueItem[]> {
  const db = await openDb();
  const items = await new Promise<OfflineQueueItem[]>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve((request.result || []) as OfflineQueueItem[]);
    request.onerror = () => reject(request.error || new Error('Gagal membaca antrean offline.'));
  });
  db.close();
  return items.sort((a, b) => a.createdAt - b.createdAt);
}

async function removeOfflineRequest(requestId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(requestId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Gagal menghapus transaksi antrean.'));
  });
  db.close();
}

export async function syncOfflineQueue(): Promise<{ sent: number; remaining: number }> {
  if (syncInProgress || typeof window === 'undefined' || !navigator.onLine) return { sent: 0, remaining: (await getOfflineQueue()).length };
  syncInProgress = true;
  let sent = 0;
  try {
    const items = await getOfflineQueue();
    for (const item of items) {
      const response = await fetch('/api/gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: item.body,
        cache: 'no-store'
      });
      const raw = await response.text();
      let payload: { ok?: boolean; error?: string };
      try { payload = JSON.parse(raw) as { ok?: boolean; error?: string }; }
      catch { throw new Error('Server memberi respons non-JSON. Antrean akan dicoba lagi.'); }
      if (!response.ok || payload.ok !== true) throw new Error(payload.error || `Sinkronisasi gagal (${response.status}).`);
      await removeOfflineRequest(item.requestId);
      sent += 1;
    }
  } finally {
    syncInProgress = false;
  }
  const remaining = (await getOfflineQueue()).length;
  return { sent, remaining };
}
