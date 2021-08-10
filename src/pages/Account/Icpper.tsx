import type { ReactNode } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { HomeOutlined } from '@ant-design/icons';
import IcpperList from './components/IcpperList';
import { useAccess } from 'umi';
import PermissionErrorPage from '@/pages/403';

export default (): ReactNode => {
  const access = useAccess();
  if (!access.isPreIcpperOrIcpper()) {
    return <PermissionErrorPage />;
  }

  const breadcrumb = [
    { icon: <HomeOutlined />, path: '/', breadcrumbName: 'HOME', menuId: 'home' },
    { path: '/account/icpper', breadcrumbName: 'ICPPER', menuId: 'icpper' },
  ];

  return (
    <PageContainer
      ghost
      header={{ breadcrumbRender: (): ReactNode => <GlobalBreadcrumb routes={breadcrumb} /> }}
    >
      <IcpperList />
    </PageContainer>
  );
};
