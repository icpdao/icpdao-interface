import type {ReactNode} from "react";
import {PageContainer} from '@ant-design/pro-layout';
import GlobalBreadcrumb from "@/components/Breadcrumb";
import {HomeOutlined} from '@ant-design/icons';
import IcpperList from "./components/IcpperList";


export default (): ReactNode => {


  const breadcrumb = [
    {icon: <HomeOutlined />, path: '/', breadcrumbName: 'HOME', menuId: 'home'},
    {path: '/account/icpper', breadcrumbName: 'ICPPER', menuId: 'icpper'}
  ]

  return (
    <PageContainer
      ghost
      header={{breadcrumbRender: (): ReactNode => <GlobalBreadcrumb routes={breadcrumb} />}}
    >
      <IcpperList />
    </PageContainer>
  );
}
