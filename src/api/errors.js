/**
 * Typed error taxonomy for CineSearch catalogue requests (F4, CS-01, CS-04).
 * Kinds: 'quota' | 'network' | 'not-found' | 'upstream'
 */
export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {'quota' | 'network' | 'not-found' | 'upstream'} kind
   * @param {number} [status=0]
   */
  constructor(message, kind = 'upstream', status = 0) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.retryable = kind === 'network' || (kind === 'upstream' && status >= 500);
  }
}

/**
 * Normalizes any HTTP status, provider payload, or thrown error into an ApiError.
 */
export function classifyApiError(statusOrError, payload = null) {
  if (statusOrError instanceof ApiError) {
    return statusOrError;
  }

  // Network / fetch level error
  if (statusOrError instanceof Error) {
    if (statusOrError.name === 'AbortError') {
      throw statusOrError;
    }
    const msg = statusOrError.message || '';
    if (
      msg.toLowerCase().includes('quota') ||
      msg.toLowerCase().includes('limit reached')
    ) {
      return new ApiError(
        'Daily API request quota reached. Cached searches and your watchlist remain available.',
        'quota',
        429
      );
    }
    return new ApiError(
      'Unable to reach the catalogue service. Check your network connection and try again.',
      'network',
      0
    );
  }

  const status = typeof statusOrError === 'number' ? statusOrError : 500;
  const rawMessage =
    payload?.error ||
    payload?.Error ||
    payload?.status_message ||
    'Catalogue request failed';
  const lowerMsg = String(rawMessage).toLowerCase();

  if (
    status === 429 ||
    lowerMsg.includes('request limit reached') ||
    lowerMsg.includes('daily limit') ||
    lowerMsg.includes('quota')
  ) {
    return new ApiError(
      'Daily API request quota exhausted (1,000 requests/day limit). Previously viewed titles and your Watchlist are still accessible.',
      'quota',
      429
    );
  }

  if (
    status === 404 ||
    lowerMsg.includes('movie not found') ||
    lowerMsg.includes('series not found') ||
    lowerMsg.includes('episode not found') ||
    lowerMsg.includes('incorrect imdb id') ||
    lowerMsg.includes('error getting data')
  ) {
    return new ApiError(rawMessage, 'not-found', 404);
  }

  if (status === 0) {
    return new ApiError(
      'Network connection interrupted. Please verify your internet connection.',
      'network',
      0
    );
  }

  return new ApiError(
    rawMessage || 'The upstream movie catalogue returned an unexpected error.',
    'upstream',
    status
  );
}
