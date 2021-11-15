import React from 'react';
import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
// import { PageLoading } from '@ant-design/pro-layout';
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

const githubCallback = '/login/auth_callback';

export const initialStateConfig = {
  loading: <div>init loading</div>,
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

const ApolloProviderRoot = ({ children, routes }: any) => {
  return (
    <ApolloProvider client={client}>
      {React.cloneElement(children, {
        ...children.props,
        routes,
      })}
    </ApolloProvider>
  );
};

const ProviderRoot = ({ children, routes }: any) => {
  return <>{ApolloProviderRoot({ children, routes })}</>;
};

export function rootContainer(container: any) {
  return React.createElement(ProviderRoot, null, container);
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
