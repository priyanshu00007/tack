/**
 * Offline Sync Service
 * Manages local data storage and synchronization with backend
 */

interface SyncableData {
  id: string;
  type: 'task' | 'habit' | 'goal' | 'profile';
  data: any;
  timestamp: number;
  synced: boolean;
  lastSyncAttempt?: number;
}

const DB_NAME = 'zenith_db';
const STORE_NAME = 'sync_queue';

export class OfflineSyncService {
  private db: IDBDatabase | null = null;
  private isOnline: boolean = typeof window !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window === 'undefined') return;

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncAll().catch(console.error);
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined') return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Save data locally
   */
  async saveLocal(id: string, type: string, data: any): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!this.db) await this.init();

    const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const syncData: SyncableData = {
      id,
      type: type as any,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const request = store.put(syncData);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get all local data
   */
  async getLocal(): Promise<SyncableData[]> {
    if (typeof window === 'undefined') return [];
    if (!this.db) await this.init();

    const transaction = this.db!.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get unsynced data
   */
  async getUnsyncedData(): Promise<SyncableData[]> {
    const allData = await this.getLocal();
    return allData.filter((item) => !item.synced);
  }

  /**
   * Sync data with backend
   */
  async syncAll(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!this.isOnline) {
      console.log('Offline mode: Skipping sync');
      return;
    }

    const unsyncedData = await this.getUnsyncedData();
    if (unsyncedData.length === 0) return;

    const token = localStorage.getItem('zenith_access_token');
    if (!token) return;

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    for (const item of unsyncedData) {
      try {
        const response = await fetch(`${API_BASE_URL}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: item.type,
            data: item.data,
          }),
        });

        if (response.ok) {
          await this.markAsSynced(item.id);
        }
      } catch (error) {
        console.error(`Failed to sync ${item.type}:`, error);
        // Update last sync attempt time
        if (this.db) {
          const transaction = this.db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          item.lastSyncAttempt = Date.now();
          store.put(item);
        }
      }
    }
  }

  /**
   * Mark item as synced
   */
  async markAsSynced(id: string): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!this.db) await this.init();

    const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const putRequest = store.put(data);
          putRequest.onerror = () => reject(putRequest.error);
          putRequest.onsuccess = () => resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Clear all local data
   */
  async clearLocal(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!this.db) await this.init();

    const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Check if online
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }
}

// Lazy singleton — only instantiated on the client
let _offlineSyncServiceInstance: OfflineSyncService | null = null;

export function getOfflineSyncService(): OfflineSyncService {
  if (!_offlineSyncServiceInstance) {
    _offlineSyncServiceInstance = new OfflineSyncService();
  }
  return _offlineSyncServiceInstance;
}

// For backward compatibility — safe to import on server (will be a no-op)
export const offlineSyncService =
  typeof window !== 'undefined' ? getOfflineSyncService() : (new OfflineSyncService());
