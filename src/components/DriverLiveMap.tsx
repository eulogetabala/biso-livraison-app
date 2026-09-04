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
  /** Coordonnées du restaurant (point de départ). */
  origin: LiveMapPoint | null;
  /** Coordonnées de livraison (destination). */
  destination: LiveMapPoint | null;
  /** Nom du livreur (affiché dans l'encart). */
  driverName?: string | null;
  /** Position GPS actuelle du livreur (prioritaire sur progress). */
  driverPosition?: LiveMapPoint | null;
  /** Progression simulée du livreur, entre 0 et 1 (repli si driverPosition absent). */
  progress?: number;
  /** Statut affiché (ex. "En livraison"). */
  statusLabel?: string;
  /** Temps estimé restant en minutes. */
  etaMinutes?: number;
  /** Hauteur de la carte (défaut 220). */
  mapHeight?: number;
  onExpand?: () => void;
};

/**
 * Carte de suivi en temps réel : restaurant, destination et position du livreur.
 */
export default function DriverLiveMap({
  origin,
  destination,
  driverName,
  driverPosition,
  progress = 0.4,
  statusLabel = 'En livraison',
  etaMinutes,
  mapHeight = 220,
  onExpand,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const [loaded, setLoaded] = useState(false);

  const resolvedDriverPosition = useMemo(() => {
    if (driverPosition) return driverPosition;
    if (!origin || !destination) return null;
    const p = Math.max(0, Math.min(1, progress));
    return {
      latitude: origin.latitude + (destination.latitude - origin.latitude) * p,
      longitude: origin.longitude + (destination.longitude - origin.longitude) * p,
    };
  }, [driverPosition, origin, destination, progress]);

  const region = useMemo(() => {
    const a = origin ?? destination;
    const b = destination ?? origin;
    if (!a || !b) return undefined;
    return {
      latitude: (a.latitude + b.latitude) / 2,
      longitude: (a.longitude + b.longitude) / 2,
      latitudeDelta: Math.abs(a.latitude - b.latitude) * 1.9 + 0.02,
      longitudeDelta: Math.abs(a.longitude - b.longitude) * 1.9 + 0.02,
    };
  }, [origin, destination]);

  useEffect(() => {
    if (loaded && resolvedDriverPosition && mapRef.current) {
      mapRef.current.animateCamera({ center: resolvedDriverPosition }, { duration: 800 });
    }
  }, [resolvedDriverPosition, loaded]);

  if (!origin || !destination || !resolvedDriverPosition) {
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
        {/* Restaurant */}
        <Marker coordinate={origin} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.marker, styles.markerOrigin]}>
            <Ionicons name="storefront" size={14} color="#fff" />
          </View>
        </Marker>

        {/* Livreur en mouvement */}
        <Marker coordinate={resolvedDriverPosition} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges>
          <View style={styles.driverPulse}>
            <View style={[styles.marker, styles.markerDriver]}>
              <Ionicons name="bicycle" size={16} color="#fff" />
            </View>
          </View>
        </Marker>

        {/* Destination */}
        <Marker coordinate={destination} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.marker, styles.markerDestination]}>
            <Ionicons name="home" size={14} color="#fff" />
          </View>
        </Marker>

        <Polyline
          coordinates={[origin, resolvedDriverPosition]}
          strokeColor={colors.primary}
          strokeWidth={4}
          lineDashPattern={[1, 6]}
          lineCap="round"
        />
        <Polyline
          coordinates={[resolvedDriverPosition, destination]}
          strokeColor={colors.border}
          strokeWidth={4}
          lineDashPattern={[1, 6]}
          lineCap="round"
        />
      </MapView>

      {/* Encart livreur */}
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Ionicons name="bicycle" size={18} color={colors.secondary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.driverName}>{driverName ?? 'Livreur en route'}</Text>
          <Text style={styles.status}>{statusLabel}</Text>
        </View>
        {etaMinutes != null ? (
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
