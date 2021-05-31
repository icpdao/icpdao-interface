import type { ReactNode } from 'react';
import { PageContainer, PageLoading } from '@ant-design/pro-layout';
import { Tabs, Button } from 'antd';
import { FormattedMessage, useAccess, history } from 'umi';
import styles from './index.less';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { HomeOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';
import { useDaoQuery } from '@/services/dao/generated';
import PermissionErrorPage from '@/pages/403';
import { useState } from 'react';
import DAOJobConfig from '@/pages/Dao/components/JobConfig';

const { TabPane } = Tabs;
const breadcrumb = (daoId: string) => [
  {
    icon: <HomeOutlined />,
    path: '',
    breadcrumbName: 'HOME',
    menuId: 'home',
  },
  {
    path: '/dao/explore',
    breadcrumbName: 'EXPLORE DAO',
    menuId: 'dao.explore',
  },
  {
    path: `/dao/${daoId}`,
    breadcrumbName: 'HOMEPAGE',
    menuId: 'dao.home',
  },
  {
    path: `/dao/${daoId}/config`,
    breadcrumbName: 'CONFIG',
    menuId: 'dao.config',
  },
];

const configTab = (
  <>
    <TabPane tab={<FormattedMessage id={`pages.dao.config.tab.job`} />} key="job"></TabPane>
    <TabPane tab={<FormattedMessage id={`pages.dao.config.tab.token`} />} key="token"></TabPane>
  </>
);

const firstConfigStep = ['job', 'token_init', 'token_uniswap', 'token_lp'];

export default (props: {
  match: { params: { daoId: string } };
  location: { query: { status: string | undefined } };
}): ReactNode => {
  const { initialState } = useModel('@@initialState');
  const access = useAccess();
  if (!initialState) {
    return <PageLoading />;
  }
  const { daoId } = props.match.params;
  const { status } = props.location.query;
  const [tab, setTab] = useState<string>(status || 'job');
  const { data, loading, error } = useDaoQuery({
    variables: { id: daoId },
  });
  if (loading || error) {
    return <PageLoading />;
  }
  if (!access.isDaoOwner(data?.dao?.datum?.ownerId || '')) {
    return <PermissionErrorPage />;
  }

  const skipClick = () => {
    const nowIndex = firstConfigStep.indexOf(status || '');
    if (nowIndex === -1) return;
    if (nowIndex + 1 > 3) {
      history.push(`/dao/${daoId}`);
    } else {
      const nextStep = firstConfigStep[(nowIndex + 1) % 4];
      if (nextStep.startsWith('job')) setTab('job');
      if (nextStep.startsWith('token')) setTab('token');
      history.push({
        pathname: `/dao/${daoId}/config`,
        query: {
          status: nextStep,
        },
      });
    }
  };
  return (
    <>
      {status && (
        <Button type="link" className={styles.skipButton} onClick={skipClick}>
          <FormattedMessage id={`pages.dao.config.tab.skip`} />
        </Button>
      )}
      <PageContainer
        ghost
        header={{ breadcrumbRender: () => <GlobalBreadcrumb routes={breadcrumb(daoId)} /> }}
      >
        <div className={styles.first}>
          {!status && (
            <Tabs defaultActiveKey={tab} onChange={setTab}>
              {configTab}
            </Tabs>
          )}
          {tab === 'job' && <DAOJobConfig daoId={daoId} />}
        </div>
      </PageContainer>
    </>
  );
};
