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
      { path: '/dao/explore', breadcrumbName: 'EXPLORE DAO', menuId: 'dao.explore' },
    ];
  }, []);

  const menuList: SelectDropdownMenu[] = useMemo(() => {
    if (access.canInviteIcpper()) {
      return [
        {
          key: 'all',
          title: 'All',
        },
        {
          key: 'following',
          title: 'Following',
        },
        {
          key: 'following_and_owner',
          title: 'My dao',
        },
      ];
    }
    return [
      {
        key: 'all',
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
