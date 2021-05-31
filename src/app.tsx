import React from 'react';
import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
import RightHeader from '@/components/RightHeader';
import LeftHeader from '@/components/LeftHeader';
import Footer from '@/components/Footer';
import { getUserProfile } from './services/icpdao-interface/user';
import requestConfig from './utils/request';
import {
  clearAuthorization,
  getAuthorization,
  getTheme,
  getUserInfo,
  setUserProfile,
} from '@/utils/utils';
import type { MenuTheme } from 'antd';
import { ApolloProvider } from '@apollo/client';
import client from '@/utils/apolloClient';

const githubCallback = '/login/auth_callback';

export const initialStateConfig = {
  loading: <PageLoading />,
};

export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  fetchUserInfo: () => Promise<API.UserProfile | undefined>;
  currentUser?: any;
}> {
  const auth = getAuthorization();
  if (!auth) {
    clearAuthorization();
    localStorage.removeItem('user_info');
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

export function rootContainer(container: any) {
  return React.createElement(ApolloProviderRoot, null, container);
}

export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    rightContentRender: () => <RightHeader />,
    headerTitleRender: () => <LeftHeader />,
    disableContentMargin: false,
    footerRender: () => <Footer />,
    onPageChange: () => {},
    menuHeaderRender: undefined,
    ...initialState?.settings,
  };
};
