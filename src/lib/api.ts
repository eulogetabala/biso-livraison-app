import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 3001;

/**
 * En dev via Expo Go, la machine de dev est joignable à la même adresse
 * que le serveur Metro (hostUri = "192.168.x.x:8081"). Sur émulateur
 * Android on bascule sur 10.0.2.2.
 */
function resolveDevHost(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') return host;
  if (Platform.OS === 'android') return '10.0.2.2';
  return 'localhost';
}

export const API_HOST = resolveDevHost();
export const API_URL = `http://${API_HOST}:${API_PORT}`;

/** Transforme une URL d'image relative (ex: /uploads/x.jpg) en URL absolue. */
export function assetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
