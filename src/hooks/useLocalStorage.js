import { useState, useCallback, useEffect } from 'react';

/**
 * Persist state in namespaced localStorage with cross-tab synchronization (F2, F5, F6).
 */
export function useLocalStorage(key, initialValue) {
  const readValue = useCallback(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item === null || item === 'undefined') {
        return typeof initialValue === 'function' ? initialValue() : initialValue;
      }
      return JSON.parse(item);
    } catch (err) {
      console.warn(`Error reading localStorage key "${key}":`, err);
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = useCallback(
    (value) => {
      try {
        setStoredValue((prev) => {
          const nextValue = typeof value === 'function' ? value(prev) : value;
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, JSON.stringify(nextValue));
          }
          return nextValue;
        });
      } catch (err) {
        console.warn(`Error writing localStorage key "${key}":`, err);
      }
    },
    [key]
  );

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === key) {
        setStoredValue(readValue());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key, readValue]);

  return [storedValue, setValue];
}
