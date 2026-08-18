import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useCart } from '../lib/cart';
import { colors } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function HomeIcon({ color }: { color: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, color }}>🏠</Text>
    </View>
  );
}

function OrdersIcon({ color, badge }: { color: string; badge?: number }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, color }}>📦</Text>
      {badge && badge > 0 ? (
        <View
          style={{
            position: 'absolute',
            top: -6,
            right: -12,
            backgroundColor: colors.primary,
            borderRadius: 9,
            minWidth: 18,
            height: 18,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, color }}>👤</Text>
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
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Accueil', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Commandes',
          tabBarIcon: ({ color }) => <OrdersIcon color={color} badge={count} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil', tabBarIcon: ({ color }) => <ProfileIcon color={color} /> }}
      />
    </Tab.Navigator>
  );
}
