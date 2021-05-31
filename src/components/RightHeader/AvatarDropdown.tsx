import React, { useCallback } from 'react';
import {
  UserOutlined,
  TransactionOutlined,
  TeamOutlined,
  DeploymentUnitOutlined,
  HeartOutlined,
  UnlockOutlined,
  DownOutlined,
  GithubOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Menu, Spin } from 'antd';
import { history, useIntl, useModel, useLocation, useAccess } from 'umi';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import { clearAuthorization, githubCallback } from '@/utils/utils';

export const LoginButton: React.FC = () => {
  const intl = useIntl();
  const loginText = intl.formatMessage({
    id: 'component.header.button.login',
  });
  const params = new URLSearchParams();
  params.append('redirect_uri', `${window.location.origin}${githubCallback}`);
  params.append('client_id', REACT_APP_GITHUB_APP_CLIENT_ID);
  const githubOAuth = `https://github.com/login/oauth/authorize?${params.toString()}`;
  return (
    <div className={styles.loginButton}>
      <Button href={githubOAuth} icon={<GithubOutlined style={{ fontSize: 17 }} />} block>
        {loginText}
      </Button>
    </div>
  );
};

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

const loginOut = async () => {
  clearAuthorization();
  const { query = {} } = history.location;
  const { redirect } = query;
  if (window.location.pathname !== githubCallback && !redirect) {
    history.replace('/');
  }
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const intl = useIntl();
  const { pathname } = useLocation();

  const onMenuClick = useCallback(
    (event: {
      key: React.Key;
      keyPath: React.Key[];
      item: React.ReactInstance;
      domEvent: React.MouseEvent<HTMLElement>;
    }) => {
      const { key } = event;
      if (key === '/account/logout' && initialState) {
        loginOut();
        return;
      }
      history.push(`${key}`);
    },
    [initialState, setInitialState],
  );

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );
  const access = useAccess();

  if (!initialState) {
    return loading;
  }

  if (!initialState.currentUser().profile || !initialState.currentUser().profile.nickname) {
    return <LoginButton />;
  }

  const menuHeaderDropdown = () => {
    return (
      <Menu className={styles.menu} selectedKeys={[pathname]} onClick={onMenuClick}>
        <Menu.Item key="/account/wallet">
          <TransactionOutlined />
          {intl.formatMessage({ id: 'component.globalHeader.avatar.dropdown.wallet' })}
        </Menu.Item>
        {access.hadMentor() && (
          <Menu.Item key="/account/mentor">
            <UserOutlined />
            {intl.formatMessage({ id: 'component.globalHeader.avatar.dropdown.mentor' })}
          </Menu.Item>
        )}
        {access.canInviteIcpper() && (
          <Menu.Item key="/account/icpper">
            <TeamOutlined />
            {intl.formatMessage({ id: 'component.globalHeader.avatar.dropdown.icpper' })}
          </Menu.Item>
        )}
        <Menu.Item key="/dao/mine">
          <DeploymentUnitOutlined />
          {intl.formatMessage({ id: 'component.globalHeader.avatar.dropdown.dao' })}
        </Menu.Item>
        <Menu.Item key="/account/following">
          <HeartOutlined />
          {intl.formatMessage({ id: 'component.globalHeader.avatar.dropdown.following' })}
        </Menu.Item>
        <Menu.Item key="/account/logout">
          <UnlockOutlined />
          {intl.formatMessage({ id: 'component.globalHeader.avatar.dropdown.logout' })}
        </Menu.Item>
      </Menu>
    );
  };
  return (
    <HeaderDropdown overlay={menuHeaderDropdown} trigger={['hover', 'click']}>
      <span className={`${styles.action} ${styles.account}`}>
        <Avatar
          size={40}
          className={styles.avatar}
          src={initialState.currentUser().profile.avatar}
          alt="avatar"
        />
        <span className={`${styles.name} anticon`}>
          {initialState.currentUser().profile.nickname}
        </span>
        <DownOutlined />
      </span>
    </HeaderDropdown>
  );
};

export default AvatarDropdown;
