import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { message } from 'antd';
import { getLocale } from 'umi';

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
      authorization: getAuthorization() || 'unlogin',
      service: context.service,
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, response, operation }) => {
  if (response === undefined) return;
  if (operation?.getContext()?.errorPolicy === 'ignore') return;
  const intl = getLocale();
  import(`../locales/${intl}`).then((locales) => {
    if (graphQLErrors) {
      if (graphQLErrors.length > 0) {
        const { message: msg, locations, path } = graphQLErrors[0];
        console.warn(`[GraphQL error]: Message: ${msg}, Location: ${locations}, Path: ${path}`);
        message.error(locales.default[msg] || msg);
      }
    } else if (networkError) {
      message.error(`[Network error]: ${networkError}`);
    }
  });
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      errorPolicy: 'none',
    },
    mutate: {
      errorPolicy: 'none',
    },
  },
});

export default client;
