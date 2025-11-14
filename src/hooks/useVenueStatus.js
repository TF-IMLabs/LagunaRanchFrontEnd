import { useCallback, useEffect, useState } from 'react';
import { readVenueState, writeVenueState, VENUE_CONSTANTS } from '../utils/venueState';

const useVenueStatus = () => {
  const [state, setState] = useState(() => readVenueState());

  const refresh = useCallback(() => {
    setState(readVenueState());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return () => {};
    }
    const handleStorage = (event) => {
      if (!event || typeof event !== 'object') {
        refresh();
        return;
      }
      if (
        event.key === VENUE_CONSTANTS.VENUE_STATE_KEY ||
        event.type === 'venue:state' ||
        event.type === 'storage'
      ) {
        refresh();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('venue:state', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('venue:state', handleStorage);
    };
  }, [refresh]);

  const setVenueStatus = useCallback((next) => {
    writeVenueState(next);
    refresh();
  }, [refresh]);

  return {
    isOpen: state.isOpen,
    updatedAt: state.updatedAt,
    setVenueStatus,
  };
};

export default useVenueStatus;
