import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 3001;
const PROD_API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ??
  'https://biso-api.onrender.com';

export type ApiMode = 'auto' | 'local' | 'prod';
export type ApiTarget = 'local' | 'prod';

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

export function getLocalApiUrl(): string {
  return `http://${resolveDevHost()}:${API_PORT}`;
}

export function getProdApiUrl(): string {
  return PROD_API_URL;
}

export function getApiMode(): ApiMode {
  const mode = process.env.EXPO_PUBLIC_API_MODE;
  if (mode === 'local' || mode === 'prod') return mode;
  return 'auto';
}

function initialApiUrl(): string {
  if (!__DEV__) return PROD_API_URL;
  if (getApiMode() === 'prod') return PROD_API_URL;
  return getLocalApiUrl();
}

let activeApiUrl = initialApiUrl();
let activeApiTarget: ApiTarget = activeApiUrl === PROD_API_URL ? 'prod' : 'local';

export function getApiUrl(): string {
  return activeApiUrl;
}

export function getApiTarget(): ApiTarget {
  return activeApiTarget;
}

async function isApiReachable(baseUrl: string, timeoutMs = 3000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(`${baseUrl}/health`, { signal: controller.signal });
    clearTimeout(timer);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Dev + mode auto : backend local s'il répond, sinon Render.
 * Build prod : toujours Render.
 */
export async function bootstrapApiUrl(): Promise<string> {
  const localUrl = getLocalApiUrl();
  const prodUrl = getProdApiUrl();
  const mode = getApiMode();

  if (!__DEV__) {
    activeApiUrl = prodUrl;
    activeApiTarget = 'prod';
    return activeApiUrl;
  }

  if (mode === 'local') {
    activeApiUrl = localUrl;
    activeApiTarget = 'local';
    return activeApiUrl;
  }

  if (mode === 'prod') {
    activeApiUrl = prodUrl;
    activeApiTarget = 'prod';
    return activeApiUrl;
  }

  if (await isApiReachable(localUrl)) {
    activeApiUrl = localUrl;
    activeApiTarget = 'local';
  } else {
    activeApiUrl = prodUrl;
    activeApiTarget = 'prod';
  }

  if (__DEV__) {
    console.log(`[api] ${activeApiTarget} → ${activeApiUrl}`);
  }

  return activeApiUrl;
}

/** Transforme une URL d'image relative (ex: /uploads/x.jpg) en URL absolue. */
export function assetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  const base = getApiUrl();
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
