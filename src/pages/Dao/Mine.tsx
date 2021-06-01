import type { ReactNode } from 'react';
import { PageContainer, PageLoading } from '@ant-design/pro-layout';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { HomeOutlined } from '@ant-design/icons';
import DaoList, { SelectDropdownMenu } from './components/DaoList';
import { useMemo } from 'react';
import { useModel } from '@@/plugin-model/useModel';
import { useAccess } from '@@/plugin-access/access';

export default (): ReactNode => {
  const access = useAccess();
  const { initialState } = useModel('@@initialState');
  if (!initialState) {
    return <PageLoading />;
  }

  const breadcrumb = useMemo(() => {
    return [
      { icon: <HomeOutlined />, path: '/', breadcrumbName: 'HOME', menuId: 'home' },
      { path: '/dao/mine', breadcrumbName: 'DAO', menuId: 'dao_mine' },
    ];
  }, []);

  const menuList: SelectDropdownMenu[] = useMemo(() => {
    if (access.canInviteIcpper()) {
      return [
        {
          key: 'following_and_owner',
          title: 'All',
        },
        {
          key: 'following',
          title: 'Following',
        },
        {
          key: 'owner',
          title: 'owner',
        },
      ];
    }
    return [
      {
        key: 'following_and_owner',
        title: 'All',
      },
      {
        key: 'following',
        title: 'Following',
      },
    ];
  }, [access]);

  return (
    <PageContainer
      ghost
      header={{ breadcrumbRender: (): ReactNode => <GlobalBreadcrumb routes={breadcrumb} /> }}
    >
      <DaoList menuList={menuList} />
    </PageContainer>
  );
};