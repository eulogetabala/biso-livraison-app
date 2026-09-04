import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useCart } from '../lib/cart';
import { useNotifications } from '../lib/notifications';
import { colors, radius, fonts, shadows } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({
  name,
  focused,
  color,
  badge,
}: {
  name: string;
  focused: boolean;
  color: string;
  badge?: number;
}) {
  const iconName = focused ? name : `${name}-outline`;

  return (
    <View style={styles.iconContainer}>
      <Ionicons name={iconName as any} size={24} color={color} />
      {focused && <View style={styles.activeDot} />}
      {badge != null && badge > 0 ? (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function MainTabs() {
  const { count } = useCart();
  const { requestPermission } = useNotifications();
  const permissionRequested = useRef(false);

  // Demande la permission de notification une seule fois, peu après l'entrée dans l'app.
  useEffect(() => {
    if (permissionRequested.current) return;
    permissionRequested.current = true;
    const timer = setTimeout(() => {
      requestPermission();
    }, 1200);
    return () => clearTimeout(timer);
  }, [requestPermission]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 68,
          borderRadius: radius.xl,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          paddingBottom: 0,
          paddingTop: 0,
          ...shadows.lg,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fonts.bodyMedium,
          marginTop: -2,
        },
        tabBarItemStyle: {
          paddingTop: 10,
          paddingBottom: 10,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favoris',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="heart" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Panier',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="cart" color={color} focused={focused} badge={count} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
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
  badgeContainer: {
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
});
