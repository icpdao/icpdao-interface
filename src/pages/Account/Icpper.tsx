import type {ReactNode} from "react";
import {PageContainer} from '@ant-design/pro-layout';
import ProDescriptions from '@ant-design/pro-descriptions';
import {Table} from 'antd';
import {FormattedMessage} from 'umi';
import GlobalTooltip from "@/components/Tooltip";
import styles from './index.less';
import GlobalBreadcrumb from "@/components/Breadcrumb";
import {HomeOutlined} from '@ant-design/icons';
import PreIcpperList from "./components/PreIcpperList";


export default (): ReactNode => {

  const icpperTitle = (
    <>
      <span style={{marginRight: 6}}><FormattedMessage id={'pages.account.icpper.iccper'} /></span>
      <GlobalTooltip title={<FormattedMessage id={'pages.account.icpper.iccper.tooltip'} />} key={'icpper.tooltip'}/>
    </>
  )
  const breadcrumb = [
    {icon: <HomeOutlined />, path: '/', breadcrumbName: 'HOME', menuId: 'home'},
    {path: '/account/icpper', breadcrumbName: 'ICPPER', menuId: 'icpper'}
  ]

  return (
    <PageContainer
      ghost
      header={{breadcrumbRender: (): ReactNode => <GlobalBreadcrumb routes={breadcrumb} />}}
    >
      <PreIcpperList />
      <ProDescriptions className={styles.second} column={1} title={icpperTitle}>
      </ProDescriptions>
      <div>
        <Table columns={[]} dataSource={[]} locale={{emptyText: 'No Data'}} />
      </div>
    </PageContainer>
  );
}
