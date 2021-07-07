import type { ReactNode } from 'react';
import { useState } from 'react';
import { PageContainer, PageLoading } from '@ant-design/pro-layout';
import { Tabs } from 'antd';
import { FormattedMessage, useAccess } from 'umi';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { HomeOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';

import TabJob from './components/TabJob';
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

export default (props: {
  location: { query: { userName: string | undefined; daoId: string | undefined } };
}): ReactNode => {
  const { initialState } = useModel('@@initialState');
  const access = useAccess();
  const [tab, setTab] = useState<string>('job');

  if (!initialState) {
    return <PageLoading />;
  }

  if (!access.isIcpper()) {
    return <PermissionErrorPage />;
  }

  const userName = props.location.query.userName || initialState.currentUser().profile.github_login;
  return (
    <>
      <PageContainer
        ghost
        header={{ breadcrumbRender: () => <GlobalBreadcrumb routes={breadcrumb} /> }}
      >
        <div className={styles.first}>
          <Tabs defaultActiveKey={tab} onChange={setTab}>
            <TabPane tab={<FormattedMessage id={`pages.job.tab.job`} />} key="job">
              <TabJob userName={userName} daoId={props.location.query.daoId} />
            </TabPane>
            <TabPane tab={<FormattedMessage id={`pages.job.tab.cycle`} />} key="cycle"></TabPane>
          </Tabs>
        </div>
      </PageContainer>
    </>
  );
};