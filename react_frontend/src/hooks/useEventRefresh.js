import { useCallback } from 'react';
import { fetchEventById } from '../api/client';

// PUBLIC_INTERFACE
export function useEventRefresh(setter) {
  /** Hook returns a function to refresh an event by id and update provided setter */
  const refresh = useCallback(async (id) => {
    const controller = new AbortController();
    try {
      const data = await fetchEventById(id, controller.signal);
      setter(data);
    } catch (e) {
      // ignore here; page can handle error states separately
      // console.error(e);
    }
    return () => controller.abort();
  }, [setter]);
  return refresh;
}
