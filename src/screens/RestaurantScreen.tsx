import React, { useMemo } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useMenuItemsByRestaurantQuery, useRestaurantQuery } from '../graphql/operations';
import type { MenuItemModel, MenuItemCategory } from '../graphql/types';
import { assetUrl } from '../lib/api';
import { useCart } from '../lib/cart';
import { colors, radius, spacing } from '../theme';
import { formatPrice, Spinner } from '../components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Restaurant'>;

const CATEGORY_LABELS: Record<MenuItemCategory, string> = {
  APPETIZER: 'Entrées',
  MAIN_COURSE: 'Plats principaux',
  SIDE: 'Accompagnements',
  DESSERT: 'Desserts',
  DRINK: 'Boissons',
  SNACK: 'Snacks',
  FRUIT: 'Fruits',
  LUNCH: 'Menus midi',
};

export default function RestaurantScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { data: restaurantData, loading: restaurantLoading } = useRestaurantQuery({
    variables: { id },
  });
  const { data: menuData, loading: menuLoading } = useMenuItemsByRestaurantQuery({
    variables: { restaurantId: id, page: 1, limit: 50 },
  });

  const restaurant = restaurantData?.restaurant;
  const items = menuData?.menuItemsByRestaurant.items ?? [];
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

  if (restaurantLoading || menuLoading) return <Spinner />;

  const sections = Array.from(grouped.entries()).map(([category, categoryItems]) => ({
    key: category,
    title: CATEGORY_LABELS[category] ?? category,
    data: categoryItems,
  }));

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        keyExtractor={(s) => s.key}
        ListHeaderComponent={
          <RestaurantHeader
            name={restaurant?.name ?? route.params.name}
            cover={restaurant?.coverImageUrl ?? restaurant?.imageUrl}
            description={restaurant?.description}
            meta={[
              restaurant?.rating ? `★ ${restaurant.rating.toFixed(1)}` : null,
              restaurant?.cuisineType,
              `${restaurant?.estimatedDeliveryTime} min`,
            ]
              .filter(Boolean)
              .join(' · ')}
          />
        }
        renderItem={({ item: section }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.data.map((menuItem) => (
              <MenuItemRow
                key={menuItem.id}
                item={menuItem}
                onAdd={() =>
                  restaurant &&
                  addItem(menuItem, restaurant.id, restaurant.name, restaurant.deliveryFee)
                }
              />
            ))}
          </View>
        )}
      />

      {count > 0 && (
        <Pressable style={styles.cartBar} onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.cartBarText}>
            Voir le panier · {count} article{count > 1 ? 's' : ''}
          </Text>
          <Text style={styles.cartBarPrice}>{formatPrice(total)}</Text>
        </Pressable>
      )}
    </View>
  );
}

function RestaurantHeader({
  name,
  cover,
  description,
  meta,
}: {
  name: string;
  cover?: string | null;
  description?: string | null;
  meta: string;
}) {
  const coverUrl = assetUrl(cover);
  return (
    <View>
      {coverUrl ? <Image source={{ uri: coverUrl }} style={styles.cover} /> : <View style={[styles.cover, styles.coverPlaceholder]} />}
      <View style={styles.headerBody}>
        <Text style={styles.name}>{name}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
    </View>
  );
}

function MenuItemRow({ item, onAdd }: { item: MenuItemModel; onAdd: () => void }) {
  const imageUrl = assetUrl(item.imageUrl);
  return (
    <View style={styles.itemRow}>
      {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.itemImage} /> : <View style={[styles.itemImage, styles.itemImagePlaceholder]} />}
      <View style={styles.itemBody}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
      </View>
      <Pressable onPress={onAdd} style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}>
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  cover: { width: '100%', height: 180, backgroundColor: colors.border },
  coverPlaceholder: { backgroundColor: colors.primaryLight },
  headerBody: { padding: spacing.md, backgroundColor: colors.surface },
  name: { fontSize: 22, fontWeight: '800', color: colors.text },
  meta: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  description: { fontSize: 14, color: colors.text, marginTop: spacing.sm },
  section: { marginTop: spacing.lg, paddingHorizontal: spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  itemImage: { width: 64, height: 64, borderRadius: radius.sm, backgroundColor: colors.border },
  itemImagePlaceholder: { backgroundColor: colors.primaryLight },
  itemBody: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.text },
  itemDescription: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: '700', color: colors.primary, marginTop: 4 },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: { opacity: 0.7 },
  addButtonText: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 26 },
  cartBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartBarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cartBarPrice: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
