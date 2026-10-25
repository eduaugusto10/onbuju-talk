import { useEffect } from 'react';
import { persistValue } from '../services/persistenceService';

export function usePersistedValue(key: string, value: string, ready: boolean, onError: () => void) {
  useEffect(() => {
    if (!ready) return;
    persistValue(key, value, onError);
  }, [key, value, ready, onError]);
}
