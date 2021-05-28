import type { ReactNode } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { HomeOutlined } from '@ant-design/icons';
import DaoList from './components/DaoList';

export default (): ReactNode => {
  const breadcrumb = [
    { icon: <HomeOutlined />, path: '/', breadcrumbName: 'HOME', menuId: 'home' },
    { path: '/dao/mine', breadcrumbName: 'DAO', menuId: 'dao_mine' },
  ];

  return (
    <PageContainer
      ghost
      header={{ breadcrumbRender: (): ReactNode => <GlobalBreadcrumb routes={breadcrumb} /> }}
    >
      <DaoList />
    </PageContainer>
  );
};
