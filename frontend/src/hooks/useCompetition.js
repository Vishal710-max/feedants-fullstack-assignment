import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';

/** Loads the competition (with the current user's state) and refreshes whenever the screen regains focus. */
export default function useCompetition(slug, { enabled = true, token } = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: null, clockOffset: 0 });
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  const apply = useCallback((data) => {
    if (!mounted.current) return;
    setState({ data, loading: false, error: null, clockOffset: new Date(data.serverTime).getTime() - Date.now() });
  }, []);

  const load = useCallback(async () => {
    try {
      apply((await api.getCompetition(slug)).data);
    } catch (error) {
      // keep showing stale data if we already have some; only surface the error on first load
      if (mounted.current) setState((s) => ({ ...s, loading: false, error: s.data ? null : error }));
    }
  }, [slug, token, apply]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => {
    setState((s) => (s.data ? s : { ...s, loading: true, error: null }));
    return load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      if (enabled) load();
    }, [enabled, load])
  );

  return { ...state, refresh, setData: apply };
}
