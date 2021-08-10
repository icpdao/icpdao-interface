import type { ReactNode } from 'react';
import { PageContainer, PageLoading } from '@ant-design/pro-layout';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { HomeOutlined } from '@ant-design/icons';
import DaoList, { SelectDropdownMenu } from './components/DaoList';
import { useMemo } from 'react';
import { useModel } from '@@/plugin-model/useModel';
import { useAccess } from '@@/plugin-access/access';
import { useIntl } from 'umi';

export default (): ReactNode => {
  const access = useAccess();
  const { initialState } = useModel('@@initialState');
  if (!initialState) {
    return <PageLoading />;
  }

  const intl = useIntl();
  const breadcrumb = useMemo(() => {
    return [
      { icon: <HomeOutlined />, path: '/', breadcrumbName: 'HOME', menuId: 'home' },
      { path: '/dao/explore', breadcrumbName: 'EXPLORE DAO', menuId: 'dao.explore' },
    ];
  }, []);

  const menuList: SelectDropdownMenu[] = useMemo(() => {
    if (access.isIcpper()) {
      return [
        {
          key: 'all',
          title: intl.formatMessage({ id: 'pages.dao.explore.table.filter.all' }),
        },
        {
          key: 'following',
          title: intl.formatMessage({ id: 'pages.dao.explore.table.filter.following' }),
        },
        {
          key: 'following_and_owner',
          title: intl.formatMessage({ id: 'pages.dao.explore.table.filter.following_and_owner' }),
        },
      ];
    }
    return [
      {
        key: 'all',
        title: intl.formatMessage({ id: 'pages.dao.explore.table.filter.all' }),
      },
      {
        key: 'following',
        title: intl.formatMessage({ id: 'pages.dao.explore.table.filter.following' }),
      },
    ];
  }, [intl, access]);

  return (
    <PageContainer
      ghost
      header={{ breadcrumbRender: (): ReactNode => <GlobalBreadcrumb routes={breadcrumb} /> }}
    >
      <DaoList menuList={menuList} />
    </PageContainer>
  );
};
