import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
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

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
