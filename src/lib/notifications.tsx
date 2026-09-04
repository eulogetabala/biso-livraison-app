import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useRegisterPushTokenMutation, useUnreadNotificationsCountQuery } from '../graphql/operations';
import { useAuth } from './auth';

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Notifications Biso',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FE6400',
  });
}

export type NotificationPermissionState =
  | 'granted'
  | 'denied'
  | 'undetermined'
  | 'unavailable';

type NotificationsContextValue = {
  permission: NotificationPermissionState;
  expoPushToken: string | null;
  unreadCount: number;
  requestPermission: () => Promise<void>;
  markAllRead: () => void;
  refetchUnreadCount: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) return null;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing !== 'granted') return null;
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch {
    return null;
  }
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { data, refetch } = useUnreadNotificationsCountQuery({ skip: !user });
  const [registerPushToken] = useRegisterPushTokenMutation();

  const [permission, setPermission] = useState<NotificationPermissionState>('undetermined');
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const unreadCount = data?.unreadNotificationsCount ?? 0;

  const syncPushToken = useCallback(
    async (token: string | null) => {
      setExpoPushToken(token);
      if (token && user) {
        try {
          await registerPushToken({ variables: { token } });
        } catch {
          // Ignore — token sync is best-effort.
        }
      }
    },
    [user, registerPushToken],
  );

  const checkPermission = useCallback(async () => {
    if (!Device.isDevice) {
      setPermission('unavailable');
      return;
    }
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermission(status as NotificationPermissionState);
    } catch {
      setPermission('unavailable');
    }
  }, []);

  useEffect(() => {
    checkPermission();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkPermission();
    });
    return () => sub.remove();
  }, [checkPermission]);

  useEffect(() => {
    let mounted = true;
    if (permission !== 'granted') return;
    registerForPushNotificationsAsync().then((token) => {
      if (mounted) void syncPushToken(token);
    });
    return () => {
      mounted = false;
    };
  }, [permission, syncPushToken]);

  useEffect(() => {
    if (permission === 'granted' && expoPushToken && user) {
      void syncPushToken(expoPushToken);
    }
  }, [user, permission, expoPushToken, syncPushToken]);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermission(status as NotificationPermissionState);
      if (status === 'granted') {
        const token = await registerForPushNotificationsAsync();
        await syncPushToken(token);
      }
    } catch {
      setPermission('unavailable');
    }
  }, [syncPushToken]);

  const markAllRead = useCallback(() => {
    void refetch();
  }, [refetch]);

  const refetchUnreadCount = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <NotificationsContext.Provider
      value={{ permission, expoPushToken, unreadCount, requestPermission, markAllRead, refetchUnreadCount }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
