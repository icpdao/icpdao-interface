import React from 'react';
import { PageContainer, PageLoading } from '@ant-design/pro-layout';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { HomeOutlined } from '@ant-design/icons';
import type { SelectDropdownMenu } from './components/DaoList';
import DaoList from './components/DaoList';
import { useMemo } from 'react';
import { useModel } from '@@/plugin-model/useModel';
import { useAccess } from '@@/plugin-access/access';
import { useIntl } from 'umi';
import PermissionErrorPage from '@/pages/Result/403';

export default (): React.ReactNode => {
  const access = useAccess();
  const { initialState } = useModel('@@initialState');
  if (!initialState) {
    return <PageLoading />;
  }

  const intl = useIntl();
  const breadcrumb = useMemo(() => {
    return [
      { icon: <HomeOutlined />, path: '/', breadcrumbName: 'HOME', menuId: 'home' },
      { path: '/dao/mine', breadcrumbName: 'DAO', menuId: 'dao.mine' },
    ];
  }, []);

  const menuList: SelectDropdownMenu[] = useMemo(() => {
    if (access.isPreIcpperOrIcpper()) {
      return [
        {
          key: 'following_and_owner',
          title: intl.formatMessage({ id: 'pages.dao.mine.table.filter.following_and_owner' }),
        },
        {
          key: 'following',
          title: intl.formatMessage({ id: 'pages.dao.mine.table.filter.following' }),
        },
        {
          key: 'owner',
          title: intl.formatMessage({ id: 'pages.dao.mine.table.filter.owner' }),
        },
      ];
    }
    return [
      {
        key: 'following',
        title: intl.formatMessage({ id: 'pages.dao.mine.table.filter.following' }),
      },
    ];
  }, [intl, access]);

  if (!access.isLogin()) {
    return <PermissionErrorPage />;
  }

  return (
    <PageContainer
      ghost
      header={{ breadcrumbRender: (): React.ReactNode => <GlobalBreadcrumb routes={breadcrumb} /> }}
    >
      <DaoList menuList={menuList} />
    </PageContainer>
  );
};
