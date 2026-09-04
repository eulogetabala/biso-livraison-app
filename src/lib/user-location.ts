import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import { BRAZZAVILLE_CENTER } from './geo-data';
import { getLocationPermissionStatus, requestLocationPermission, type LocationPermissionStatus } from './permissions';

export type UserCoords = {
  latitude: number;
  longitude: number;
};

/**
 * Cache la position en mémoire : la géolocalisation peut être coûteuse, on ne
 * la re-demande donc pas à chaque écran. `refresh()` force une nouvelle mesure.
 */
let cachedCoords: UserCoords | null = null;
let cachePromise: Promise<UserCoords | null> | null = null;

async function resolveCoords(): Promise<UserCoords | null> {
  try {
    const permission = await requestLocationPermission();
    if (permission !== 'granted') return null;
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return null;
  }
}

function getCoords(): Promise<UserCoords | null> {
  if (cachedCoords) return Promise.resolve(cachedCoords);
  if (cachePromise) return cachePromise;
  cachePromise = resolveCoords().then((coords) => {
    cachedCoords = coords;
    return coords;
  });
  return cachePromise;
}

/**
 * Position actuelle de l'utilisateur. Retombe sur le centre de Brazzaville si
 * la permission est refusée ou la localisation indisponible. Expose aussi le
 * statut de la permission, re-vérifié quand l'app revient au premier plan.
 */
export function useUserLocation() {
  const [coords, setCoords] = useState<UserCoords | null>(cachedCoords ?? BRAZZAVILLE_CENTER);
  const [located, setLocated] = useState<boolean>(cachedCoords != null);
  const [permission, setPermission] = useState<LocationPermissionStatus>('denied');

  const checkPermission = useCallback(async () => {
    setPermission(await getLocationPermissionStatus());
  }, []);

  useEffect(() => {
    checkPermission();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkPermission();
    });
    return () => sub.remove();
  }, [checkPermission]);

  const refresh = useCallback(async () => {
    cachedCoords = null;
    cachePromise = null;
    const next = await getCoords();
    if (next) {
      setCoords(next);
      setLocated(true);
    }
    await checkPermission();
  }, [checkPermission]);

  useEffect(() => {
    let mounted = true;
    getCoords().then((next) => {
      if (mounted && next) {
        setCoords(next);
        setLocated(true);
      }
      if (mounted) checkPermission();
    });
    return () => {
      mounted = false;
    };
  }, [checkPermission]);

  return { coords, located, permission, refresh };
}
