/**
 * IndexedDB Utility for Skill Mapper
 * Provides robust offline storage with better capacity than localStorage
 */

const DB_NAME = 'skill-mapper-db';
const DB_VERSION = 1;
const STORE_NAME = 'game-state';

export interface StoredGameState {
    id: string; // Always 'current' for single-user app
    timestamp: number;
    version: number;
    state: any;
}

class IndexedDBHelper {
    private dbPromise: Promise<IDBDatabase> | null = null;

    private async getDB(): Promise<IDBDatabase> {
        if (!this.dbPromise) {
            this.dbPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);

                request.onupgradeneeded = (event) => {
                    const db = (event.target as IDBOpenDBRequest).result;
                    
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    }
                };
            });
        }

        return this.dbPromise;
    }

    async saveState(state: any): Promise<void> {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const data: StoredGameState = {
                id: 'current',
                timestamp: Date.now(),
                version: 1,
                state,
            };

            await new Promise<void>((resolve, reject) => {
                const request = store.put(data);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Failed to save state to IndexedDB:', error);
            // Fallback to localStorage
            this.fallbackSave(state);
        }
    }

    async loadState(): Promise<any | null> {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);

            const data = await new Promise<StoredGameState | undefined>((resolve, reject) => {
                const request = store.get('current');
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            return data?.state || null;
        } catch (error) {
            console.error('Failed to load state from IndexedDB:', error);
            // Fallback to localStorage
            return this.fallbackLoad();
        }
    }

    async clearState(): Promise<void> {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            await new Promise<void>((resolve, reject) => {
                const request = store.delete('current');
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Failed to clear state from IndexedDB:', error);
        }
    }

    async exportState(): Promise<string> {
        const state = await this.loadState();
        return JSON.stringify({
            version: 1,
            timestamp: Date.now(),
            state,
        }, null, 2);
    }

    async importState(jsonString: string): Promise<void> {
        try {
            const data = JSON.parse(jsonString);
            if (data.version && data.state) {
                await this.saveState(data.state);
            } else {
                throw new Error('Invalid save file format');
            }
        } catch (error) {
            console.error('Failed to import state:', error);
            throw error;
        }
    }

    // Fallback methods for browsers without IndexedDB support
    private fallbackSave(state: any): void {
        try {
            localStorage.setItem('skill-mapper-storage', JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    private fallbackLoad(): any | null {
        try {
            const data = localStorage.getItem('skill-mapper-storage');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return null;
        }
    }

    // Check if IndexedDB is available
    isAvailable(): boolean {
        return typeof indexedDB !== 'undefined';
    }
}

export const idbHelper = new IndexedDBHelper();

// Export convenience functions
export const saveGameState = (state: any) => idbHelper.saveState(state);
export const loadGameState = () => idbHelper.loadState();
export const clearGameState = () => idbHelper.clearState();
export const exportGameState = () => idbHelper.exportState();
export const importGameState = (json: string) => idbHelper.importState(json);
