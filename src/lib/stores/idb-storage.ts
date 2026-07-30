import type { StateStorage } from 'zustand/middleware';
import { idbHelper } from '../indexeddb';
import { config } from '../config';

const LEGACY_KEY = config.storage.key;

/**
 * Zustand StateStorage backed by IndexedDB with localStorage migration.
 * Falls back to localStorage when IndexedDB is unavailable.
 */
export const idbStateStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    try {
      if (idbHelper.isAvailable()) {
        const fromIdb = await idbHelper.loadState();
        if (fromIdb != null) {
          // Persist layer expects the raw JSON string of { state, version }
          if (typeof fromIdb === 'string') return fromIdb;
          return JSON.stringify(fromIdb);
        }

        // One-time migration from legacy localStorage persist payload
        const legacy = localStorage.getItem(name) ?? localStorage.getItem(LEGACY_KEY);
        if (legacy) {
          await idbHelper.saveState(JSON.parse(legacy));
          return legacy;
        }
      }
    } catch (error) {
      console.error('IndexedDB getItem failed, trying localStorage:', error);
    }

    try {
      return localStorage.getItem(name) ?? localStorage.getItem(LEGACY_KEY);
    } catch {
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;

    try {
      if (idbHelper.isAvailable()) {
        await idbHelper.saveState(JSON.parse(value));
      }
    } catch (error) {
      console.error('IndexedDB setItem failed, falling back to localStorage:', error);
    }

    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.error('localStorage setItem failed:', error);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return;

    try {
      if (idbHelper.isAvailable()) {
        await idbHelper.clearState();
      }
    } catch (error) {
      console.error('IndexedDB removeItem failed:', error);
    }

    try {
      localStorage.removeItem(name);
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      // ignore
    }
  },
};
