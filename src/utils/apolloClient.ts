import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { message } from 'antd';

import { getAuthorization } from '@/utils/utils';

const customFetch = (uri: string, options: any) => {
  const { service } = options.headers;
  const { headers } = options;
  delete headers.service;
  if (REACT_APP_ICPDAO_MOCK_URL) {
    return fetch(REACT_APP_ICPDAO_MOCK_URL, options);
  }
  return fetch(
    `${REACT_APP_ICPDAO_BACKEND_BASE_URL}/${REACT_APP_ICPDAO_BACKEND_VERSION}/${service}/graph`,
    options,
  );
};

const httpLink = new HttpLink({
  fetch: customFetch,
  credentials: 'same-origin',
});

const authLink = setContext((_, context) => {
  return {
    headers: {
      ...context.headers,
      authorization: getAuthorization() || '',
      service: context.service,
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message: msg, locations, path }) =>
      // message.error(`[GraphQL error]: Message: ${msg}, Location: ${locations}, Path: ${path}`,)
      console.log(`[GraphQL error]: Message: ${msg}, Location: ${locations}, Path: ${path}`),
    );
    console.warn(`warning`);
  }

  if (networkError) {
    message.error(`[Network error]: ${networkError}`);
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;
