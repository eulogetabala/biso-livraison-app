import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import FloatingBackButton from '../components/FloatingBackButton';
import { useNotifications } from '../lib/notifications';
import {
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useMyNotificationsQuery,
} from '../graphql/operations';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { EmptyState, formatDateTime, SkeletonBlock } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const TYPE_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; tint: string }> = {
  ORDER_STATUS: { icon: 'bicycle-outline', tint: colors.primary },
  DELIVERY_STATUS: { icon: 'location-outline', tint: '#10B981' },
  PAYMENT: { icon: 'card-outline', tint: '#3B82F6' },
  PROMOTIONAL: { icon: 'pricetag-outline', tint: colors.warning },
};

export default function NotificationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { permission, requestPermission, refetchUnreadCount } = useNotifications();
  const { data, loading, refetch } = useMyNotificationsQuery({ variables: { page: 1, limit: 30 } });
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  const items = data?.myNotifications.items ?? [];
  const unreadLocal = items.filter((n) => !n.readAt).length;

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    refetch();
    refetchUnreadCount();
  };

  const handleOpen = async (id: string) => {
    await markAsRead({ variables: { input: { id } } });
    refetch();
    refetchUnreadCount();
  };

  const listData = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        meta: TYPE_META[item.type] ?? { icon: 'notifications-outline' as const, tint: colors.primary },
      })),
    [items],
  );

  return (
    <View style={styles.container}>
      <FloatingBackButton navigation={navigation} />
      <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={[styles.hero, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.heroTitle}>Notifications</Text>
      </LinearGradient>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {permission !== 'granted' ? (
              <View style={styles.permissionBanner}>
                <View style={styles.permissionIcon}>
                  <Ionicons name="notifications-off-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.permissionBody}>
                  <Text style={styles.permissionTitle}>Notifications désactivées</Text>
                  <Text style={styles.permissionText}>
                    Activez-les pour suivre vos commandes et vos colis en temps réel.
                  </Text>
                </View>
                <Pressable style={styles.permissionBtn} onPress={requestPermission}>
                  <Text style={styles.permissionBtnText}>Activer</Text>
                </Pressable>
              </View>
            ) : null}
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>Vos dernières notifications</Text>
              {unreadLocal > 0 ? (
                <Pressable style={styles.markAllBtn} onPress={handleMarkAllRead}>
                  <Text style={styles.markAllText}>Tout marquer comme lu</Text>
                </Pressable>
              ) : (
                <Text style={styles.allReadText}>Aucune notification non lue</Text>
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: spacing.sm }}>
              <SkeletonBlock width="100%" height={76} />
              <SkeletonBlock width="100%" height={76} />
            </View>
          ) : (
            <EmptyState title="Aucune notification" subtitle="Vos alertes de commande apparaîtront ici." />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, !item.readAt && styles.cardUnread]}
            onPress={() => handleOpen(item.id)}
          >
            <View style={[styles.cardIcon, { backgroundColor: `${item.meta.tint}18` }]}>
              <Ionicons name={item.meta.icon} size={20} color={item.meta.tint} />
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {!item.readAt ? <View style={styles.unreadDot} /> : null}
              </View>
              <Text style={styles.cardMessage} numberOfLines={2}>{item.message}</Text>
              <Text style={styles.cardTime}>{formatDateTime(item.createdAt)}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { paddingBottom: spacing.xl, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 20 },
  listContent: { padding: spacing.lg, paddingBottom: 140, gap: spacing.sm },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  listHeaderText: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12 },
  markAllBtn: { padding: 4 },
  markAllText: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 12 },
  allReadText: { color: colors.success, fontFamily: fonts.bodyBold, fontSize: 12 },
  permissionBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  permissionIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  permissionBody: { flex: 1 },
  permissionTitle: { color: colors.secondary, fontFamily: fonts.bodyBold, fontSize: 13 },
  permissionText: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 16, marginTop: 2 },
  permissionBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 8 },
  permissionBtnText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 12 },
  card: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, ...shadows.sm },
  cardUnread: { borderWidth: 1, borderColor: colors.primaryLight },
  cardIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  cardTitle: { color: colors.secondary, fontFamily: fonts.titleSemiBold, fontSize: 14 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  cardMessage: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 18, marginTop: 4 },
  cardTime: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 11, marginTop: 6, opacity: 0.8 },
});
