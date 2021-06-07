import type { ReactNode } from 'react';
import { useState } from 'react';
import { PageContainer, PageLoading } from '@ant-design/pro-layout';
import { Tabs } from 'antd';
import { FormattedMessage, useAccess } from 'umi';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { HomeOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';

import TabJob from './components/Job';
import PermissionErrorPage from '@/pages/403';
import styles from './index.less';

const { TabPane } = Tabs;

const breadcrumb = [
  {
    icon: <HomeOutlined />,
    path: '',
    breadcrumbName: 'HOME',
    menuId: 'home',
  },
  {
    path: '/job',
    breadcrumbName: 'JOB',
    menuId: 'job',
  },
];

export default (): ReactNode => {
  const { initialState } = useModel('@@initialState');
  const access = useAccess();
  const [tab, setTab] = useState<string>('job');

  if (!initialState) {
    return <PageLoading />;
  }

  if (!access.isIcpper()) {
    return <PermissionErrorPage />;
  }

  return (
    <>
      <PageContainer
        ghost
        header={{ breadcrumbRender: () => <GlobalBreadcrumb routes={breadcrumb} /> }}
      >
        <div className={styles.first}>
          <Tabs defaultActiveKey={tab} onChange={setTab}>
            <TabPane tab={<FormattedMessage id={`pages.job.tab.job`} />} key="job">
              <TabJob />
            </TabPane>
            <TabPane tab={<FormattedMessage id={`pages.job.tab.cycle`} />} key="cycle"></TabPane>
          </Tabs>
        </div>
      </PageContainer>
    </>
  );
};
