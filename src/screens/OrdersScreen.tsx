import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { useMyOrdersQuery } from '../graphql/operations';
import { assetUrl } from '../lib/api';
import { MOCK_MODE } from '../config/mock';
import { getMockOrders } from '../mocks/service';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { EmptyState, formatDateTime, formatPrice, Spinner, StatusBadge } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import FloatingBackButton from '../components/FloatingBackButton';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;

const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'IN_TRANSIT', 'ASSIGNED'];
const HISTORY_STATUSES = ['DELIVERED', 'CANCELLED', 'PAID'];

const TABS = [
  { key: 'active', label: 'En cours' },
  { key: 'history', label: 'Historique' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const PROGRESS_STEPS = ['PENDING', 'CONFIRMED', 'PREPARING', 'IN_TRANSIT'] as const;

function getProgressIndex(status: string): number {
  const idx = PROGRESS_STEPS.indexOf(status as any);
  return idx === -1 ? 0 : idx;
}

export default function OrdersScreen({ navigation }: Props) {
  const [mockOrders, setMockOrders] = useState<any[]>([]);
  const [mockLoading, setMockLoading] = useState(MOCK_MODE);
  const insets = useSafeAreaInsets();
  const { data, loading, error, refetch } = useMyOrdersQuery({
    variables: { page: 1, limit: 20 },
    skip: MOCK_MODE,
  });

  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const orders = MOCK_MODE ? mockOrders : data?.myOrders.items ?? [];

  useEffect(() => {
    if (!MOCK_MODE) return;
    let mounted = true;
    getMockOrders().then((items) => {
      if (mounted) {
        setMockOrders(items);
        setMockLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const statuses = activeTab === 'active' ? ACTIVE_STATUSES : HISTORY_STATUSES;
    return orders.filter((o: any) => statuses.includes(o.status));
  }, [orders, activeTab]);

  const switchTab = useCallback((tab: TabKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
    Animated.spring(indicatorAnim, {
      toValue: tab === 'active' ? 0 : 1,
      tension: 68,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [indicatorAnim]);

  if ((MOCK_MODE && mockLoading) || (loading && !data)) return <Spinner />;
  if (!MOCK_MODE && error) {
    return (
      <EmptyState
        title="Impossible de charger vos commandes"
        subtitle="Vérifiez votre connexion puis réessayez."
      />
    );
  }

  return (
    <View style={styles.container}>
      <FloatingBackButton navigation={navigation} />
      <View style={{ height: insets.top + 44 }}>
        <Text style={styles.pageTitle}>Mes commandes</Text>
      </View>
      <TabBar
        activeTab={activeTab}
        indicatorAnim={indicatorAnim}
        onSwitch={switchTab}
      />

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        onRefresh={() => {
          if (MOCK_MODE) {
            setMockLoading(true);
            getMockOrders().then((items) => {
              setMockOrders(items);
              setMockLoading(false);
            });
            return;
          }
          refetch();
        }}
        refreshing={MOCK_MODE ? mockLoading : loading}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={activeTab === 'active' ? 'timer-outline' : 'receipt-outline'}
            title={activeTab === 'active' ? 'Aucune commande en cours' : 'Aucun historique'}
            subtitle={
              activeTab === 'active'
                ? 'Vos commandes actives apparaîtront ici.'
                : 'Vos commandes passées apparaîtront ici.'
            }
          />
        }
        renderItem={({ item, index }) => (
          <OrderCard
            order={item}
            index={index}
            isActive={activeTab === 'active'}
            onPress={() => navigation.navigate('OrderDetail', { id: item.id })}
          />
        )}
      />
    </View>
  );
}

/* ─── Tab Bar ─── */

function TabBar({
  activeTab,
  indicatorAnim,
  onSwitch,
}: {
  activeTab: TabKey;
  indicatorAnim: Animated.Value;
  onSwitch: (tab: TabKey) => void;
}) {
  const [tabWidth, setTabWidth] = useState(0);

  const translateX = indicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, tabWidth + 4],
  });

  return (
    <View
      style={styles.tabContainer}
      onLayout={(e) => setTabWidth((e.nativeEvent.layout.width - 8) / 2)}
    >
      <Animated.View
        style={[
          styles.tabIndicator,
          { width: tabWidth, transform: [{ translateX }] },
        ]}
      />
      {TABS.map((tab) => (
        <Pressable
          key={tab.key}
          style={styles.tab}
          onPress={() => onSwitch(tab.key)}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === tab.key && styles.tabLabelActive,
            ]}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

/* ─── Order Card ─── */

function OrderCard({
  order,
  index,
  isActive,
  onPress,
}: {
  order: any;
  index: number;
  isActive: boolean;
  onPress: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);

    const delay = Math.min(index * 100, 400);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index, isActive]);

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [glowAnim, isActive]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.3],
  });

  const progressIdx = getProgressIndex(order.status);

  return (
    <Animated.View
      style={[
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
      ]}
    >
      {isActive && (
        <Animated.View
          style={[
            styles.cardGlow,
            { opacity: glowOpacity },
          ]}
        />
      )}
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          isActive ? styles.cardActive : styles.cardHistory,
        ]}
      >
        {order.restaurant?.imageUrl ? (
          <Image
            source={{ uri: assetUrl(order.restaurant.imageUrl) }}
            style={styles.cardImage}
          />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Ionicons
              name="restaurant"
              size={28}
              color={isActive ? colors.primary : colors.textMuted + '40'}
            />
          </View>
        )}

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text
              style={[styles.cardName, !isActive && styles.cardNameMuted]}
              numberOfLines={1}
            >
              {order.restaurant?.name ?? 'Restaurant'}
            </Text>
            <StatusBadge status={order.status} />
          </View>

          {isActive && (
            <View style={styles.progressRow}>
              {PROGRESS_STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    i <= progressIdx
                      ? styles.progressDotActive
                      : styles.progressDotInactive,
                  ]}
                />
              ))}
            </View>
          )}

          <View style={styles.cardFooter}>
            <View style={styles.cardDateRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
              <Text style={styles.cardDate}>{formatDateTime(order.createdAt)}</Text>
            </View>
            <Text style={[styles.cardTotal, !isActive && styles.cardTotalMuted]}>
              {formatPrice(order.grandTotal)}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* ─── Styles ─── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.titleBold,
    fontSize: 22,
    color: colors.secondary,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.border + '80',
    borderRadius: radius.sm,
    padding: 4,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
  },
  tabLabelActive: {
    fontFamily: fonts.bodyBold,
    color: colors.primary,
  },

  // List
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardActive: {
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.primary + '18',
  },
  cardHistory: {
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border + '60',
  },
  cardGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: radius.md + 2,
    backgroundColor: colors.primary,
  },
  cardImage: {
    width: 80,
    height: 'auto' as any,
    minHeight: 100,
    backgroundColor: colors.primaryLight,
  },
  cardImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight + '80',
  },
  cardBody: {
    flex: 1,
    padding: spacing.md,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardName: {
    fontSize: 15,
    fontFamily: fonts.titleSemiBold,
    color: colors.secondary,
    flex: 1,
  },
  cardNameMuted: {
    color: colors.textMuted,
  },

  // Progress dots
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginTop: 2,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressDotInactive: {
    backgroundColor: colors.border,
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.xs + 2,
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardDate: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
  },
  cardTotal: {
    fontSize: 15,
    fontFamily: fonts.titleBold,
    color: colors.primary,
  },
  cardTotalMuted: {
    color: colors.textMuted,
  },
});
