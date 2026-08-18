# Biso Livraison — Application mobile (React Native / Expo)

Application mobile client pour commander des repas, construite avec **React Native** + **Expo SDK 57** et **Apollo Client** (GraphQL) contre le backend NestJS.

## Prérequis

- **Node.js** 20+
- L'application **Expo Go** sur votre téléphone (App Store / Play Store)
- Le **backend NestJS** démarré (`npm run start:dev` dans `delivery-backend`, port `3001`)
- Téléphone et ordinateur **sur le même réseau Wi-Fi**

## Lancer l'application

```bash
npm install
npm start
```

Un QR code s'affiche. Scannez-le avec **Expo Go** (Android) ou l'appareil photo (iOS).

> L'application détecte automatiquement l'IP de votre machine via Expo et se connecte
> au backend sur `http://<ip-de-votre-machine>:3001`. Si le backend tourne sur une autre
> machine, modifiez `src/lib/api.ts` (`API_PORT`) ou la logique de résolution.

## Autres commandes

```bash
npm run ios      # Ouvrir dans le simulateur iOS
npm run android  # Ouvrir dans l'émulateur Android
npm run typecheck # Vérification TypeScript
npm run codegen   # Régénérer les types/hooks GraphQL depuis le schéma backend
```

## Structure

```
src/
  components/     # Composants UI réutilisables
  graphql/        # Opérations GraphQL (.graphql) + types générés
  lib/            # Apollo, auth, panier, utils API
  navigation/     # Stack + onglets React Navigation
  screens/        # Écrans de l'application
```

## Fonctionnalités

- Création de compte / connexion (JWT, persistance locale)
- Accueil : recherche et filtres par cuisine, restaurants paginés
- Menu du restaurant : ajout au panier
- Panier + commande avec paiement à la livraison
- Suivi de commande (timeline de statut) + annulation
- Profil utilisateur
