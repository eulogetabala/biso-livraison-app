import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useCreateOrderMutation } from '../graphql/operations';
import type { PaymentMethod } from '../graphql/types';
import { assetUrl } from '../lib/api';
import { useCart } from '../lib/cart';
import { colors, radius, spacing } from '../theme';
import { Button, EmptyState, formatPrice } from '../components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export default function CheckoutScreen({ navigation }: Props) {
  const { cart, subtotal, total, clear } = useCart();
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [createOrder, { loading }] = useCreateOrderMutation();

  const handleSubmit = async () => {
    setError(null);
    if (!cart.restaurantId || cart.lines.length === 0) {
      setError('Votre panier est vide.');
      return;
    }
    if (!address.trim() || !city.trim() || !zipCode.trim()) {
      setError('Veuillez renseigner l\u2019adresse de livraison complète.');
      return;
    }
    try {
      const { data } = await createOrder({
        variables: {
          input: {
            restaurantId: cart.restaurantId,
            items: cart.lines.map((l) => ({ menuItemId: l.menuItem.id, quantity: l.quantity })),
            deliveryAddress: address.trim(),
            deliveryCity: city.trim(),
            deliveryZipCode: zipCode.trim(),
            paymentMethod: 'CASH_ON_DELIVERY' as PaymentMethod,
          },
        },
      });
      if (!data?.createOrder) throw new Error('Réponse invalide du serveur.');
      clear();
      navigation.navigate('OrderDetail', { id: data.createOrder.id });
    } catch (e) {
      const message =
        e instanceof Error && e.message.toLowerCase().includes('restaurant')
          ? 'Ce restaurant n\u2019est plus disponible.'
          : 'Impossible de créer la commande. Vérifiez votre connexion et réessayez.';
      setError(message);
    }
  };

  if (!cart.restaurantId || cart.lines.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState title="Votre panier est vide" subtitle="Ajoutez des plats depuis un restaurant." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Votre commande</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Restaurant</Text>
          <Text style={styles.restaurantName}>{cart.restaurantName}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Articles</Text>
          {cart.lines.map((line) => (
            <View key={line.menuItem.id} style={styles.line}>
              {line.menuItem.imageUrl ? (
                <Image source={{ uri: assetUrl(line.menuItem.imageUrl) }} style={styles.lineImage} />
              ) : null}
              <View style={styles.lineBody}>
                <Text style={styles.lineName} numberOfLines={1}>
                  {line.menuItem.name}
                </Text>
                <Text style={styles.lineQty}>x{line.quantity}</Text>
              </View>
              <Text style={styles.linePrice}>{formatPrice(line.quantity * line.menuItem.price)}</Text>
            </View>
          ))}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Livraison</Text>
              <Text style={styles.summaryValue}>{formatPrice(cart.deliveryFee)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>{formatPrice(total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Adresse de livraison</Text>
          <Text style={styles.label}>Adresse</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="12 rue des Lilas"
            placeholderTextColor={colors.textMuted}
          />
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Code postal</Text>
              <TextInput
                style={styles.input}
                value={zipCode}
                onChangeText={setZipCode}
                placeholder="75011"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
              />
            </View>
            <View style={[styles.rowItem, styles.rowItemWide]}>
              <Text style={styles.label}>Ville</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Paris"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
          <Text style={styles.label}>Notes (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Code d'accès, étage, instructions…"
            placeholderTextColor={colors.textMuted}
            multiline
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Paiement</Text>
          <Text style={styles.payment}>Paiement à la livraison (espèces)</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title={`Commander · ${formatPrice(total)}`}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: spacing.xl },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  restaurantName: { fontSize: 16, fontWeight: '600', color: colors.primary },
  line: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  lineImage: { width: 40, height: 40, borderRadius: radius.sm },
  lineBody: { flex: 1 },
  lineName: { fontSize: 14, color: colors.text },
  lineQty: { fontSize: 13, color: colors.textMuted },
  linePrice: { fontSize: 14, fontWeight: '600', color: colors.text },
  summary: { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  summaryLabel: { fontSize: 14, color: colors.textMuted },
  summaryValue: { fontSize: 14, color: colors.text },
  summaryTotalRow: { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  summaryTotalLabel: { fontSize: 16, fontWeight: '800', color: colors.text },
  summaryTotalValue: { fontSize: 16, fontWeight: '800', color: colors.primary },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: spacing.sm, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#fff',
  },
  inputMultiline: { minHeight: 70, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.sm },
  rowItem: { flex: 1 },
  rowItemWide: { flex: 2 },
  payment: { fontSize: 14, color: colors.text },
  error: { color: colors.danger, fontSize: 14, marginTop: spacing.sm, marginBottom: spacing.sm },
  submit: { marginTop: spacing.sm },
});
