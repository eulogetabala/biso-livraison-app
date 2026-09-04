import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useActiveCuisineTypesQuery,
  useActiveHomeBannersQuery,
  useActiveMarketCategoriesQuery,
  useAvailableDriversQuery,
  useSearchMenuItemsQuery,
  useSearchRestaurantsQuery,
} from '../graphql/operations';
import type { MenuItemModel } from '../graphql/types';
import { assetUrl } from '../lib/api';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { useNotifications } from '../lib/notifications';
import { restaurantDistanceKm } from '../lib/geo-data';
import { useUserLocation } from '../lib/user-location';
import { requestLocationPermission, promptLocationDenied } from '../lib/permissions';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { EmptyState, formatPrice, SkeletonBlock } from '../components/ui';
import { AppTextInput } from '../components/AppTextInput';
import OpenClosedBadge from '../components/OpenClosedBadge';
import ProductDetailModal from '../components/ProductDetailModal';
import RestaurantCoverImage from '../components/RestaurantCoverImage';
import { menuItemToCatalogProduct, type CatalogProduct } from '../lib/catalog';
import { countProductsByCategory, mapApiMarketCategories } from '../lib/market-categories';
import { useMarketRestaurant } from '../lib/use-market';
import { formatCuisineDisplay } from '../lib/cuisine-display';
import { navigateFromBanner } from '../lib/banner-navigation';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const HERO_SNAP = HERO_CARD_WIDTH + spacing.md;

type HeroSlide = {
  id: string;
  title: string;
  subtitle?: string | null;
  image: string;
  cta: string;
  linkType: string;
  linkValue?: string | null;
};

function SkeletonCard({ height = 240 }: { height?: number }) {
  return (
    <View style={[styles.card, { overflow: 'hidden' }]}>
      <SkeletonBlock width="100%" height={height} />
      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <SkeletonBlock width="60%" height={18} style={{ borderRadius: radius.xs }} />
        <SkeletonBlock width="40%" height={14} style={{ borderRadius: radius.xs }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
          <SkeletonBlock width={100} height={14} style={{ borderRadius: radius.xs }} />
          <SkeletonBlock width={80} height={14} style={{ borderRadius: radius.xs }} />
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState<string | 'ALL'>('ALL');
  const [locationLabel, setLocationLabel] = useState('Localisation en cours...');
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemModel | null>(null);
  const { count, total, addItem } = useCart();
  const { unreadCount } = useNotifications();
  const { coords: userCoords } = useUserLocation();
  const { marketId, deliveryFee: simpleDeliveryFee } = useMarketRestaurant();
  const heroScrollX = useRef(new Animated.Value(0)).current;
  const heroListRef = useRef<FlatList<HeroSlide> | null>(null);
  const heroIndexRef = useRef(0);

  const { data: bannersData, refetch: refetchBanners } = useActiveHomeBannersQuery();
  const { data: marketCategoriesData, refetch: refetchMarketCategories } = useActiveMarketCategoriesQuery();
  useActiveCuisineTypesQuery();

  const heroSlides = useMemo<HeroSlide[]>(() => {
    const banners = bannersData?.activeHomeBanners ?? [];
    return banners.map((banner) => ({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      image: assetUrl(banner.imageUrl) ?? banner.imageUrl,
      cta: banner.ctaLabel ?? 'Découvrir',
      linkType: banner.linkType,
      linkValue: banner.linkValue,
    }));
  }, [bannersData]);

  const { data, loading, error, refetch } = useSearchRestaurantsQuery({
    variables: {
      page: 1,
      limit: 20,
      input: {
        query: query || undefined,
        cuisineType: cuisine === 'ALL' ? undefined : cuisine,
        onlyActive: false,
        excludeMarket: true,
        featuredOnly: false,
      },
    },
  });

  const { data: marketData, refetch: refetchMarket } = useSearchMenuItemsQuery({
    variables: {
      page: 1,
      limit: 50,
      input: { simpleProductsOnly: true },
    },
  });

  const { data: featuredMarketData, refetch: refetchFeaturedMarket } = useSearchMenuItemsQuery({
    variables: {
      page: 1,
      limit: 6,
      input: { simpleProductsOnly: true, featuredOnly: true },
    },
  });

  const { data: driversData, refetch: refetchDrivers } = useAvailableDriversQuery();

  const marketMenuItems = marketData?.searchMenuItems.items ?? [];
  const productCounts = useMemo(() => countProductsByCategory(marketMenuItems), [marketMenuItems]);
  const homeCategories = useMemo(
    () =>
      mapApiMarketCategories(marketCategoriesData?.activeMarketCategories ?? [], productCounts),
    [marketCategoriesData, productCounts],
  );
  const products = useMemo(() => marketMenuItems.map(menuItemToCatalogProduct), [marketMenuItems]);
  const featuredMenuItems = featuredMarketData?.searchMenuItems.items ?? [];
  const featuredProducts = useMemo(() => {
    const featured = featuredMenuItems.map(menuItemToCatalogProduct);
    if (featured.length >= 6) return featured.slice(0, 6);
    const featuredIds = new Set(featuredMenuItems.map((item) => item.id));
    const rest = marketMenuItems
      .filter((item) => !featuredIds.has(item.id))
      .map(menuItemToCatalogProduct);
    return [...featured, ...rest].slice(0, 6);
  }, [featuredMenuItems, marketMenuItems]);
  const driversCount = driversData?.availableDrivers?.length ?? 0;

  useEffect(() => {
    if (homeCategories.length > 0 && !homeCategories.some((c) => c.key === activeCategory)) {
      setActiveCategory(homeCategories[0].key);
    }
  }, [homeCategories, activeCategory]);

  const fetchLocation = useCallback(async () => {
    const permission = await requestLocationPermission();
    if (permission !== 'granted') {
      setLocationLabel('Brazzaville');
      promptLocationDenied(permission, fetchLocation);
      return;
    }
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const places = await Location.reverseGeocodeAsync(position.coords);
      const place = places[0];
      const primary = place?.district || place?.subregion || place?.city || 'Brazzaville';
      const city = place?.city && place.city !== primary ? `, ${place.city}` : '';
      setLocationLabel(`${primary}${city}`);
    } catch {
      setLocationLabel('Brazzaville');
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const restaurants = data?.searchRestaurants.items ?? [];
  const isLoading = loading;
  const hasError = !!error;

  const featuredRestaurants = useMemo(() => {
    const sorted = [...restaurants].sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });
    return sorted.slice(0, 6).map((restaurant) => ({
      ...restaurant,
      distanceKm: restaurantDistanceKm(userCoords, restaurant),
      estimatedDeliveryTime: restaurant.estimatedDeliveryTime,
    }));
  }, [restaurants, userCoords]);

  const nearbyRestaurants = useMemo(
    () =>
      [...featuredRestaurants]
        .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
        .slice(0, 3),
    [featuredRestaurants],
  );

  const featuredProductsList = featuredProducts;

  const searchFocusAnim = useRef(new Animated.Value(0)).current;
  const cartTranslateY = useRef(new Animated.Value(120)).current;
  const cartScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (count > 0) {
      Animated.parallel([
        Animated.spring(cartTranslateY, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(cartScale, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(cartTranslateY, {
          toValue: 120,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cartScale, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [count, cartTranslateY, cartScale]);

  const handleSearchFocus = useCallback(
    (focused: boolean) => {
      Animated.timing(searchFocusAnim, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    },
    [searchFocusAnim],
  );

  const searchBorderColor = searchFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const searchShadowOpacity = searchFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.04, 0.12],
  });

  const handleCuisineSelect = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCuisine(value);
      refetch({
        input: {
          query: query || undefined,
          cuisineType: value === 'ALL' ? undefined : value,
        },
      });
    },
    [query, refetch],
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      refetch(),
      refetchMarket(),
      refetchFeaturedMarket(),
      refetchBanners(),
      refetchMarketCategories(),
      refetchDrivers(),
      fetchLocation(),
    ]).finally(() => setRefreshing(false));
  }, [refetch, refetchMarket, refetchFeaturedMarket, refetchBanners, refetchMarketCategories, refetchDrivers, fetchLocation]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      heroIndexRef.current = (heroIndexRef.current + 1) % heroSlides.length;
      heroListRef.current?.scrollToOffset({
        offset: heroIndexRef.current * HERO_SNAP,
        animated: true,
      });
    }, 4200);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const handleHeroCta = useCallback(
    (slide: HeroSlide) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigateFromBanner(navigation, slide.linkType, slide.linkValue);
    },
    [navigation],
  );

  const handleCategoryPress = useCallback((key: string) => {
    Haptics.selectionAsync();
    setActiveCategory(key);
    const selected = homeCategories.find((category) => category.key === key);
    navigation.navigate('Products', selected ? { category: selected.label } : undefined);
  }, [navigation, homeCategories]);

  const handleProductModalAdd = useCallback(
    (quantity: number) => {
      if (!selectedMenuItem || !marketId) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      addItem(selectedMenuItem, marketId, 'Produits particuliers', simpleDeliveryFee, undefined, quantity);
      setSelectedProduct(null);
      setSelectedMenuItem(null);
    },
    [selectedMenuItem, marketId, simpleDeliveryFee, addItem],
  );

  const greetingName = user?.firstName || 'Client';

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        <LinearGradient
          colors={[colors.secondary, colors.secondaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroShell}
        >
          <View style={styles.heroShellGlow1} />
          <View style={styles.heroShellGlow2} />

          <View style={styles.topBar}>
            <View style={styles.nameBlock}>
              <Text style={styles.eyebrow}>Biso Livraison</Text>
              <Text style={styles.welcomeText}>Bonjour, {greetingName}</Text>
            </View>
            <View style={styles.topActions}>
              <Pressable
                style={styles.topAction}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('Notifications');
                }}
                hitSlop={8}
              >
                <Ionicons name="notifications-outline" size={22} color="#fff" />
                {unreadCount > 0 ? (
                  <View style={styles.topActionBadge}>
                    <Text style={styles.topActionBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                  </View>
                ) : null}
              </Pressable>
              <Pressable
                style={styles.topAction}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('Cart');
                }}
                hitSlop={8}
              >
                <Ionicons name="cart-outline" size={22} color="#fff" />
                {count > 0 ? (
                  <View style={styles.topActionBadge}>
                    <Text style={styles.topActionBadgeText}>{count > 99 ? '99+' : count}</Text>
                  </View>
                ) : null}
              </Pressable>
            </View>
          </View>

          <View style={styles.locationRow}>
            <View style={styles.locationChip}>
              <Ionicons name="location-outline" size={15} color={colors.primary} />
              <Text style={styles.locationChipText}>{locationLabel}</Text>
            </View>
            <Pressable style={styles.locationAction} onPress={fetchLocation}>
              <Feather name="crosshair" size={15} color="#fff" />
            </Pressable>
          </View>

          <Animated.View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
            <AppTextInput
              style={styles.search}
              value={query}
              onChangeText={(t) => {
                setQuery(t);
                refetch({
                  input: { query: t || undefined, cuisineType: cuisine === 'ALL' ? undefined : cuisine },
                });
              }}
              placeholder="Restaurant, produit, gâteau, colis..."
            />
          </Animated.View>
        </LinearGradient>

        <View style={styles.heroSectionOuter}>
          {heroSlides.length > 0 ? (
            <>
          <Animated.FlatList
            ref={heroListRef}
            data={heroSlides}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            snapToInterval={HERO_SNAP}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.heroList}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: heroScrollX } } }], {
              useNativeDriver: false,
            })}
            onMomentumScrollEnd={(event) => {
              heroIndexRef.current = Math.round(event.nativeEvent.contentOffset.x / HERO_SNAP);
            }}
            renderItem={({ item }) => (
              <View style={styles.heroCard}>
                <Image source={{ uri: item.image }} style={styles.heroImage} />
                <LinearGradient
                  colors={['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.92)']}
                  locations={[0, 0.45, 1]}
                  style={styles.heroOverlay}
                />
                <View style={styles.heroContent}>
                  <Text style={styles.heroTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.heroSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                  <Pressable style={styles.heroCta} onPress={() => handleHeroCta(item)}>
                    <Text style={styles.heroCtaText} numberOfLines={1}>
                      {item.cta}
                    </Text>
                    <View style={styles.heroCtaIcon}>
                      <Ionicons name="arrow-forward" size={13} color={colors.primary} />
                    </View>
                  </Pressable>
                </View>
              </View>
            )}
          />

          <View style={styles.heroDots}>
            {heroSlides.map((_, index) => {
              const width = heroScrollX.interpolate({
                inputRange: [(index - 1) * HERO_SNAP, index * HERO_SNAP, (index + 1) * HERO_SNAP],
                outputRange: [8, 26, 8],
                extrapolate: 'clamp',
              });
              const opacity = heroScrollX.interpolate({
                inputRange: [(index - 1) * HERO_SNAP, index * HERO_SNAP, (index + 1) * HERO_SNAP],
                outputRange: [0.35, 1, 0.35],
                extrapolate: 'clamp',
              });
              return <Animated.View key={index} style={[styles.heroDot, { width, opacity }]} />;
            })}
          </View>
            </>
          ) : null}
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionTitle}>Catégories</Text>
            <Pressable onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.sectionHint}>Voir tout</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
            {homeCategories.map((category) => {
              const active = activeCategory === category.key;
              return (
                <Pressable
                  key={category.key}
                  style={[styles.categoryCard, active && styles.categoryCardActive]}
                  onPress={() => handleCategoryPress(category.key)}
                >
                  <View style={[styles.categoryIconWrap, { backgroundColor: category.tint }]}>
                    {category.lib === 'image' ? (
                      <Image source={{ uri: assetUrl(category.icon) }} style={styles.categoryIconImage} />
                    ) : category.lib === 'mci' ? (
                      <MaterialCommunityIcons name={category.icon as any} size={22} color={category.iconColor} />
                    ) : category.lib === 'feather' ? (
                      <Feather name={category.icon as any} size={20} color={category.iconColor} />
                    ) : (
                      <Ionicons name={category.icon as any} size={20} color={category.iconColor} />
                    )}
                  </View>
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{category.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader title="Restaurants à découvrir" subtitle="Distance et temps estimé près de toi" action="Voir tout" onPress={() => navigation.navigate('Restaurants')} />
          {isLoading ? (
            <View style={styles.restaurantList}>
              <SkeletonCard />
            </View>
          ) : hasError ? (
            <EmptyState title="Restaurants indisponibles" subtitle="Le catalogue resto n'a pas pu être chargé." />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {featuredRestaurants.map((restaurant) => (
                <Pressable
                  key={restaurant.id}
                  style={styles.restaurantCard}
                  onPress={() => navigation.navigate('Restaurant', { id: restaurant.id, name: restaurant.name })}
                >
                  <RestaurantCoverImage
                    coverImageUrl={restaurant.coverImageUrl}
                    logoImageUrl={restaurant.imageUrl}
                    height={190}
                    nameFallback={restaurant.name}
                  />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={styles.restaurantImageOverlay} />
                  <View style={styles.restaurantRating}>
                    <Ionicons name="star" size={12} color="#fff" />
                    <Text style={styles.restaurantRatingText}>{restaurant.rating.toFixed(1)}</Text>
                  </View>
                  <View style={styles.restaurantStatusBadge}>
                    <OpenClosedBadge isOpen={restaurant.isActive} compact />
                  </View>
                  <View style={styles.restaurantBody}>
                    <Text style={styles.restaurantName} numberOfLines={1}>{restaurant.name}</Text>
                    <Text style={styles.restaurantMeta}>{formatCuisineDisplay(restaurant.cuisineType)} · {restaurant.city}</Text>
                    <View style={styles.metricsRow}>
                      {restaurant.distanceKm != null ? (
                        <MetricPill icon="location-outline" value={`${restaurant.distanceKm.toFixed(1)} km`} />
                      ) : null}
                      <MetricPill icon="time-outline" value={`${restaurant.estimatedDeliveryTime} min`} />
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader title="Produits populaires" subtitle="Boulangerie, gâteaux, douceurs et produits maison" action="Explorer" onPress={() => navigation.navigate('Products')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {featuredProductsList.map((product) => (
              <Pressable
                key={product.id}
                style={styles.productCard}
                onPress={() => {
                  setSelectedProduct(product);
                  setSelectedMenuItem(
                    [...featuredMenuItems, ...marketMenuItems].find((item) => item.id === product.id) ??
                      null,
                  );
                }}
              >
                <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                <View style={styles.productBody}>
                  <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.productSeller}>{product.seller}</Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionBlock}>
          <LinearGradient colors={['#081A4B', colors.secondary, '#18336E']} style={styles.parcelBanner}>
            <Text style={styles.parcelTitle}>Livrer un colis ici à Brazzaville ou vers Pointe-Noire</Text>
            <Text style={styles.parcelSubtitle}>
              Petits colis, documents, courses urgentes et expéditions interville avec suivi.
            </Text>
            <View style={styles.parcelOptions}>
              <View style={styles.parcelOptionCard}>
                <Ionicons name="cube-outline" size={18} color={colors.primary} />
                <Text style={styles.parcelOptionTitle}>Dans Brazzaville</Text>
                <Text style={styles.parcelOptionText}>Express 30 à 90 min</Text>
              </View>
              <View style={styles.parcelOptionCard}>
                <Ionicons name="swap-horizontal-outline" size={18} color={colors.primary} />
                <Text style={styles.parcelOptionTitle}>Interville</Text>
                <Text style={styles.parcelOptionText}>Brazzaville → Pointe-Noire</Text>
              </View>
            </View>
            <Pressable style={styles.parcelCta} onPress={() => navigation.navigate('Parcel')}>
              <Text style={styles.parcelCtaText}>Expédier maintenant</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.secondary} />
            </Pressable>
          </LinearGradient>
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader title="Besoin d'un livreur ?" subtitle="Un CTA rapide vers les coursiers disponibles" />
          <Pressable style={styles.driverCtaCard} onPress={() => navigation.navigate('Drivers')}>
            <LinearGradient colors={['#ffffff', '#F7F9FF']} style={styles.driverCtaGradient}>
              <View style={styles.driverCtaLeft}>
                <View style={styles.driverCtaIcon}>
                  <MaterialCommunityIcons name="motorbike" size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.driverCtaTitle}>Trouver un livreur express</Text>
                  <Text style={styles.driverCtaSubtitle}>
                    {driversCount} livreurs disponibles maintenant pour tes courses et tes colis.
                  </Text>
                </View>
              </View>
              <View style={styles.driverCtaArrow}>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader title="Restaurants proches de chez moi" subtitle="3 restos sélectionnés autour de ta position" />
          <View style={styles.nearbyStack}>
            {nearbyRestaurants.map((restaurant) => (
              <Pressable
                key={restaurant.id}
                style={styles.nearbyCard}
                onPress={() => navigation.navigate('Restaurant', { id: restaurant.id, name: restaurant.name })}
              >
                <RestaurantCoverImage
                  coverImageUrl={restaurant.coverImageUrl}
                  logoImageUrl={restaurant.imageUrl}
                  width={92}
                  height={92}
                  borderRadius={radius.md}
                  logoSize={30}
                  nameFallback={restaurant.name}
                />
                <View style={styles.nearbyBody}>
                  <View style={styles.nearbyTopRow}>
                    <Text style={styles.nearbyName}>{restaurant.name}</Text>
                    <View style={styles.nearbyDistanceBadge}>
                      <Ionicons name="location-outline" size={12} color={colors.primary} />
                      <Text style={styles.nearbyDistanceText}>
                        {restaurant.distanceKm != null
                          ? `${restaurant.distanceKm.toFixed(1)} km`
                          : `${restaurant.estimatedDeliveryTime} min`}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.nearbyMeta}>{formatCuisineDisplay(restaurant.cuisineType)} · {restaurant.city}</Text>
                  <View style={styles.nearbyBottomRow}>
                    <Text style={styles.nearbyHint}>Livraison estimée {restaurant.estimatedDeliveryTime} min</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </View>
                </View>
              </Pressable>
            ))}
            <Pressable style={styles.nearbyMapButton} onPress={() => navigation.navigate('NearbyMap')}>
              <Text style={styles.nearbyMapButtonText}>Voir plus sur la carte</Text>
              <Ionicons name="map-outline" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      </Animated.ScrollView>

      <Animated.View
        style={[
          styles.cartBarWrapper,
          {
            transform: [
              {
                translateY: count > 0 ? 0 : 120,
              },
            ],
          },
        ]}
      >
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('Checkout');
          }}
        >
          <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.cartBar}>
            <View style={styles.cartBarInfo}>
              <View style={styles.cartIconBadge}>
                <Ionicons name="cart" size={20} color="#fff" />
                <View style={styles.badgeMini}>
                  <Text style={styles.badgeMiniText}>{count}</Text>
                </View>
              </View>
              <Text style={styles.cartBarText}>Voir le panier</Text>
            </View>
            <View style={styles.cartBarPriceWrapper}>
              <Text style={styles.cartBarPrice}>{formatPrice(total)}</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* Fiche produit */}
      <ProductDetailModal
        visible={selectedProduct != null}
        onClose={() => setSelectedProduct(null)}
        id={selectedProduct?.id ?? ''}
        imageUrl={selectedProduct?.imageUrl}
        name={selectedProduct?.name ?? ''}
        price={selectedProduct?.price ?? 0}
        categoryLabel={selectedProduct?.category}
        seller={selectedProduct?.seller}
        onAddToCart={(quantity) => handleProductModalAdd(quantity)}
      />
    </View>
  );
}

function SectionHeader({ title, subtitle, action, onPress }: { title: string; subtitle: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionHeadingRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      {action ? (
        <Pressable onPress={onPress}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function MetricPill({ icon, value }: { icon: any; value: string }) {
  return (
    <View style={styles.metricPill}>
      <Ionicons name={icon} size={13} color={colors.textMuted} />
      <Text style={styles.metricPillText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 140 },
  heroShell: {
    paddingTop: 56,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
  },
  heroSectionOuter: {
    marginTop: spacing.xl,
  },
  heroShellGlow1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(254,100,0,0.12)',
    top: -70,
    right: -60,
  },
  heroShellGlow2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: 100,
    left: -20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  nameBlock: { flex: 1, paddingRight: spacing.md },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  topAction: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topActionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.secondaryDark,
  },
  topActionBadgeText: { color: '#fff', fontSize: 9, fontFamily: fonts.bodyBold },
  eyebrow: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    fontFamily: fonts.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: fonts.titleBold,
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  locationChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  locationChipText: { color: '#fff', fontFamily: fonts.bodyMedium, fontSize: 13 },
  locationAction: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 58,
    ...shadows.lg,
  },
  searchIcon: { marginRight: spacing.sm },
  search: {
    flex: 1,
    height: '100%',
    color: colors.text,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
  },
  heroList: { paddingHorizontal: spacing.lg, paddingTop: 0 },
  heroCard: {
    width: HERO_CARD_WIDTH,
    height: 125,
    marginRight: spacing.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadows.lg,
  },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  heroContent: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.sm + 2 },
  heroTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 16, lineHeight: 20 },
  heroSubtitle: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.bodyMedium, fontSize: 11, marginTop: 3, lineHeight: 14 },
  heroCta: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: radius.full,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    ...shadows.md,
  },
  heroCtaText: { color: colors.secondary, fontFamily: fonts.bodyBold, fontSize: 12, maxWidth: 200 },
  heroCtaIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.md },
  heroDot: { height: 8, borderRadius: 999, backgroundColor: colors.primary },
  sectionBlock: { marginTop: spacing.xxl },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: { color: colors.secondary, fontFamily: fonts.titleBold, fontSize: 16 },
  sectionSubtitle: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12, marginTop: 4, lineHeight: 17 },
  sectionHint: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 12, marginTop: 6 },
  sectionAction: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 12, marginTop: 6 },
  categoriesRow: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  categoryCard: {
    width: 96,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: 10,
    ...shadows.sm,
  },
  categoryCardActive: {
    backgroundColor: colors.secondary,
    transform: [{ translateY: -2 }],
  },
  categoryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconImage: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  categoryText: { color: colors.secondary, fontFamily: fonts.bodyBold, fontSize: 12, textAlign: 'center' },
  categoryTextActive: { color: '#fff' },
  horizontalList: { paddingHorizontal: spacing.lg, gap: spacing.md },
  restaurantList: { paddingHorizontal: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  restaurantCard: {
    width: 290,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  restaurantImage: { width: '100%', height: 190, backgroundColor: colors.border },
  restaurantImageOverlay: { position: 'absolute', left: 0, right: 0, top: 0, height: 190 },
  restaurantRating: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warning,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  restaurantRatingText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 12 },
  restaurantStatusBadge: { position: 'absolute', top: spacing.sm, left: spacing.sm },
  restaurantBody: { padding: spacing.md, gap: 8 },
  restaurantName: { color: colors.secondary, fontFamily: fonts.titleBold, fontSize: 16 },
  restaurantMeta: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12 },
  metricsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  metricPillText: { color: colors.secondary, fontFamily: fonts.bodyMedium, fontSize: 12 },
  productCard: {
    width: 190,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  productImage: { width: '100%', height: 150, backgroundColor: colors.border },
  productBody: { padding: spacing.md },
  productName: { color: colors.secondary, fontFamily: fonts.titleSemiBold, fontSize: 14 },
  productSeller: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 11, marginTop: 4 },
  productFooter: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  productPrice: { color: colors.primary, fontFamily: fonts.titleBold, fontSize: 13 },
  parcelBanner: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  parcelTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 18, marginTop: spacing.md, lineHeight: 24 },
  parcelSubtitle: { color: 'rgba(255,255,255,0.76)', fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 19, marginTop: spacing.sm },
  parcelOptions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  parcelOptionCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 6,
  },
  parcelOptionTitle: { color: colors.secondary, fontFamily: fonts.titleSemiBold, fontSize: 14 },
  parcelOptionText: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 17 },
  parcelCta: {
    marginTop: spacing.lg,
    backgroundColor: '#fff',
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  parcelCtaText: { color: colors.secondary, fontFamily: fonts.bodyBold, fontSize: 14 },
  driverCard: {
    width: 230,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadows.md,
  },
  driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  driverAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 16 },
  driverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  driverStatusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  driverStatusText: { color: colors.success, fontFamily: fonts.bodyBold, fontSize: 11 },
  driverName: { color: colors.secondary, fontFamily: fonts.titleBold, fontSize: 16, marginTop: spacing.md },
  driverZone: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12, marginTop: 4 },
  driverMetaRow: { flexDirection: 'row', gap: 8, marginTop: spacing.md, flexWrap: 'wrap' },
  driverBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  driverRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  driverRatingText: { color: colors.secondary, fontFamily: fonts.bodyBold, fontSize: 12 },
  driverHint: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 12 },
  driverCtaCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  driverCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    gap: spacing.md,
  },
  driverCtaLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  driverCtaIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverCtaTitle: { color: colors.secondary, fontFamily: fonts.titleBold, fontSize: 16 },
  driverCtaSubtitle: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12, marginTop: 5, lineHeight: 17 },
  driverCtaArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyStack: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  nearbyCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: spacing.sm,
    ...shadows.sm,
  },
  nearbyImage: { width: 92, height: 92, borderRadius: radius.md, backgroundColor: colors.border },
  nearbyBody: { flex: 1 },
  nearbyTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  nearbyName: { color: colors.secondary, fontFamily: fonts.titleSemiBold, fontSize: 14 },
  nearbyDistanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  nearbyDistanceText: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 11 },
  nearbyMeta: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12, marginTop: 3 },
  nearbyBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  nearbyHint: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 12, marginTop: 6 },
  nearbyMapButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nearbyMapButtonText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 14 },
  cartBarWrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
  cartBar: {
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.glow(colors.primary),
  },
  cartBarInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartIconBadge: { position: 'relative' },
  badgeMini: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeMiniText: { color: colors.primary, fontSize: 10, fontFamily: fonts.bodyBold },
  cartBarText: { color: '#fff', fontSize: 15, fontFamily: fonts.titleBold },
  cartBarPriceWrapper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cartBarPrice: { color: '#fff', fontSize: 15, fontFamily: fonts.titleBold },
});
