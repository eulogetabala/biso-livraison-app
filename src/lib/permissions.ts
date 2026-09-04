import { Alert, Linking } from 'react-native';
import * as Location from 'expo-location';

export type LocationPermissionStatus = 'granted' | 'denied' | 'blocked';

/**
 * Demande la permission de localisation (premier plan) et distingue le cas
 * "bloqué" (l'utilisateur ne peut plus être re-sollicité, il doit passer par
 * les réglages du système) du simple refus.
 */
export async function requestLocationPermission(): Promise<LocationPermissionStatus> {
  try {
    const current = await Location.getForegroundPermissionsAsync();
    if (current.status === 'granted') return 'granted';
    if (current.status === 'denied' && !current.canAskAgain) return 'blocked';

    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') return 'granted';
    if (status === 'denied' && !canAskAgain) return 'blocked';
    return 'denied';
  } catch {
    return 'denied';
  }
}

/** Lit l'état actuel sans ouvrir de dialogue système. */
export async function getLocationPermissionStatus(): Promise<LocationPermissionStatus> {
  try {
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
    if (status === 'granted') return 'granted';
    return status === 'denied' && !canAskAgain ? 'blocked' : 'denied';
  } catch {
    return 'denied';
  }
}

/** Ouvre les réglages de l'application (iOS / Android). */
export function openAppSettings() {
  Linking.openSettings().catch(() => undefined);
}

/**
 * Affiche une alerte cohérente quand la localisation est refusée.
 * - bloquée : invite à ouvrir les réglages.
 * - simple refus : propose de réessayer.
 */
export function promptLocationDenied(status: LocationPermissionStatus, onRetry?: () => void) {
  if (status === 'granted') return;
  const blocked = status === 'blocked';
  Alert.alert(
    'Localisation désactivée',
    blocked
      ? 'Biso Livraison a besoin de votre position pour calculer les distances, les frais de livraison et trouver les restaurants près de vous. Autorisez l’accès à la localisation dans les réglages de votre téléphone.'
      : 'Biso Livraison utilise votre position pour calculer les distances, les frais de livraison et trouver les restaurants près de vous.',
    blocked
      ? [
          { text: 'Ouvrir les réglages', onPress: openAppSettings },
          { text: 'Annuler', style: 'cancel' },
        ]
      : [
          { text: 'Réessayer', onPress: onRetry },
          { text: 'Annuler', style: 'cancel' },
        ],
  );
}
