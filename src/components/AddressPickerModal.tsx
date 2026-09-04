import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { AppTextInput } from './AppTextInput';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { requestLocationPermission, promptLocationDenied } from '../lib/permissions';
import {
  BRAZZAVILLE_CENTER,
  POINTE_NOIRE_CENTER,
  distanceKmBetween,
  nearestLocalPlace,
  searchLocalPlaces,
  type GeoPlace,
} from '../lib/geo-data';

type PickerTarget = 'pickup' | 'dropoff' | 'delivery';
type PickerMode = 'map' | 'manual';

type Props = {
  visible: boolean;
  target: PickerTarget;
  initialAddress?: string;
  /** Mode d'ouverture : carte ou saisie manuelle. */
  initialMode?: PickerMode;
  /** Ville par défaut où centrer la carte (départ/arrivée). */
  defaultCity: 'brazzaville' | 'pointe-noire';
  onClose: () => void;
  onConfirm: (address: string, coords?: { latitude: number; longitude: number }) => void;
};

const TITLES: Record<PickerTarget, string> = {
  pickup: 'Adresse de départ',
  dropoff: 'Adresse du destinataire',
  delivery: 'Adresse de livraison',
};

type Suggestion = {
  latitude: number;
  longitude: number;
  label: string;
  /** Quartier local connu (pour l'icône/label). */
  local?: GeoPlace;
};

const CITY_NAME: Record<'brazzaville' | 'pointe-noire', string> = {
  brazzaville: 'Brazzaville',
  'pointe-noire': 'Pointe-Noire',
};

/**
 * Détecte un nom de commerce / point d'intérêt (ex. "Biso Market") pour ne pas
 * l'utiliser comme adresse. On ignore ces noms au profit des rues/quartiers.
 */
const POI_NAME_PATTERN =
  /\b(market|march[eé]|shop|boutique|store|restaurant|supermarche|supermarch[eé]|e?picerie|pharmacie|boulangerie|salon|coiffure|hotel|bar|caf[eé]|bracerie)\b/i;

function isPoiName(name: string): boolean {
  const trimmed = name.trim();
  // Un nom de rue classique (rue, avenue, boulevard…) ou avec un numéro
  // est une vraie adresse, pas un POI.
  if (
    /(^|\s)(rue|avenue|av\.|bd|boulevard|impasse|chemin|route|all[eé]e|place|pont|quai|cours|giratoire|carrefour)\b/i.test(
      trimmed,
    ) ||
    /\d/.test(trimmed)
  ) {
    return false;
  }
  return POI_NAME_PATTERN.test(trimmed);
}

/**
 * Sélecteur d'adresse dynamique sur une carte :
 * recherche par géocodage, pin central déplaçable, adresse déduite par
 * reverse-geocoding et confirmation.
 */
export default function AddressPickerModal({
  visible,
  target,
  initialAddress,
  initialMode = 'map',
  defaultCity,
  onClose,
  onConfirm,
}: Props) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mode, setMode] = useState<PickerMode>(initialMode);
  const [center, setCenter] = useState(BRAZZAVILLE_CENTER);
  const [address, setAddress] = useState('');
  const [resolving, setResolving] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locating, setLocating] = useState(false);

  const defaultRegion = defaultCity === 'pointe-noire' ? POINTE_NOIRE_CENTER : BRAZZAVILLE_CENTER;

  // Initialise la carte à l'ouverture.
  useEffect(() => {
    if (!visible) return;
    setMode(initialMode);
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (initialAddress?.trim()) {
      setQuery(initialAddress);
      setAddress(initialAddress);
      geocodeAndCenter(initialAddress);
    } else {
      setCenter(defaultRegion);
      setAddress('');
      reverseGeocode(defaultRegion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, defaultCity]);

  const formatPlace = (place: Location.LocationGeocodedAddress): string => {
    // Certains noms renvoyés par le géocodeur système sont des commerces/POI
    // (ex. "Biso Market") et non une vraie adresse : on les ignore pour ne pas
    // proposer le nom d'un magasin comme adresse de livraison.
    const name = place.name && !isPoiName(place.name) ? place.name : undefined;
    const parts = [
      name,
      place.street,
      place.district,
      place.subregion,
      place.city,
      place.region,
      place.country,
    ].filter((p): p is string => !!p && p.trim().length > 0);
    const uniq = [...new Set(parts)];
    // Si on ne garde qu'une ville/région/pays (aucune rue ni quartier),
    // l'adresse n'est pas exploitable : on renvoie '' pour retomber sur le
    // quartier local le plus proche.
    const hasStreetInfo = !!place.street || !!place.district || !!place.subregion;
    if (!hasStreetInfo && (!name || uniq.length <= 2)) {
      return '';
    }
    return uniq.join(', ');
  };

  const reverseGeocode = useCallback(
    async (coords: { latitude: number; longitude: number }) => {
      setResolving(true);
      let resolved = '';
      try {
        const places = await Location.reverseGeocodeAsync(coords);
        if (places.length > 0) {
          resolved = formatPlace(places[0]);
        }
      } catch {
        resolved = '';
      }
      // Si l'adresse renvoyée pointe vers une autre ville que la cible
      // (ex. "Siafoumou, Brazzaville" alors qu'on est à Pointe-Noire),
      // on la rejette et on retombe sur le quartier local le plus proche.
      const local = nearestLocalPlace(coords, defaultCity);
      const fallback = local ? `${local.name}, ${local.city}` : '';
      const wrongCity =
        defaultCity === 'pointe-noire'
          ? /brazzaville/i.test(resolved)
          : /pointe\s?-?\s?noire/i.test(resolved);
      // Une adresse réduite à une simple ville (sans rue ni quartier) n'est pas
      // exploitable : on préfère le quartier local le plus proche.
      const tooGeneric = !/,\s*/.test(resolved);
      setAddress(
        (resolved && resolved.length > 4 && !wrongCity && !tooGeneric ? resolved : fallback) ||
          `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
      );
      setResolving(false);
    },
    [defaultCity],
  );

  const geocodeAndCenter = async (text: string) => {
    setSearching(true);
    try {
      // Essaie d'abord un quartier local (libellé connu → coordonnées sûres).
      const local = searchLocalPlaces(text, defaultCity, 1)[0];
      if (local) {
        const c = { latitude: local.latitude, longitude: local.longitude };
        setCenter(c);
        mapRef.current?.animateToRegion(
          { ...c, latitudeDelta: 0.02, longitudeDelta: 0.02 },
          400,
        );
        setAddress(`${local.name}, ${local.city}`);
        setSearching(false);
        return;
      }
      const results = await Location.geocodeAsync(text);
      if (results.length > 0 && results[0]) {
        const c = { latitude: results[0].latitude, longitude: results[0].longitude };
        setCenter(c);
        mapRef.current?.animateToRegion(
          { ...c, latitudeDelta: 0.02, longitudeDelta: 0.02 },
          400,
        );
        await reverseGeocode(c);
      }
    } catch {
      // géocodage indisponible : on laisse l'adresse saisie telle quelle
    } finally {
      setSearching(false);
    }
  };

  // Recherche avec debounce.
  const handleQueryChange = (text: string) => {
    setQuery(text);
    setShowSuggestions(true);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        // 1. Quartiers locaux (Brazzaville ET Pointe-Noire) d'abord.
        const localPlaces = searchLocalPlaces(text.trim(), defaultCity);
        const localSuggestions: Suggestion[] = localPlaces.map((p) => ({
          latitude: p.latitude,
          longitude: p.longitude,
          label: `${p.name}, ${p.city}`,
          local: p,
        }));

        // 2. Le géocodage système ne sert que si aucun quartier local n'a
        //    été trouvé (il peut renvoyer de faux résultats de l'autre ville,
        //    ex. "Siafoumou, Brazzaville").
        if (localSuggestions.length > 0) {
          setSuggestions(localSuggestions);
          return;
        }

        let remoteSuggestions: Suggestion[] = [];
        try {
          const targetCenter =
            defaultCity === 'pointe-noire' ? POINTE_NOIRE_CENTER : BRAZZAVILLE_CENTER;
          const results = await Location.geocodeAsync(
            `${text.trim()}, ${CITY_NAME[defaultCity]}, Congo`,
          );
          remoteSuggestions = results
            .filter(
              (r) =>
                distanceKmBetween(
                  { latitude: r.latitude, longitude: r.longitude },
                  targetCenter,
                ) <= 30,
            )
            .slice(0, 4)
            .map((r) => ({
              latitude: r.latitude,
              longitude: r.longitude,
              label: `${text.trim()}, ${CITY_NAME[defaultCity]}`,
            }));
        } catch {
          remoteSuggestions = [];
        }

        setSuggestions(remoteSuggestions);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const selectSuggestion = async (s: Suggestion) => {
    setQuery(s.label);
    setSuggestions([]);
    setShowSuggestions(false);
    const c = { latitude: s.latitude, longitude: s.longitude };
    setCenter(c);
    mapRef.current?.animateToRegion(
      { ...c, latitudeDelta: 0.02, longitudeDelta: 0.02 },
      400,
    );
    // Pour un quartier local connu on garde directement le libellé propre.
    if (s.local) {
      setAddress(s.label);
    } else {
      await reverseGeocode(c);
    }
  };

  const handleMapMove = (region: { latitude: number; longitude: number }) => {
    const c = { latitude: region.latitude, longitude: region.longitude };
    setCenter(c);
    reverseGeocode(c);
  };

  const locateMe = async () => {
    setLocating(true);
    const permission = await requestLocationPermission();
    if (permission !== 'granted') {
      setLocating(false);
      promptLocationDenied(permission, locateMe);
      return;
    }
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const c = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setCenter(c);
      mapRef.current?.animateToRegion(
        { ...c, latitudeDelta: 0.02, longitudeDelta: 0.02 },
        400,
      );
      await reverseGeocode(c);
    } catch {
      // géolocalisation indisponible
    } finally {
      setLocating(false);
    }
  };

  const confirm = () => {
    if (address.trim().length > 0) {
      if (mode === 'manual') {
        onConfirm(address.trim());
      } else {
        onConfirm(address.trim(), { latitude: center.latitude, longitude: center.longitude });
      }
    }
  };

  const switchMode = (m: PickerMode) => {
    setMode(m);
    setShowSuggestions(false);
    setSuggestions([]);
    // En repassant sur la carte, on tente de centrer sur l'adresse saisie.
    if (m === 'map' && address.trim()) {
      geocodeAndCenter(address.trim());
    }
  };

  const handleClose = () => {
    setShowSuggestions(false);
    setSuggestions([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Carte */}
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            ...center,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onRegionChangeComplete={(region) =>
            handleMapMove({ latitude: region.latitude, longitude: region.longitude })
          }
        >
          <Marker coordinate={center} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.pinWrap}>
              <View style={styles.pin}>
                <Ionicons name="location" size={26} color="#fff" />
              </View>
            </View>
          </Marker>
        </MapView>

        {/* Barre du haut : titre + fermer */}
        <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
          <Pressable style={styles.closeBtn} onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.secondary} />
          </Pressable>
          <Text style={styles.topTitle}>{TITLES[target]}</Text>
          <View style={styles.closeBtn} />
        </View>

        {/* Recherche (mode carte) */}
        {mode === 'map' ? (
          <View style={[styles.searchBar, { marginTop: insets.top + 60 }]}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <AppTextInput
              style={styles.searchInput}
              value={query}
              onChangeText={handleQueryChange}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Rechercher une adresse…"
              autoCapitalize="words"
              returnKeyType="search"
            />
            {searching ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : query.length > 0 ? (
              <Pressable onPress={() => handleQueryChange('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
        ) : (
          /* Saisie manuelle (mode texte) */
          <View style={[styles.manualBar, { marginTop: insets.top + 60 }]}>
            <Ionicons name="create-outline" size={18} color={colors.primary} />
            <AppTextInput
              style={styles.manualInput}
              value={address}
              onChangeText={(t) => {
                setAddress(t);
                setQuery(t);
              }}
              placeholder="Saisissez votre adresse…"
              autoCapitalize="words"
              multiline
            />
            {address.length > 0 ? (
              <Pressable
                onPress={() => {
                  setAddress('');
                  setQuery('');
                }}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
        )}

        {/* Bascule carte / saisie manuelle */}
        <View style={[styles.modeToggle, { marginTop: insets.top + 116 }]}>
          <Pressable
            style={[styles.modeBtn, mode === 'map' && styles.modeBtnActive]}
            onPress={() => switchMode('map')}
          >
            <Ionicons
              name="map-outline"
              size={15}
              color={mode === 'map' ? '#fff' : colors.textMuted}
            />
            <Text style={[styles.modeBtnText, mode === 'map' && styles.modeBtnTextActive]}>
              Sur la carte
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeBtn, mode === 'manual' && styles.modeBtnActive]}
            onPress={() => switchMode('manual')}
          >
            <Ionicons
              name="create-outline"
              size={15}
              color={mode === 'manual' ? '#fff' : colors.textMuted}
            />
            <Text style={[styles.modeBtnText, mode === 'manual' && styles.modeBtnTextActive]}>
              Saisie manuelle
            </Text>
          </Pressable>
        </View>

        {/* Suggestions (mode carte) */}
        {mode === 'map' && showSuggestions && query.trim().length >= 2 ? (
          <View style={[styles.suggestionsCard, { marginTop: insets.top + 170 }]}>
            {suggestions.length === 0 && !searching ? (
              <View style={styles.noResult}>
                <Ionicons name="map-outline" size={18} color={colors.textMuted} />
                <Text style={styles.noResultText}>Aucun résultat</Text>
              </View>
            ) : null}
            {suggestions.map((s, idx) => (
              <Pressable
                key={idx}
                style={[styles.suggestionRow, idx === 0 && styles.suggestionRowFirst]}
                onPress={() => selectSuggestion(s)}
              >
                <View style={styles.suggestionIcon}>
                  <Ionicons
                    name={s.local ? 'business-outline' : 'location-outline'}
                    size={16}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.suggestionText} numberOfLines={2}>
                  {s.label}
                </Text>
                {s.local ? (
                  <View style={styles.suggestionBadge}>
                    <Text style={styles.suggestionBadgeText}>Quartier</Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        ) : null}

        {/* Bouton ma position (mode carte) */}
        {mode === 'map' ? (
          <Pressable
            style={[styles.locateBtn, { top: insets.top + 164 }]}
            onPress={locateMe}
            disabled={locating}
          >
            <Ionicons name={locating ? 'sync' : 'locate'} size={20} color={colors.primary} />
          </Pressable>
        ) : null}

        {/* Carte basse : adresse + confirmer */}
        <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.pinHint}>
            <Ionicons
              name={mode === 'map' ? 'navigate' : 'create-outline'}
              size={15}
              color={colors.primary}
            />
            <Text style={styles.pinHintText}>
              {mode === 'map'
                ? "Déplace la carte pour ajuster l'adresse"
                : "Saisissez l'adresse ci-dessus puis confirmez"}
            </Text>
          </View>

          {mode === 'map' ? (
            <View style={styles.addressRow}>
              <View style={styles.addressIcon}>
                <Ionicons name="home-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.addressBody}>
                {resolving ? (
                  <View style={styles.resolvingRow}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.resolvingText}>Adresse en cours…</Text>
                  </View>
                ) : (
                  <Text style={styles.addressText}>{address || 'Aucune adresse sélectionnée'}</Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.manualPreview}>
              <View style={styles.addressIcon}>
                <Ionicons name="create-outline" size={20} color={colors.secondary} />
              </View>
              <View style={styles.addressBody}>
                <Text style={styles.addressText}>
                  {address || 'Aucune adresse saisie'}
                </Text>
              </View>
            </View>
          )}

          <Pressable
            style={[styles.confirmBtn, address.trim().length === 0 && styles.confirmBtnDisabled]}
            disabled={address.trim().length === 0}
            onPress={confirm}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.confirmText}>Confirmer cette adresse</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  topTitle: {
    fontFamily: fonts.titleBold,
    fontSize: 16,
    color: colors.secondary,
  },
  searchBar: {
    position: 'absolute',
    left: spacing.md,
    right: 64,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    ...shadows.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  manualBar: {
    position: 'absolute',
    left: spacing.md,
    right: 64,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 52,
    ...shadows.md,
  },
  manualInput: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
    textAlignVertical: 'top',
    maxHeight: 96,
  },
  modeToggle: {
    position: 'absolute',
    left: spacing.md,
    right: 64,
    zIndex: 25,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    padding: 3,
    gap: 4,
    ...shadows.sm,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  modeBtnActive: {
    backgroundColor: colors.primary,
  },
  modeBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textMuted,
  },
  modeBtnTextActive: {
    color: '#fff',
  },
  manualPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  suggestionsCard: {
    position: 'absolute',
    left: spacing.md,
    right: 64,
    zIndex: 40,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    maxHeight: 280,
    ...shadows.lg,
  },
  noResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noResultText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  suggestionRowFirst: {
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
  },
  suggestionIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionText: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.text,
  },
  suggestionBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  suggestionBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.primary,
  },
  locateBtn: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  pinWrap: {
    alignItems: 'center',
  },
  pin: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    ...shadows.md,
  },
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadows.lg,
  },
  pinHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  pinHintText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  addressIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressBody: {
    flex: 1,
  },
  resolvingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resolvingText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
  },
  addressText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    fontFamily: fonts.titleSemiBold,
    fontSize: 15,
    color: '#fff',
  },
});
