import { useState, useEffect, useCallback } from 'react';
import { safeJsonParse } from '@/lib/utils';

/**
 * Custom hook for safely interacting with localStorage
 * Handles errors gracefully and provides TypeScript type safety
 * 
 * @param key - The localStorage key
 * @param initialValue - Default value if key doesn't exist
 * @returns [value, setValue, remove] tuple
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? safeJsonParse<T>(item, initialValue) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that
    // persists the new value to localStorage
    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            try {
                // Allow value to be a function so we have same API as useState
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                
                setStoredValue(valueToStore);
                
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
            } catch (error) {
                console.warn(`Error setting localStorage key "${key}":`, error);
            }
        },
        [key, storedValue]
    );

    // Function to remove the value from localStorage
    const remove = useCallback(() => {
        try {
            setStoredValue(initialValue);
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }
        } catch (error) {
            console.warn(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    // Listen for changes to this localStorage key in other tabs/windows
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue) {
                setStoredValue(safeJsonParse<T>(e.newValue, initialValue));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, initialValue]);

    return [storedValue, setValue, remove];
}

/**
 * Hook to check if localStorage is available
 */
export function useIsLocalStorageAvailable(): boolean {
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        try {
            const test = '__localStorage_test__';
            window.localStorage.setItem(test, test);
            window.localStorage.removeItem(test);
            setIsAvailable(true);
        } catch {
            setIsAvailable(false);
        }
    }, []);

    return isAvailable;
}
