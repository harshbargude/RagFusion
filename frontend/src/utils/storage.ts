/**
 * Storage abstraction layer
 * Handles localStorage with fallback to in-memory storage
 */

const memoryStorage: Record<string, string> = {};

const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

const storage = isLocalStorageAvailable() ? localStorage : {
  getItem: (key: string) => memoryStorage[key] || null,
  setItem: (key: string, value: string) => {
    memoryStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete memoryStorage[key];
  },
  clear: () => {
    Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
  },
};

export const storageUtils = {
  get: <T>(key: string): T | null => {
    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  },

  remove: (key: string): void => {
    try {
      storage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  },

  clear: (): void => {
    try {
      storage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
} as const;

