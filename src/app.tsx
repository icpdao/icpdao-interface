import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
import RightHeader from '@/components/RightHeader';
import LeftHeader from '@/components/LeftHeader';
import HeaderContent from '@/components/HeaderContent';
import Footer from '@/components/Footer';
import { getUserProfile } from './services/icpdao-interface/user';
import requestConfig from './utils/request';
import {
  clearAuthorization,
  getAuthorization,
  getAuthorizationExpiresAt,
  getCurrentTimestamps,
  getTheme,
  getUserInfo,
  setUserProfile,
} from '@/utils/utils';
import type { MenuTheme } from 'antd';
import { ApolloProvider } from '@apollo/client';
import client from '@/utils/apolloClient';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';

const githubCallback = '/login/auth_callback';

export const initialStateConfig = {
  loading: <PageLoading />,
};

export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  fetchUserInfo?: () => Promise<API.UserProfile | undefined>;
  currentUser?: any;
}> {
  const auth = getAuthorization();
  const expiresAt = getAuthorizationExpiresAt();
  if (!auth || expiresAt < getCurrentTimestamps()) {
    clearAuthorization();
  }
  const fetchUserInfo = async () => {
    try {
      const { data: userProfile } = await getUserProfile();
      if (userProfile) setUserProfile(userProfile);
      return userProfile;
    } catch (error) {
      return undefined;
    }
  };
  if (history.location.pathname !== githubCallback && auth) {
    await fetchUserInfo();
  }
  return {
    fetchUserInfo,
    currentUser: getUserInfo,
    settings: { headerTheme: getTheme() as MenuTheme },
  };
}

export const request: RequestConfig = requestConfig;

function getLibrary(provider: any) {
  return new ethers.providers.Web3Provider(provider); // this will vary according to whether you use e.g. ethers or web3.js
}

// const getProviderRoot = ({ children, routes }: any) => {
//   return (
//     <ApolloProvider client={client}>
//       <Web3ReactProvider getLibrary={getLibrary}>
//         {React.cloneElement(children, {
//           ...children.props,
//           routes,
//         })}
//       </Web3ReactProvider>
//     </ApolloProvider>
//   );
// }

// const ProviderRoot = ({ children, routes }: any) => {
//   return <>{getProviderRoot({ children, routes })}</>;
// };
//
// export function rootContainer(container: any) {
//   return React.createElement(ProviderRoot, null, container);
// }

export function rootContainer(container: any) {
  return (
    <ApolloProvider client={client}>
      <Web3ReactProvider getLibrary={getLibrary}>{container}</Web3ReactProvider>
    </ApolloProvider>
  );
}

export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    headerContentRender: () => <HeaderContent />,
    rightContentRender: () => <RightHeader />,
    headerTitleRender: () => <LeftHeader />,
    disableContentMargin: false,
    footerRender: () => {
      const { location } = history;
      if (location.pathname !== '/home') return <Footer />;
      return false;
    },
    onPageChange: () => {},
    menuHeaderRender: undefined,
    ...initialState?.settings,
  };
};
