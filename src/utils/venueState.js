const VENUE_STATE_KEY = 'resto_venue_state';
const TABLE_CACHE_KEY = 'resto_table_cache';

const isBrowser =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const readVenueState = () => {
  if (!isBrowser) {
    return { isOpen: true, updatedAt: null };
  }
  try {
    const stored = window.localStorage.getItem(VENUE_STATE_KEY);
    if (!stored) {
      return { isOpen: true, updatedAt: null };
    }
    const parsed = JSON.parse(stored);
    if (typeof parsed?.isOpen !== 'boolean') {
      return { isOpen: true, updatedAt: null };
    }
    return {
      isOpen: parsed.isOpen,
      updatedAt: parsed.updatedAt ?? null,
    };
  } catch (error) {
    console.error('Error reading venue state:', error);
    return { isOpen: true, updatedAt: null };
  }
};

export const writeVenueState = (nextState) => {
  if (!isBrowser) return;
  try {
    const payload = {
      isOpen: Boolean(nextState?.isOpen),
      updatedAt: nextState?.updatedAt ?? Date.now(),
    };
    window.localStorage.setItem(VENUE_STATE_KEY, JSON.stringify(payload));
    window.dispatchEvent(
      new CustomEvent('venue:state', {
        detail: payload,
      }),
    );
  } catch (error) {
    console.error('Error writing venue state:', error);
  }
};

export const readTableCache = () => {
  if (!isBrowser) return [];
  try {
    const stored = window.localStorage.getItem(TABLE_CACHE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading table cache:', error);
    return [];
  }
};

export const writeTableCache = (tables = []) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(TABLE_CACHE_KEY, JSON.stringify(tables));
    window.dispatchEvent(
      new CustomEvent('tables:cache', {
        detail: { count: Array.isArray(tables) ? tables.length : 0 },
      }),
    );
  } catch (error) {
    console.error('Error writing table cache:', error);
  }
};

export const VENUE_CONSTANTS = {
  VENUE_STATE_KEY,
  TABLE_CACHE_KEY,
};
