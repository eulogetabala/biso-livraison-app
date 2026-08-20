import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSearchRestaurantsQuery } from '../graphql/operations';
import type { RestaurantModel } from '../graphql/types';
import { assetUrl } from '../lib/api';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { MOCK_MODE } from '../config/mock';
import type { MockDriver, MockProduct } from '../mocks/data';
import { getMockDrivers, getMockProducts, getMockRestaurants } from '../mocks/service';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { EmptyState, formatPrice, SkeletonBlock } from '../components/ui';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const CUISINES: { label: string; value?: string | 'ALL'; emoji: string }[] = [
  { label: 'Tous', value: 'ALL', emoji: '🍽️' },
  { label: 'Africain', value: 'AFRICAIN', emoji: '🥘' },
  { label: 'Pizza', value: 'PIZZA', emoji: '🍕' },
  { label: 'Burgers', value: 'BURGER', emoji: '🍔' },
  { label: 'Salades', value: 'SALADE', emoji: '🥗' },
  { label: 'Desserts', value: 'DESSERT', emoji: '🧁' },
];

const HOME_CATEGORIES = [
  { key: 'boissons', label: 'Boissons', icon: 'wine-outline', lib: 'ionicons', tint: '#E0F2FE', iconColor: '#0284C7' },
  { key: 'boucherie', label: 'Boucherie', icon: 'food-steak', lib: 'mci', tint: '#FEE2E2', iconColor: '#DC2626' },
  { key: 'volailles', label: 'Volailles', icon: 'food-drumstick-outline', lib: 'mci', tint: '#FEF3C7', iconColor: '#D97706' },
  { key: 'fruits', label: 'Fruits', icon: 'nutrition-outline', lib: 'ionicons', tint: '#ECFCCB', iconColor: '#65A30D' },
  { key: 'legumes', label: 'Légumes', icon: 'carrot', lib: 'mci', tint: '#DCFCE7', iconColor: '#16A34A' },
  { key: 'epicerie', label: 'Epicerie', icon: 'shopping-bag', lib: 'feather', tint: '#EDE9FE', iconColor: '#7C3AED' },
] as const;

const HERO_SLIDES = [
  {
    id: 'hero-1',
    badge: 'Gourmand',
    title: 'Les meilleurs restos de Brazzaville, livrés chaud',
    subtitle: 'Cuisine locale, burgers premium, pizzas et jus frais en quelques minutes.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
    cta: 'Commander un repas',
  },
  {
    id: 'hero-2',
    badge: 'Marché local',
    title: 'Pains, gâteaux et produits maison juste autour de toi',
    subtitle: 'Des produits du quotidien et des douceurs artisanales livrés avec soin.',
    image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=1200&auto=format&fit=crop',
    cta: 'Voir les produits',
  },
  {
    id: 'hero-3',
    badge: 'Express',
    title: 'Un colis à livrer dans Brazzaville ou vers Pointe-Noire ?',
    subtitle: 'Petits colis, coursiers disponibles et suivi rassurant pour chaque expédition.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
    cta: 'Expédier maintenant',
  },
] as const;

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
  const [mockItems, setMockItems] = useState<RestaurantModel[]>([]);
  const [mockLoading, setMockLoading] = useState(MOCK_MODE);
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [drivers, setDrivers] = useState<MockDriver[]>([]);
  const [locationLabel, setLocationLabel] = useState('Localisation en cours...');
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('boissons');
  const { count, total } = useCart();
  const heroScrollX = useRef(new Animated.Value(0)).current;
  const heroListRef = useRef<FlatList<(typeof HERO_SLIDES)[number]> | null>(null);
  const heroIndexRef = useRef(0);
  const { data, loading, error, refetch } = useSearchRestaurantsQuery({
    variables: {
      page: 1,
      limit: 20,
      input: {
        query: query || undefined,
        cuisineType: cuisine === 'ALL' ? undefined : cuisine,
      },
    },
    skip: MOCK_MODE,
  });

  useEffect(() => {
    if (!MOCK_MODE) return;
    let mounted = true;
    setMockLoading(true);
    getMockRestaurants({
      query: query || undefined,
      cuisineType: cuisine === 'ALL' ? undefined : cuisine,
    }).then((items) => {
      if (mounted) {
        setMockItems(items);
        setMockLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [query, cuisine]);

  useEffect(() => {
    getMockProducts().then(setProducts);
    getMockDrivers().then(setDrivers);
  }, []);

  const fetchLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationLabel('Brazzaville');
        return;
      }
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

  const restaurants = MOCK_MODE ? mockItems : data?.searchRestaurants.items ?? [];
  const isLoading = MOCK_MODE ? mockLoading : loading;
  const hasError = MOCK_MODE ? false : !!error;

  const featuredRestaurants = useMemo(
    () =>
      restaurants.map((restaurant, index) => ({
        ...restaurant,
        distanceKm: [1.2, 2.4, 3.8, 4.3, 5.1][index % 5],
      })),
    [restaurants],
  );

  const nearbyRestaurants = useMemo(
    () => [...featuredRestaurants].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3),
    [featuredRestaurants],
  );

  const featuredProducts = useMemo(() => {
    const selected = HOME_CATEGORIES.find((category) => category.key === activeCategory);
    if (!selected) return products;
    return products.filter((product) => product.category.toLowerCase() === selected.label.toLowerCase());
  }, [activeCategory, products]);

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
      if (MOCK_MODE) return;
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
    if (MOCK_MODE) {
      setMockLoading(true);
      Promise.all([
        getMockRestaurants({
          query: query || undefined,
          cuisineType: cuisine === 'ALL' ? undefined : cuisine,
        }),
        getMockProducts(),
        getMockDrivers(),
        fetchLocation(),
      ]).then(([items, nextProducts, nextDrivers]) => {
        setMockItems(items);
        setProducts(nextProducts);
        setDrivers(nextDrivers);
        setMockLoading(false);
        setRefreshing(false);
      });
      return;
    }
    refetch().finally(() => setRefreshing(false));
  }, [query, cuisine, refetch, fetchLocation]);

  useEffect(() => {
    const interval = setInterval(() => {
      heroIndexRef.current = (heroIndexRef.current + 1) % HERO_SLIDES.length;
      heroListRef.current?.scrollToOffset({
        offset: heroIndexRef.current * 310,
        animated: true,
      });
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  const handleHeroCta = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (id === 'hero-3') {
        navigation.navigate('Parcel');
        return;
      }
      if (id === 'hero-2') {
        navigation.navigate('Products');
        return;
      }
      navigation.navigate('Restaurants');
    },
    [navigation],
  );

  const handleCategoryPress = useCallback((key: string) => {
    Haptics.selectionAsync();
    setActiveCategory(key);
    const selected = HOME_CATEGORIES.find((category) => category.key === key);
    navigation.navigate('Products', selected ? { category: selected.label } : undefined);
  }, [navigation]);

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
            <Pressable style={styles.avatarWrap} onPress={() => navigation.navigate('Profile')}>
              {user?.avatarUrl ? (
                <Image source={{ uri: assetUrl(user.avatarUrl) }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{(greetingName[0] || 'B').toUpperCase()}</Text>
                </View>
              )}
            </Pressable>
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
            <TextInput
              style={styles.search}
              value={query}
              onChangeText={(t) => {
                setQuery(t);
                if (MOCK_MODE) return;
                refetch({
                  input: { query: t || undefined, cuisineType: cuisine === 'ALL' ? undefined : cuisine },
                });
              }}
              placeholder="Restaurant, produit, gâteau, colis..."
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.searchMiniBadge}>
              <Text style={styles.searchMiniBadgeText}>GPS</Text>
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={styles.heroSectionOuter}>
          <Animated.FlatList
            ref={heroListRef}
            data={HERO_SLIDES}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            snapToInterval={310}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.heroList}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: heroScrollX } } }], {
              useNativeDriver: false,
            })}
            onMomentumScrollEnd={(event) => {
              heroIndexRef.current = Math.round(event.nativeEvent.contentOffset.x / 310);
            }}
            renderItem={({ item }) => (
              <View style={styles.heroCard}>
                <Image source={{ uri: item.image }} style={styles.heroImage} />
                <LinearGradient colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.86)']} style={styles.heroOverlay} />
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>{item.badge}</Text>
                </View>
                <View style={styles.heroContent}>
                  <Text style={styles.heroTitle}>{item.title}</Text>
                  <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
                  <Pressable style={styles.heroCta} onPress={() => handleHeroCta(item.id)}>
                    <Text style={styles.heroCtaText}>{item.cta}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </Pressable>
                </View>
              </View>
            )}
          />

          <View style={styles.heroDots}>
            {HERO_SLIDES.map((_, index) => {
              const width = heroScrollX.interpolate({
                inputRange: [(index - 1) * 310, index * 310, (index + 1) * 310],
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
              });
              const opacity = heroScrollX.interpolate({
                inputRange: [(index - 1) * 310, index * 310, (index + 1) * 310],
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              return <Animated.View key={index} style={[styles.heroDot, { width, opacity }]} />;
            })}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionTitle}>Catégories</Text>
            <Pressable onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.sectionHint}>Voir tout</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
            {HOME_CATEGORIES.map((category) => {
              const active = activeCategory === category.key;
              return (
                <Pressable
                  key={category.key}
                  style={[styles.categoryCard, active && styles.categoryCardActive]}
                  onPress={() => handleCategoryPress(category.key)}
                >
                  <View style={[styles.categoryIconWrap, { backgroundColor: category.tint }]}>
                    {category.lib === 'mci' ? (
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
                  <Image source={{ uri: assetUrl(restaurant.imageUrl ?? restaurant.coverImageUrl) || undefined }} style={styles.restaurantImage} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={styles.restaurantImageOverlay} />
                  <View style={styles.restaurantRating}>
                    <Ionicons name="star" size={12} color="#fff" />
                    <Text style={styles.restaurantRatingText}>{restaurant.rating.toFixed(1)}</Text>
                  </View>
                  <View style={styles.restaurantBody}>
                    <Text style={styles.restaurantName} numberOfLines={1}>{restaurant.name}</Text>
                    <Text style={styles.restaurantMeta}>{restaurant.cuisineType} · {restaurant.city}</Text>
                    <View style={styles.metricsRow}>
                      <MetricPill icon="location-outline" value={`${restaurant.distanceKm.toFixed(1)} km`} />
                      <MetricPill icon="time-outline" value={`${restaurant.estimatedDeliveryTime} min`} />
                    </View>
                    <View style={styles.metricsRow}>
                      <MetricPill icon="pricetag-outline" value={`Dès ${formatPrice(restaurant.deliveryFee + 2500)}`} />
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
            {featuredProducts.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                {product.badge ? (
                  <View style={styles.productBadge}>
                    <Text style={styles.productBadgeText}>{product.badge}</Text>
                  </View>
                ) : null}
                <View style={styles.productBody}>
                  <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.productSeller}>{product.seller}</Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                    <Text style={styles.productDistance}>{product.distanceKm.toFixed(1)} km</Text>
                  </View>
                </View>
              </View>
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
                    {drivers.length} livreurs disponibles maintenant pour tes courses et tes colis.
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
          <SectionHeader title="Proche de chez moi" subtitle="3 restos sélectionnés autour de ta position" />
          <View style={styles.nearbyStack}>
            {nearbyRestaurants.map((restaurant) => (
              <Pressable
                key={restaurant.id}
                style={styles.nearbyCard}
                onPress={() => navigation.navigate('Restaurant', { id: restaurant.id, name: restaurant.name })}
              >
                <Image source={{ uri: assetUrl(restaurant.imageUrl ?? restaurant.coverImageUrl) || undefined }} style={styles.nearbyImage} />
                <View style={styles.nearbyBody}>
                  <View style={styles.nearbyTopRow}>
                    <Text style={styles.nearbyName}>{restaurant.name}</Text>
                    <View style={styles.nearbyDistanceBadge}>
                      <Ionicons name="location-outline" size={12} color={colors.primary} />
                      <Text style={styles.nearbyDistanceText}>{restaurant.distanceKm.toFixed(1)} km</Text>
                    </View>
                  </View>
                  <Text style={styles.nearbyMeta}>{restaurant.cuisineType} · {restaurant.city}</Text>
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
    marginTop: spacing.lg,
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
  eyebrow: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    fontFamily: fonts.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 26,
    color: '#fff',
    fontFamily: fonts.titleBold,
    marginTop: 4,
  },
  avatarWrap: { marginLeft: spacing.sm },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)' },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarInitial: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 18 },
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
  searchMiniBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchMiniBadgeText: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 11 },
  heroList: { paddingHorizontal: spacing.lg, paddingTop: 0 },
  heroCard: {
    width: 310,
    height: 210,
    marginRight: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 140 },
  heroBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroBadgeText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 11 },
  heroContent: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md },
  heroTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 22, lineHeight: 28 },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontFamily: fonts.bodyMedium, fontSize: 13, marginTop: 6, lineHeight: 18 },
  heroCta: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(254,100,0,0.9)',
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  heroCtaText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 13 },
  heroDots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.md },
  heroDot: { height: 8, borderRadius: 999, backgroundColor: '#fff' },
  sectionBlock: { marginTop: spacing.lg },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: { color: colors.secondary, fontFamily: fonts.titleBold, fontSize: 22 },
  sectionSubtitle: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 13, marginTop: 4, lineHeight: 18 },
  sectionHint: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 13, marginTop: 6 },
  sectionAction: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 13, marginTop: 6 },
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
  restaurantBody: { padding: spacing.md, gap: 8 },
  restaurantName: { color: colors.secondary, fontFamily: fonts.titleBold, fontSize: 18 },
  restaurantMeta: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 13 },
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
  productBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  productBadgeText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 11 },
  productBody: { padding: spacing.md },
  productName: { color: colors.secondary, fontFamily: fonts.titleSemiBold, fontSize: 15 },
  productSeller: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12, marginTop: 4 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  productPrice: { color: colors.primary, fontFamily: fonts.titleBold, fontSize: 14 },
  productDistance: { color: colors.textMuted, fontFamily: fonts.bodyBold, fontSize: 12 },
  parcelBanner: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  parcelTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 24, marginTop: spacing.md, lineHeight: 30 },
  parcelSubtitle: { color: 'rgba(255,255,255,0.76)', fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20, marginTop: spacing.sm },
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
  driverCtaTitle: { color: colors.secondary, fontFamily: fonts.titleBold, fontSize: 18 },
  driverCtaSubtitle: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 13, marginTop: 5, lineHeight: 18 },
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
  nearbyName: { color: colors.secondary, fontFamily: fonts.titleSemiBold, fontSize: 15 },
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
  cartBarText: { color: '#fff', fontSize: 16, fontFamily: fonts.titleBold },
  cartBarPriceWrapper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cartBarPrice: { color: '#fff', fontSize: 16, fontFamily: fonts.titleBold },
});
