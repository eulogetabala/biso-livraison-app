import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useMenuItemsByRestaurantQuery, useRestaurantQuery } from '../graphql/operations';
import type { MenuItemModel, MenuItemCategory } from '../graphql/types';
import { assetUrl } from '../lib/api';
import { useCart } from '../lib/cart';
import { MOCK_MODE } from '../config/mock';
import { getMockMenuByRestaurant, getMockRestaurantById } from '../mocks/service';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { formatPrice, Spinner } from '../components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Restaurant'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 280;
const CARD_OVERLAP = 50;

const CATEGORY_LABELS: Record<MenuItemCategory, string> = {
  APPETIZER: '🥗 Entrées',
  MAIN_COURSE: '🍕 Plats principaux',
  SIDE: '🍟 Accompagnements',
  DESSERT: '🧁 Desserts',
  DRINK: '🥤 Boissons',
  SNACK: '🍿 Snacks',
  FRUIT: '🍎 Fruits',
  LUNCH: '🍱 Menus midi',
};

export default function RestaurantScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { data: restaurantData, loading: restaurantLoading } = useRestaurantQuery({
    variables: { id },
    skip: MOCK_MODE,
  });
  const { data: menuData, loading: menuLoading } = useMenuItemsByRestaurantQuery({
    variables: { restaurantId: id, page: 1, limit: 50 },
    skip: MOCK_MODE,
  });

  const restaurant = MOCK_MODE ? getMockRestaurantById(String(id)) : restaurantData?.restaurant;
  const items = MOCK_MODE ? getMockMenuByRestaurant(String(id)) : menuData?.menuItemsByRestaurant.items ?? [];
  const { addItem, count, total } = useCart();

  const grouped = useMemo(() => {
    const groups = new Map<MenuItemCategory, MenuItemModel[]>();
    for (const item of items) {
      if (!item.isAvailable) continue;
      const list = groups.get(item.category) ?? [];
      list.push(item);
      groups.set(item.category, list);
    }
    return groups;
  }, [items]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const cartTranslateY = useRef(new Animated.Value(120)).current;

  useEffect(() => {
    if (count > 0) {
      Animated.spring(cartTranslateY, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(cartTranslateY, {
        toValue: 120,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [count, cartTranslateY]);

  const handleAdd = useCallback(
    (menuItem: MenuItemModel) => {
      if (restaurant) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        addItem(menuItem, restaurant.id, restaurant.name, restaurant.deliveryFee);
      }
    },
    [restaurant, addItem],
  );

  if ((!MOCK_MODE && restaurantLoading) || (!MOCK_MODE && menuLoading)) return <Spinner />;

  const sections = Array.from(grouped.entries()).map(([category, categoryItems]) => ({
    key: category,
    title: CATEGORY_LABELS[category] ?? category,
    data: categoryItems,
  }));

  const coverUrl = assetUrl(restaurant?.coverImageUrl ?? restaurant?.imageUrl);

  const heroTranslateY = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT],
    outputRange: [-HERO_HEIGHT / 2, 0, HERO_HEIGHT / 3],
    extrapolate: 'clamp',
  });

  const heroScale = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0],
    outputRange: [2, 1],
    extrapolateRight: 'clamp',
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.6],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });

  const pillsOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.4],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero */}
        <View style={styles.heroWrapper}>
          <Animated.View
            style={[
              styles.heroImageContainer,
              {
                transform: [{ translateY: heroTranslateY }, { scale: heroScale }],
                opacity: heroOpacity,
              },
            ]}
          >
            {coverUrl ? (
              <Image source={{ uri: coverUrl }} style={styles.heroImage} />
            ) : (
              <View style={[styles.heroImage, { backgroundColor: colors.primaryLight }]} />
            )}
          </Animated.View>

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            style={styles.heroGradient}
          />

          {/* Glass pills on hero */}
          <Animated.View style={[styles.glassPillsRow, { opacity: pillsOpacity }]}>
            {restaurant?.rating ? (
              <View style={styles.glassPill}>
                <Ionicons name="star" size={12} color={colors.warning} />
                <Text style={styles.glassPillText}>{restaurant.rating.toFixed(1)}</Text>
              </View>
            ) : null}
            {restaurant?.estimatedDeliveryTime ? (
              <View style={styles.glassPill}>
                <Ionicons name="time-outline" size={12} color="#fff" />
                <Text style={styles.glassPillText}>{restaurant.estimatedDeliveryTime} min</Text>
              </View>
            ) : null}
            <View style={styles.glassPill}>
              <Ionicons name="bicycle-outline" size={12} color="#fff" />
              <Text style={styles.glassPillText}>
                {restaurant?.deliveryFee === 0 ? 'Gratuit' : formatPrice(restaurant?.deliveryFee ?? 0)}
              </Text>
            </View>
          </Animated.View>

          {/* Back button */}
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <View style={styles.backButtonInner}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </View>
          </Pressable>
        </View>

        {/* Floating info card */}
        <View style={styles.floatingCard}>
          <View style={styles.titleRow}>
            <Text style={styles.restaurantName} numberOfLines={2}>
              {restaurant?.name ?? route.params.name}
            </Text>
            {restaurant?.rating ? (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={13} color="#fff" />
                <Text style={styles.ratingBadgeText}>{restaurant.rating.toFixed(1)}</Text>
              </View>
            ) : null}
          </View>

          {restaurant?.cuisineType ? (
            <Text style={styles.cuisineText}>{restaurant.cuisineType}</Text>
          ) : null}

          {restaurant?.description ? (
            <Text style={styles.descriptionText}>{restaurant.description}</Text>
          ) : null}

          <View style={styles.cardDivider} />

          <View style={styles.deliveryRow}>
            <View style={styles.deliveryItem}>
              <View style={styles.deliveryIconCircle}>
                <Ionicons name="bicycle" size={18} color={colors.primary} />
              </View>
              <Text style={styles.deliveryLabel}>Livraison</Text>
              <Text style={styles.deliveryValue}>
                {restaurant?.deliveryFee === 0
                  ? 'Offerte'
                  : formatPrice(restaurant?.deliveryFee ?? 0)}
              </Text>
            </View>

            <View style={styles.deliveryVerticalDivider} />

            <View style={styles.deliveryItem}>
              <View style={[styles.deliveryIconCircle, { backgroundColor: colors.secondaryLight }]}>
                <Ionicons name="time" size={18} color={colors.secondary} />
              </View>
              <Text style={styles.deliveryLabel}>Temps estimé</Text>
              <Text style={styles.deliveryValue}>
                {restaurant?.estimatedDeliveryTime ?? 30} min
              </Text>
            </View>
          </View>
        </View>

        {/* Menu sections */}
        {sections.map((section) => (
          <View key={section.key} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionLine} />
            </View>
            {section.data.map((menuItem) => (
              <MenuItemCard
                key={menuItem.id}
                item={menuItem}
                onAdd={() => handleAdd(menuItem)}
              />
            ))}
          </View>
        ))}
      </Animated.ScrollView>

      {/* Cart bar */}
      <Animated.View
        style={[styles.cartBarWrapper, { transform: [{ translateY: cartTranslateY }] }]}
      >
        <Pressable onPress={() => navigation.navigate('Checkout')}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cartBar}
          >
            <View style={styles.cartBarLeft}>
              <View style={styles.cartIconWrap}>
                <Ionicons name="cart" size={20} color="#fff" />
                <View style={styles.cartCountBadge}>
                  <Text style={styles.cartCountText}>{count}</Text>
                </View>
              </View>
              <Text style={styles.cartBarLabel}>Voir le panier</Text>
            </View>
            <View style={styles.cartBarRight}>
              <Text style={styles.cartBarPrice}>{formatPrice(total)}</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function MenuItemCard({ item, onAdd }: { item: MenuItemModel; onAdd: () => void }) {
  const imageUrl = assetUrl(item.imageUrl);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.75,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
    onAdd();
  };

  return (
    <View style={styles.menuCard}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.menuCardImage} />
      ) : (
        <View style={[styles.menuCardImage, styles.menuCardImagePlaceholder]}>
          <Ionicons name="fast-food" size={28} color={colors.primary + '30'} />
        </View>
      )}

      <View style={styles.menuCardBody}>
        <Text style={styles.menuCardName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.description ? (
          <Text style={styles.menuCardDesc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <Text style={styles.menuCardPrice}>{formatPrice(item.price)}</Text>
      </View>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable onPress={handlePress}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.addBtn}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Hero
  heroWrapper: {
    height: HERO_HEIGHT,
    overflow: 'hidden',
    backgroundColor: colors.secondary,
  },
  heroImageContainer: {
    ...StyleSheet.absoluteFill,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    resizeMode: 'cover',
  } as any,
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_HEIGHT * 0.55,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 36,
    left: spacing.md,
    zIndex: 10,
  },
  backButtonInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Glass pills
  glassPillsRow: {
    position: 'absolute',
    bottom: CARD_OVERLAP + 14,
    right: spacing.md,
    flexDirection: 'row',
    gap: 6,
  },
  glassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  glassPillText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: fonts.bodyBold,
    fontWeight: '700',
  },

  // Floating card
  floatingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginTop: -CARD_OVERLAP,
    padding: spacing.lg,
    ...shadows.lg,
    shadowColor: '#002774',
    shadowOpacity: 0.12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  restaurantName: {
    flex: 1,
    fontSize: 24,
    fontFamily: fonts.titleBold,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: -0.3,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  ratingBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: fonts.bodyBold,
    fontWeight: '700',
  },
  cuisineText: {
    fontSize: 14,
    fontFamily: fonts.bodyBold,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 6,
  },
  descriptionText: {
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  deliveryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  deliveryLabel: {
    fontSize: 11,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
  },
  deliveryValue: {
    fontSize: 14,
    fontFamily: fonts.titleBold,
    fontWeight: '700',
    color: colors.secondary,
  },
  deliveryVerticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },

  // Sections
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: fonts.titleBold,
    fontWeight: '700',
    color: colors.secondary,
  },
  sectionLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: colors.border,
    borderRadius: 1,
  },

  // Menu card
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadows.sm,
  },
  menuCardImage: {
    width: 80,
    height: 80,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  } as any,
  menuCardImagePlaceholder: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCardBody: {
    flex: 1,
  },
  menuCardName: {
    fontSize: 15,
    fontFamily: fonts.titleSemiBold,
    fontWeight: '600',
    color: colors.text,
  },
  menuCardDesc: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 3,
  },
  menuCardPrice: {
    fontSize: 16,
    fontFamily: fonts.titleBold,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 6,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow(colors.primary),
  },

  // Cart bar
  cartBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    zIndex: 99,
  },
  cartBar: {
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.glow(colors.primary),
  },
  cartBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartIconWrap: {
    position: 'relative',
  },
  cartCountBadge: {
    position: 'absolute',
    top: -7,
    right: -9,
    backgroundColor: '#fff',
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountText: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
    fontWeight: '800',
  },
  cartBarLabel: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.titleBold,
    fontWeight: '700',
  },
  cartBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartBarPrice: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.titleBold,
    fontWeight: '700',
  },
});
