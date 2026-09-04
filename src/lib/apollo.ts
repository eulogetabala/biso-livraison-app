import { ApolloClient, createHttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getApiUrl } from './api';
import { getStoredToken } from './token-storage';

export function createApolloClient(apiUrl = getApiUrl()) {
  const httpLink = createHttpLink({
    uri: `${apiUrl}/graphql`,
  });

  const authLink = setContext(async (_, { headers }) => {
    const token = await getStoredToken();
    return {
      headers: {
        ...headers,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  return new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-and-network' },
    },
  });
}
