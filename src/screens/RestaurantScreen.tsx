import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMenuItemsByRestaurantQuery, useRestaurantQuery } from '../graphql/operations';
import type { MenuItemModel, MenuItemCategory } from '../graphql/types';
import { assetUrl } from '../lib/api';
import { useCart } from '../lib/cart';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { TAB_BAR_OFFSET } from '../components/AppTabBar';
import { restaurantDistanceKm } from '../lib/geo-data';
import { useUserLocation } from '../lib/user-location';
import { formatPrice, Spinner } from '../components/ui';
import ProductDetailModal from '../components/ProductDetailModal';
import OpenClosedBadge from '../components/OpenClosedBadge';
import PhoneNumber from '../components/PhoneNumber';
import { useFavorites } from '../lib/favorites';
import type { CartSupplement } from '../lib/cart';
import { formatCuisineDisplay } from '../lib/cuisine-display';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Restaurant'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 280;
const CARD_OVERLAP = 50;

const CATEGORY_LABELS: Record<string, string> = {
  MAIN_COURSE: 'Plat principal',
  SIDE: 'Accompagnement',
  LUNCH: 'Déjeuner',
  APPETIZER: 'Entrée',
  DRINK: 'Boisson',
  DESSERT: 'Dessert',
  FRUIT: 'Fruit',
  SNACK: 'Snack',
};

/** Regroupe les catégories du menu en onglets "grand public". */
const MENU_GROUPS: { key: string; label: string; icon: string; categories: MenuItemCategory[] }[] = [
  { key: 'repas', label: 'Repas', icon: 'restaurant-outline', categories: ['MAIN_COURSE'] },
  { key: 'dejeuner', label: 'Déjeuner', icon: 'sunny-outline', categories: ['LUNCH'] },
  { key: 'entrees', label: 'Entrées', icon: 'leaf-outline', categories: ['APPETIZER'] },
  { key: 'boissons', label: 'Boissons', icon: 'wine-outline', categories: ['DRINK'] },
  { key: 'desserts', label: 'Desserts', icon: 'ice-cream-outline', categories: ['DESSERT'] },
  { key: 'fruits', label: 'Fruits', icon: 'nutrition-outline', categories: ['FRUIT'] },
  { key: 'snacks', label: 'Snacks', icon: 'pizza-outline', categories: ['SNACK'] },
];

export default function RestaurantScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const { data: restaurantData, loading: restaurantLoading } = useRestaurantQuery({
    variables: { id },
  });
  const { data: menuData, loading: menuLoading } = useMenuItemsByRestaurantQuery({
    variables: { restaurantId: id, page: 1, limit: 50 },
  });

  const restaurant = restaurantData?.restaurant;
  const items = menuData?.menuItemsByRestaurant.items ?? [];
  const { addItem, count, total } = useCart();
  const { coords: userCoords } = useUserLocation();
  const { isFavoriteRestaurant, toggleFavoriteRestaurant } = useFavorites();

  const restaurantDistance = useMemo(
    () => restaurantDistanceKm(userCoords, restaurant),
    [restaurant, userCoords],
  );

  const estimatedTime = restaurant?.estimatedDeliveryTime ?? 30;
  const deliveryFee = restaurant?.deliveryFee ?? 0;

  // Regroupe les items par groupe de menu (Repas, Boissons, ...)
  const groups = useMemo(() => {
    const result = MENU_GROUPS.map((group) => ({
      ...group,
      items: items.filter(
        (item) => item.isAvailable && group.categories.includes(item.category),
      ),
    })).filter((group) => group.items.length > 0);
    return result;
  }, [items]);

  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItemModel | null>(null);

  // Sélectionne le premier groupe disponible par défaut.
  useEffect(() => {
    if (groups.length > 0 && !groups.some((g) => g.key === activeGroupKey)) {
      setActiveGroupKey(groups[0].key);
    }
  }, [groups, activeGroupKey]);

  const activeGroup = groups.find((g) => g.key === activeGroupKey) ?? groups[0];

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
      if (restaurant?.isActive) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        addItem(menuItem, restaurant.id, restaurant.name, deliveryFee);
      }
    },
    [restaurant, deliveryFee, addItem],
  );

  // Suppléments liés au plat (API), affichés dans le modal.
  const selectedSupplements = useMemo(
    () =>
      selectedItem
        ? (selectedItem.supplements ?? []).filter((supplement) => supplement.isAvailable)
        : [],
    [selectedItem],
  );

  const showSupplements =
    selectedItem != null &&
    selectedItem.category !== 'DRINK' &&
    selectedItem.category !== 'DESSERT' &&
    selectedItem.category !== 'FRUIT' &&
    selectedItem.category !== 'SNACK' &&
    selectedSupplements.length > 0;

  const handleModalAdd = useCallback(
    (quantity: number, supplements: CartSupplement[]) => {
      if (restaurant && restaurant.isActive && selectedItem) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        addItem(selectedItem, restaurant.id, restaurant.name, deliveryFee, supplements, quantity);
        setSelectedItem(null);
      }
    },
    [restaurant, selectedItem, deliveryFee, addItem],
  );

  const isOpen = restaurant?.isActive ?? true;

  const isFavorited = restaurant ? isFavoriteRestaurant(restaurant.id) : false;

  const handleToggleFavorite = useCallback(() => {
    if (!restaurant) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavoriteRestaurant(restaurant);
  }, [restaurant, toggleFavoriteRestaurant]);

  if (restaurantLoading || menuLoading) return <Spinner />;

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

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        contentContainerStyle={{ paddingBottom: 120 + TAB_BAR_OFFSET }}
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

          {/* Back button */}
          <Pressable style={[styles.backButton, { top: insets.top + 8 }]} onPress={() => navigation.goBack()}>
            <View style={styles.backButtonInner}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </View>
          </Pressable>

          {/* Favorite button */}
          <Pressable style={[styles.heartButton, { top: insets.top + 8 }]} onPress={handleToggleFavorite} hitSlop={8}>
            <View style={[styles.heartButtonInner, isFavorited && styles.heartButtonActive]}>
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorited ? '#fff' : '#fff'}
              />
            </View>
          </Pressable>
        </View>

        {/* Floating info card */}
        <View style={styles.floatingCard}>
          <View style={styles.titleRow}>
            <Text style={styles.restaurantName} numberOfLines={2}>
              {restaurant?.name ?? route.params.name}
            </Text>
            <OpenClosedBadge isOpen={isOpen} />
            {restaurant?.rating ? (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={13} color="#fff" />
                <Text style={styles.ratingBadgeText}>{restaurant.rating.toFixed(1)}</Text>
              </View>
            ) : null}
          </View>

          {restaurant?.cuisineType ? (
            <Text style={styles.cuisineText}>{formatCuisineDisplay(restaurant.cuisineType)}</Text>
          ) : null}

          {!isOpen ? (
            <View style={styles.closedBanner}>
              <Ionicons name="time-outline" size={16} color="#B91C1C" />
              <Text style={styles.closedBannerText}>Ce restaurant est fermé pour le moment.</Text>
            </View>
          ) : null}

          {restaurant?.description ? (
            <Text style={styles.descriptionText}>{restaurant.description}</Text>
          ) : null}

          <View style={styles.cardDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="location-outline" size={17} color={colors.primary} />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>Adresse</Text>
              <Text style={styles.infoValue}>
                {restaurant?.address ?? 'Brazzaville'}
                {restaurant?.city ? `, ${restaurant.city}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoIconCircle, { backgroundColor: colors.secondaryLight }]}>
              <Ionicons name="call-outline" size={17} color={colors.secondary} />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              {restaurant?.phone ? (
                <PhoneNumber phone={restaurant.phone} tint={colors.secondary} />
              ) : (
                <Text style={styles.infoValue}>Non renseigné</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="navigate-outline" size={17} color={colors.success} />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValue}>
                {restaurantDistance != null
                  ? `${restaurantDistance.toFixed(1)} km · `
                  : ''}
                ~{estimatedTime} min de chez vous
              </Text>
            </View>
          </View>
        </View>

        {/* Menu : slider de catégories */}
        {groups.length > 0 ? (
          <View style={styles.menuBlock}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.groupChipsRow}
            >
              {groups.map((group) => {
                const active = group.key === activeGroup?.key;
                return (
                  <Pressable
                    key={group.key}
                    style={[styles.groupChip, active && styles.groupChipActive]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setActiveGroupKey(group.key);
                    }}
                  >
                    <View style={[styles.groupChipIcon, active && styles.groupChipIconActive]}>
                      <Ionicons
                        name={group.icon as any}
                        size={15}
                        color={active ? '#fff' : colors.primary}
                      />
                    </View>
                    <Text style={[styles.groupChipLabel, active && styles.groupChipLabelActive]}>
                      {group.label}
                    </Text>
                    <View style={[styles.groupChipCount, active && styles.groupChipCountActive]}>
                      <Text style={[styles.groupChipCountText, active && styles.groupChipCountTextActive]}>
                        {group.items.length}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            {activeGroup ? (
              <View style={styles.groupItems}>
                <View style={styles.groupTitleRow}>
                  <View style={styles.groupTitleIcon}>
                    <Ionicons name={activeGroup.icon as any} size={17} color={colors.primary} />
                  </View>
                  <Text style={styles.groupTitle}>{activeGroup.label}</Text>
                  <Text style={styles.groupCount}>{activeGroup.items.length} produits</Text>
                </View>
                {activeGroup.items.map((menuItem) => (
                  <MenuItemCard
                    key={menuItem.id}
                    item={menuItem}
                    onAdd={() => handleAdd(menuItem)}
                    onPress={() => setSelectedItem(menuItem)}
                  />
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.emptyMenu}>
            <Text style={styles.emptyMenuText}>Le menu de ce restaurant arrive bientôt.</Text>
          </View>
        )}
      </Animated.ScrollView>

      {/* Cart bar */}
      {isOpen && count > 0 ? (
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
      ) : null}

      {/* Fiche produit */}
      <ProductDetailModal
        visible={selectedItem != null}
        onClose={() => setSelectedItem(null)}
        id={selectedItem?.id ?? ''}
        imageUrl={selectedItem ? assetUrl(selectedItem.imageUrl) : undefined}
        name={selectedItem?.name ?? ''}
        description={selectedItem?.description}
        price={selectedItem?.price ?? 0}
        categoryLabel={selectedItem ? CATEGORY_LABELS[selectedItem.category] ?? selectedItem.category : undefined}
        seller={restaurant?.name}
        supplements={showSupplements ? selectedSupplements : []}
        onAddToCart={handleModalAdd}
      />
    </View>
  );
}

function MenuItemCard({
  item,
  onAdd,
  onPress,
}: {
  item: MenuItemModel;
  onAdd: () => void;
  onPress: () => void;
}) {
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
      <Pressable style={styles.menuCardMain} onPress={onPress}>
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
      </Pressable>

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
  heartButton: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 10,
  },
  heartButtonInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButtonActive: {
    backgroundColor: colors.primary,
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
    fontSize: 19,
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
    fontSize: 13,
    fontFamily: fonts.bodyBold,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 6,
  },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#FEE2E2',
    borderRadius: radius.md,
  },
  closedBannerText: {
    flex: 1,
    color: '#B91C1C',
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  descriptionText: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBody: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: fonts.titleSemiBold,
    color: colors.secondary,
    marginTop: 2,
  },

  // Sections
  menuBlock: {
    marginTop: spacing.xl,
  },
  groupChipsRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  groupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.sm,
  },
  groupChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  groupChipIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupChipIconActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  groupChipLabel: {
    color: colors.secondary,
    fontFamily: fonts.titleSemiBold,
    fontSize: 14,
  },
  groupChipLabelActive: {
    color: '#fff',
  },
  groupChipCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  groupChipCountActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  groupChipCountText: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  groupChipCountTextActive: {
    color: '#fff',
  },
  groupItems: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  groupTitleIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  groupTitle: {
    fontSize: 16,
    fontFamily: fonts.titleBold,
    fontWeight: '700',
    color: colors.secondary,
    flex: 1,
  },
  groupCount: {
    fontSize: 11,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
  },
  emptyMenu: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyMenuText: {
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
  },
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
    fontSize: 15,
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
  menuCardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
    fontSize: 14,
    fontFamily: fonts.titleSemiBold,
    fontWeight: '600',
    color: colors.text,
  },
  menuCardDesc: {
    fontSize: 11,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 3,
  },
  menuCardPrice: {
    fontSize: 15,
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
    bottom: TAB_BAR_OFFSET,
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
    fontSize: 15,
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
    fontSize: 15,
    fontFamily: fonts.titleBold,
    fontWeight: '700',
  },
});
