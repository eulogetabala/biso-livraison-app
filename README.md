# Biso Livraison — Frontend

Application web (client) de Biso Livraison, connectée au backend NestJS + GraphQL.

## Stack

- Vite + React 19 + TypeScript
- Apollo Client (GraphQL)
- Tailwind CSS v4
- React Router

## Démarrage

```bash
npm install
npm run dev
```

L'app tourne sur `http://localhost:5173` et proxy vers le backend sur `http://localhost:3001`
(`/graphql` et `/uploads`). Le backend doit être démarré au préalable.

## Génération des types GraphQL

Les types et hooks sont générés depuis le schéma GraphQL du backend :

```bash
npm run codegen          # une fois
npm run codegen:watch    # en continu pendant le dev
```

- `src/graphql/types.ts` — types du schéma
- `src/graphql/operations.ts` — hooks typés (`useSearchRestaurantsQuery`, `useCreateOrderMutation`, …)
- Opérations définies dans `src/graphql/*.graphql`

## Scripts

```bash
npm run build        # build de production
npm run preview      # prévisualisation du build
npm run lint         # oxlint
```

## Pages

- `/` — restaurants (recherche, filtres, pagination)
- `/restaurant/:id` — détail restaurant + menu + panier
- `/checkout` — panier, adresse, paiement à la livraison
- `/orders` — mes commandes (pagination)
- `/orders/:id` — détail commande (statut, livreur, annulation)
- `/login` `/register` — authentification
