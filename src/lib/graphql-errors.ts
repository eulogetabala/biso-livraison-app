import { ApolloError } from '@apollo/client';

/** Extrait le message le plus utile d'une erreur Apollo / réseau. */
export function getGraphqlErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApolloError) {
    const gqlMsg = error.graphQLErrors[0]?.message;
    if (gqlMsg) return gqlMsg;
    if (error.networkError) {
      return 'Impossible de joindre le serveur. Vérifiez votre connexion.';
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** Indique si l'erreur correspond à une contrainte d'unicité (ex. numéro déjà inscrit). */
export function isUniqueConstraintError(error: unknown): boolean {
  const msg = getGraphqlErrorMessage(error, '').toLowerCase();
  return msg.includes('unique') || msg.includes('déjà utilisé');
}

/** Session absente ou JWT expiré / invalide. */
export function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof ApolloError) {
    const code = error.graphQLErrors[0]?.extensions?.code;
    if (code === 'UNAUTHENTICATED') return true;
    const status =
      'statusCode' in (error.networkError ?? {})
        ? (error.networkError as { statusCode?: number }).statusCode
        : undefined;
    if (status === 401) return true;
  }
  const msg = getGraphqlErrorMessage(error, '').toLowerCase();
  return msg.includes('unauthorized') || msg.includes('unauthenticated');
}
