import { ApolloClient, createHttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { API_URL } from './api';
import { getStoredToken } from './token-storage';

const httpLink = createHttpLink({
  uri: `${API_URL}/graphql`,
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

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});
