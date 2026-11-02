import { omdbAdapter } from './omdbAdapter.js';
import { tmdbAdapter } from './tmdbAdapter.js';

const PROVIDER_STORAGE_KEY = 'cinesearch:provider';

/**
 * Returns the active provider identifier ('omdb' or 'tmdb').
 * Defaults to VITE_DATA_PROVIDER env var or 'omdb' (F8).
 */
export function getActiveProviderId() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(PROVIDER_STORAGE_KEY);
      if (stored === 'tmdb' || stored === 'omdb') {
        return stored;
      }
    }
  } catch {
    // Ignore storage read errors
  }

  try {
    const envVal = import.meta?.env?.VITE_DATA_PROVIDER;
    if (envVal && String(envVal).toLowerCase() === 'tmdb') {
      return 'tmdb';
    }
  } catch {
    // Ignore in Node test runner
  }

  return 'omdb';
}

export function setActiveProviderId(providerId) {
  const next = providerId === 'tmdb' ? 'tmdb' : 'omdb';
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PROVIDER_STORAGE_KEY, next);
      window.dispatchEvent(new CustomEvent('cinesearch:provider-change', { detail: next }));
    }
  } catch {
    // Ignore storage errors
  }
  return next;
}

export function getProviderAdapter(providerId = getActiveProviderId()) {
  return providerId === 'tmdb' ? tmdbAdapter : omdbAdapter;
}
