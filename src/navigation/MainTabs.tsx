import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useCart } from '../lib/cart';
import { colors, radius, fonts, shadows, spacing } from '../theme';
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
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Commandes',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="receipt" color={color} focused={focused} badge={count} />
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
