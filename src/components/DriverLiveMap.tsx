import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, fonts, shadows } from '../theme';

export type LiveMapPoint = {
  latitude: number;
  longitude: number;
};

type Props = {
  origin: LiveMapPoint | null;
  destination: LiveMapPoint | null;
  driverName?: string | null;
  /** Position GPS réelle du livreur — absent tant que le backend n'a pas reçu de fix. */
  driverPosition?: LiveMapPoint | null;
  statusLabel?: string;
  etaMinutes?: number;
  mapHeight?: number;
  onExpand?: () => void;
};

/**
 * Carte de suivi : restaurant, destination et position live du livreur (sans simulation).
 */
export default function DriverLiveMap({
  origin,
  destination,
  driverName,
  driverPosition,
  statusLabel = 'En livraison',
  etaMinutes,
  mapHeight = 220,
  onExpand,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const [loaded, setLoaded] = useState(false);
  const isLive = driverPosition != null;

  const region = useMemo(() => {
    const points = [origin, destination, driverPosition].filter(Boolean) as LiveMapPoint[];
    if (points.length === 0) return undefined;
    const lats = points.map((p) => p.latitude);
    const lngs = points.map((p) => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 1.8, 0.02),
      longitudeDelta: Math.max((maxLng - minLng) * 1.8, 0.02),
    };
  }, [origin, destination, driverPosition]);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const focus = driverPosition ?? origin ?? destination;
    if (focus) {
      mapRef.current.animateCamera({ center: focus }, { duration: 600 });
    }
  }, [driverPosition, origin, destination, loaded]);

  if (!origin || !destination) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={[styles.map, { height: mapHeight }]}
        region={region}
        onMapReady={() => setLoaded(true)}
        pitchEnabled={false}
        rotateEnabled={false}
        toolbarEnabled={false}
      >
        <Marker coordinate={origin} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.marker, styles.markerOrigin]}>
            <Ionicons name="storefront" size={14} color="#fff" />
          </View>
        </Marker>

        {driverPosition ? (
          <Marker coordinate={driverPosition} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={styles.driverPulse}>
              <View style={[styles.marker, styles.markerDriver]}>
                <Ionicons name="bicycle" size={16} color="#fff" />
              </View>
            </View>
          </Marker>
        ) : null}

        <Marker coordinate={destination} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.marker, styles.markerDestination]}>
            <Ionicons name="home" size={14} color="#fff" />
          </View>
        </Marker>

        {driverPosition ? (
          <>
            <Polyline
              coordinates={[origin, driverPosition]}
              strokeColor={colors.primary}
              strokeWidth={4}
              lineDashPattern={[1, 6]}
              lineCap="round"
            />
            <Polyline
              coordinates={[driverPosition, destination]}
              strokeColor={colors.border}
              strokeWidth={4}
              lineDashPattern={[1, 6]}
              lineCap="round"
            />
          </>
        ) : (
          <Polyline
            coordinates={[origin, destination]}
            strokeColor={colors.border}
            strokeWidth={3}
            lineDashPattern={[4, 8]}
            lineCap="round"
          />
        )}
      </MapView>

      {isLive ? (
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Ionicons name="bicycle" size={18} color={colors.secondary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.driverName}>{driverName ?? 'Livreur en route'}</Text>
          <Text style={[styles.status, !isLive && styles.statusWaiting]}>
            {isLive ? statusLabel : 'En attente de position GPS…'}
          </Text>
        </View>
        {etaMinutes != null && isLive ? (
          <View style={styles.eta}>
            <Ionicons name="time-outline" size={13} color={colors.primary} />
            <Text style={styles.etaText}>{etaMinutes} min</Text>
          </View>
        ) : null}
        {onExpand ? (
          <Pressable style={styles.expandBtn} onPress={onExpand} hitSlop={8}>
            <Ionicons name="expand-outline" size={18} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  map: {
    height: 220,
    width: '100%',
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  markerOrigin: { backgroundColor: colors.secondary },
  markerDestination: { backgroundColor: colors.primary },
  markerDriver: { backgroundColor: colors.secondary },
  driverPulse: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    ...shadows.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveText: {
    fontSize: 11,
    fontFamily: fonts.bodyBold,
    color: colors.success,
  },
  card: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    ...shadows.lg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  driverName: {
    fontSize: 14,
    fontFamily: fonts.titleSemiBold,
    color: colors.secondary,
  },
  status: {
    fontSize: 11,
    fontFamily: fonts.bodyMedium,
    color: colors.success,
    marginTop: 1,
  },
  statusWaiting: {
    color: colors.textMuted,
  },
  eta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  etaText: {
    fontSize: 12,
    fontFamily: fonts.bodyBold,
    color: colors.primary,
  },
  expandBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
