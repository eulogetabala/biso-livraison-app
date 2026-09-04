# App Livreur — MVP (Plan A + navigation)

**Date :** 2026-03-03  
**Statut :** Validé par le client (Plan A + carte + directions externes)

---

## Objectif

Donner au livreur une app dédiée (rôle `DRIVER`) pour :

1. Se connecter avec le compte créé par l’admin
2. Passer **disponible / hors ligne**
3. Voir ses **courses assignées** (repas + colis)
4. Ouvrir une course → **carte + adresse** → lancer **Google Maps ou Waze** en navigation
5. Avancer le statut : **Récupéré → En route → Livré**

Le client continue d’utiliser l’app actuelle ; le livreur a un parcours séparé.

---

## Parcours livreur

```
Login (compte DRIVER admin)
    ↓
DriverMain (tabs)
├── Accueil     → toggle dispo + résumé (X courses actives)
├── Courses     → liste paginée myDeliveries
└── Profil      → nom, véhicule, déconnexion

Course (détail)
├── Carte (restaurant + client + position livreur)
├── Adresse texte + boutons [Google Maps] [Waze]
├── Infos commande (restaurant, client, téléphone)
└── Action statut (selon étape)
```

---

## Navigation carte (exigence clé)

### Carte in-app (`react-native-maps`, déjà installé)

Réutiliser / étendre `DriverLiveMap` :

| Marqueur | Source |
|----------|--------|
| Restaurant (pickup) | `order.restaurant.latitude/longitude` |
| Client (livraison) | `order.deliveryLatitude/deliveryLongitude` |
| Livreur (moi) | `expo-location` (position actuelle) |

Si coords client absentes → fallback géocodage adresse texte (`deliveryAddress`, `deliveryCity`) via quartiers locaux (`geo-data.ts`) ou centre Brazzaville.

### Directions externes (type Waze / Google Maps)

Nouveau utilitaire `src/lib/open-navigation.ts` :

| App | Deep link |
|-----|-----------|
| **Google Maps** | `https://www.google.com/maps/dir/?api=1&destination=lat,lng&travelmode=driving` |
| **Waze** | `https://waze.com/ul?ll=lat,lng&navigate=yes` |
| **Apple Plans** (iOS) | `maps://?daddr=lat,lng&dirflg=d` |

**Cible selon statut de la course :**

| Statut livraison | Destination navigation |
|------------------|------------------------|
| `ASSIGNED` | Restaurant (récupérer la commande) |
| `PICKED_UP` / `IN_TRANSIT` | Adresse client |
| `DELIVERED` | Boutons désactivés |

UI : deux boutons visibles sous la carte + `ActionSheet` « Choisir l’app » si les deux sont installées.

Pas de SDK Waze/Google embarqué — ouverture de l’app native (standard, fiable, zero coût).

---

## API GraphQL (backend déjà prêt)

Nouveaux fichiers `.graphql` + `npm run codegen` :

```graphql
# drivers.graphql (étendre)
query MyDriverProfile { myDriverProfile { ... } }
mutation SetDriverAvailability($input: ...) { setDriverAvailability(...) { ... } }

# deliveries.graphql (nouveau)
query MyDeliveries($page: Int, $limit: Int) {
  myDeliveries(page: $page, limit: $limit) {
    items {
      id status orderId parcelId
      order {
        deliveryAddress deliveryCity deliveryLatitude deliveryLongitude
        restaurant { name phone latitude longitude address city }
        user { firstName lastName phone }
      }
      parcel { pickupAddress deliveryAddress ... }
    }
    pageInfo { ... }
  }
}
mutation UpdateDeliveryStatus($input: UpdateDeliveryStatusInput!) { ... }

# geo.graphql (étendre)
mutation UpdateDriverLocation($input: ...) { updateDriverLocation(...) }
```

---

## Routing par rôle

Après login / OTP / splash restore :

```ts
if (user.role === 'DRIVER') navigation.replace('DriverMain');
else navigation.replace('Main');
```

- `DriverMain` : bottom tabs Accueil | Courses | Profil
- Masquer `AppTabBar` client quand `DriverMain` actif
- Pas d’inscription livreur in-app (comptes admin uniquement)

---

## GPS livreur (MVP)

- **Foreground** : envoi `updateDriverLocation` toutes les 15–30 s quand dispo ou course active
- **Background** : phase 2 (permissions + `UIBackgroundModes` location)
- Throttle backend déjà en place (`THROTTLE_GPS`)

---

## Comptes test

| Rôle | Téléphone | Mot de passe |
|------|-----------|--------------|
| Livreur | +242066000111 | Driver123! |

---

## Ordre d’implémentation

1. GraphQL driver + codegen
2. Routing `DRIVER` → `DriverMain`
3. Écran Accueil (dispo + profil)
4. Liste courses `myDeliveries`
5. **Détail course + carte + Google Maps / Waze**
6. Boutons statut `updateDeliveryStatus`
7. Boucle GPS foreground
8. Polish (push assignation → phase 2)

---

## Hors scope MVP

- Inscription livreur self-service
- Navigation turn-by-turn in-app (Mapbox Directions)
- GPS arrière-plan continu
- Chat livreur-client
