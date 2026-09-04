import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCart, lineUnitPrice } from '../lib/cart';
import { assetUrl } from '../lib/api';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import { EmptyState, formatPrice } from '../components/ui';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Cart'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function CartScreen({ navigation }: Props) {
  const { cart, subtotal, setQuantity, removeItem } = useCart();

  const handleQty = (lineKey: string, quantity: number) => {
    Haptics.selectionAsync();
    setQuantity(lineKey, quantity);
  };

  if (!cart.restaurantId || cart.lines.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={styles.hero}>
          <Text style={styles.heroTitle}>Mon panier</Text>
        </LinearGradient>
        <View style={styles.emptyWrap}>
          <EmptyState
            title="Votre panier est vide"
            subtitle="Ajoutez des plats depuis un restaurant ou des produits depuis le marché."
            icon="🛒"
          />
          <Pressable style={styles.exploreBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.exploreText}>Découvrir les restaurants</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={styles.hero}>
        <Text style={styles.heroTitle}>Mon panier</Text>
      </LinearGradient>

      <FlatList
        data={cart.lines}
        keyExtractor={(line) => line.key}
        contentContainerStyle={styles.list}
        renderItem={({ item: line }) => {
          const unitPrice = lineUnitPrice(line);
          return (
            <View style={styles.card}>
              <View style={styles.line}>
                <View style={styles.imageWrap}>
                  {line.menuItem.imageUrl ? (
                    <Image source={{ uri: assetUrl(line.menuItem.imageUrl) }} style={styles.image} />
                  ) : (
                    <View style={[styles.image, styles.imagePlaceholder]}>
                      <Ionicons name="fast-food" size={18} color={colors.primary} />
                    </View>
                  )}
                </View>

                <View style={styles.body}>
                  <View style={styles.topRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {line.menuItem.name}
                    </Text>
                    <Pressable hitSlop={8} onPress={() => removeItem(line.key)}>
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    </Pressable>
                  </View>

                  {line.supplements.length > 0 ? (
                    <Text style={styles.supplements} numberOfLines={1}>
                      + {line.supplements.map((s) => s.name).join(', ')}
                    </Text>
                  ) : null}

                  <View style={styles.bottomRow}>
                    <View style={styles.qtySelector}>
                      <Pressable
                        style={[styles.qtyBtn, line.quantity <= 1 && styles.qtyBtnDisabled]}
                        onPress={() => handleQty(line.key, line.quantity - 1)}
                      >
                        <Ionicons name="remove" size={15} color={line.quantity <= 1 ? colors.textMuted : colors.secondary} />
                      </Pressable>
                      <Text style={styles.qtyValue}>{line.quantity}</Text>
                      <Pressable style={styles.qtyBtn} onPress={() => handleQty(line.key, line.quantity + 1)}>
                        <Ionicons name="add" size={15} color={colors.secondary} />
                      </Pressable>
                    </View>
                    <Text style={styles.linePrice}>{formatPrice(unitPrice * line.quantity)}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de livraison</Text>
              <Text style={styles.summaryLater}>Calculés à l'étape suivante</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>{formatPrice(subtotal)}</Text>
            </View>

            <Pressable style={styles.checkoutBtn} onPress={() => navigation.navigate('Checkout')}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.checkoutGradient}
              >
                <Text style={styles.checkoutText}>Passer à la commande</Text>
                <Ionicons name="arrow-forward" size={17} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    paddingTop: 24,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 20, textAlign: 'center' },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  exploreText: {
    color: '#fff',
    fontFamily: fonts.titleSemiBold,
    fontSize: 15,
  },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  line: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  imageWrap: { position: 'relative' },
  image: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  imagePlaceholder: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.titleSemiBold,
    color: colors.secondary,
  },
  supplements: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.primary,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: 3,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: {
    opacity: 0.5,
  },
  qtyValue: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: fonts.titleBold,
    color: colors.secondary,
  },
  linePrice: {
    fontSize: 15,
    fontFamily: fonts.titleBold,
    color: colors.primary,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: fonts.bodyBold,
    color: colors.secondary,
  },
  summaryLater: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontFamily: fonts.titleBold,
    color: colors.secondary,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontFamily: fonts.titleBold,
    color: colors.primary,
  },
  checkoutBtn: {
    marginTop: spacing.lg,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: fonts.titleBold,
  },
});
