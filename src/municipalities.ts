// Mirrors the API's catalog (GET /provinces, GET /municipalities).
import { useEffect, useState } from 'react';
import { useApi } from './api.ts';

export interface Province {
  id: string;
  name: string;
}

export interface Municipality {
  id: string;
  name: string;
  provinceId: string;
  provinceName: string;
}

export function useProvinces(): Province[] | null {
  const api = useApi();
  const [provinces, setProvinces] = useState<Province[] | null>(null);
  useEffect(() => {
    api<Province[]>('GET', '/provinces')
      .then(setProvinces)
      .catch(() => setProvinces([]));
  }, [api]);
  return provinces;
}

// Every municipality of the province; null while loading or without a province.
export function useMunicipalities(provinceId: string): Municipality[] | null {
  const api = useApi();
  const [loaded, setLoaded] = useState<{ provinceId: string; municipalities: Municipality[] } | null>(null);
  useEffect(() => {
    if (!provinceId) {
      return;
    }
    let ignore = false;
    api<Municipality[]>('GET', `/municipalities?provinceId=${provinceId}`)
      .then((municipalities) => !ignore && setLoaded({ provinceId, municipalities }))
      .catch(() => !ignore && setLoaded({ provinceId, municipalities: [] }));
    return () => {
      ignore = true;
    };
  }, [api, provinceId]);
  return loaded?.provinceId === provinceId ? loaded.municipalities : null;
}
