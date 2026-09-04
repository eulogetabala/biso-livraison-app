import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { formatPrice } from './ui';
import { useFavorites, type FavoriteItem } from '../lib/favorites';
import type { CartSupplement } from '../lib/cart';

export type ProductSupplement = {
  id?: string;
  name: string;
  price: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  id: string;
  imageUrl?: string | null;
  name: string;
  description?: string | null;
  price: number;
  categoryLabel?: string;
  seller?: string;
  supplements?: ProductSupplement[];
  onAddToCart: (quantity: number, supplements: CartSupplement[]) => void;
};

export default function ProductDetailModal({
  visible,
  onClose,
  id,
  imageUrl,
  name,
  description,
  price,
  categoryLabel,
  seller,
  supplements = [],
  onAddToCart,
}: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const slideY = useRef(new Animated.Value(0)).current;
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      slideY.setValue(1);
      setQuantity(1);
      setSelected([]);
      Animated.spring(slideY, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideY]);

  const selectedSupplements = useMemo(
    () => supplements.filter((s) => selected.includes(s.id ?? s.name)),
    [supplements, selected],
  );

  const unitPrice = price + selectedSupplements.reduce((sum, s) => sum + s.price, 0);
  const totalPrice = unitPrice * quantity;
  const favorited = isFavorite(id);

  const toggleSupplement = (id: string) => {
    Haptics.selectionAsync();
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToCart(quantity, selectedSupplements);
  };

  const handleFavorite = () => {
    const item: FavoriteItem = {
      id,
      name,
      kind: 'product',
      price,
      imageUrl,
      seller,
    };
    toggleFavorite(item);
    Haptics.selectionAsync();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: slideY.interpolate({ inputRange: [0, 1], outputRange: [0, 900] }) }],
            },
          ]}
        >
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Image */}
            <View style={styles.imageWrap}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.image} />
              ) : (
                <LinearGradient
                  colors={[colors.primaryLight, colors.secondaryLight]}
                  style={[styles.image, styles.imagePlaceholder]}
                >
                  <Ionicons name="fast-food" size={48} color={colors.primary} />
                </LinearGradient>
              )}
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.35)']} style={styles.imageOverlay} />

              <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
                <Ionicons name="close" size={20} color="#fff" />
              </Pressable>

              <Pressable style={[styles.heartBtn, favorited && styles.heartBtnActive]} onPress={handleFavorite} hitSlop={8}>
                <Ionicons
                  name={favorited ? 'heart' : 'heart-outline'}
                  size={19}
                  color={favorited ? '#fff' : '#fff'}
                />
              </Pressable>
            </View>

            {/* Details */}
            <View style={styles.body}>
              {categoryLabel ? (
                <View style={styles.categoryChip}>
                  <Ionicons name="pricetag-outline" size={11} color={colors.primary} />
                  <Text style={styles.categoryText}>{categoryLabel}</Text>
                </View>
              ) : null}

              <Text style={styles.name}>{name}</Text>

              {seller ? <Text style={styles.seller}>{seller}</Text> : null}

              <Text style={styles.price}>{formatPrice(price)}</Text>

              {description ? <Text style={styles.description}>{description}</Text> : null}

              {/* Supplements */}
              {supplements.length > 0 ? (
                <View style={styles.supplementsBlock}>
                  <View style={styles.supplementsHeader}>
                    <Ionicons name="add-circle-outline" size={16} color={colors.secondary} />
                    <Text style={styles.supplementsTitle}>Suppléments</Text>
                    <Text style={styles.supplementsHint}>Choisis tes accompagnements</Text>
                  </View>

                  {supplements.map((sup) => {
                    const id = sup.id ?? sup.name;
                    const isSelected = selected.includes(id);
                    return (
                      <Pressable
                        key={id}
                        style={[styles.supplementRow, isSelected && styles.supplementRowSelected]}
                        onPress={() => toggleSupplement(id)}
                      >
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                          {isSelected ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                        </View>
                        <View style={styles.supplementBody}>
                          <Text style={styles.supplementName}>{sup.name}</Text>
                        </View>
                        <Text style={styles.supplementPrice}>+{formatPrice(sup.price)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          </ScrollView>

          {/* Bottom bar */}
          <View style={styles.bottomBar}>
            <View style={styles.qtySelector}>
              <Pressable
                style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                onPress={() => {
                  Haptics.selectionAsync();
                  if (quantity > 1) setQuantity((q) => q - 1);
                }}
              >
                <Ionicons name="remove" size={18} color={quantity <= 1 ? colors.textMuted : colors.secondary} />
              </Pressable>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <Pressable
                style={styles.qtyBtn}
                onPress={() => {
                  Haptics.selectionAsync();
                  setQuantity((q) => q + 1);
                }}
              >
                <Ionicons name="add" size={18} color={colors.secondary} />
              </Pressable>
            </View>

            <Pressable style={styles.addBtn} onPress={handleAdd}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addGradient}
              >
                <Ionicons name="cart" size={17} color="#fff" />
                <Text style={styles.addText}>Ajouter · {formatPrice(totalPrice)}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '88%',
    overflow: 'hidden',
    ...shadows.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginTop: 10,
    marginBottom: 2,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  imageWrap: {
    height: 230,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtnActive: {
    backgroundColor: colors.primary,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: spacing.sm,
  },
  categoryText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  name: {
    fontSize: 18,
    fontFamily: fonts.titleBold,
    color: colors.secondary,
  },
  seller: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    marginTop: 3,
  },
  price: {
    fontSize: 17,
    fontFamily: fonts.titleBold,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  description: {
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  supplementsBlock: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  supplementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  supplementsTitle: {
    fontSize: 15,
    fontFamily: fonts.titleSemiBold,
    color: colors.secondary,
  },
  supplementsHint: {
    fontSize: 11,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    marginLeft: 'auto',
  },
  supplementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  supplementRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  supplementBody: {
    flex: 1,
  },
  supplementName: {
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    color: colors.text,
  },
  supplementPrice: {
    fontSize: 12,
    fontFamily: fonts.bodyBold,
    color: colors.primary,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 4,
  },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  qtyBtnDisabled: {
    backgroundColor: colors.background,
    opacity: 0.6,
  },
  qtyValue: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: fonts.titleBold,
    color: colors.secondary,
  },
  addBtn: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  addGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: radius.md,
  },
  addText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.titleBold,
  },
});
