import React, { useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { useCart } from '../lib/cart';
import { colors, radius, fonts, shadows } from '../theme';
import type { RootStackParamList } from '../navigation/types';

/** Espace vertical occupé par la barre (offset bas de l'écran → haut de la barre). */
export const TAB_BAR_BOTTOM = 20;
export const TAB_BAR_HEIGHT = 68;
export const TAB_BAR_OFFSET = TAB_BAR_BOTTOM + TAB_BAR_HEIGHT + 8;

/** Écrans qui possèdent déjà leur propre barre (auth, tabs) → pas de menu global. */
const HIDDEN_ROUTES = new Set([
  'Splash',
  'Onboarding',
  'Login',
  'Register',
  'Otp',
  'ForgotPassword',
  'Main',
]);

/** Associe chaque écran stack au tab auquel il appartient. */
const ROUTE_TO_TAB: Record<string, 'Home' | 'Favorites' | 'Cart' | 'Profile'> = {
  Home: 'Home',
  Categories: 'Home',
  Restaurants: 'Home',
  Products: 'Home',
  Restaurant: 'Home',
  Parcel: 'Home',
  Drivers: 'Home',
  DriverDetail: 'Home',
  NearbyMap: 'Home',
  Notifications: 'Home',
  Favorites: 'Favorites',
  Cart: 'Cart',
  Checkout: 'Cart',
  Profile: 'Profile',
  Orders: 'Profile',
  OrderDetail: 'Profile',
};

const TABS: { key: 'Home' | 'Favorites' | 'Cart' | 'Profile'; label: string; icon: 'home' | 'heart' | 'cart' | 'person' }[] = [
  { key: 'Home', label: 'Accueil', icon: 'home' },
  { key: 'Favorites', label: 'Favoris', icon: 'heart' },
  { key: 'Cart', label: 'Panier', icon: 'cart' },
  { key: 'Profile', label: 'Profil', icon: 'person' },
];

type Props = {
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>;
  routeName: string | null;
};

/**
 * Barre de navigation inférieure flottante, identique à celle des onglets.
 * Affichée par-dessus les écrans de détail (stack) afin que le menu
 * principal reste accessible partout.
 */
export default function AppTabBar({ navigationRef, routeName }: Props) {
  const { count } = useCart();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (keyboardVisible || !routeName || HIDDEN_ROUTES.has(routeName)) return null;

  const activeTab = ROUTE_TO_TAB[routeName] ?? 'Home';

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          const iconName = active ? tab.icon : `${tab.icon}-outline`;
          const showBadge = tab.key === 'Cart' && count > 0;
          return (
            <Pressable
              key={tab.key}
              style={styles.tab}
              onPress={() => navigationRef.navigate('Main', { screen: tab.key })}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={iconName as any}
                  size={24}
                  color={active ? colors.primary : colors.textMuted}
                />
                {active && <View style={styles.activeDot} />}
                {showBadge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  bar: {
    position: 'absolute',
    bottom: TAB_BAR_BOTTOM,
    left: 20,
    right: 20,
    height: TAB_BAR_HEIGHT,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    ...shadows.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginTop: 3,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -12,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: fonts.bodyBold,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    marginTop: 3,
  },
  labelActive: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
});
