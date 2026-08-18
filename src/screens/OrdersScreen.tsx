import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMyOrdersQuery } from '../graphql/operations';
import { assetUrl } from '../lib/api';
import { colors, radius, spacing } from '../theme';
import { EmptyState, formatDateTime, formatPrice, Spinner, StatusBadge } from '../components/ui';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Orders'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function OrdersScreen({ navigation }: Props) {
  const { data, loading, error, refetch } = useMyOrdersQuery({
    variables: { page: 1, limit: 20 },
  });

  const orders = data?.myOrders.items ?? [];

  if (loading) return <Spinner />;
  if (error) return <EmptyState title="Impossible de charger vos commandes" subtitle="Vérifiez votre connexion puis réessayez." />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes commandes</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        onRefresh={() => refetch()}
        refreshing={loading}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState title="Aucune commande" subtitle="Vos commandes apparaîtront ici." />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('OrderDetail', { id: item.id })}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            {item.restaurant?.imageUrl ? (
              <Image source={{ uri: assetUrl(item.restaurant.imageUrl) }} style={styles.cardImage} />
            ) : (
              <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
            )}
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.restaurant?.name ?? 'Restaurant'}
                </Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.cardDate}>{formatDateTime(item.createdAt)}</Text>
              <Text style={styles.cardTotal}>{formatPrice(item.grandTotal)}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, padding: spacing.lg, paddingBottom: spacing.md },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.85 },
  cardImage: { width: 84, height: 'auto', minHeight: 84, backgroundColor: colors.border },
  cardImagePlaceholder: { backgroundColor: colors.primaryLight },
  cardBody: { flex: 1, padding: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  cardName: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  cardDate: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  cardTotal: { fontSize: 16, fontWeight: '800', color: colors.primary, marginTop: 4 },
});
