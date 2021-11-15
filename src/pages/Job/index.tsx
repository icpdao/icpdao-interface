import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Tabs } from 'antd';
import { FormattedMessage, useAccess } from 'umi';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { HomeOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';

import TabJob from './components/TabJob';
import PermissionErrorPage from '@/pages/Result/403';
import styles from './index.less';
import TabCycle from '@/pages/Job/components/TabCycle';

const { TabPane } = Tabs;

const myBreadcrumb = [
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

const otherUserBreadcrumb = (userName: string) => {
  return [
    {
      icon: <HomeOutlined />,
      path: '',
      breadcrumbName: 'HOME',
      menuId: 'home',
    },
    {
      path: '/job',
      name: userName,
      breadcrumbName: userName,
    },
  ];
};

export default (props: {
  location: { query: { userName: string | undefined; daoId: string | undefined } };
  match: { params: { subType?: string } };
}): ReactNode => {
  const { initialState } = useModel('@@initialState');
  const access = useAccess();
  const [tab, setTab] = useState<string>(props.match.params.subType || 'job');

  if (!initialState) {
    return <div>loading</div>;
  }

  const currentLoginUserName = initialState.currentUser().profile?.github_login;
  const queryUserName = props.location.query.userName;
  const userName = queryUserName || currentLoginUserName;
  const isMy = userName === currentLoginUserName;

  if (access.noLogin()) {
    if (!queryUserName || queryUserName === currentLoginUserName) {
      return <PermissionErrorPage />;
    }
  }

  const breadcrumb = useMemo(() => {
    if (isMy) {
      return myBreadcrumb;
    }
    return otherUserBreadcrumb(userName);
  }, [isMy, userName]);
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
            <TabPane tab={<FormattedMessage id={`pages.job.tab.cycle`} />} key="cycle">
              <TabCycle userName={userName} daoId={props.location.query.daoId} />
            </TabPane>
          </Tabs>
        </div>
      </PageContainer>
    </>
  );
};
